enum ModelType {
  base = "checkpoint",
  lora = "lora",
  controlnet = "controlnet",
  vae = "vae",
  upscaler = "upscaler",
  textual_inversion = "textualinversion",
}

type ModelListProps = {
  initModelList?: any[];
  type: "link" | "dom";
  modelType?: ModelType;
  needDetails?: boolean;
  onSelect?: (model: any) => void;
  selectedModelId?: number;
  selectedModelName?: string;
  selectedModelAPIName?: string;
  itemWidth?: number;
  parentDom?: boolean;
  widthTransition?: boolean;
  filter?: Record<string, string | boolean | undefined>;
  fixedBaseModel?: string;
  defaultBaseModel?: string;
};

type Model = {
  base_model: string;
  base_model_type: string;
  categories: string[];
  cover_url: string;
  hash_sha256: string;
  id: number;
  name: string;
  sd_name: string;
  sd_name_in_api: string;
  source: string;
  status: number;
  tags: string[];
  type: {
    name: string;
    display_name: string;
  };
  is_nsfw: boolean;
  is_sdxl: boolean;
  is_sd3: boolean;
  hight_light?: {
    sd_name: string[];
    name: string[];
  };
};

type ModelDetails = {
  model_id: number;
  name: string;
  type: string;
  model_name: string;
  is_nsfw?: boolean;
  cover_url?: string;
  status?: number;
  hash_sha256: string;
  cfg_scale: number;
  width: number;
  height: number;
  prompt: string;
  negative_prompt: string;
  sampler_name: string;
  steps: number;
  seed: number;
  tags: string[];
  is_sdxl?: boolean;
  is_sd3?: boolean;
  base_model?: string;
  in_whitelist?: boolean;
};

type ControlnetUnitParams = {
  modelName: string;
  imageBase64: string;
  strength: number;
  preprocessor: string;
  guidanceStart: number;
  guidanceEnd: number;
};

type ControlnetFormItemProps = {
  itemKey: string;
  param: ControlnetUnitParams;
  onFocus: () => void;
  onChange: (p: ControlnetUnitParams) => void;
  onBlur: () => void;
  isSDXL?: boolean;
  baseModel: string;
};
