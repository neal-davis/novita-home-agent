/**
 * Default config generator
 * Provides defaults for pricingConfig to reduce configuration burden
 */

import { PricingConfig, DynamicModelConfig } from "@/types/dynamic-pricing";
import { extractFieldMappingFromSKUMappings } from "./cel-field-extractor";

/**
 * Resolve $ref reference
 */
function resolveRef(ref: string, schema: any): any {
  if (!ref.startsWith("#/components/schemas/")) {
    return null;
  }

  const schemaName = ref.replace("#/components/schemas/", "");
  return schema.components?.schemas?.[schemaName] || null;
}

/**
 * Get request body Schema (simplified, for field checks only)
 */
function getRequestSchema(schema: any): any {
  if (!schema?.paths) {
    return null;
  }

  for (const pathValue of Object.values(schema.paths)) {
    const pathObj = pathValue as any;
    if (pathObj.post?.requestBody?.content?.["application/json"]?.schema) {
      let requestSchema =
        pathObj.post.requestBody.content["application/json"].schema;
      if (requestSchema.$ref) {
        requestSchema = resolveRef(requestSchema.$ref, schema);
        if (!requestSchema) {
          return null;
        }
      }
      return requestSchema;
    }
  }

  return null;
}

const FIELD_NAME_TO_TITLE: Record<string, string> = {
  duration: "Duration",
  resolution: "Resolution",
  size: "Size",
  mode: "Mode",
  fast_mode: "Mode",
  steps: "Steps",
  scale: "Scale",
  width: "Width",
  height: "Height",
};

const FIELD_NAME_TO_RENDER: Record<
  string,
  "duration" | "resolution" | "mode" | "size" | "default"
> = {
  duration: "duration",
  resolution: "resolution",
  size: "size",
  mode: "mode",
  fast_mode: "mode",
};

/**
 * Get default price unit by category (aligned with pricing page and model-table-adapter)
 */
export function getDefaultPriceUnit(category: string): string {
  switch (category) {
    case "video_gen":
      return "video";
    case "image_gen":
      return "image";
    case "audio_gen":
      return "10k chars";
    default:
      return "call";
  }
}

/**
 * Generate default pricingConfig (other config derived from fieldMapping when only that is set)
 */
export function generateDefaultPricingConfig(
  fieldMapping: Record<string, string>,
  category: string,
  existingConfig?: Partial<PricingConfig>,
): PricingConfig {
  const config: PricingConfig = {
    fieldMapping,
    priceFactors: {},
    table: {
      priceUnit:
        existingConfig?.table?.priceUnit || getDefaultPriceUnit(category),
    },
    billing: existingConfig?.billing || {},
  };

  if (
    !existingConfig?.priceFactors ||
    Object.keys(existingConfig.priceFactors).length === 0
  ) {
    let order = 1;
    for (const fieldName of Object.keys(fieldMapping)) {
      if (
        fieldName === "video" ||
        fieldName === "images" ||
        fieldName === "loras"
      ) {
        continue;
      }

      const title = FIELD_NAME_TO_TITLE[fieldName] || fieldName;
      const render = FIELD_NAME_TO_RENDER[fieldName] || "default";

      config.priceFactors![fieldName] = {
        column: {
          title,
          dataIndex: fieldName,
          render,
          order: order++,
        },
      };

      if (fieldName === "fast_mode") {
        config.priceFactors![fieldName].column.dataIndex = "mode";
        config.priceFactors![fieldName].column.render = "mode";
        config.priceFactors![fieldName].valueTransform = (value: boolean) => {
          return value ? "Fast mode" : "Standard mode";
        };
      }
    }
  } else {
    config.priceFactors = existingConfig.priceFactors;
  }

  if (existingConfig?.table) {
    config.table = { ...config.table, ...existingConfig.table };
  }

  return config;
}

/**
 * Ensure pricingConfig has full default config (fallback).
 * If no pricingConfig, tries to extract fieldMapping from SKU mappings CEL expressions.
 */
export function ensureDefaultPricingConfig(
  modelConfig: DynamicModelConfig,
): PricingConfig | null {
  const pricingConfig = modelConfig.pricingConfig;

  if (pricingConfig?.fieldMapping) {
    return generateDefaultPricingConfig(
      pricingConfig.fieldMapping,
      modelConfig.modelConfig.config.category,
      pricingConfig,
    );
  }

  const skuMappings = modelConfig.modelConfig.skuMappings;

  if (!skuMappings || skuMappings.length === 0) {
    return null;
  }

  const autoFieldMapping = extractFieldMappingFromSKUMappings(skuMappings);

  const hasDurationInSKU = skuMappings.some((m) => /_\d+S/.test(m.skuCode));
  if (hasDurationInSKU && !autoFieldMapping.duration) {
    try {
      const openapiSchemaStr = modelConfig.modelConfig.config.openapiSchema;
      if (openapiSchemaStr) {
        const schema = JSON.parse(openapiSchemaStr);
        const requestSchema = getRequestSchema(schema);
        if (requestSchema) {
          let parameters = requestSchema.properties?.parameters;
          if (parameters?.$ref) {
            parameters = resolveRef(parameters.$ref, schema);
          }

          if (parameters?.properties?.duration) {
            autoFieldMapping.duration = "object.parameters.duration";
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const category = modelConfig.modelConfig.config.category;
  if (category === "image_gen") {
    try {
      const openapiSchemaStr = modelConfig.modelConfig.config.openapiSchema;
      if (openapiSchemaStr) {
        const schema = JSON.parse(openapiSchemaStr);
        const requestSchema = getRequestSchema(schema);
        if (requestSchema) {
          if (!autoFieldMapping.quality) {
            if (requestSchema.properties?.quality) {
              autoFieldMapping.quality = "body.quality";
            } else if (
              requestSchema.properties?.parameters?.properties?.quality
            ) {
              autoFieldMapping.quality = "object.parameters.quality";
            }
          }

          if (!autoFieldMapping.size) {
            if (requestSchema.properties?.size) {
              autoFieldMapping.size = "body.size";
            } else if (requestSchema.properties?.parameters?.properties?.size) {
              autoFieldMapping.size = "object.parameters.size";
            } else if (requestSchema.properties?.input?.properties?.size) {
              autoFieldMapping.size = "object.input.size";
            } else if (
              requestSchema.properties?.input?.properties?.parameters
                ?.properties?.size
            ) {
              autoFieldMapping.size = "object.input.parameters.size";
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (Object.keys(autoFieldMapping).length > 0) {
    return generateDefaultPricingConfig(
      autoFieldMapping,
      modelConfig.modelConfig.config.category,
      pricingConfig,
    );
  }

  return {
    fieldMapping: {},
    priceFactors: {},
    table: {
      priceUnit: getDefaultPriceUnit(modelConfig.modelConfig.config.category),
    },
    billing: {},
  };
}
