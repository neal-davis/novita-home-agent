import { reduxStore } from "@/store";
import { FUNC_NAME, FUNC_TYPE } from "@/app/models/constants/funcs";

type CalcProps = {
  width?: number;
  height?: number;
  steps?: number;
  scale?: number;
  sdxl?: boolean;
  trainSteps?: number;
  frames?: number;
  model?: string;
  isSDXL?: boolean;
  resolutionType?: string;
  fps?: number;
  mode?: string;
  duration?: number;
  ratio?: string;
  frameType?: "FLF" | "FF" | "";
  audioType?: "SILENT" | "AUDIO";
  batchMode?: "ONLINE" | "BATCH";
  audio?: boolean | string;
};

const IMG_API_DISCOUNT = 0.36;
const SCALE_PRICE_FACTOR = 10;

export const CALC_CATEGORY_MAP = {
  [FUNC_TYPE.IMG]: [
    FUNC_NAME.TXT2IMG,
    FUNC_NAME.IMG2IMG,
    FUNC_NAME.LCM_TXT2IMG,
    FUNC_NAME.LCM_IMG2IMG,
    FUNC_NAME.MIX_POSE,
    FUNC_NAME.DOODLE,
    FUNC_NAME.TILE,
    FUNC_NAME.REIMAGINE,
    FUNC_NAME.UPSCALE,
    FUNC_NAME.REMOVE_BACKGROUND,
    FUNC_NAME.REPLACE_BACKGROUND,
    FUNC_NAME.OUTPAINTING,
    FUNC_NAME.INPAINTING,
    FUNC_NAME.REPLACE_SKY,
    FUNC_NAME.REPLACE_OBJECT,
    FUNC_NAME.REMOVE_TEXT,
    FUNC_NAME.REMOVE_WATERMARK,
    FUNC_NAME.CLEANUP,
    FUNC_NAME.IMG2MASK,
    FUNC_NAME.IMG2PROMPT,
    FUNC_NAME.ADETAILER,
    FUNC_NAME.RELIGHT,
    FUNC_NAME.MERGE_FACE,
    FUNC_NAME.RESTORE_FACE,
    FUNC_NAME.MAKE_PHOTO,
    FUNC_NAME.IMAGE_REMOVE_BACKGROUND,
    FUNC_NAME.IMAGE_ERASER,
    FUNC_NAME.IMAGE_UPSCALER,
  ],
  [FUNC_TYPE.VIDEO_GENERATOR]: [
    FUNC_NAME.TXT2VIDEO,
    "hunyuan-video-fast",
    "wan-t2v",
    "wan-i2v",
    "kling-v1.6-t2v",
    "kling-v1.6-i2v",
    "minimax-video-01",
    "minimax-hailuo-02",
    "minimax-hailuo-2.3-t2v",
    "minimax-hailuo-2.3-i2v",
    "minimax-hailuo-2.3-fast-i2v",
    FUNC_NAME.KLING_V30_STD_T2V,
    FUNC_NAME.KLING_V30_STD_I2V,
    FUNC_NAME.KLING_V30_PRO_T2V,
    FUNC_NAME.KLING_V30_PRO_I2V,
    FUNC_NAME.IMG2VIDEO,
    FUNC_NAME.MOTIONSYNC,
    FUNC_NAME.ANIMATE_ANYONE,
  ],
  [FUNC_TYPE.TRAINING]: [FUNC_NAME.TRAINING],
};

function getFixedPrice(): Record<string, number> {
  return {
    [FUNC_NAME.MIX_POSE]: 0.0255,
    [FUNC_NAME.DOODLE]: 0.017,
    [FUNC_NAME.TILE]: 0.017,
    [FUNC_NAME.REIMAGINE]: 0.017,
    [FUNC_NAME.REMOVE_BACKGROUND]: 0.017,
    [FUNC_NAME.REPLACE_BACKGROUND]: 0.0255,
    [FUNC_NAME.OUTPAINTING]: 0.017,
    [FUNC_NAME.REPLACE_SKY]: 0.0255,
    [FUNC_NAME.REPLACE_OBJECT]: 0.0255,
    [FUNC_NAME.REMOVE_TEXT]: 0.017,
    [FUNC_NAME.REMOVE_WATERMARK]: 0.017,
    [FUNC_NAME.CLEANUP]: 0.017,
    [FUNC_NAME.RELIGHT]: 0.0255,
    [FUNC_NAME.IMG2MASK]: 0.017,
    [FUNC_NAME.IMG2PROMPT]: 0.017,
    [FUNC_NAME.MOTIONSYNC]: 0.288,
    [FUNC_NAME.ANIMATE_ANYONE]: 0.288,
    [FUNC_NAME.MERGE_FACE]: 0.0255,
    [FUNC_NAME.RESTORE_FACE]: 0.0255,
    [FUNC_NAME.TXT2SPEECH]: 15,
    [FUNC_NAME.VOICE_CLONING_INSTANT]: 12,
  };
}

const BASE_PRICE: Record<string, number> = {
  [FUNC_NAME.TXT2IMG]: 4e-6 * IMG_API_DISCOUNT,
  [FUNC_NAME.LCM_TXT2IMG]: 4e-6,
  [FUNC_NAME.ADETAILER]: 4e-6,
  [FUNC_NAME.UPSCALE]: 4e-6 * SCALE_PRICE_FACTOR,
  [FUNC_NAME.TXT2VIDEO]: 4.8e-5,
  [FUNC_NAME.MAKE_PHOTO]: 8e-6 * 0.5,
};

const IMG2VIDEO_MODEL_FRAMES: Record<string, number> = {
  "SVD-XT": 25,
  SVD: 14,
};

export function getDefaultParmas(func: FUNC_NAME | string) {
  switch (func) {
    case FUNC_NAME.TXT2IMG:
    case FUNC_NAME.IMG2IMG:
    case FUNC_NAME.INPAINTING:
    case FUNC_NAME.ADETAILER:
    case FUNC_NAME.MAKE_PHOTO:
    case FUNC_NAME.LCM_TXT2IMG:
    case FUNC_NAME.LCM_IMG2IMG:
      return {
        width: 512,
        minWidth: 256,
        maxWidth: 2048,
        height: 512,
        minHeight: 256,
        maxHeight: 2048,
        steps: 5,
        minSteps: 1,
        maxSteps: 100,
      };
    case FUNC_NAME.UPSCALE:
      return {
        width: 512,
        minWidth: 256,
        maxWidth: 2048,
        height: 512,
        minHeight: 256,
        maxHeight: 2048,
        scale: 2,
        minScale: 1,
        maxScal: 4,
      };
    case FUNC_NAME.TXT2VIDEO:
      return {
        frames: 32,
        minFrames: 8,
        maxFrames: 128,
        steps: 20,
        minSteps: 1,
        maxSteps: 50,
      };
    case "hunyuan-video-fast":
      return {
        duration: 5,
        resolutionType: "1280*720",
      };
    case "wan-t2v":
    case "wan-i2v":
      return {
        duration: 5,
        resolutionType: "1280*720",
      };
    case "kling-v1.6-t2v":
      return {
        duration: 5,
        mode: "Standard",
        resolutionType: "720P",
      };
    case "kling-v1.6-i2v":
      return {
        duration: 5,
        mode: "Standard",
        resolutionType: "720P",
      };
    case "kling-v2.5-t2v":
      return {
        duration: 5,
        resolutionType: "1080P",
      };
    case "kling-v2.5-i2v":
      return {
        duration: 5,
        resolutionType: "1080P",
      };
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_VIDEO_AND_IMG:
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_VIDEO:
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_IMG:
      return {
        resolutionType: "720P",
      };
    case FUNC_NAME.KLING_O1_IMG_TO_VIDEO_720P_5S_TO_10S:
    case FUNC_NAME.KLING_O1_TEXT_TO_VIDEO_720P_5S_TO_10S:
      return {
        duration: 5,
        resolutionType: "720P",
      };
    case FUNC_NAME.KLING_O1_EDIT_VIDEO_FAST_720P_6S_TO_20S:
      return {
        duration: 6,
        resolutionType: "720P",
      };
    case FUNC_NAME.KLING_O1_EDIT_VIDEO_720P_3S_TO_10S_VIDEO:
      return {
        duration: 3,
        resolutionType: "720P",
      };
    case "minimax-video-01":
      return {
        duration: 6,
        resolutionType: "720P",
      };
    case "minimax-hailuo-02":
      return {
        duration: 6,
        resolutionType: "768P",
      };
    case "minimax-hailuo-2.3-t2v":
    case "minimax-hailuo-2.3-i2v":
    case "minimax-hailuo-2.3-fast-i2v":
      return {
        duration: 6,
        resolutionType: "768P",
      };
    case FUNC_NAME.IMG2VIDEO:
      return {
        model: "SVD",
        steps: 20,
        minSteps: 1,
        maxSteps: 50,
      };
    case FUNC_NAME.TRAINING:
      return {
        width: 512,
        minWidth: 256,
        maxWidth: 1024,
        height: 512,
        minHeight: 256,
        maxHeight: 1024,
        steps: 2000,
        minSteps: 1,
        maxSteps: 10000,
      };
    default:
      return {};
  }
}

function getResolutionType(
  widthHeightStr: string | null,
): "480P" | "720P" | "1080P" | null {
  if (!widthHeightStr) {
    return null;
  }

  if (["480P", "720P", "1080P"].includes(widthHeightStr)) {
    return widthHeightStr as "480P" | "720P" | "1080P";
  }

  const resolutionMap: Record<string, "480P" | "720P" | "1080P"> = {
    // 480P level
    "832*480": "480P",
    "480*832": "480P",
    "624*624": "480P",

    // 720P level
    "1280*720": "720P",
    "720*1280": "720P",
    "960*960": "720P",
    "1088*832": "720P",
    "832*1088": "720P",

    // 1080P level
    "1920*1080": "1080P",
    "1080*1920": "1080P",
    "1440*1440": "1080P",
    "1632*1248": "1080P",
    "1248*1632": "1080P",
  };

  return resolutionMap[widthHeightStr] || null;
}

export function calcPrice(
  func: FUNC_NAME | string,
  props?: CalcProps,
): { originalPrice: number | string; discountPrice: number | string } {
  const {
    width = 0,
    height = 0,
    steps = 0,
    scale = 1,
    frames = 0,
    resolutionType = "",
    model = "",
    isSDXL,
    mode = "",
    duration = 0,
    ratio = "",
  } = props || {};
  const rate = 1;
  const extraCost = 0;
  const fixedPrice = getFixedPrice();

  const state = reduxStore.store?.getState();
  const modelProductPrice = state?.config?.modelProductPrice;

  function getPriceForLocal(priceEn: number | string) {
    if (priceEn === "-") {
      return {
        originalPrice: "-",
        discountPrice: "-",
      };
    }
    const discountPrice =
      Math.round((Number(priceEn) * rate + extraCost) * 10000) / 10000;
    return {
      originalPrice: discountPrice,
      discountPrice: discountPrice,
    };
  }

  function getSeedancePriceId(
    baseId: string,
    duration: number,
    resolutionType: string,
    ratio: string,
  ) {
    const durationSuffix = duration === 10 ? "10S" : "5S";
    const firstRatio = ratio.split(" & ")[0];
    const ratioSuffix = firstRatio.replace(":", "_");
    return `${baseId}_${durationSuffix}_${resolutionType}_${ratioSuffix}` as keyof typeof modelProductPrice;
  }

  function getSeedanceV15ProPriceId(
    type: "I2V" | "T2V",
    frameType: "FLF" | "FF" | "",
    audioType: "SILENT" | "AUDIO",
    resolutionType: "480P" | "720P",
    mode: "ONLINE" | "BATCH",
  ) {
    if (type === "T2V") {
      return `SEEDANCE_V15_PRO_T2V_${audioType}_${resolutionType}_${mode}` as keyof typeof modelProductPrice;
    } else {
      return `SEEDANCE_V15_PRO_I2V_${frameType}_${audioType}_${resolutionType}_${mode}` as keyof typeof modelProductPrice;
    }
  }

  function getMediaProductPrice(
    priceData:
      | { originalPrice: number | string; discountPrice: number | string }
      | number
      | string
      | undefined,
  ): { originalPrice: number | string; discountPrice: number | string } {
    // If it's already in the correct format, return it
    if (
      priceData &&
      typeof priceData === "object" &&
      "originalPrice" in priceData
    ) {
      return priceData;
    }
    // If it's undefined or "-", return default structure
    if (!priceData || priceData === "-") {
      return {
        originalPrice: "-",
        discountPrice: "-",
      };
    }
    // If it's a simple number or string, wrap it
    return {
      originalPrice: priceData,
      discountPrice: priceData,
    };
  }

  if (fixedPrice[func]) {
    return getPriceForLocal(fixedPrice[func]);
  }
  switch (func) {
    case FUNC_NAME.MINIMAX_SPEECH_02_HD:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_02_HD);
    case FUNC_NAME.MINIMAX_SPEECH_02_TURBO:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_02_TURBO);
    case FUNC_NAME.MINIMAX_VOICE_CLONING:
      return getMediaProductPrice(modelProductPrice.MINIMAX_VOICE_CLONING);
    case FUNC_NAME.MINIMAX_SPEECH_2_5_HD_PREVIEW:
      return getMediaProductPrice(
        modelProductPrice.MINIMAX_SPEECH_2_5_HD_PREVIEW,
      );
    case FUNC_NAME.MINIMAX_SPEECH_2_5_TURBO_PREVIEW:
      return getMediaProductPrice(
        modelProductPrice.MINIMAX_SPEECH_2_5_TURBO_PREVIEW,
      );
    case FUNC_NAME.MINIMAX_SPEECH_2_6_HD:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_2_6_HD);
    case FUNC_NAME.MINIMAX_SPEECH_2_6_TURBO:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_2_6_TURBO);
    case FUNC_NAME.MINIMAX_SPEECH_2_8_HD:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_2_8_HD);
    case FUNC_NAME.MINIMAX_SPEECH_2_8_TURBO:
      return getMediaProductPrice(modelProductPrice.MINIMAX_SPEECH_2_8_TURBO);
    case FUNC_NAME.FISH_AUDIO_TEXT_TO_SPEECH:
      return getMediaProductPrice(modelProductPrice.FISH_AUDIO_TEXT_TO_SPEECH);
    case FUNC_NAME.FISH_AUDIO_VOICE_CLONING:
      return getMediaProductPrice(modelProductPrice?.FISH_AUDIO_VOICE_CLONE);
    case FUNC_NAME.GLM_TTS:
      return getMediaProductPrice(modelProductPrice?.GLM_TTS);
    case FUNC_NAME.GLM_TTS_CLONE:
      return getMediaProductPrice(modelProductPrice?.GLM_TTS_CLONE);
    case FUNC_NAME.GLM_ASR_2512:
      return getMediaProductPrice(modelProductPrice?.GLM_ASR_2512);
    case FUNC_NAME.SEEDREAM_3_0_T2I:
      return getMediaProductPrice(
        modelProductPrice.SEE_DREAM_3_0_TXT_TO_IMG_250415,
      );
    case FUNC_NAME.SEEDREAM_4_0:
      return getMediaProductPrice(modelProductPrice.SEEDREAM_4_0_IMG_GEN);
    case FUNC_NAME.SEEDREAM_4_5:
      return getMediaProductPrice(modelProductPrice.SEEDREAM_4_5_IMG_GEN);
    case "seedream-5.0-lite":
      return getMediaProductPrice(modelProductPrice.SEEDREAM_5_LITE_IMG_GEN);
    case FUNC_NAME.QWEN_TXT2IMG:
      return getMediaProductPrice(modelProductPrice.QWEN_IMAGE_TEXT_TO_IMAGE);
    case FUNC_NAME.QWEN_IMAGE_EDIT:
      return getMediaProductPrice(modelProductPrice.QWEN_IMAGE_EDIT);
    case FUNC_NAME.GLM_IMAGE:
      return getMediaProductPrice(modelProductPrice.GLM_IMAGE);
    case FUNC_NAME.TXT2IMG:
    case FUNC_NAME.IMG2IMG: {
      const priceEn = Math.max(
        Math.round(width * height * steps * BASE_PRICE[FUNC_NAME.TXT2IMG]) /
          10000 || 0,
        0.001,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.LCM_TXT2IMG:
    case FUNC_NAME.LCM_IMG2IMG: {
      const priceEn = Math.max(
        Math.round(width * height * steps * BASE_PRICE[FUNC_NAME.LCM_TXT2IMG]) /
          10000 || 0,
        0.0005,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.ADETAILER:
    case FUNC_NAME.INPAINTING: {
      const priceEn = Math.max(
        Math.round(width * height * steps * BASE_PRICE[FUNC_NAME.ADETAILER]) /
          10000 || 0,
        0.0015,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.UPSCALE: {
      const priceEn = Math.max(
        Math.round(width * height * scale * BASE_PRICE[FUNC_NAME.UPSCALE]) /
          10000 || 0,
        0.0015,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.FLUX1_KONTEXT_DEV: {
      if (mode === "fast_mode") {
        return getMediaProductPrice(
          modelProductPrice.FLUX_KONTEXT_DEV_ULTRA_FAST || "-",
        );
      }
      return getMediaProductPrice(modelProductPrice.FLUX_KONTEXT_DEV || "-");
    }
    case FUNC_NAME.FLUX1_KONTEXT_PRO:
      return getMediaProductPrice(modelProductPrice.FLUX_KONTEXT_PRO || "-");
    case FUNC_NAME.FLUX1_KONTEXT_MAX:
      return getMediaProductPrice(modelProductPrice.FLUX_KONTEXT_MAX || "-");
    case FUNC_NAME.FLUX_2_DEV_TXT_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_DEV_TXT_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_DEV_IMG_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_DEV_IMG_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_DEV_LORA_TXT_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_DEV_LORA_TXT_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_DEV_LORA_IMG_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_DEV_LORA_IMG_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_FLEX_TXT_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_FLEX_TXT_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_FLEX_IMG_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_FLEX_IMG_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_PRO_TXT_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_PRO_TXT_TO_IMG || "-",
      );
    case FUNC_NAME.FLUX_2_PRO_IMG_TO_IMG:
      return getMediaProductPrice(
        modelProductPrice.FLUX_2_PRO_IMG_TO_IMG || "-",
      );
    case FUNC_NAME.HUNYUAN_3_0: {
      return getMediaProductPrice(modelProductPrice.HUNYUAN_IMAGE_3 || "-");
    }
    case FUNC_NAME.Z_IMAGE_TURBO_LORA: {
      return getMediaProductPrice(
        modelProductPrice["Z-IMAGE-TURBO-LORA"] || "-",
      );
    }
    case FUNC_NAME.Z_IMAGE_TURBO: {
      return getMediaProductPrice(modelProductPrice["Z-IMAGE-TURBO"] || "-");
    }
    case FUNC_NAME.IMAGE_REMOVE_BACKGROUND: {
      return getMediaProductPrice(
        modelProductPrice.IMAGE_REMOVE_BACKGROUND || "-",
      );
    }
    case FUNC_NAME.IMAGE_ERASER: {
      return getMediaProductPrice(modelProductPrice.IMAGE_ERASER || "-");
    }
    case FUNC_NAME.IMAGE_UPSCALER: {
      return getMediaProductPrice(modelProductPrice.IMAGE_UPSCALER || "-");
    }
    case "kling-v1.6-t2v":
    case "kling-v1.6-i2v": {
      if (mode === "Standard") {
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V16_I2V_10S_STANDARD || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V16_I2V_STANDARD || "-",
        );
      } else if (mode === "Professional") {
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V16_I2V_10S_PRO || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V16_I2V_PRO || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.KLING_V2_1_T2V_MASTER: {
      if (duration === 10) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V21_T2V_10S_MASTER || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V21_T2V_MASTER || "-",
      );
    }
    case FUNC_NAME.KLING_V2_1_I2V_MASTER: {
      if (duration === 10) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V21_I2V_10S_MASTER || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V21_I2V_MASTER || "-",
      );
    }
    case FUNC_NAME.KLING_V2_1_I2V: {
      if (mode === "Standard") {
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V21_I2V_10S_STANDARD || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V21_I2V_STANDARD || "-",
        );
      } else if (mode === "Professional") {
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V21_I2V_10S_PRO || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V21_I2V_PRO || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.KLING_V2_5_T2V: {
      if (duration === 10) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_2_5_TURBO_T2V_10S_1080P || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_2_5_TURBO_T2V_5S_1080P || "-",
      );
    }
    case FUNC_NAME.KLING_V2_5_I2V: {
      if (duration === 10) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_2_5_TURBO_I2V_10S_1080P || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_2_5_TURBO_I2V_5S_1080P || "-",
      );
    }
    case FUNC_NAME.KLING_V26_PRO_MOTION_CONTROL: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_V26_PRO_MOTION_CONTROL || "-",
      );
    }
    case FUNC_NAME.KLING_V26_PRO_T2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      const duration = props?.duration || 5;

      if (duration === 10) {
        if (hasAudio) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V26_PRO_T2V_10S_A || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V26_PRO_T2V_10S_NA || "-",
        );
      }
      // duration === 5
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V26_PRO_T2V_5S_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V26_PRO_T2V_5S_NA || "-",
      );
    }
    case FUNC_NAME.KLING_V26_PRO_I2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      const duration = props?.duration || 5;

      if (duration === 10) {
        if (hasAudio) {
          return getMediaProductPrice(
            modelProductPrice?.KLING_V26_PRO_I2V_10S_A || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice?.KLING_V26_PRO_I2V_10S_NA || "-",
        );
      }
      // duration === 5
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V26_PRO_I2V_5S_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V26_PRO_I2V_5S_NA || "-",
      );
    }
    case FUNC_NAME.KLING_V30_STD_T2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V30_STD_T2V_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V30_STD_T2V_NA || "-",
      );
    }
    case FUNC_NAME.KLING_V30_STD_I2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V30_STD_I2V_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V30_STD_I2V_NA || "-",
      );
    }
    case FUNC_NAME.KLING_V30_PRO_T2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V30_PRO_T2V_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V30_PRO_T2V_NA || "-",
      );
    }
    case FUNC_NAME.KLING_V30_PRO_I2V: {
      const hasAudio = props?.audio === true || props?.audio === "A";
      if (hasAudio) {
        return getMediaProductPrice(
          modelProductPrice?.KLING_V30_PRO_I2V_A || "-",
        );
      }
      return getMediaProductPrice(
        modelProductPrice?.KLING_V30_PRO_I2V_NA || "-",
      );
    }
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_VIDEO_AND_IMG: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_REFERENCE_TO_VIDEO_VIDEO_AND_IMG || "-",
      );
    }
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_VIDEO: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_REFERENCE_TO_VIDEO_ONLY_VIDEO || "-",
      );
    }
    case FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_IMG: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_REFERENCE_TO_VIDEO_ONLY_IMG || "-",
      );
    }
    case FUNC_NAME.KLING_O1_IMG_TO_VIDEO_720P_5S_TO_10S: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_IMG_TO_VIDEO_720P_5S_TO_10S || "-",
      );
    }
    case FUNC_NAME.KLING_O1_TEXT_TO_VIDEO_720P_5S_TO_10S: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_TEXT_TO_VIDEO_720P_5S_TO_10S || "-",
      );
    }
    case FUNC_NAME.KLING_O1_EDIT_VIDEO_FAST_720P_6S_TO_20S: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_EDIT_VIDEO_FAST_720P_6S_TO_20S || "-",
      );
    }
    case FUNC_NAME.KLING_O1_EDIT_VIDEO_720P_3S_TO_10S_VIDEO: {
      return getMediaProductPrice(
        modelProductPrice?.KLING_O1_EDIT_VIDEO_720P_3S_TO_10S_VIDEO || "-",
      );
    }
    case FUNC_NAME.HEYGEN_VIDEO_TRANSLATE: {
      return getMediaProductPrice(
        modelProductPrice?.HEYGEN_VIDEO_TRANSLATE_PER_SECOND || "-",
      );
    }
    case "minimax-video-01": {
      return getMediaProductPrice(modelProductPrice?.MINIMAX_VIDEO_01 || "-");
    }
    case "minimax-hailuo-02": {
      if (resolutionType === "768P") {
        if (duration === 6) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_02_6S_768P || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_02_10S_768P || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.MINIMAX_HAILUO_02_6S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case "minimax-hailuo-2.3-t2v": {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      if (resolutionType === "768P") {
        if (duration === 6) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_T2V_6S_768P || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_T2V_10S_768P || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.MINIMAX_HAILUO_2_3_T2V_6S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case "minimax-hailuo-2.3-i2v": {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      if (resolutionType === "768P") {
        if (duration === 6) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_I2V_6S_768P || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_I2V_10S_768P || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.MINIMAX_HAILUO_2_3_I2V_6S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case "minimax-hailuo-2.3-fast-i2v": {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      if (resolutionType === "768P") {
        if (duration === 6) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_FAST_I2V_6S_768P || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.MINIMAX_HAILUO_2_3_FAST_I2V_10S_768P || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.MINIMAX_HAILUO_2_3_FAST_I2V_6S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case "wan-t2v":
    case "wan-i2v": {
      if (
        resolutionType === "1280*720" ||
        resolutionType === "720*1280" ||
        resolutionType === "1280*720 | 720*1280"
      ) {
        if (mode === "fast_mode") {
          return getMediaProductPrice(
            modelProductPrice.WAN_TXT_TO_VIDEO_FAST_MODE_720P || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice.WAN_TXT_TO_VIDEO_720P || "-",
        );
      }
      if (
        resolutionType === "832*480" ||
        resolutionType === "480*832" ||
        resolutionType === "832*480 | 480*832"
      ) {
        if (mode === "fast_mode") {
          return getMediaProductPrice(
            modelProductPrice.WAN_TXT_TO_VIDEO_FAST_MODE_480P || "-",
          );
        }
        return getMediaProductPrice(
          modelProductPrice.WAN_TXT_TO_VIDEO_480P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_2_T2V: {
      if (resolutionType === "480P") {
        if (duration === 5) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_TXT_TO_VIDEO_LORA_5S_480p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_TXT_TO_VIDEO_5S_480p || "-",
          );
        }
        if (duration === 8) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_TXT_TO_VIDEO_LORA_8S_480p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_TXT_TO_VIDEO_8S_480p || "-",
          );
        }
      }
      if (resolutionType === "720P") {
        if (duration === 5) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_TXT_TO_VIDEO_LORA_5S_720p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_TXT_TO_VIDEO_5S_720p || "-",
          );
        }
        if (duration === 8) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_TXT_TO_VIDEO_LORA_8S_720p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_TXT_TO_VIDEO_8S_720p || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.WAN2_2_TXT_TO_VIDEO_5S_1080p || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_2_I2V: {
      if (resolutionType === "480P") {
        if (duration === 5) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_LORA_5S_480p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_5S_480p || "-",
          );
        }
        if (duration === 8) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_LORA_8S_480p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_8S_480p || "-",
          );
        }
      }
      if (resolutionType === "720P") {
        if (duration === 5) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_LORA_5S_720p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_5S_720p || "-",
          );
        }
        if (duration === 8) {
          if (mode === "LoRA") {
            return getMediaProductPrice(
              modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_LORA_8S_720p || "-",
            );
          }
          return getMediaProductPrice(
            modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_8S_720p || "-",
          );
        }
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.WAN2_2_IMAGE_TO_VIDEO_5S_1080p || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_5_T2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_5_I2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_6_T2V: {
      const validResolutionType = getResolutionType(resolutionType);
      if (validResolutionType === "720P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_720P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_720P_10S || "-",
          );
        }
        if (duration === 15) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_720P_15S || "-",
          );
        }
      }
      if (validResolutionType === "1080P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_1080P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_1080P_10S || "-",
          );
        }
        if (duration === 15) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_T2V_1080P_15S || "-",
          );
        }
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_6_I2V: {
      const validResolutionType = getResolutionType(resolutionType);
      if (validResolutionType === "720P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_720P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_720P_10S || "-",
          );
        }
        if (duration === 15) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_720P_15S || "-",
          );
        }
      }
      if (validResolutionType === "1080P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_1080P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_1080P_10S || "-",
          );
        }
        if (duration === 15) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_I2V_1080P_15S || "-",
          );
        }
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.WAN_2_6_V2V: {
      const validResolutionType = getResolutionType(resolutionType);
      if (validResolutionType === "720P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_V2V_720P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_V2V_720P_10S || "-",
          );
        }
      }
      if (validResolutionType === "1080P") {
        if (duration === 5) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_V2V_1080P_5S || "-",
          );
        }
        if (duration === 10) {
          return getMediaProductPrice(
            modelProductPrice.WAN2_6_V2V_1080P_10S || "-",
          );
        }
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q1_TEXT2VIDEO:
    case FUNC_NAME.VIDU_Q1_IMG2VIDEO: {
      return getMediaProductPrice(
        modelProductPrice.VIDU_Q1_TEXT_TO_VIDEO_GENERAL_5S_1080P || "-",
      );
    }
    case FUNC_NAME.VIDU_Q1_STARTEND2VIDEO: {
      return getMediaProductPrice(
        modelProductPrice.VIDU_Q1_START_END_TO_VIDEO_GENERAL_5S_1080P || "-",
      );
    }
    case FUNC_NAME.VIDU_Q1_REFERENCE2VIDEO: {
      return getMediaProductPrice(
        modelProductPrice.VIDU_Q1_REFERENCE_TO_VIDEO_GENERAL_5S_1080P || "-",
      );
    }
    case FUNC_NAME.VIDU_2_0_IMG2VIDEO: {
      if (duration === 4) {
        if (resolutionType === "360P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_IMAGE_TO_VIDEO_GENERAL_4S_360P || "-",
          );
        }
        if (resolutionType === "720P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_IMAGE_TO_VIDEO_GENERAL_4S_720P || "-",
          );
        }
        if (resolutionType === "1080P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_IMAGE_TO_VIDEO_GENERAL_4S_1080P || "-",
          );
        }
      } else {
        return getMediaProductPrice(
          modelProductPrice.VIDU_2_0_IMAGE_TO_VIDEO_GENERAL_8S_720P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_2_0_REFERENCE2VIDEO: {
      if (resolutionType === "360P") {
        return getMediaProductPrice(
          modelProductPrice.VIDU_2_0_REFERENCE_TO_VIDEO_GENERAL_4S_360P || "-",
        );
      }
      if (resolutionType === "720P") {
        return getMediaProductPrice(
          modelProductPrice.VIDU_2_0_REFERENCE_TO_VIDEO_GENERAL_4S_720P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_2_0_STARTEND2VIDEO: {
      if (duration === 4) {
        if (resolutionType === "360P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_START_END_TO_VIDEO_GENERAL_4S_360P ||
              "-",
          );
        }
        if (resolutionType === "720P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_START_END_TO_VIDEO_GENERAL_4S_720P ||
              "-",
          );
        }
        if (resolutionType === "1080P") {
          return getMediaProductPrice(
            modelProductPrice.VIDU_2_0_START_END_TO_VIDEO_GENERAL_4S_1080P ||
              "-",
          );
        }
      } else {
        return getMediaProductPrice(
          modelProductPrice.VIDU_2_0_START_END_TO_VIDEO_GENERAL_8S_720P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q2: {
      // Hardcoded prices for 5s duration (temporary fix)
      if (model === "VIDU_Q2_T2V_540P") {
        return getPriceForLocal(0.0802);
      }
      if (model === "VIDU_Q2_T2V_720P") {
        return getPriceForLocal(0.1562);
      }
      if (model === "VIDU_Q2_T2V_1080P") {
        return getPriceForLocal(0.2677);
      }
      if (model === "VIDU_Q2_R2V_540P") {
        return getPriceForLocal(0.1562);
      }
      if (model === "VIDU_Q2_R2V_720P") {
        return getPriceForLocal(0.2008);
      }
      if (model === "VIDU_Q2_R2V_1080P") {
        return getPriceForLocal(0.5132);
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q2_PRO: {
      // Hardcoded prices for 5s duration (temporary fix)
      if (model === "VIDU_Q2_PRO_I2V_540P") {
        return getPriceForLocal(0.1472);
      }
      if (model === "VIDU_Q2_PRO_I2V_720P") {
        return getPriceForLocal(0.2454);
      }
      if (model === "VIDU_Q2_PRO_I2V_1080P") {
        return getPriceForLocal(0.5135);
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q2_PRO_FAST: {
      // Hardcoded prices for 5s duration (temporary fix)
      if (model === "VIDU_Q2_PRO_FAST_I2V_720P") {
        return getPriceForLocal(0.0713);
      }
      if (model === "VIDU_Q2_PRO_FAST_I2V_1080P") {
        return getPriceForLocal(0.143);
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q2_TURBO: {
      // Hardcoded prices for 5s duration (temporary fix)
      if (model === "VIDU_Q2_TURBO_I2V_540P") {
        return getPriceForLocal(0.0624);
      }
      if (model === "VIDU_Q2_TURBO_I2V_720P") {
        return getPriceForLocal(0.2141);
      }
      if (model === "VIDU_Q2_TURBO_I2V_1080P") {
        return getPriceForLocal(0.3347);
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q2_TEMPLATE: {
      // Get price from API for template SKUs
      if (model) {
        return getMediaProductPrice(
          modelProductPrice?.[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q3_PRO_T2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q3_PRO_I2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q3_PRO_F2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.VIDU_Q3_TURBO_T2V:
    case FUNC_NAME.VIDU_Q3_TURBO_I2V:
    case FUNC_NAME.VIDU_Q3_TURBO_F2V: {
      if (model) {
        return getMediaProductPrice(
          modelProductPrice[model as keyof typeof modelProductPrice] || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.PIXVERSE_V4_5_T2V: {
      if (mode === "fast_mode") {
        if (resolutionType === "360P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_FAST_MODE_5S_360P ||
              "-",
          );
        }
        if (resolutionType === "540P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_FAST_MODE_5S_540P ||
              "-",
          );
        }
        if (resolutionType === "720P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_FAST_MODE_5S_720P ||
              "-",
          );
        }
      }
      if (resolutionType === "360P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_5S_360P || "-",
        );
      }
      if (resolutionType === "540P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_5S_540P || "-",
        );
      }
      if (resolutionType === "720P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_5S_720P || "-",
        );
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_TXT_TO_VIDEO_5S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.PIXVERSE_V4_5_I2V: {
      if (mode === "fast_mode") {
        if (resolutionType === "360P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_FAST_MODE_5S_360P ||
              "-",
          );
        }
        if (resolutionType === "540P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_FAST_MODE_5S_540P ||
              "-",
          );
        }
        if (resolutionType === "720P") {
          return getMediaProductPrice(
            modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_FAST_MODE_5S_720P ||
              "-",
          );
        }
      }
      if (resolutionType === "360P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_5S_360P || "-",
        );
      }
      if (resolutionType === "540P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_5S_540P || "-",
        );
      }
      if (resolutionType === "720P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_5S_720P || "-",
        );
      }
      if (resolutionType === "1080P") {
        return getMediaProductPrice(
          modelProductPrice.PIXVERSE_V4_5_IMG_TO_VIDEO_5S_1080P || "-",
        );
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V1_LITE_T2V: {
      if (
        ratio &&
        (resolutionType === "480P" ||
          resolutionType === "720P" ||
          resolutionType === "1080P")
      ) {
        const priceId = getSeedancePriceId(
          "SEEDANCE_V10_LITE_T2V",
          duration,
          resolutionType,
          ratio,
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V1_LITE_I2V: {
      if (
        ratio &&
        (resolutionType === "480P" ||
          resolutionType === "720P" ||
          resolutionType === "1080P")
      ) {
        const priceId = getSeedancePriceId(
          "SEEDANCE_V10_LITE_I2V",
          duration,
          resolutionType,
          ratio,
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V1_PRO_T2V: {
      if (
        ratio &&
        (resolutionType === "480P" ||
          resolutionType === "720P" ||
          resolutionType === "1080P")
      ) {
        const priceId = getSeedancePriceId(
          "SEEDANCE_V10_PRO_T2V",
          duration,
          resolutionType,
          ratio,
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V1_PRO_I2V: {
      if (
        ratio &&
        (resolutionType === "480P" ||
          resolutionType === "720P" ||
          resolutionType === "1080P")
      ) {
        const priceId = getSeedancePriceId(
          "SEEDANCE_V10_PRO_I2V",
          duration,
          resolutionType,
          ratio,
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V15_PRO_T2V: {
      const {
        resolutionType: resType = "",
        audioType = "SILENT",
        batchMode = "ONLINE",
      } = props || {};
      if (resType === "480P" || resType === "720P") {
        const priceId = getSeedanceV15ProPriceId(
          "T2V",
          "",
          audioType as "SILENT" | "AUDIO",
          resType as "480P" | "720P",
          batchMode as "ONLINE" | "BATCH",
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.SEEDANCE_V15_PRO_I2V: {
      const {
        resolutionType: resType = "",
        frameType = "FLF",
        audioType = "SILENT",
        batchMode = "ONLINE",
      } = props || {};
      if (resType === "480P" || resType === "720P") {
        const priceId = getSeedanceV15ProPriceId(
          "I2V",
          (frameType || "FLF") as "FLF" | "FF",
          audioType as "SILENT" | "AUDIO",
          resType as "480P" | "720P",
          batchMode as "ONLINE" | "BATCH",
        );
        return getMediaProductPrice(modelProductPrice[priceId] || "-");
      }
      return getMediaProductPrice("-");
    }
    case FUNC_NAME.TXT2VIDEO:
    case "hunyuan-video-fast":
    case FUNC_NAME.IMG2VIDEO: {
      if (model === "hunyuan-video-fast") {
        if (
          resolutionType === "720*1280" ||
          resolutionType === "1280*720" ||
          resolutionType === "1280*720 | 720*1280"
        ) {
          return getMediaProductPrice(
            modelProductPrice.HUNYUAN_VIDEO_FAST || "-",
          );
        }
      }
      const equivalentFrames = frames || IMG2VIDEO_MODEL_FRAMES[model] || 0;
      const priceEn = Math.max(
        Math.round(
          equivalentFrames * steps * BASE_PRICE[FUNC_NAME.TXT2VIDEO] * 10000,
        ) / 10000 || 0,
        0.0015,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.MAKE_PHOTO: {
      const priceEn = Math.max(
        Math.round(width * height * steps * BASE_PRICE[FUNC_NAME.MAKE_PHOTO]) /
          10000 || 0,
        0.0015,
      );
      return getPriceForLocal(priceEn);
    }
    case FUNC_NAME.TRAINING: {
      let priceEn = 0;
      if (!width || !height || !steps) {
        priceEn = 0.0015;
      } else {
        const baseResolution = 512 * 512;
        let priceOfPerSteps = 0.00028;
        if (isSDXL) {
          priceOfPerSteps = priceOfPerSteps * 1.5;
        }
        const value = (width * height * steps) / baseResolution;
        priceEn = value * priceOfPerSteps;
      }
      return getPriceForLocal(priceEn);
    }
    default:
      return getMediaProductPrice("-");
  }
}
