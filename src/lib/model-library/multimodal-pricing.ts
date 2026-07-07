import type {
  MultimodalPricing,
  MultimodalPricingInputItem,
  MultimodalPricingOutputItem,
} from "@/types/models";

export type MultimodalPriceKind =
  | "input"
  | "output"
  | "cache-read"
  | "cache-write"
  | "cache-write-1h";

export type MultimodalPriceModality = "text" | "image" | "audio" | "video";

export type MultimodalPriceEntry = {
  modality: MultimodalPriceModality;
  kind: MultimodalPriceKind;
  label: string;
  pricePerM: number;
  originPricePerM: number;
  discounted: boolean;
};

const MODALITY_ORDER: MultimodalPriceModality[] = [
  "text",
  "image",
  "audio",
  "video",
];

const KIND_ORDER: MultimodalPriceKind[] = [
  "input",
  "output",
  "cache-read",
  "cache-write",
  "cache-write-1h",
];

function isModality(value: string): value is MultimodalPriceModality {
  return MODALITY_ORDER.includes(value as MultimodalPriceModality);
}

function getModalities(modals: unknown): MultimodalPriceModality[] {
  if (!Array.isArray(modals)) return [];

  return modals
    .map((item) => String(item ?? "").toLowerCase())
    .filter(isModality)
    .filter((item, index, values) => values.indexOf(item) === index);
}

function readNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getKindLabel(kind: MultimodalPriceKind) {
  switch (kind) {
    case "input":
      return "Input";
    case "output":
      return "Output";
    case "cache-read":
      return "Cache Read";
    case "cache-write":
      return "Cache Write";
    case "cache-write-1h":
      return "Cache Write 1h";
  }
}

function getModalityLabel(modality: MultimodalPriceModality) {
  return modality.charAt(0).toUpperCase() + modality.slice(1);
}

function buildLabel(
  modality: MultimodalPriceModality,
  kind: MultimodalPriceKind,
) {
  return `${getModalityLabel(modality)} · ${getKindLabel(kind)}`;
}

function buildEntry(
  modality: MultimodalPriceModality,
  kind: MultimodalPriceKind,
  priceValue: unknown,
  originValue: unknown,
): MultimodalPriceEntry | null {
  const pricePerM = readNumber(priceValue);
  if (pricePerM === null) {
    return null;
  }

  const originPricePerM = readNumber(originValue) ?? pricePerM;

  return {
    modality,
    kind,
    label: buildLabel(modality, kind),
    pricePerM,
    originPricePerM,
    discounted: originPricePerM > pricePerM,
  };
}

function collectInputEntries(
  item: MultimodalPricingInputItem,
): MultimodalPriceEntry[] {
  const modalities = getModalities(item.modals);

  return modalities.flatMap((modality) =>
    [
      buildEntry(
        modality,
        "input",
        item.input_token_discount_price ?? item.inputTokenDiscountPrice,
        item.input_token_base_price ?? item.inputTokenBasePrice,
      ),
      buildEntry(
        modality,
        "cache-read",
        item.cache_read_input_discount_price ??
          item.cacheReadInputDiscountPrice,
        item.cache_read_input_base_price ?? item.cacheReadInputBasePrice,
      ),
      buildEntry(
        modality,
        "cache-write",
        item.cache_creation_input_discount_price ??
          item.cacheCreationInputDiscountPrice,
        item.cache_creation_input_base_price ??
          item.cacheCreationInputBasePrice,
      ),
      buildEntry(
        modality,
        "cache-write-1h",
        item.cache_creation_1_hour_input_discount_price ??
          item.cacheCreation1HourInputDiscountPrice,
        item.cache_creation_1_hour_input_base_price ??
          item.cacheCreation1HourInputBasePrice,
      ),
    ].filter((entry): entry is MultimodalPriceEntry => Boolean(entry)),
  );
}

function collectOutputEntries(
  item: MultimodalPricingOutputItem,
): MultimodalPriceEntry[] {
  const modalities = getModalities(item.modals);

  return modalities
    .map((modality) =>
      buildEntry(
        modality,
        "output",
        item.output_token_discount_price ?? item.outputTokenDiscountPrice,
        item.output_token_base_price ?? item.outputTokenBasePrice,
      ),
    )
    .filter((entry): entry is MultimodalPriceEntry => Boolean(entry));
}

export function getMultimodalPriceEntries(
  pricing: MultimodalPricing | null | undefined,
): MultimodalPriceEntry[] {
  const inputItems = pricing?.input_price ?? pricing?.inputPrice ?? [];
  const outputItems = pricing?.output_price ?? pricing?.outputPrice ?? [];

  return [
    ...inputItems.flatMap(collectInputEntries),
    ...outputItems.flatMap(collectOutputEntries),
  ].sort(
    (left, right) =>
      MODALITY_ORDER.indexOf(left.modality) -
        MODALITY_ORDER.indexOf(right.modality) ||
      KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind),
  );
}

export function getMultimodalSummaryEntries(
  pricing: MultimodalPricing | null | undefined,
): MultimodalPriceEntry[] {
  return getMultimodalPriceEntries(pricing).filter(
    (entry) => entry.modality === "text",
  );
}

export function getMultimodalDetailEntries(
  pricing: MultimodalPricing | null | undefined,
): MultimodalPriceEntry[] {
  return getMultimodalPriceEntries(pricing).filter(
    (entry) => entry.modality !== "text",
  );
}
