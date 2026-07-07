import type {
  LLMLibraryInfo,
  LLMModelWithStatus,
  MediaModel,
  TieredBillingConfig,
} from "@/types/models";
import type { AnyModel } from "./capabilities";
import {
  getMultimodalPriceEntries,
  getMultimodalSummaryEntries,
  type MultimodalPriceEntry,
} from "./multimodal-pricing";

export type PriceLine = {
  label: string;
  value: string;
  originalValue?: string;
  discounted?: boolean;
  modality?: "text" | "image" | "audio" | "video";
  kind?: "input" | "output" | "cache-read" | "cache-write" | "cache-write-1h";
};

export type TieredPriceLine = {
  label: string;
  value: string;
  discounted: boolean;
};

export type TieredPricingRow = {
  inputRange: string;
  prices: TieredPriceLine[];
};

export type ModelExpandLabel = "Tiered" | "Multimodal";

function isLLMModel(model: AnyModel): model is LLMModelWithStatus {
  return "input_token_price_per_m_toString" in model;
}

function normalizeInfoValue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
}

function formatPricePerM(value?: number): string {
  return `$${(Number(value ?? 0) / 10_000).toString()}/Mt`;
}

function formatRange(min?: number, max?: number) {
  const start = Number(min ?? 0).toLocaleString();
  const end =
    max === undefined || max === null || max < 0
      ? "∞"
      : Number(max).toLocaleString();
  return `[${start} - ${end})`;
}

function getTierPriceLine(
  label: string,
  pricing: TieredBillingConfig["input_pricing"] | undefined,
): TieredPriceLine | null {
  if (pricing?.pricePerM === undefined || pricing.pricePerM === null) {
    return null;
  }

  return {
    label,
    value: formatPricePerM(pricing.pricePerM),
    discounted:
      Boolean(pricing.originPricePerM) &&
      pricing.originPricePerM > pricing.pricePerM,
  };
}

function getPriceLine(
  label: string,
  value?: string,
  originalValue?: string,
): PriceLine | null {
  if (!value) {
    return null;
  }

  return {
    label,
    value,
    originalValue:
      originalValue && originalValue !== value ? originalValue : undefined,
    discounted: Boolean(originalValue && originalValue !== value),
  };
}

function toMultimodalPriceLine(entry: MultimodalPriceEntry): PriceLine {
  const value = formatPricePerM(entry.pricePerM);
  const originalValue =
    entry.originPricePerM !== entry.pricePerM
      ? formatPricePerM(entry.originPricePerM)
      : undefined;

  return {
    label: entry.label,
    value,
    originalValue,
    discounted: entry.discounted,
    modality: entry.modality,
    kind: entry.kind,
  };
}

export function getTieredPricingRows(
  model: Pick<
    LLMModelWithStatus,
    "is_tiered_billing" | "tiered_billing_configs"
  >,
): TieredPricingRow[] {
  if (!model.is_tiered_billing || !model.tiered_billing_configs?.length) {
    return [];
  }

  return model.tiered_billing_configs.map((tier) => ({
    inputRange: formatRange(tier.min_tokens, tier.max_tokens),
    prices: [
      getTierPriceLine("Cache Read", tier.cache_read_input_pricing),
      getTierPriceLine("Cache Write", tier.cache_creation_input_pricing),
      getTierPriceLine("Input", tier.input_pricing),
      getTierPriceLine("Output", tier.output_pricing),
    ].filter((line): line is TieredPriceLine => Boolean(line)),
  }));
}

export function getExpandedModelPriceLines(model: AnyModel): PriceLine[] {
  if (!isLLMModel(model)) {
    return [];
  }

  return getMultimodalPriceEntries(model.multimodal_pricing).map(
    toMultimodalPriceLine,
  );
}

export function getModelPriceLines(model: AnyModel): PriceLine[] {
  if (isLLMModel(model)) {
    const multimodalSummary = getMultimodalSummaryEntries(
      model.multimodal_pricing,
    ).map(toMultimodalPriceLine);

    if (multimodalSummary.length > 0) {
      return multimodalSummary;
    }

    const infos = model.infos as LLMLibraryInfo | undefined;
    return [
      getPriceLine("Input", infos?.inputPricing, infos?.originInputPricing),
      getPriceLine("Output", infos?.outputPricing, infos?.originOutputPricing),
      getPriceLine(
        "Cache read",
        infos?.cacheReadPricing,
        infos?.originCacheReadPricing,
      ),
      getPriceLine(
        "Cache write",
        infos?.cacheWrite5mPricing,
        infos?.originCacheWrite5mPricing,
      ),
      getPriceLine(
        "Cache write 1h",
        infos?.cacheWrite1hPricing,
        infos?.originCacheWrite1hPricing,
      ),
    ].filter((line): line is PriceLine => Boolean(line));
  }

  const [firstInfoGroup] = ((model as MediaModel).infos ?? []) as Array<
    string[] | string
  >;

  if (Array.isArray(firstInfoGroup)) {
    return firstInfoGroup.flatMap((value, index) => {
      const normalized = normalizeInfoValue(value);
      return normalized
        ? [{ label: index === 0 ? "Price" : "Info", value: normalized }]
        : [];
    });
  }

  const normalized = normalizeInfoValue(firstInfoGroup);
  return normalized ? [{ label: "Price", value: normalized }] : [];
}

export function getModelExpandLabel(model: AnyModel): ModelExpandLabel | null {
  if (!isLLMModel(model)) {
    return null;
  }

  if (getTieredPricingRows(model).length > 0) {
    return "Tiered";
  }

  const hasMultimodalPrices = getExpandedModelPriceLines(model).some(
    (line) => line.modality !== undefined,
  );

  return hasMultimodalPrices ? "Multimodal" : null;
}

export function getListSummaryPriceLines(model: AnyModel): PriceLine[] {
  const summaryPriceLines = getModelPriceLines(model);
  const expandLabel = getModelExpandLabel(model);

  if (expandLabel !== "Multimodal") {
    return summaryPriceLines;
  }

  return summaryPriceLines.filter(
    (line) => line.modality === undefined || line.modality === "text",
  );
}

export function getListExpandedPriceLines(model: AnyModel): PriceLine[] {
  const expandLabel = getModelExpandLabel(model);
  if (expandLabel !== "Multimodal") {
    return [];
  }

  return getExpandedModelPriceLines(model).filter(
    (line) => line.modality && line.modality !== "text",
  );
}
