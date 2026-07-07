/**
 * Dynamic model data adapter for model library
 * Converts dynamic model config to model library card format
 */

import { DynamicModelConfig, FusionConfigLabel } from "@/types/dynamic-pricing";
import { VideoModel, ImageModel, AudioModel, ModelType } from "@/types/models";
import { generateTableRows } from "./table-generator";
import { generateDocLink } from "./doc-link-generator";

export function extractPrimaryPath(
  openapiSchemaStr: string | undefined,
): string | undefined {
  if (!openapiSchemaStr || openapiSchemaStr.trim() === "") return undefined;
  try {
    const schema = JSON.parse(openapiSchemaStr) as {
      paths?: Record<string, unknown>;
    };
    const pathKeys = Object.keys(schema.paths || {});
    return pathKeys.length > 0 ? pathKeys[0] : undefined;
  } catch {
    return undefined;
  }
}

function getDynamicModelUniqueId(modelConfig: DynamicModelConfig): string {
  const fusionId: unknown = (modelConfig.fusionConfig as { id?: unknown })?.id;
  if (typeof fusionId === "number") return String(fusionId);
  if (typeof fusionId === "string") {
    const trimmed = fusionId.trim();
    if (trimmed) return trimmed;
  }
  return (
    modelConfig.fusionConfig?.name ||
    modelConfig.modelConfig?.config?.name ||
    "unknown"
  );
}

function getDynamicModelSeries(modelConfig: DynamicModelConfig): string {
  const series = modelConfig.fusionConfig?.series?.trim();
  return series ? series : "Others";
}

/**
 * Check if string can be converted to number (for featured sort)
 */
function isNumericValue(value: string): boolean {
  if (value == null || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;
  const num = Number(trimmed);
  return !Number.isNaN(num);
}

/**
 * Parse fusionConfig.labels:
 * - numeric value -> featured, sort by number (min as featuredOrder)
 * - non-numeric -> badge label on card
 */
function parseLabels(config: DynamicModelConfig): {
  featuredOrder: number | undefined;
  badgeLabels: string[];
} {
  const labels = config.fusionConfig?.labels;
  if (!Array.isArray(labels) || labels.length === 0) {
    return { featuredOrder: undefined, badgeLabels: [] };
  }

  let featuredOrder: number | undefined;
  const badgeLabels: string[] = [];

  for (const item of labels) {
    let value: string;
    if (item && typeof item === "object" && "value" in item) {
      value = String((item as FusionConfigLabel).value ?? "");
    } else if (typeof item === "string") {
      value = item;
    } else {
      continue;
    }
    const trimmed = value.trim();
    if (trimmed === "") continue;

    if (isNumericValue(value)) {
      const num = Number(trimmed);
      if (featuredOrder === undefined || num < featuredOrder) {
        featuredOrder = num;
      }
    } else {
      badgeLabels.push(trimmed);
    }
  }

  return { featuredOrder, badgeLabels };
}

/**
 * Generate price info string from dynamic model config (for model card display).
 * Exported for use in model library merge (useModelLibrary) when filling infos for dynamic models.
 */
export function generatePriceInfoString(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >,
): string[] {
  const dynamicRows = generateTableRows(modelConfig, priceMap);
  const priceInfos: string[] = [];

  const formatPriceString = (
    row: any,
    category: string,
    pricingConfig?: any,
  ): string | null => {
    const originalPrice = row.originalPrice;
    const discountPrice = row.discountPrice;
    const price = row.price;

    const unit =
      pricingConfig?.table?.priceUnit ||
      (category === "video_gen"
        ? "video"
        : category === "audio_gen"
          ? "10k chars"
          : "image");
    const resolution = row.resolution || "";
    const duration = row.duration || "";
    const durationStr = duration ? `${duration}s` : "";
    const resolutionStr = resolution ? `${resolution} ` : "";

    const mode = row.mode || "";
    const modeStr = mode && mode !== "-" ? ` (${mode})` : "";

    const basePricePart = `${resolutionStr}${durationStr}`.trim();

    const buildPriceString = (priceValue: number | string): string => {
      const base = `$${priceValue} /${unit}${basePricePart ? ` ${basePricePart}` : ""}`;
      return modeStr ? `${base} ${modeStr}` : base;
    };

    if (discountPrice === 0) {
      return "Free";
    }

    if (
      typeof discountPrice === "number" &&
      typeof originalPrice === "number" &&
      discountPrice < originalPrice
    ) {
      return buildPriceString(discountPrice);
    }

    if (typeof originalPrice === "number") {
      return buildPriceString(originalPrice);
    }

    if (typeof discountPrice === "number") {
      return buildPriceString(discountPrice);
    }

    if (typeof price === "number") {
      return buildPriceString(price);
    }

    if (price !== "-" && price !== undefined && price !== null) {
      return price as string;
    }

    return null;
  };

  if (dynamicRows.length === 1) {
    const row = dynamicRows[0];
    const formattedPrice = formatPriceString(
      row,
      modelConfig.modelConfig.config.category,
      modelConfig.pricingConfig,
    );
    if (formattedPrice) {
      priceInfos.push(formattedPrice);
    }
  } else if (dynamicRows.length > 0) {
    const firstRow = dynamicRows[0];
    const formattedPrice = formatPriceString(
      firstRow,
      modelConfig.modelConfig.config.category,
      modelConfig.pricingConfig,
    );
    if (formattedPrice) {
      priceInfos.push(formattedPrice);
    }
  }

  return priceInfos;
}

/**
 * Convert dynamic model config to VideoModel
 */
export function convertToVideoModel(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >,
): VideoModel {
  const priceInfos = generatePriceInfoString(modelConfig, priceMap);
  const docLink = generateDocLink(modelConfig);
  const uniqueId = getDynamicModelUniqueId(modelConfig);
  const series = getDynamicModelSeries(modelConfig);
  const paths = extractPrimaryPath(
    modelConfig.modelConfig?.config?.openapiSchema,
  );
  const { featuredOrder, badgeLabels } = parseLabels(modelConfig);

  return {
    id: `dynamic-video-${uniqueId}`,
    type: ModelType.Video,
    name: modelConfig.fusionConfig.name,
    displayName: modelConfig.fusionConfig.displayName,
    series,
    tags: [],
    infos: priceInfos,
    link: docLink,
    paths,
    isFeatured: featuredOrder !== undefined,
    featuredOrder,
    badgeLabels: badgeLabels.length > 0 ? badgeLabels : undefined,
  };
}

/**
 * Convert dynamic model config to ImageModel
 */
export function convertToImageModel(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >,
): ImageModel {
  const priceInfos = generatePriceInfoString(modelConfig, priceMap);
  const docLink = generateDocLink(modelConfig);
  const uniqueId = getDynamicModelUniqueId(modelConfig);
  const series = getDynamicModelSeries(modelConfig);
  const paths = extractPrimaryPath(
    modelConfig.modelConfig?.config?.openapiSchema,
  );
  const { featuredOrder, badgeLabels } = parseLabels(modelConfig);

  return {
    id: `dynamic-image-${uniqueId}`,
    type: ModelType.Images,
    name: modelConfig.fusionConfig.name,
    displayName: modelConfig.fusionConfig.displayName,
    series,
    tags: [],
    infos: priceInfos,
    link: docLink,
    paths,
    isFeatured: featuredOrder !== undefined,
    featuredOrder,
    badgeLabels: badgeLabels.length > 0 ? badgeLabels : undefined,
  };
}

/**
 * Convert dynamic model config to AudioModel
 */
export function convertToAudioModel(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >,
): AudioModel {
  const priceInfos = generatePriceInfoString(modelConfig, priceMap);
  const docLink = generateDocLink(modelConfig);
  const uniqueId = getDynamicModelUniqueId(modelConfig);
  const series = getDynamicModelSeries(modelConfig);
  const paths = extractPrimaryPath(
    modelConfig.modelConfig?.config?.openapiSchema,
  );
  const { featuredOrder, badgeLabels } = parseLabels(modelConfig);

  return {
    id: `dynamic-audio-${uniqueId}`,
    type: ModelType.Audio,
    name: modelConfig.fusionConfig.name,
    displayName: modelConfig.fusionConfig.displayName,
    series,
    tags: [],
    infos: priceInfos,
    link: docLink,
    paths,
    isFeatured: featuredOrder !== undefined,
    featuredOrder,
    badgeLabels: badgeLabels.length > 0 ? badgeLabels : undefined,
  };
}

/**
 * Convert dynamic model config to library model by category
 */
export function convertDynamicModelToLibraryModel(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >,
): VideoModel | ImageModel | AudioModel | null {
  const category = modelConfig.modelConfig.config.category;

  switch (category) {
    case "video_gen":
      return convertToVideoModel(modelConfig, priceMap);
    case "image_gen":
      return convertToImageModel(modelConfig, priceMap);
    case "audio_gen":
      return convertToAudioModel(modelConfig, priceMap);
    default:
      return null;
  }
}
