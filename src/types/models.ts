export enum LLMModelStatus {
  Available = 1,
  Unavailable = 2,
  Pending = 3,
  Deprecated = 4,
}

export enum LLMModelFeatures {
  StructuredOutputs = "structured-outputs",
  FunctionCalling = "function-calling",
  DisableCharacter = "disable-character",
  Reasoning = "reasoning",
  Vision = "vision",
  Video = "video",
}

export enum LLMModelModality {
  Text = "text",
  Image = "image",
  Audio = "audio",
  Video = "video",
}

export enum ModelType {
  Campaign = "Campaign",
  Featured = "Featured",
  All = "All",
  Chat = "Chat", // LLM
  Images = "Images",
  Video = "Video",
  Embedding = "Embedding",
  FeaturedAPI = "APIs",
  Vision = "Vision",
  Audio = "Audio",
  Reranker = "Reranker",
  AISearch = "AI Search",
  Serverless = "Serverless",
}

export enum ModelLabelMap {
  // key
  Display = "display",
  Footer = "footer",
  Specification = "specification",
  Filter = "filter",
  // value
  Discount = "DISCOUNT", // if set, show actual discount
  Free = "FREE",
  Hot = "HOT",
  New = "NEW",
  Dedicated = "Dedicated", // support dedicated endpoint
  Featured = "Featured",
  Partner = "Partner",
}

export type ModelLabelKey =
  | ModelLabelMap.Display
  | ModelLabelMap.Specification
  | ModelLabelMap.Footer
  | ModelLabelMap.Filter
  | ModelLabelMap.Partner;

export type ModelLabel = {
  key: ModelLabelKey;
  value: string;
};

export type LLMPringCell = {
  originPricePerM: number;
  pricePerM: number;
};

export type TieredBillingConfig = {
  min_tokens: number;
  max_tokens: number;
  output_min_tokens: number;
  output_max_tokens?: number;
  input_pricing: LLMPringCell;
  output_pricing: LLMPringCell;
  cache_read_input_pricing?: LLMPringCell;
  cache_creation_input_pricing?: LLMPringCell;
  cache_creation_1_hour_input_pricing?: LLMPringCell;
};

export type MultimodalPricingInputItem = {
  modals: string[];
  input_token_base_price?: string | number;
  cache_read_input_base_price?: string | number;
  cache_creation_input_base_price?: string | number;
  cache_creation_1_hour_input_base_price?: string | number;
  input_token_discount_price?: string | number;
  cache_read_input_discount_price?: string | number;
  cache_creation_input_discount_price?: string | number;
  cache_creation_1_hour_input_discount_price?: string | number;
  // Billing API返回的字段名（驼峰命名）
  inputTokenBasePrice?: string | number;
  cacheReadInputBasePrice?: string | number;
  cacheCreationInputBasePrice?: string | number;
  cacheCreation1HourInputBasePrice?: string | number;
  inputTokenDiscountPrice?: string | number;
  cacheReadInputDiscountPrice?: string | number;
  cacheCreationInputDiscountPrice?: string | number;
  cacheCreation1HourInputDiscountPrice?: string | number;
};

export type MultimodalPricingOutputItem = {
  modals: string[];
  output_token_base_price?: string | number;
  output_token_discount_price?: string | number;
  // Billing API返回的字段名（驼峰命名）
  outputTokenBasePrice?: string | number;
  outputTokenDiscountPrice?: string | number;
};

export type MultimodalPricing = {
  input_price?: MultimodalPricingInputItem[];
  output_price?: MultimodalPricingOutputItem[];
  // Billing API返回的字段名（驼峰命名）
  inputPrice?: MultimodalPricingInputItem[];
  outputPrice?: MultimodalPricingOutputItem[];
};

export interface ModelLibraryFilterForm {
  Type: ModelType[] | undefined;
  Vendor: string[] | undefined;
  Context: string[] | undefined;
  Specification: string[] | undefined;
  Pricing: string[] | undefined;
}

export interface LLMLibraryInfo {
  inputPricing: string;
  originInputPricing?: string;
  outputPricing?: string;
  originOutputPricing?: string;
  cacheReadPricing?: string;
  originCacheReadPricing?: string;
  cacheWritePricing?: string;
  cacheWrite5mPricing?: string;
  originCacheWrite5mPricing?: string;
  cacheWrite1hPricing?: string;
  originCacheWrite1hPricing?: string;
  contextSize: string;
  maxOutputTokens: string;
}

interface BaseModel {
  id: string;
  name: string;
  displayName?: string;
  labels?: Array<ModelLabel> | undefined;
  infos?: Array<string> | LLMLibraryInfo | undefined;
  icon?: string | undefined;
  link?: string | undefined;
  linkPath?: string | undefined;
}

export interface LLMModel extends BaseModel {
  type:
    | ModelType.Chat
    | ModelType.Embedding
    | ModelType.Reranker
    | ModelType.Vision;
  context_size: number;
  description: string;
  input_token_price_per_m: number;
  input_token_price_per_m_toString: string;
  output_token_price_per_m: number;
  output_token_price_per_m_toString: string;
  cache_read_input_token_price_per_m?: number;
  cache_read_input_pricing?: LLMPringCell | undefined | null;
  cache_creation_input_token_price_per_m?: number;
  cache_creation_input_pricing?: LLMPringCell | undefined | null;
  cache_creation_1_hour_input_token_price_per_m?: number;
  cache_creation_1_hour_input_pricing?: LLMPringCell | undefined | null;
  input_pricing?: LLMPringCell | undefined | null;
  output_pricing?: LLMPringCell | undefined | null;
  cache_pricing?: LLMPringCell | undefined | null;
  series?: string | undefined;
  quantization?: string | undefined;
  status?: number | undefined;
  features?: string[] | undefined;
  max_output_tokens?: number | undefined;
  rpm?: number | undefined;
  tmp?: number | undefined;
  tags?: string[] | undefined;
  quota_items?:
    | {
        tier: string;
        rpm: number;
        tpm: number;
      }[]
    | undefined;
  is_tiered_billing?: boolean | undefined;
  tiered_billing_configs?: TieredBillingConfig[] | undefined;
  outputModalities?: LLMModelModality[] | undefined;
  inputModalities?: LLMModelModality[] | undefined;
  endpoints?: string[] | undefined;
  multimodal_pricing?: MultimodalPricing | null | undefined;
  model_released_at?: string | number | null | undefined;
  platform_release_at?: string | number | null | undefined;
}

export interface LLMModelWithStatus extends LLMModel {
  isNew?: boolean | undefined;
  isHot?: boolean | undefined;
  isFeatured?: boolean | undefined;
  isDeprecated?: boolean | undefined;
  isDiscount?: boolean | undefined;
  isFree?: boolean | undefined;
  discount?: number | undefined;
  isCompletion?: boolean | undefined;
}

export interface MediaModel {
  id: string | number;
  type:
    | ModelType.Images
    | ModelType.Audio
    | ModelType.Video
    | ModelType.AISearch;
  name: string;
  displayName?: string;
  tags: string[];
  infos: string[][];
  link?: string;
  path: string;
  isNew?: boolean | undefined;
  isHot?: boolean | undefined;
  isFeatured?: boolean | undefined;
  series?: string | undefined;
  model_released_at?: string | number | null | undefined;
  platform_release_at?: string | number | null | undefined;
  /** Dynamic config labels for display/features/filter rendering and filtering */
  labels?: ModelLabel[] | undefined;
  /** Sort weight from fusionConfig.rank, smaller = higher priority */
  rank?: number;
}

// TODO: remove this
export interface ImageModel extends Omit<BaseModel, "infos"> {
  type: ModelType.Images;
  tags: string[];
  infos?: (string | string[])[];
  paths?: string | undefined;
  series?: string | undefined;
  isFeatured?: boolean | undefined;
  featuredOrder?: number | undefined;
  badgeLabels?: string[] | undefined;
}

export interface AudioModel extends Omit<BaseModel, "infos"> {
  type: ModelType.Audio;
  tags: string[];
  infos?: (string | string[])[];
  paths?: string | undefined;
  series?: string | undefined;
  isFeatured?: boolean | undefined;
  featuredOrder?: number | undefined;
  badgeLabels?: string[] | undefined;
}

export interface VideoModel extends Omit<BaseModel, "infos"> {
  type: ModelType.Video;
  tags: string[];
  infos?: (string | string[])[];
  paths?: string | undefined;
  series?: string | undefined;
  isFeatured?: boolean | undefined;
  featuredOrder?: number | undefined;
  badgeLabels?: string[] | undefined;
}

export interface FeaturedAPIsModel extends BaseModel {
  type: ModelType.FeaturedAPI;
}
