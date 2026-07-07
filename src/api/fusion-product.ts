import { request, service_base_url } from "./api";
import { DynamicModelConfig, PricingConfig } from "@/types/dynamic-pricing";
import { MultimodalListItem } from "@/types/multimodal-playground";

/**
 * Parse pricingConfig from modelConfig.config.priceConfig
 * priceConfig is a JSON string that needs to be parsed and assigned to the pricingConfig field
 */
function parsePriceConfig(config: DynamicModelConfig): DynamicModelConfig {
  const priceConfigStr = config.modelConfig?.config?.priceConfig;

  if (!priceConfigStr || typeof priceConfigStr !== "string") {
    return config;
  }

  try {
    const parsedPriceConfig = JSON.parse(priceConfigStr) as PricingConfig;
    return {
      ...config,
      pricingConfig: parsedPriceConfig,
    };
  } catch (error) {
    console.warn(
      "Failed to parse priceConfig for model:",
      config.modelConfig?.config?.name,
      error,
    );
    return config;
  }
}

/**
 * TODO Temporary use before storing in store (to be removed)
 */
export function fetchMultimodalPlaygroundConfig(
  fusionProductNames?: string[],
): Promise<MultimodalListItem[]> {
  return request({
    url: "/v1/product/multimodal-model/list",
    method: "GET",
    query: {
      returnSchema: true,
    },
  }).then((data) => data.configs);
}

/**
 * Get enabled fusion product configuration list (for client-side use)
 */
export async function getEnabledFusionProductConfigs(
  name?: string,
): Promise<DynamicModelConfig[]> {
  try {
    const response = (await request({
      url: "/v1/product/multimodal-model/list",
      method: "GET",
      query: {
        returnSchema: true,
        ...(name ? { fusion_product_names: name } : {}),
      },
    })) as { configs: DynamicModelConfig[]; total: number };

    // The API returns a configs field, not data
    const result = response?.configs || [];

    // Process each configuration, parsing pricingConfig from modelConfig.config.priceConfig
    return result.map(parsePriceConfig);
  } catch (error) {
    return [];
  }
}

/**
 * Get enabled fusion product configuration list (for server-side use, using native fetch cache)
 * Suitable for generateMetadata and server components to avoid duplicate requests
 */
export async function getEnabledFusionProductConfigsForServer(
  name?: string,
): Promise<DynamicModelConfig[]> {
  try {
    const queryParams = new URLSearchParams({
      returnSchema: "true",
      ...(name ? { fusion_product_names: name } : {}),
    });

    const url = `${service_base_url}/v1/product/multimodal-model/list?${queryParams}`;

    // Use Next.js fetch caching feature
    // Same URLs within the same request cycle are automatically deduplicated
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Next.js will automatically cache and deduplicate identical requests
      next: { revalidate: 60 }, // Revalidate after 60 seconds
    });

    if (!response.ok) {
      console.warn(`Failed to fetch product configs: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as {
      configs: DynamicModelConfig[];
      total: number;
    };

    const result = data?.configs || [];

    // Process each configuration, parsing pricingConfig from modelConfig.config.priceConfig
    return result.map(parsePriceConfig);
  } catch (error) {
    console.warn("Error fetching product configs:", error);
    return [];
  }
}
