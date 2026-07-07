/**
 * Price calculator for Playground and model library
 *
 * Derives price from Redux configs + priceMap (no API call).
 * Same pricing logic as pricing page: dynamic models use config + priceMap + CEL;
 * static models use calcPrice.
 *
 * Usage (compatible with other projects):
 * - getModelPriceFromConfigsAndMap(configs, priceMap, modelName, formData)
 *   Use when you have model name and form params (e.g. from ParametersPanel)
 * - calculatePlaygroundPrice(userParams, modelConfig, priceMap)
 *   Use when you already have modelConfig (e.g. from selected model)
 */

import { DynamicModelConfig } from "@/types/dynamic-pricing";
import { CalculatePriceResult } from "@/types/price";
import {
  calculatePriceForSingleParams,
  convertPlaygroundParamsToFieldMapping,
  calculatePlaygroundPrice,
} from "@/lib/utils/dynamic-pricing/table-generator";
import { getDefaultPriceUnit } from "@/lib/utils/dynamic-pricing/default-config";
import { calcPrice } from "@/lib/utils/pricing";
import { FUNC_NAME } from "@/app/models/constants/funcs";

export { calculatePlaygroundPrice, convertPlaygroundParamsToFieldMapping };

type PriceMap = Record<
  string,
  number | string | { originalPrice: number; discountPrice: number }
>;

function findDynamicConfigByModelIdOrName(
  configs: DynamicModelConfig[],
  modelIdOrName: string,
): DynamicModelConfig | null {
  const byId = configs.find(
    (c) => String(c.fusionConfig?.id) === String(modelIdOrName),
  );
  if (byId) return byId;

  const byName = configs.find(
    (c) =>
      c.fusionConfig?.name?.toLowerCase() === modelIdOrName.toLowerCase() ||
      c.fusionConfig?.displayName?.toLowerCase() ===
        modelIdOrName.toLowerCase(),
  );
  if (byName) return byName;

  const byConfigId = configs.find(
    (c) => String(c.modelConfig?.config?.id) === String(modelIdOrName),
  );
  if (byConfigId) return byConfigId;

  const byConfigName = configs.find(
    (c) =>
      c.modelConfig?.config?.name?.toLowerCase() ===
      modelIdOrName.toLowerCase(),
  );
  if (byConfigName) return byConfigName;

  return null;
}

function isStaticModel(modelIdOrName: string): boolean {
  const values = Object.values(FUNC_NAME) as string[];
  return values.includes(modelIdOrName);
}

function getCategoryFromStaticModelName(modelIdOrName: string): string {
  const name = modelIdOrName.toLowerCase();
  if (
    /video|t2v|i2v|v2v|vidu|wan-|kling|veo|sora|seedance|pixverse|hunyuan|minimax-(video|hailuo)|txt2video|img2video|motionsync|animate-anyone/.test(
      name,
    )
  ) {
    return "video_gen";
  }
  if (
    /speech|tts|asr|voice-cloning|minimax-speech|eleven|glm-tts|scribe|stt/.test(
      name,
    )
  ) {
    return "audio_gen";
  }
  return "image_gen";
}

/**
 * Calculate price for dynamic model (config + params + priceMap)
 * Reusable by getModelPriceFromConfigsAndMap
 */
export function calculateDynamicModelPrice(
  config: DynamicModelConfig,
  params: Record<string, unknown>,
  priceMap: PriceMap,
): CalculatePriceResult | null {
  const { skuCode, price } = calculatePriceForSingleParams(
    params as Record<string, any>,
    config,
    priceMap,
  );
  if (
    skuCode == null ||
    price === "-" ||
    (typeof price === "number" && !Number.isFinite(price))
  ) {
    return null;
  }
  const category = config.modelConfig?.config?.category ?? "";
  const unit =
    config.pricingConfig?.table?.priceUnit ?? getDefaultPriceUnit(category);
  const priceNum = typeof price === "number" ? price : Number(price);
  return { skuCode, price: priceNum, unit };
}

/**
 * Derive price from Redux configs + priceMap (no API call)
 *
 * - Dynamic model: find config by name, convert params via fieldMapping, then CEL match + billingExpr
 * - Static model: use calcPrice (reads Redux modelProductPrice)
 *
 * Same API as other projects for easy playground migration.
 *
 * @param configs - multimodal configs from Redux
 * @param priceMap - price map from Redux
 * @param modelIdOrName - model ID or display name
 * @param params - form/playground params (width, height, duration, resolution, size, mode, etc.)
 * @returns Price result or null if not derivable
 */
export function getModelPriceFromConfigsAndMap(
  configs: DynamicModelConfig[],
  priceMap: PriceMap,
  modelIdOrName: string,
  params: Record<string, unknown> = {},
): CalculatePriceResult | null {
  try {
    const config = findDynamicConfigByModelIdOrName(configs, modelIdOrName);
    if (config) {
      const mappedParams = convertPlaygroundParamsToFieldMapping(
        params as Record<string, any>,
        config,
      );
      const dynamicResult = calculateDynamicModelPrice(
        config,
        mappedParams,
        priceMap,
      );
      return dynamicResult;
    }

    if (isStaticModel(modelIdOrName)) {
      const calcProps = {
        width:
          (params.width as number) ?? (params.size as string)?.split("*")[0],
        height:
          (params.height as number) ?? (params.size as string)?.split("*")[1],
        duration: params.duration,
        quality: params.quality,
        resolutionType: (params.resolutionType ?? params.resolution) as string,
        mode: params.mode,
        ratio: params.ratio,
        audio: params.audio,
        ...params,
      };
      const { originalPrice, discountPrice } = calcPrice(
        modelIdOrName as FUNC_NAME,
        calcProps as any,
      );
      if (
        (originalPrice === "-" || discountPrice === "-") &&
        typeof originalPrice !== "number" &&
        typeof discountPrice !== "number"
      ) {
        return null;
      }
      const orig =
        typeof originalPrice === "number"
          ? originalPrice
          : Number(originalPrice);
      const disc =
        typeof discountPrice === "number"
          ? discountPrice
          : Number(discountPrice);
      if (!Number.isFinite(orig) || !Number.isFinite(disc)) {
        return null;
      }
      const unit = getDefaultPriceUnit(
        getCategoryFromStaticModelName(modelIdOrName),
      );
      return { originalPrice: orig, discountPrice: disc, unit };
    }

    return null;
  } catch {
    return null;
  }
}
