import * as txt2imgCodes from "../image/sample-codes/txt2img";
import * as img2imgCodes from "../image/sample-codes/img2img";
import * as lcmTxt2imgCodes from "../image/sample-codes/lcm_txt2img";
import * as removebgCodes from "../image/sample-codes/removebg";
import * as cleanupCodes from "../image/sample-codes/cleanup";
import * as doodleCodes from "../image/sample-codes/doodle";
import * as mixposeCodes from "../image/sample-codes/mixpose";
import * as outpaintingCodes from "../image/sample-codes/outpainting";
import * as replaceBgCodes from "../image/sample-codes/replacebg";
import * as replaceObjCodes from "../image/sample-codes/replaceobj";
import * as replaceSkyCodes from "../image/sample-codes/replacesky";
import * as mergeFaceCodes from "../image/sample-codes/mergeface";
import * as reimagineCodes from "../image/sample-codes/reimagine";
import * as removeTxtCodes from "../image/sample-codes/removetxt";
import * as removeWatermarkCodes from "../image/sample-codes/removewatermark";
import * as restoreFaceCodes from "../image/sample-codes/restoreface";
import * as upscaleCodes from "../image/sample-codes/upscale";
import * as tileCodes from "../image/sample-codes/createtile";
import * as inpaintingCodes from "../image/sample-codes/inpainting";
import * as wanT2vCodes from "../image/sample-codes/wan-t2v";
import * as wanI2vCodes from "../image/sample-codes/wan-i2v";
import * as wan26T2vCodes from "../image/sample-codes/wan26-t2v";
import * as wan26I2vCodes from "../image/sample-codes/wan26-i2v";
import * as wan26V2vCodes from "../image/sample-codes/wan26-v2v";
import * as hunyuanVideoFastCodes from "../image/sample-codes/hunyuan-video-fast";
import * as klingV16T2vCodes from "../image/sample-codes/kling-v1_6-t2v";
import * as klingV16I2vCodes from "../image/sample-codes/kling-v1_6-i2v";
import * as minimaxVideo01Codes from "../image/sample-codes/minimax-video-01";
import * as minimaxHailuo02Codes from "../image/sample-codes/minimax-hailuo-02";
import * as txt2videoCodes from "../image/sample-codes/txt2video";
import * as img2videoCodes from "../image/sample-codes/img2video";
import * as img2videoMotionCodes from "../image/sample-codes/img2video-motion";
import * as animateAnyoneCodes from "../image/sample-codes/animate-anyone";
import { CODE_LANG } from "../image/sample-codes/code";
import FUNCS, {
  FUNC_DISABLE_IN_EN,
  FuncConstants,
  FuncData,
} from "@/app/models/constants/funcs";

export type FuncList = Func[];

export type SampleCode = {
  lang: CODE_LANG;
  code: string;
};
export type Func = {
  info: FuncConstants;
  sampleCode?: SampleCode[];
  codeLines?: {
    [key: string]: {
      lang: string;
      line: number;
    }[];
  };
};

const funcs: FuncList = [
  {
    info: FUNCS.TXT2IMG,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: txt2imgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: txt2imgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: txt2imgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.IMG2IMG,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: img2imgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: img2imgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: img2imgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.LCM_TXT2IMG,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: lcmTxt2imgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: lcmTxt2imgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: lcmTxt2imgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.LCM_IMG2IMG,
    sampleCode: [],
  },
  {
    info: FUNCS.HUNYUAN_VIDEO_FAST,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: hunyuanVideoFastCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.WAN_T2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: wanT2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.WAN_I2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: wanI2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.WAN_2_6_T2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: wan26T2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.WAN_2_6_I2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: wan26I2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.WAN_2_6_V2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: wan26V2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.KLING_V1_6_T2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: klingV16T2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.KLING_V1_6_I2V,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: klingV16I2vCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.MINIMAX_VIDEO_01,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: minimaxVideo01Codes.bash,
      },
    ],
  },
  {
    info: FUNCS.MINIMAX_HAILUO_02,
    sampleCode: [
      {
        lang: CODE_LANG.BASH,
        code: minimaxHailuo02Codes.bash,
      },
    ],
  },
  {
    info: FUNCS.TXT2VIDEO,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: txt2videoCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: txt2videoCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: txt2videoCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.IMG2VIDEO,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: img2videoCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: img2videoCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: img2videoCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REMOVE_BACKGROUND,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: removebgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: removebgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: removebgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.CLEANUP,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: cleanupCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: cleanupCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: cleanupCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.OUTPAINTING,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: outpaintingCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: outpaintingCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: outpaintingCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REPLACE_BACKGROUND,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: replaceBgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: replaceBgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: replaceBgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.MIX_POSE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: mixposeCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: mixposeCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: mixposeCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.DOODLE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: doodleCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: doodleCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: doodleCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REPLACE_SKY,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: replaceSkyCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: replaceSkyCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: replaceSkyCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REPLACE_OBJECT,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: replaceObjCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: replaceObjCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: replaceObjCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.MERGE_FACE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: mergeFaceCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: mergeFaceCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: mergeFaceCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REMOVE_TEXT,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: removeTxtCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: removeTxtCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: removeTxtCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REMOVE_WATERMARK,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: removeWatermarkCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: removeWatermarkCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: removeWatermarkCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.RESTORE_FACE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: restoreFaceCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: restoreFaceCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: restoreFaceCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.REIMAGINE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: reimagineCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: reimagineCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: reimagineCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.UPSCALE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: upscaleCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: upscaleCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: upscaleCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.TILE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: tileCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: tileCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: tileCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.INPAINTING,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: inpaintingCodes.js,
      },
      // {
      //   lang: CODE_LANG.PYTHON,
      //   code: inpaintingCodes.python,
      // },
      {
        lang: CODE_LANG.BASH,
        code: inpaintingCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.SDXL,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: txt2imgCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: txt2imgCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: txt2imgCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.MOTIONSYNC,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: img2videoMotionCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: img2videoMotionCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: img2videoMotionCodes.bash,
      },
    ],
  },
  {
    info: FUNCS.ANIMATE_ANYONE,
    sampleCode: [
      {
        lang: CODE_LANG.JAVASCRIPT,
        code: animateAnyoneCodes.js,
      },
      {
        lang: CODE_LANG.PYTHON,
        code: animateAnyoneCodes.python,
      },
      {
        lang: CODE_LANG.BASH,
        code: animateAnyoneCodes.bash,
      },
    ],
  },
];

export function getFuncs(): Promise<FuncList> {
  return new Promise((resolve) => {
    resolve(funcs);
  });
}

export function funcFilter(
  func: FuncData | FuncConstants,
  page: "product" | "playground",
) {
  if (!func.productpageReady && page === "product") {
    return false;
  }
  if (!func.playgroundReady && page === "playground") {
    return false;
  }
  if (FUNC_DISABLE_IN_EN.includes(func.name)) {
    return false;
  }
  return true;
}
