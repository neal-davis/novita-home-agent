import Big from "big.js";
import {
  LLMModelStatus,
  LLMModelWithStatus,
  ModelLabel,
  ModelLabelMap,
  ModelType,
} from "@/types/models";
import { transformModelIdToPath } from "@/lib/utils";

export type ProductModelType = "chat" | "embedding" | "reranker";

const typeMap: Record<
  ProductModelType,
  ModelType.Chat | ModelType.Embedding | ModelType.Reranker
> = {
  chat: ModelType.Chat,
  embedding: ModelType.Embedding,
  reranker: ModelType.Reranker,
};

function getDiscountRatio(
  pricing?: { originPricePerM?: number; pricePerM?: number } | null,
) {
  if (
    !pricing?.originPricePerM ||
    pricing.originPricePerM <= 0 ||
    pricing.pricePerM === undefined ||
    pricing.pricePerM >= pricing.originPricePerM
  ) {
    return undefined;
  }

  return pricing.pricePerM / pricing.originPricePerM;
}

/**
 * Transform raw model data from API to LLMModelWithStatus
 * @param rawModel - Raw model data from API
 * @returns Transformed LLMModelWithStatus object
 */
export const convertRawModelToLLMModelClient = (
  rawModel: any,
  fallbackType: ProductModelType = "chat",
): LLMModelWithStatus => {
  const inputInfo = Big(rawModel.input_token_price_per_m || 0)
    .div(10000)
    .toString();
  const originInputInfo =
    rawModel.input_pricing?.originPricePerM &&
    rawModel.input_pricing?.originPricePerM !== rawModel.input_token_price_per_m
      ? Big(rawModel.input_pricing?.originPricePerM || 0)
          .div(10000)
          .toString()
      : undefined;
  const outputInfo = Big(rawModel.output_token_price_per_m || 0)
    .div(10000)
    .toString();
  const hasOutputTokenPrice =
    rawModel.output_token_price_per_m !== undefined &&
    rawModel.output_token_price_per_m !== null;
  const originOutputInfo =
    rawModel.output_pricing?.originPricePerM &&
    rawModel.output_pricing?.originPricePerM !==
      rawModel.output_token_price_per_m
      ? Big(rawModel.output_pricing?.originPricePerM || 0)
          .div(10000)
          .toString()
      : undefined;
  const cacheReadInfo = rawModel.cache_read_input_token_price_per_m
    ? Big(rawModel.cache_read_input_token_price_per_m || 0)
        .div(10000)
        .toString()
    : undefined;
  const originCacheReadInfo =
    rawModel.cache_read_input_pricing?.originPricePerM &&
    rawModel.cache_read_input_pricing?.originPricePerM !==
      rawModel.cache_read_input_token_price_per_m
      ? Big(rawModel.cache_read_input_pricing?.originPricePerM || 0)
          .div(10000)
          .toString()
      : undefined;
  const cacheWrite5mInfo = rawModel.cache_creation_input_token_price_per_m
    ? Big(rawModel.cache_creation_input_token_price_per_m || 0)
        .div(10000)
        .toString()
    : undefined;
  const originCacheWrite5mInfo =
    rawModel.cache_creation_input_pricing?.originPricePerM &&
    rawModel.cache_creation_input_pricing?.originPricePerM !==
      rawModel.cache_creation_input_token_price_per_m
      ? Big(rawModel.cache_creation_input_pricing?.originPricePerM || 0)
          .div(10000)
          .toString()
      : undefined;
  const cacheWrite1hInfo =
    rawModel.cache_creation_1_hour_input_token_price_per_m
      ? Big(rawModel.cache_creation_1_hour_input_token_price_per_m || 0)
          .div(10000)
          .toString()
      : undefined;
  const originCacheWrite1hInfo =
    rawModel.cache_creation_1_hour_input_pricing?.originPricePerM &&
    rawModel.cache_creation_1_hour_input_pricing?.originPricePerM !==
      rawModel.cache_creation_1_hour_input_token_price_per_m
      ? Big(rawModel.cache_creation_1_hour_input_pricing?.originPricePerM || 0)
          .div(10000)
          .toString()
      : undefined;

  const modelType =
    (rawModel.model_type as ProductModelType | undefined) || fallbackType;

  const model: LLMModelWithStatus = {
    type: typeMap[modelType] || typeMap[fallbackType],
    id: rawModel.id,
    name: rawModel.title.includes("/")
      ? rawModel.title.split("/")[1]
      : rawModel.title,
    displayName: rawModel.display_name,
    description: rawModel.description,
    context_size: rawModel.context_size,
    input_token_price_per_m: rawModel.input_token_price_per_m,
    output_token_price_per_m: rawModel.output_token_price_per_m,
    cache_read_input_token_price_per_m:
      rawModel.cache_read_input_token_price_per_m,
    cache_creation_input_token_price_per_m:
      rawModel.cache_creation_input_token_price_per_m,
    cache_creation_input_pricing: rawModel.cache_creation_input_pricing,
    cache_creation_1_hour_input_token_price_per_m:
      rawModel.cache_creation_1_hour_input_token_price_per_m,
    cache_creation_1_hour_input_pricing:
      rawModel.cache_creation_1_hour_input_pricing,
    input_token_price_per_m_toString: Big(rawModel.input_token_price_per_m || 0)
      .div(10_000)
      .toString(),
    output_token_price_per_m_toString: Big(
      rawModel.output_token_price_per_m || 0,
    )
      .div(10_000)
      .toString(),
    features: rawModel.features,
    inputModalities: rawModel.input_modalities,
    outputModalities: rawModel.output_modalities,
    endpoints: rawModel.endpoints || [],
    linkPath:
      rawModel.status === LLMModelStatus.Available
        ? `${transformModelIdToPath(rawModel.id)}`
        : undefined,
    infos: {
      inputPricing: `$${inputInfo}/Mt`,
      originInputPricing: originInputInfo
        ? `$${originInputInfo}/Mt`
        : undefined,
      outputPricing: hasOutputTokenPrice ? `$${outputInfo}/Mt` : undefined,
      originOutputPricing: originOutputInfo
        ? `$${originOutputInfo}/Mt`
        : undefined,
      contextSize: rawModel.context_size,
      maxOutputTokens: rawModel.max_output_tokens,
      cacheReadPricing: cacheReadInfo ? `$${cacheReadInfo}/Mt` : undefined,
      originCacheReadPricing: originCacheReadInfo
        ? `$${originCacheReadInfo}/Mt`
        : undefined,
      cacheWrite5mPricing: cacheWrite5mInfo
        ? `$${cacheWrite5mInfo}/Mt`
        : undefined,
      originCacheWrite5mPricing: originCacheWrite5mInfo
        ? `$${originCacheWrite5mInfo}/Mt`
        : undefined,
      cacheWrite1hPricing: cacheWrite1hInfo
        ? `$${cacheWrite1hInfo}/Mt`
        : undefined,
      originCacheWrite1hPricing: originCacheWrite1hInfo
        ? `$${originCacheWrite1hInfo}/Mt`
        : undefined,
    },
    status: rawModel.status,
    input_pricing: rawModel.input_pricing,
    cache_read_input_pricing: rawModel.cache_read_input_pricing,
    cache_pricing: {
      originPricePerM:
        Big(
          rawModel.cache_read_input_pricing?.originPricePerM || 0,
        ).toNumber() || 0,
      pricePerM:
        Big(rawModel.cache_read_input_token_price_per_m || 0).toNumber() || 0,
    },
    output_pricing: rawModel.output_pricing,
    max_output_tokens: rawModel.max_output_tokens,
    rpm: rawModel.rpm,
    tmp: rawModel.tmp,
    labels: rawModel.labels || [],
    tags: [
      ...(modelType === "chat" ? ["LLM"] : []),
      // Only add "Serverless" to tags if features includes "serverless"
      ...(modelType === "chat" &&
      Array.isArray(rawModel.features) &&
      rawModel.features.some((f: string) => f.toLowerCase() === "serverless")
        ? ["Serverless"]
        : []),
      ...(modelType === "embedding" ? ["Embedding"] : []),
      ...(modelType === "reranker" ? ["Reranker"] : []),
      ...(rawModel.tags || []),
    ],
    series: rawModel.series,
    quantization: rawModel.quantization,
    quota_items: rawModel.quota_items || [],
    is_tiered_billing: rawModel.is_tiered_billing,
    tiered_billing_configs: rawModel.tiered_billing_configs,
    multimodal_pricing: rawModel.multimodal_pricing,
    model_released_at: rawModel.model_released_at,
    platform_release_at: rawModel.platform_release_at,
    isCompletion:
      (Array.isArray(rawModel.endpoints) &&
        rawModel.endpoints.includes("completions")) ||
      false,
  };
  // Preserve new fields from include_de=true
  (model as any).de_configured = rawModel.de_configured;
  (model as any).hf_mirror_url = rawModel.hf_mirror_url;
  model.displayName = model.displayName || model.name || "";

  // Merge tags to labels
  if (Array.isArray(rawModel.tags && rawModel.tags.length > 0)) {
    const mergeToLabels: Array<ModelLabel> = [];
    rawModel.tags.forEach((tag: string) => {
      const labels = model.labels?.find((c) => c.value === tag);
      if (!labels) {
        mergeToLabels.push({
          key: ModelLabelMap.Footer,
          value: tag,
        });
      }
    });
    model.labels = [...(model.labels as Array<ModelLabel>), ...mergeToLabels];
  }

  // Process labels for discount, new, hot, featured
  if (Array.isArray(model.labels)) {
    const displayLabels = model.labels.filter(
      (one) => one.key === ModelLabelMap.Display,
    );
    const filterLabels = model.labels.filter(
      (one) => one.key === ModelLabelMap.Filter,
    );
    const hasFreeLabel = displayLabels.find(
      (one) => one.value === ModelLabelMap.Free,
    );
    const hasDiscountLabel = displayLabels.find(
      (one) => one.value === ModelLabelMap.Discount,
    );
    const newLabel = displayLabels.find(
      (one) => one.value === ModelLabelMap.New,
    );
    const hasHotLabel = displayLabels.find(
      (one) => one.value === ModelLabelMap.Hot,
    );
    const hasFeaturedLabel = filterLabels.find(
      (one) => one.value === ModelLabelMap.Featured,
    );

    const discountValue = [
      model.input_pricing,
      model.output_pricing,
      model.cache_read_input_pricing,
      model.cache_creation_input_pricing,
      model.cache_creation_1_hour_input_pricing,
    ]
      .map(getDiscountRatio)
      .find((value) => value !== undefined);

    model.isDiscount = hasDiscountLabel !== undefined;
    model.isFree = hasFreeLabel !== undefined;
    model.isNew = newLabel !== undefined;
    model.isHot = hasHotLabel !== undefined;
    model.discount = discountValue;
    model.isFeatured = hasFeaturedLabel !== undefined;
  }

  return model;
};
