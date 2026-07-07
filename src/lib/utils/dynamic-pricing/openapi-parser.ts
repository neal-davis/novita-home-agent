/**
 * OpenAPI Schema parser
 * Extracts price factors and their possible values from OpenAPI Schema
 */

import { PriceFactor, PricingConfig } from "@/types/dynamic-pricing";

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

interface OpenAPISchema {
  info?: any;
  paths?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

/**
 * Extract price factors from OpenAPI Schema
 */
export function extractPriceFactors(
  openapiSchemaStr: string,
  pricingConfig: PricingConfig,
): PriceFactor[] {
  if (!openapiSchemaStr || openapiSchemaStr.trim() === "") {
    return [];
  }

  try {
    const schema: OpenAPISchema = JSON.parse(openapiSchemaStr);
    const priceFactors: PriceFactor[] = [];

    const requestSchema = getRequestSchema(schema);
    if (!requestSchema) {
      return [];
    }

    (requestSchema as any).__rootSchema = schema;

    for (const [fieldName, fieldPath] of Object.entries(
      pricingConfig.fieldMapping,
    )) {
      const factor = extractFactorFromSchema(
        fieldName,
        fieldPath,
        requestSchema,
        pricingConfig,
        schema,
      );
      if (factor) {
        priceFactors.push(factor);
      }
    }

    priceFactors.sort((a, b) => {
      const orderA = a.displayConfig?.column.order ?? 999;
      const orderB = b.displayConfig?.column.order ?? 999;
      return orderA - orderB;
    });

    return priceFactors;
  } catch (error) {
    console.error("Failed to parse OpenAPI Schema:", error);
    return [];
  }
}

/**
 * Get request body Schema
 */
function getRequestSchema(schema: OpenAPISchema): any {
  if (!schema.paths) {
    return null;
  }

  for (const path of Object.values(schema.paths)) {
    if (path.post?.requestBody) {
      const content = path.post.requestBody.content;
      const jsonContent =
        content["application/json"] || content["multipart/form-data"];
      if (jsonContent?.schema) {
        const requestSchema = jsonContent.schema;
        if (requestSchema.$ref) {
          return resolveRef(requestSchema.$ref, schema);
        }
        return requestSchema;
      }
    }
  }

  return null;
}

/**
 * Resolve $ref reference
 */
function resolveRef(ref: string, schema: OpenAPISchema): any {
  if (!ref.startsWith("#/components/schemas/")) {
    return null;
  }

  const schemaName = ref.replace("#/components/schemas/", "");
  return schema.components?.schemas?.[schemaName] || null;
}

/**
 * Extract a single price factor from Schema
 */
function extractFactorFromSchema(
  fieldName: string,
  fieldPath: string,
  requestSchema: any,
  pricingConfig: PricingConfig,
  rootSchema: OpenAPISchema,
): PriceFactor | null {
  const pathParts = fieldPath.split(".").filter(Boolean);
  const actualPath = pathParts.slice(1);
  let currentSchema = requestSchema;

  for (const part of actualPath) {
    if (currentSchema.$ref) {
      currentSchema = resolveRef(currentSchema.$ref, rootSchema);
      if (!currentSchema) {
        return null;
      }
    }

    if (currentSchema.properties?.[part]) {
      currentSchema = currentSchema.properties[part];
    } else if (currentSchema.type === "object" && currentSchema.properties) {
      if (currentSchema.properties[part]) {
        currentSchema = currentSchema.properties[part];
      } else {
        return null;
      }
    } else {
      return null;
    }

    if (currentSchema.$ref) {
      currentSchema = resolveRef(currentSchema.$ref, rootSchema);
      if (!currentSchema) {
        return null;
      }
    }
  }

  if (!currentSchema) {
    return null;
  }

  const factor: PriceFactor = {
    name: fieldName,
    type: "string",
    values: [],
  };

  if (currentSchema.enum) {
    factor.type = "enum";
    factor.values = currentSchema.enum;
    factor.defaultValue = currentSchema.default;
  } else if (currentSchema.type === "boolean") {
    factor.type = "boolean";
    factor.values = [true, false];
    factor.defaultValue = currentSchema.default ?? false;
  } else if (
    currentSchema.type === "integer" ||
    currentSchema.type === "number"
  ) {
    if (currentSchema.enum) {
      factor.type = "enum";
      factor.values = currentSchema.enum;
    } else {
      factor.type = "number";
      return null;
    }
    factor.defaultValue = currentSchema.default;
  } else {
    return null;
  }

  if (pricingConfig.priceFactors?.[fieldName]) {
    factor.displayConfig = pricingConfig.priceFactors[fieldName];
  } else {
    const title = FIELD_NAME_TO_TITLE[fieldName] || fieldName;
    const render = FIELD_NAME_TO_RENDER[fieldName] || "default";

    factor.displayConfig = {
      column: {
        title,
        dataIndex: fieldName === "fast_mode" ? "mode" : fieldName,
        render,
        order: 999,
      },
    };

    if (fieldName === "fast_mode") {
      factor.displayConfig.valueTransform = (value: boolean) => {
        return value ? "Fast mode" : "Standard mode";
      };
    }
  }

  return factor;
}

/**
 * Extract all possible enum values from Schema (for complex cases)
 */
export function extractEnumValues(schema: any, path: string[]): any[] {
  let current = schema;
  for (const part of path) {
    if (current.properties?.[part]) {
      current = current.properties[part];
    } else {
      return [];
    }
  }

  if (current.enum) {
    return current.enum;
  }

  return [];
}
