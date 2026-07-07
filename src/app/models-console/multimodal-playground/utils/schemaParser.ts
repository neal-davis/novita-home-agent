import {
  RawOpenAPISchema,
  ParsedOpenAPISchema,
  SchemaProperty,
  MultimodalDetail,
} from "@/types/multimodal-playground";
import { DynamicModelConfig } from "@/types/dynamic-pricing";

/**
 * Resolve $ref references in a schema property
 * @param property - The schema property that may contain $ref
 * @param schemas - All available schemas from components.schemas
 * @returns Resolved schema property
 */
function resolveRef(
  property: SchemaProperty | { $ref: string },
  schemas: Record<string, any>,
): SchemaProperty {
  // If property has a $ref, resolve it
  if ("$ref" in property && property.$ref) {
    const schemaName = property.$ref.split("/").pop();
    if (schemaName && schemas[schemaName]) {
      const resolvedSchema = schemas[schemaName];
      // Recursively resolve any nested $refs in the resolved schema
      return resolveSchemaRefs(resolvedSchema, schemas);
    }
  }

  // Recursively resolve $refs in nested properties
  return resolveSchemaRefs(property as SchemaProperty, schemas);
}

/**
 * Recursively resolve all $ref references in a schema object
 * @param schema - The schema object to resolve
 * @param schemas - All available schemas from components.schemas
 * @returns Schema with all $refs resolved
 */
function resolveSchemaRefs(
  schema: SchemaProperty | any,
  schemas: Record<string, any>,
): SchemaProperty {
  // Handle direct $ref
  if (schema.$ref) {
    return resolveRef(schema, schemas);
  }

  // Clone the schema to avoid mutations
  const resolved = { ...schema };

  // Resolve items.$ref for arrays
  if (resolved.type === "array" && resolved.items) {
    if (resolved.items.$ref) {
      resolved.items = resolveRef(resolved.items, schemas);
    } else {
      resolved.items = resolveSchemaRefs(resolved.items, schemas);
    }
  }

  // Resolve properties for objects
  if (resolved.type === "object" && resolved.properties) {
    const resolvedProperties: Record<string, SchemaProperty> = {};
    Object.keys(resolved.properties).forEach((key) => {
      resolvedProperties[key] = resolveRef(resolved.properties[key], schemas);
    });
    resolved.properties = resolvedProperties;
  }

  // Resolve anyOf/oneOf/allOf
  ["anyOf", "oneOf", "allOf"].forEach((key) => {
    if (resolved[key] && Array.isArray(resolved[key])) {
      resolved[key] = resolved[key].map((item: any) =>
        resolveRef(item, schemas),
      );
    }
  });

  return resolved as SchemaProperty;
}

/**
 * Parse OpenAPI schema from modelConfig
 * Returns flattened schema with dot notation for nested objects
 * Note: isAsyncTask is removed from here and should be read from MultimodalPlaygroundConfig.async
 */
export function parseOpenAPISchema(
  openapiSchema: RawOpenAPISchema,
): ParsedOpenAPISchema {
  const schemas = openapiSchema?.components?.schemas || {};
  const paths = openapiSchema?.paths || {};

  // Get the first path and method
  const pathKeys = Object.keys(paths);
  const endpoint = pathKeys[0] || "";
  const pathConfig = paths[endpoint] || {};
  const methodKeys = Object.keys(pathConfig);
  const method = methodKeys[0] || "post";
  const operation = pathConfig[method] || {};

  // Get request schema
  const requestBodySchema =
    operation.requestBody?.content?.["application/json"]?.schema;
  const requestSchemaRef = requestBodySchema?.$ref;

  let originalSchema: Record<string, SchemaProperty> = {};
  let originalRequiredFields: string[] = [];

  if (requestSchemaRef) {
    // Extract schema name from $ref (e.g., "#/components/schemas/Flux2Request")
    const schemaName = requestSchemaRef.split("/").pop();
    const schema = schemas[schemaName];
    if (schema) {
      originalSchema = schema.properties || {};
      originalRequiredFields = schema.required || [];
    }
  } else if (requestBodySchema?.properties) {
    originalSchema = requestBodySchema.properties;
    originalRequiredFields = requestBodySchema.required || [];
  }

  // Resolve all $ref references in the schema
  const resolvedSchema: Record<string, SchemaProperty> = {};
  Object.keys(originalSchema).forEach((key) => {
    resolvedSchema[key] = resolveRef(originalSchema[key], schemas);
  });

  // Flatten nested schema and required fields
  const requestSchema = flattenSchema(resolvedSchema);
  const requiredFields = flattenRequiredFields(
    resolvedSchema,
    originalRequiredFields,
  );

  return {
    requestSchema,
    endpoint,
    method,
    description: operation.description,
    requiredFields,
  };
}

/**
 * Get default value for a field
 * @param property - Schema property
 * @param isRequired - Whether the field is required
 * Returns explicit default if defined, otherwise returns a type-based default only for required fields
 */
export function getDefaultValue(
  property: SchemaProperty,
  isRequired: boolean = false,
): any {
  if (property.default !== undefined) {
    return property.default;
  }

  // For optional fields without explicit default, return undefined so they can be omitted
  if (!isRequired) {
    return undefined;
  }

  // For required fields, provide a type-based default for form initialization
  switch (property.type) {
    case "string":
      return "";
    case "integer":
    case "number":
      return property.minimum ?? 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      // For object type, don't return empty object
      // It will be flattened into separate fields
      return undefined;
    default:
      return null;
  }
}

/**
 * Validate field value against schema
 */
export function validateField(
  value: any,
  property: SchemaProperty,
  isRequired: boolean,
): string | null {
  // Validate required
  if (isRequired && (value === null || value === undefined || value === "")) {
    return "This field is required";
  }

  // Skip validation when optional field is empty
  if (!isRequired) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    if (
      property.type === "array" &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      return null;
    }
    if (
      property.type === "object" &&
      typeof value === "object" &&
      Object.keys(value).length === 0
    ) {
      return null;
    }
  }

  // Type validation
  switch (property.type) {
    case "integer":
    case "number":
      if (typeof value !== "number" || isNaN(value)) {
        return "Must be a valid number";
      }
      if (property.minimum !== undefined && value < property.minimum) {
        return `Cannot be less than ${property.minimum}`;
      }
      if (property.maximum !== undefined && value > property.maximum) {
        return `Cannot be greater than ${property.maximum}`;
      }
      break;
    case "string":
      if (typeof value !== "string") {
        return "Must be a string";
      }
      if (
        property.minLength !== undefined &&
        value.length < property.minLength
      ) {
        return `Length cannot be less than ${property.minLength} characters`;
      }
      if (
        property.maxLength !== undefined &&
        value.length > property.maxLength
      ) {
        return `Length cannot exceed ${property.maxLength} characters`;
      }
      if (property.pattern) {
        const regex = new RegExp(property.pattern);
        if (!regex.test(value)) {
          return "Invalid format";
        }
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        return "Must be an array";
      }
      if (property.minItems !== undefined && value.length < property.minItems) {
        return `At least ${property.minItems} items required`;
      }
      if (property.maxItems !== undefined && value.length > property.maxItems) {
        return `At most ${property.maxItems} items allowed`;
      }
      break;
  }

  return null;
}

/**
 * Flatten nested schema into dot notation (e.g., "input.prompt")
 * @param schema - The schema to flatten
 * @param prefix - The prefix for nested keys
 * @returns Flattened schema with dot notation keys
 */
export function flattenSchema(
  schema: Record<string, SchemaProperty>,
  prefix: string = "",
): Record<string, SchemaProperty> {
  const flattened: Record<string, SchemaProperty> = {};

  Object.keys(schema).forEach((key) => {
    const property = schema[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (property.type === "object" && property.properties) {
      // Recursively flatten nested objects
      const nested = flattenSchema(property.properties, fullKey);
      Object.assign(flattened, nested);
    } else {
      // Add non-object properties directly
      flattened[fullKey] = property;
    }
  });

  return flattened;
}

/**
 * Flatten required fields array to include nested paths
 * @param schema - The original schema
 * @param requiredFields - The required fields at current level
 * @param prefix - The prefix for nested keys
 * @returns Flattened required fields with dot notation
 */
export function flattenRequiredFields(
  schema: Record<string, SchemaProperty>,
  requiredFields: string[],
  prefix: string = "",
): string[] {
  const flattened: string[] = [];

  requiredFields.forEach((field) => {
    const property = schema[field];
    const fullKey = prefix ? `${prefix}.${field}` : field;

    flattened.push(fullKey);

    if (
      property?.type === "object" &&
      property.properties &&
      property.required
    ) {
      const nested = flattenRequiredFields(
        property.properties,
        property.required,
        fullKey,
      );
      flattened.push(...nested);
    }
  });

  Object.keys(schema).forEach((field) => {
    if (requiredFields.includes(field)) {
      return;
    }

    const property = schema[field];
    const fullKey = prefix ? `${prefix}.${field}` : field;

    if (
      property?.type === "object" &&
      property.properties &&
      property.required &&
      property.required.length > 0
    ) {
      const nested = flattenRequiredFields(
        property.properties,
        property.required,
        fullKey,
      );
      flattened.push(...nested);
    }
  });

  return flattened;
}

/**
 * Generate form data from schema with default values
 * Supports nested schemas with dot notation (e.g., "input.prompt")
 */
export function generateDefaultFormData(
  schema: Record<string, SchemaProperty>,
  requiredFields: string[] = [],
): Record<string, any> {
  const formData: Record<string, any> = {};
  const flattenedSchema = flattenSchema(schema);

  Object.keys(flattenedSchema).forEach((key) => {
    const isRequired = requiredFields.includes(key);
    const value = getDefaultValue(flattenedSchema[key], isRequired);
    if (value !== undefined) {
      formData[key] = value;
    }
  });

  return formData;
}

/**
 * Convert flat form data (with dot notation) back to nested structure
 * @param flatData - Flat form data with dot notation keys
 * @returns Nested object structure
 */
export function unflattenFormData(
  flatData: Record<string, any>,
): Record<string, any> {
  const nested: Record<string, any> = {};

  Object.keys(flatData).forEach((key) => {
    const value = flatData[key];
    const parts = key.split(".");

    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  });

  return nested;
}

/**
 * Get value from formData by flattened key
 * @param flattenedKey - Dot notation key (e.g., "input.prompt")
 * @param formData - Form data object (can be flat or nested)
 * @returns The value at the specified path, or undefined if not found
 */
export function getValueByFlattenedKey(
  flattenedKey: string,
  formData: Record<string, any>,
): any {
  // First check if the flattened key exists directly in formData
  if (flattenedKey in formData) {
    return formData[flattenedKey];
  }

  // If not found, traverse the nested structure
  const parts = flattenedKey.split(".");
  let current = formData;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Check if a value is considered empty
 */
function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return true;
  }
  return false;
}

/**
 * Filter out empty fields from form data before submitting
 * Only keeps required fields and non-empty optional fields
 * Converts flat form data (with dot notation) back to nested structure
 */
export function filterEmptyFields(
  formData: Record<string, any>,
  requiredFields: string[],
): Record<string, any> {
  const filteredData: Record<string, any> = {};

  Object.keys(formData).forEach((key) => {
    const value = formData[key];
    const isRequired = requiredFields.includes(key);

    // Always include required fields, only include optional fields if not empty
    if (isRequired || !isEmptyValue(value)) {
      filteredData[key] = value;
    }
  });

  // Convert flat data back to nested structure
  return unflattenFormData(filteredData);
}

/**
 * Safely parse and normalize model config from API response
 */
export const parseRawListItem = (
  rawConfig: DynamicModelConfig,
): MultimodalDetail => {
  try {
    const config = rawConfig.modelConfig.config;
    let parsedOpenAPISchema: ParsedOpenAPISchema | null = null;
    const schemaSource = config.openapiSchema;

    if (schemaSource) {
      if (typeof schemaSource === "object") {
        parsedOpenAPISchema = schemaSource;
      } else if (typeof schemaSource === "string") {
        try {
          parsedOpenAPISchema = JSON.parse(schemaSource);
        } catch (parseError) {
          throw new Error("Failed to parse openapiSchema string");
        }
      }
    }

    if (!parsedOpenAPISchema) {
      throw new Error("Failed to parse openapiSchema");
    }

    let examples: {
      request: Record<string, any>;
      response: Record<string, any>;
    }[] = [];
    const examplesStr = (rawConfig.fusionConfig as any).examples;
    if (examplesStr) {
      try {
        examples = JSON.parse(examplesStr);
      } catch (parseError) {
        throw new Error("Failed to parse examples string");
      }
    }

    return {
      name: rawConfig.fusionConfig.name,
      displayName: rawConfig.fusionConfig.displayName,
      category: config.category as "image_gen" | "audio_gen" | "video_gen",
      async: config.async,
      description: rawConfig.fusionConfig.description || "",
      markdown: (rawConfig.fusionConfig as any).markdown || "",
      examples,
      openapiSchema: parsedOpenAPISchema as unknown as RawOpenAPISchema,
    };
  } catch (error) {
    console.error("Failed to parse model config:", error, rawConfig);
    return {
      name: "Error Loading Model",
      displayName: "Error Loading Model",
      category: "image_gen" as const,
      async: false,
      description: "Failed to load model configuration",
      markdown: "",
      examples: [],
      openapiSchema: {
        info: {
          title: "Error Loading Model",
          version: "1.0.0",
          description: "Failed to load model configuration",
        },
        paths: {},
        components: {
          schemas: {},
        },
      },
    };
  }
};
