/**
 * Doc link generator
 * Generates doc links from OpenAPI Schema: extract endpoint name from API path -> /docs/api-reference/model-apis-{endpointName}
 */

import { DynamicModelConfig } from "@/types/dynamic-pricing";

/**
 * Extract endpoint name from OpenAPI schema (last segment of path, e.g. /v3/async/wan2.5-t2v -> wan2.5-t2v)
 */
function extractEndpointName(openapiSchemaStr: string): string | null {
  try {
    const schema = JSON.parse(openapiSchemaStr);
    const paths = schema.paths;

    if (!paths || Object.keys(paths).length === 0) {
      return null;
    }

    const pathKey = Object.keys(paths)[0];
    const pathSegments = pathKey.split("/").filter((p) => p);
    if (pathSegments.length === 0) {
      return null;
    }

    return pathSegments[pathSegments.length - 1];
  } catch (error) {
    console.error(
      "Failed to extract endpoint name from OpenAPI schema:",
      error,
    );
    return null;
  }
}

/**
 * Generate doc link: /docs/api-reference/model-apis-{endpointName}
 */
export function generateDocLink(modelConfig: DynamicModelConfig): string {
  const endpointName = extractEndpointName(
    modelConfig.modelConfig.config.openapiSchema,
  );

  if (!endpointName) {
    return "";
  }

  return `/docs/api-reference/model-apis-${endpointName}`;
}

/**
 * Generate doc links for multiple configs
 */
export function generateDocLinks(
  modelConfigs: DynamicModelConfig[],
): Map<number, string> {
  const linkMap = new Map<number, string>();

  modelConfigs.forEach((config) => {
    const link = generateDocLink(config);
    if (link) {
      linkMap.set(config.fusionConfig.id, link);
    }
  });

  return linkMap;
}
