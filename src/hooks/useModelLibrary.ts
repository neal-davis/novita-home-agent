import { useState, useMemo } from "react";
import {
  ModelType,
  LLMModelWithStatus,
  MediaModel,
  LLMModelModality,
  ModelLabel,
  ModelLabelMap,
} from "@/types/models";
import { isModelFeatured } from "@/lib/model-library/badges";
import {
  getAudioModelList,
  getAISearchModelList,
  getImageModelList,
  getVideoModelList,
} from "@/constants/model-library-config";
import getCampaignConfig from "@/config/campaign";
import { useAppSelector } from "@/store";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import { generatePriceInfoString } from "@/lib/utils/dynamic-pricing/model-library-adapter";

type AnyModel = LLMModelWithStatus | MediaModel;

const PROVIDER_ALIASES: Record<string, string> = {
  "z.ai": "Zai-org",
  zai: "Zai-org",
  "zai-org": "Zai-org",
};

function normalizeProvider(provider?: string) {
  const trimmedProvider = provider?.trim();
  if (!trimmedProvider) {
    return "";
  }

  return PROVIDER_ALIASES[trimmedProvider.toLowerCase()] ?? trimmedProvider;
}

export type LLMQuickFilter =
  | "all"
  | "text-to-image"
  | "text-to-text"
  | "text-embeddings"
  | "text-to-audio";

export interface ModelLibraryState {
  llm: LLMModelWithStatus[];
  image: MediaModel[];
  audio: MediaModel[];
  video: MediaModel[];
  embedding: LLMModelWithStatus[];
  reranker: LLMModelWithStatus[];
  vision: LLMModelWithStatus[];
  aiSearch: MediaModel[];
}

export interface ModelLibraryActions {
  handleCategoryChange: (newCategory: ModelType | "") => void;
  handleProviderChange: (provider: string) => void;
  handleLlmQuickFilterChange: (filter: LLMQuickFilter) => void;
}

/**
 * Extract paths from OpenAPI schema JSON string using regex
 * More efficient than JSON.parse as it only extracts the paths section
 */
function extractPathsFromSchema(openapiSchema: string): string[] {
  try {
    // Find the "paths" object in the schema
    const pathsMatch = openapiSchema.match(
      /"paths"\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/,
    );
    if (!pathsMatch) return [];

    const pathsContent = pathsMatch[1];

    // Extract all path strings (starts with /)
    const pathRegex = /"(\/[^"]+)"\s*:/g;
    const paths: string[] = [];
    let match;

    while ((match = pathRegex.exec(pathsContent)) !== null) {
      paths.push(match[1]);
    }

    return paths;
  } catch (error) {
    console.error("Failed to extract paths from openapiSchema:", error);
    return [];
  }
}

/**
 * Check if a static model's path matches any path in the multimodal schema
 * Using regex pattern matching
 */
function doesPathMatch(
  staticModelPath: string | undefined,
  schemaPaths: string[],
): boolean {
  if (!staticModelPath) return false;

  try {
    // Create regex from static model path
    // Replace dynamic segments like :id with regex pattern
    const pathPattern = staticModelPath
      .replace(/\*/g, ".*") // Replace * with .*
      .replace(/:\w+/g, "[^/]+"); // Replace :param with [^/]+

    const regex = new RegExp(`^${pathPattern}$`);

    return schemaPaths.some((schemaPath) => regex.test(schemaPath));
  } catch (error) {
    console.error("Invalid regex pattern:", error);
    return false;
  }
}

/**
 * Convert multimodal category to ModelType
 */
function categoryToModelType(
  category: string,
): ModelType.Images | ModelType.Audio | ModelType.Video | null {
  switch (category) {
    case "image_gen":
      return ModelType.Images;
    case "audio_gen":
      return ModelType.Audio;
    case "video_gen":
      return ModelType.Video;
    default:
      return null;
  }
}

function categoryToDefaultTags(category: string): string[] {
  switch (category) {
    case "image_gen":
      return ["Image Generation"];
    case "audio_gen":
      return ["Audio Generation"];
    case "video_gen":
      return ["Video Generation"];
    default:
      return [];
  }
}

type PriceMap = Record<
  string,
  number | string | { originalPrice: number; discountPrice: number }
>;

/**
 * Parse fusionConfig.labels:
 * - display: top-right badge labels (NEW, HOT, etc.)
 * - features: bottom feature tags (Text to Image, Text-to-Video, etc.)
 * - filter: filter options, value maps to filter key, e.g. "featured" -> Featured
 */
function parseFusionLabels(
  labels: DynamicModelConfig["fusionConfig"]["labels"],
): {
  displayLabels: string[];
  featureLabels: string[];
  filterValues: string[];
  rawLabels: ModelLabel[];
} {
  const displayLabels: string[] = [];
  const featureLabels: string[] = [];
  const filterValues: string[] = [];
  const rawLabels: ModelLabel[] = [];

  if (!Array.isArray(labels) || labels.length === 0) {
    return { displayLabels, featureLabels, filterValues, rawLabels };
  }

  for (const item of labels) {
    let key: string;
    let value: string;
    if (item && typeof item === "object" && "key" in item && "value" in item) {
      key = String((item as { key: string; value: string }).key).toLowerCase();
      value = String((item as { key: string; value: string }).value).trim();
    } else if (typeof item === "string") {
      key = ModelLabelMap.Display;
      value = item.trim();
    } else {
      continue;
    }
    if (!value) continue;

    rawLabels.push({ key: key as ModelLabel["key"], value });

    if (key === "display") {
      displayLabels.push(value);
    } else if (key === "features") {
      featureLabels.push(value);
    } else if (key === "filter") {
      filterValues.push(value.toLowerCase());
    }
  }

  return { displayLabels, featureLabels, filterValues, rawLabels };
}

/**
 * Convert DynamicModelConfig to MediaModel, optionally merge with static model.
 * When priceMap is provided, fills infos from dynamic pricing (same as pricing page) so the library card shows price.
 * Labels: display=top-right badges, features=bottom tags, filter=filter options (e.g. featured)
 */
function convertMultimodalToMediaModel(
  item: DynamicModelConfig,
  staticModel?: MediaModel,
  priceMap?: PriceMap,
): MediaModel | null {
  const modelType = categoryToModelType(item.modelConfig.config.category);
  if (!modelType) return null;

  const { displayLabels, featureLabels, filterValues, rawLabels } =
    parseFusionLabels(item.fusionConfig.labels);

  const staticTags = staticModel?.tags ?? [];
  const tags =
    featureLabels.length > 0
      ? featureLabels
      : staticTags.length > 0
        ? staticTags
        : categoryToDefaultTags(item.modelConfig.config.category);

  // filter label: value "featured" maps to Featured filter
  const isFeaturedByFilter = filterValues.includes("featured");

  // display labels: NEW/HOT etc., case-insensitive
  const isNew =
    displayLabels.some((v) => v.toUpperCase() === "NEW") ||
    (staticModel?.isNew ?? false);
  const isHot =
    displayLabels.some((v) => v.toUpperCase() === "HOT") ||
    (staticModel?.isHot ?? false);

  // Use static model as base, or create minimal defaults for new models
  const baseModel = staticModel || {
    infos: [["-"]],
    isFeatured: false,
    isNew: false,
    isHot: false,
  };

  // Prefer dynamic price from priceMap when available (consistent with pricing page)
  let infos = staticModel?.infos ?? [["-"]];
  if (priceMap && Object.keys(priceMap).length > 0) {
    const priceInfos = generatePriceInfoString(item, priceMap);
    if (priceInfos.length > 0) {
      infos = [priceInfos];
    }
  }

  return {
    ...baseModel,
    ...(staticModel &&
      featureLabels.length === 0 && {
        tags: staticModel.tags,
      }),
    // Multimodal config overrides
    id: item.fusionConfig.name,
    type: modelType,
    name: item.fusionConfig.name,
    displayName: item.fusionConfig.displayName,
    tags,
    infos,
    series: item.fusionConfig.series || staticModel?.series,
    model_released_at:
      item.fusionConfig.modelReleasedAt ?? staticModel?.model_released_at,
    platform_release_at:
      item.fusionConfig.platformReleaseAt ?? staticModel?.platform_release_at,
    link: `/models-console/multimodal-playground?model=${item.fusionConfig.name}`,
    path: staticModel?.path || "",
    // dynamic labels: display/features parsed to tags/isNew/isHot, filter for isFeatured
    labels: rawLabels.length > 0 ? rawLabels : undefined,
    isFeatured: isFeaturedByFilter || baseModel.isFeatured,
    isNew,
    isHot,
    rank: item.fusionConfig?.rank,
  };
}

/** Sort models by rank ascending (smaller = first). Models without rank go last. */
function sortModelsByRank<T extends { rank?: number }>(models: T[]): T[] {
  return [...models].sort(
    (a, b) =>
      (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER),
  );
}

function hasModality(
  model: LLMModelWithStatus,
  field: "inputModalities" | "outputModalities",
  modality: LLMModelModality,
) {
  return model[field]?.some((item) => String(item).toLowerCase() === modality);
}

function isTextOnlyChatModel(model: LLMModelWithStatus) {
  const outputModalities = model.outputModalities ?? [];
  if (outputModalities.length === 0) {
    return true;
  }
  return (
    outputModalities.some(
      (item) => String(item).toLowerCase() === LLMModelModality.Text,
    ) &&
    !outputModalities.some((item) =>
      [
        LLMModelModality.Image,
        LLMModelModality.Audio,
        LLMModelModality.Video,
      ].includes(String(item).toLowerCase() as LLMModelModality),
    )
  );
}

function isVisionChatModel(model: AnyModel) {
  if (model.type !== ModelType.Chat) {
    return false;
  }
  return (
    hasModality(model, "inputModalities", LLMModelModality.Image) ||
    hasModality(model, "inputModalities", LLMModelModality.Video) ||
    hasModality(model, "outputModalities", LLMModelModality.Image) ||
    hasModality(model, "outputModalities", LLMModelModality.Video)
  );
}

function hasTag(model: AnyModel, tag: string) {
  return model.tags?.some((item) => item.toLowerCase() === tag.toLowerCase());
}

function filterByLlmQuickFilter(
  models: AnyModel[],
  filter: LLMQuickFilter,
): AnyModel[] {
  switch (filter) {
    case "text-to-image":
      return models.filter((model) => {
        if (model.type === ModelType.Images) {
          return hasTag(model, "Text to Image");
        }
        return (
          model.type === ModelType.Chat &&
          hasModality(model, "outputModalities", LLMModelModality.Image)
        );
      });
    case "text-to-text":
      return models.filter(
        (model) =>
          model.type === ModelType.Chat &&
          isTextOnlyChatModel(model as LLMModelWithStatus),
      );
    case "text-embeddings":
      return models.filter((model) => model.type === ModelType.Embedding);
    case "text-to-audio":
      return models.filter((model) => {
        if (model.type === ModelType.Audio) {
          return hasTag(model, "Text to Audio");
        }
        return (
          model.type === ModelType.Chat &&
          hasModality(model, "outputModalities", LLMModelModality.Audio)
        );
      });
    case "all":
    default:
      return models.filter((model) => model.type === ModelType.Chat);
  }
}

/**
 * Merge multimodal configs with static model lists
 * @param staticModels - Static model list
 * @param multimodalConfigs - Multimodal config items
 * @param priceMap - Optional price map for dynamic model pricing (from Redux)
 * @returns Merged model list containing:
 *  - Matched models (static + multimodal merged)
 *  - New multimodal-only models
 *  - Unmatched static models
 */
function mergeMultimodalWithStatic(
  staticModels: MediaModel[],
  multimodalConfigs: DynamicModelConfig[],
  priceMap?: PriceMap,
): MediaModel[] {
  const mergedModels: MediaModel[] = [];
  const matchedStaticIds = new Set<string | number>();

  // Process each multimodal config
  multimodalConfigs.forEach((multimodalItem) => {
    const schemaPaths = extractPathsFromSchema(
      multimodalItem.modelConfig.config.openapiSchema,
    );

    // Try to find matching static model by path
    const matchedStaticModel = staticModels.find((staticModel) =>
      doesPathMatch(staticModel.path, schemaPaths),
    );

    if (matchedStaticModel) {
      // Merge with existing static model
      const merged = convertMultimodalToMediaModel(
        multimodalItem,
        matchedStaticModel,
        priceMap,
      );
      if (merged) {
        mergedModels.push(merged);
        matchedStaticIds.add(matchedStaticModel.id);
      }
    } else {
      // Add as new model
      const converted = convertMultimodalToMediaModel(
        multimodalItem,
        undefined,
        priceMap,
      );
      if (converted) {
        mergedModels.push(converted);
      }
    }
  });

  // Add unmatched static models
  staticModels.forEach((staticModel) => {
    if (!matchedStaticIds.has(staticModel.id)) {
      mergedModels.push(staticModel);
    }
  });

  return mergedModels;
}

export function useModelLibrary(
  llmModelList: LLMModelWithStatus[],
  defaultType?: string,
  defaultProvider?: string,
) {
  const campaign = getCampaignConfig();
  const multimodalConfig = useAppSelector((state) => state.multimodal.configs);
  const priceMap = useAppSelector((state) => state.multimodal.priceMap);

  const normalizedDefaultType = defaultType?.trim().toLowerCase();
  const normalizedDefaultProvider = normalizeProvider(defaultProvider);
  const defaultCategoryMap: Record<string, ModelType> = {
    featured: ModelType.Featured,
    all: ModelType.All,
    llm: ModelType.Chat,
    chat: ModelType.Chat,
    serverless: ModelType.Serverless,
    image: ModelType.Images,
    images: ModelType.Images,
    audio: ModelType.Audio,
    "ai search": ModelType.AISearch,
    "ai-search": ModelType.AISearch,
    ai_search: ModelType.AISearch,
    search: ModelType.AISearch,
    video: ModelType.Video,
    vision: ModelType.Vision,
    embedding: ModelType.Embedding,
    embeddings: ModelType.Embedding,
    reranker: ModelType.Reranker,
  };
  const defaultCategory = normalizedDefaultType
    ? defaultCategoryMap[normalizedDefaultType]
    : undefined;

  const [selectedCategory, setSelectedCategory] = useState<ModelType | "">(
    defaultCategory ?? ModelType.All,
  );
  const [selectedProvider, setSelectedProvider] = useState(
    normalizedDefaultProvider ?? "",
  );
  const [selectedLlmQuickFilter, setSelectedLlmQuickFilter] =
    useState<LLMQuickFilter>("all");

  // Get merged model lists (priceMap used to fill infos for dynamic models so cards show price)
  const mergedImageModels = useMemo(() => {
    const imageMultimodals = multimodalConfig.filter(
      (item) => item.modelConfig.config.category === "image_gen",
    );
    const merged = mergeMultimodalWithStatic(
      getImageModelList(),
      imageMultimodals,
      priceMap,
    );
    return sortModelsByRank(merged);
  }, [multimodalConfig, priceMap]);

  const mergedAudioModels = useMemo(() => {
    const audioMultimodals = multimodalConfig.filter(
      (item) => item.modelConfig.config.category === "audio_gen",
    );
    const merged = mergeMultimodalWithStatic(
      getAudioModelList(),
      audioMultimodals,
      priceMap,
    );
    return sortModelsByRank(merged);
  }, [multimodalConfig, priceMap]);

  const mergedVideoModels = useMemo(() => {
    const videoMultimodals = multimodalConfig.filter(
      (item) => item.modelConfig.config.category === "video_gen",
    );
    const merged = mergeMultimodalWithStatic(
      getVideoModelList(),
      videoMultimodals,
      priceMap,
    );
    return sortModelsByRank(merged);
  }, [multimodalConfig, priceMap]);

  const aiSearchModels = useMemo(() => getAISearchModelList(), []);

  const filteredModels = useMemo(() => {
    let filtered: AnyModel[] = [
      ...llmModelList,
      ...mergedImageModels,
      ...mergedAudioModels,
      ...mergedVideoModels,
      ...aiSearchModels,
    ];

    if (selectedCategory) {
      switch (selectedCategory) {
        case ModelType.Campaign:
          filtered = filtered.filter((model) => {
            if ("output_pricing" in model) {
              return (
                model.output_pricing?.originPricePerM !==
                model.output_token_price_per_m
              );
            }
            if (Array.isArray(model.infos)) {
              const [pricingInfo] = model.infos;
              const [discountPrice, originalPrice] = pricingInfo || [];
              if (originalPrice && discountPrice) {
                return originalPrice !== discountPrice;
              }
            }
            return false;
          });
          break;
        case ModelType.Featured:
          filtered = filtered.filter(isModelFeatured);
          break;
        case ModelType.All:
          break;
        case ModelType.Chat:
          filtered = filterByLlmQuickFilter(filtered, selectedLlmQuickFilter);
          break;
        case ModelType.Images:
          filtered = filtered.filter(
            (model) => model.type === ModelType.Images,
          );
          break;
        case ModelType.Audio:
          filtered = filtered.filter((model) => model.type === ModelType.Audio);
          break;
        case ModelType.Video:
          filtered = filtered.filter((model) => model.type === ModelType.Video);
          break;
        case ModelType.AISearch:
          filtered = filtered.filter(
            (model) => model.type === ModelType.AISearch,
          );
          break;
        case ModelType.Embedding:
          filtered = filtered.filter(
            (model) => model.type === ModelType.Embedding,
          );
          break;
        case ModelType.Reranker:
          filtered = filtered.filter(
            (model) => model.type === ModelType.Reranker,
          );
          break;
        case ModelType.Vision:
          filtered = filtered.filter(isVisionChatModel);
          break;
        case ModelType.Serverless:
          filtered = filtered.filter(
            (model) => model.tags?.includes("Serverless") || false,
          );
          break;
        default:
          filtered = [];
          break;
      }
    }

    if (selectedProvider) {
      filtered = filtered.filter((model) => model.series === selectedProvider);
    }

    return filtered;
  }, [
    llmModelList,
    mergedImageModels,
    mergedAudioModels,
    mergedVideoModels,
    aiSearchModels,
    selectedCategory,
    selectedProvider,
    selectedLlmQuickFilter,
  ]);

  const handleCategoryChange = (newCategory: ModelType | "") => {
    setSelectedCategory(newCategory);
    if (newCategory !== ModelType.Chat) {
      setSelectedLlmQuickFilter("all");
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(normalizeProvider(provider));
  };

  const clearFilter = () => {
    setSelectedCategory(ModelType.All);
    setSelectedProvider("");
    setSelectedLlmQuickFilter("all");
  };

  const allModels = useMemo(() => {
    return [
      ...llmModelList,
      ...mergedImageModels,
      ...mergedAudioModels,
      ...mergedVideoModels,
      ...aiSearchModels,
    ];
  }, [
    llmModelList,
    mergedImageModels,
    mergedAudioModels,
    mergedVideoModels,
    aiSearchModels,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [ModelType.Featured]: 0,
      [ModelType.All]: 0,
      [ModelType.Chat]: 0,
      [ModelType.Serverless]: 0,
      [ModelType.Images]: 0,
      [ModelType.Audio]: 0,
      [ModelType.Video]: 0,
      [ModelType.AISearch]: 0,
      [ModelType.Vision]: 0,
      [ModelType.Embedding]: 0,
      [ModelType.Reranker]: 0,
    };
    allModels.forEach((model) => {
      counts[ModelType.All] = (counts[ModelType.All] || 0) + 1;
      if (isModelFeatured(model)) {
        counts[ModelType.Featured] = (counts[ModelType.Featured] || 0) + 1;
      }
      if (model.type) {
        counts[model.type] = (counts[model.type] || 0) + 1;
      }
      if (isVisionChatModel(model)) {
        counts[ModelType.Vision] = (counts[ModelType.Vision] || 0) + 1;
      }
      if (model.tags?.includes("Serverless")) {
        counts[ModelType.Serverless] = (counts[ModelType.Serverless] || 0) + 1;
      }
    });
    return counts;
  }, [allModels]);

  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allModels.forEach((model) => {
      if (model.series) {
        counts[model.series] = (counts[model.series] || 0) + 1;
      }
    });
    return counts;
  }, [allModels]);

  const libraryData: ModelLibraryState = {
    llm: filteredModels.filter(
      (model) => model.type === ModelType.Chat,
    ) as LLMModelWithStatus[],
    image: filteredModels.filter(
      (model) => model.type === ModelType.Images,
    ) as MediaModel[],
    audio: filteredModels.filter(
      (model) => model.type === ModelType.Audio,
    ) as MediaModel[],
    video: filteredModels.filter(
      (model) => model.type === ModelType.Video,
    ) as MediaModel[],
    aiSearch: filteredModels.filter(
      (model) => model.type === ModelType.AISearch,
    ) as MediaModel[],
    embedding: filteredModels.filter(
      (model) => model.type === ModelType.Embedding,
    ) as LLMModelWithStatus[],
    reranker: filteredModels.filter(
      (model) => model.type === ModelType.Reranker,
    ) as LLMModelWithStatus[],
    vision: filteredModels.filter(
      (model) => model.type === ModelType.Vision,
    ) as LLMModelWithStatus[],
  };

  const actions: ModelLibraryActions = {
    handleCategoryChange,
    handleProviderChange,
    handleLlmQuickFilterChange: setSelectedLlmQuickFilter,
  };

  return {
    allModels,
    filteredModels,
    libraryData,
    selectedCategory,
    selectedProvider,
    selectedLlmQuickFilter,
    categoryCounts,
    providerCounts,
    clearFilter,
    actions,
  };
}
