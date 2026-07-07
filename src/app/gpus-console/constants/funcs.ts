export type FuncConstants = {
  name: string;
  displayName: string;
  docUrl?: string;
  getStartedUrl?: string;
  playgroundReady: boolean;
  productpageReady: boolean;
  cover?: string;
  coverAlt?: string;
  showcaseVideo?: {
    src: string;
    type: string;
  }[];
};

export const SAMPLER_OPTIONS = [
  "DPM++ 2M Karras",
  "DPM++ SDE Karras",
  "DPM++ 2M SDE Exponential",
  "DPM++ 2M SDE Karras",
  "Euler a",
  "Euler",
  "LMS",
  "Heun",
  "DPM2",
  "DPM2 a",
  "DPM++ 2S a",
  "DPM++ 2M",
  "DPM++ SDE",
  "DPM++ 2M SDE",
  "DPM++ 2M SDE Heun",
  "DPM++ 2M SDE Heun Karras",
  "DPM++ 2M SDE Heun Exponential",
  "DPM++ 3M SDE",
  "DPM++ 3M SDE Karras",
  "DPM++ 3M SDE Exponential",
  "DPM fast",
  "DPM adaptive",
  "LMS Karras",
  "DPM2 Karras",
  "DPM2 a Karras",
  "DPM++ 2S a Karras",
  "Restart",
  "DDIM",
  "PLMS",
  "UniPC",
];

export enum FUNC_NAME {
  TXT2IMG = "txt2img",
  IMG2IMG = "img2img",
  LCM_TXT2IMG = "lcm-txt2img",
  REMOVE_BACKGROUND = "remove-background",
  REPLACE_BACKGROUND = "replace-background",
  CLEANUP = "cleanup",
  OUTPAINTING = "outpainting",
  MIX_POSE = "mix-pose",
  DOODLE = "doodle",
  UPSCALE = "upscale",
  MERGE_FACE = "merge-face",
  REPLACE_SKY = "replace-sky",
  REPLACE_OBJECT = "replace-object",
  REMOVE_TEXT = "remove-text",
  RESTORE_FACE = "restore-face",
  TILE = "create-tile",
  REIMAGINE = "reimagine",
  INPAINTING = "inpainting",
  SDXL = "sdxl",
  LORA = "lora",
  REFINER = "refiner",
  TXT2VIDEO = "txt2video",
  IMG2VIDEO = "img2video",
  SDXL_TURBO = "sdxl-turbo",
  REMOVE_WATERMARK = "remove-watermark",
  LCM_IMG2IMG = "lcm-img2img",
  TRAINING = "training",
  MOTIONSYNC = "img2video-motion",
}

enum FUNC_DISPLAY_NAME {
  TXT2IMG = "Text to Image",
  IMG2IMG = "Image to Image",
  LCM_TXT2IMG = "LCM Text to Image",
  REMOVE_BACKGROUND = "Remove Background",
  REPLACE_BACKGROUND = "Replace Background",
  CLEANUP = "Cleanup",
  OUTPAINTING = "Outpainting",
  MIX_POSE = "Mix Pose",
  DOODLE = "Doodle",
  UPSCALE = "Upscale",
  MERGE_FACE = "Merge Face",
  REPLACE_SKY = "Replace Sky",
  REPLACE_OBJECT = "Replace Object",
  REMOVE_TEXT = "Remove Text",
  RESTORE_FACE = "Restore Face",
  TILE = "Create Tile",
  REIMAGINE = "Reimagine",
  INPAINTING = "Inpainting",
  SDXL = "SDXL",
  LORA = "LoRA",
  REFINER = "Refiner",
  TXT2VIDEO = "Text to Video",
  IMG2VIDEO = "Image to Video",
  SDXL_TURBO = "SDXL-Turbo",
  REMOVE_WATERMARK = "Remove Watermark",
  LCM_IMG2IMG = "LCM Image to Image",
  TRAINING = "Training",
  MOTIONSYNC = "Image to Video - Motion",
}

const FUNC_TYPE = {
  IMG_GENERATOR: Symbol("img_generator"),
  IMG_EDITOR: Symbol("img_editor"),
  IMG_ENHANCER: Symbol("img_enhancer"),
  FACE_EDITOR: Symbol("face_editor"),
  VIDEO_GENERATOR: Symbol("video_generator"),
  TRAINING: Symbol("training"),
};

const FUNC_TYPE_NAME = {
  [FUNC_TYPE.IMG_GENERATOR]: "AI Image Generator",
  [FUNC_TYPE.IMG_EDITOR]: "AI Image Editor",
  [FUNC_TYPE.IMG_ENHANCER]: "AI Image Enhancer",
  [FUNC_TYPE.FACE_EDITOR]: "Face Editor",
  [FUNC_TYPE.VIDEO_GENERATOR]: "AI Video Generator",
  [FUNC_TYPE.TRAINING]: "Training",
};
