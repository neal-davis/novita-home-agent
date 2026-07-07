import React from "react";
import {
  Baichuan,
  Exa,
  Hunyuan,
  Microsoft,
  Mistral,
  Moonshot,
  OpenAI,
  Wenxin,
} from "@lobehub/icons";
import { FUNC_NAME } from "@/app/models/constants/funcs";

export interface ModelLogoMapping {
  keywords: string[];
  logoPath?: string;
  ModelIcon?: React.ComponentType<any>;
  preferModelIcon?: boolean;
}

export interface ModelLogoResult {
  logoPath?: string;
  ModelIcon?: React.ComponentType<any>;
  preferModelIcon?: boolean;
}

export interface ModelLogoNameSource {
  series?: string | null;
  provider?: string | null;
  displayName?: string | null;
  name?: string | null;
  id?: string | number | null;
}

export function getModelLogoName(source: ModelLogoNameSource): string {
  return (
    source.series ||
    source.provider ||
    source.displayName ||
    source.name ||
    source.id?.toString() ||
    ""
  );
}

const MODEL_LOGO_MAPPINGS: ModelLogoMapping[] = [
  {
    keywords: ["stepfun", "step-fun", "step fun"],
    logoPath: "/models/logo/svg/stepfun-logo.svg",
  },
  {
    keywords: ["nvidia"],
    logoPath: "/models/logo/svg/nvidia-logo.svg",
  },
  {
    keywords: ["deepseek"],
    logoPath: "/models/logo/svg/deepseek-logo.svg",
  },
  {
    keywords: ["llama"],
    logoPath: "/models/logo/svg/meta-logo.svg",
  },
  {
    keywords: ["gryphe"],
    logoPath: "/models/logo/svg/gryphe-logo.svg",
  },
  {
    keywords: ["google", "gemini", "gemma"],
    logoPath: "/models/logo/svg/google-logo.svg",
  },
  {
    keywords: ["mistralai"],
    logoPath: "/models/logo/svg/mistralai-logo.svg",
  },
  {
    keywords: ["microsoft"],
    logoPath: "/models/logo/svg/microsoft-logo.svg",
  },
  {
    keywords: ["openchat"],
    logoPath: "/models/logo/svg/openchat-logo.svg",
  },
  {
    keywords: ["nousresearch"],
    logoPath: "/models/logo/nousresearch-logo.png",
  },
  {
    keywords: ["sao10k", "euryale", "lunaris", "stheno"],
    logoPath: "/models/logo/sao10k-logo.png",
  },
  {
    keywords: ["cognitivecomputations"],
    logoPath: "/models/logo/cognitivecomputations-logo.png",
  },
  {
    keywords: ["jondurbin"],
    logoPath: "/models/logo/jondurbin-logo.png",
  },
  {
    keywords: ["teknium"],
    logoPath: "/models/logo/teknium-logo.png",
  },
  {
    keywords: ["sophosympatheia"],
    logoPath: "/models/logo/sophosympatheia-logo.png",
  },
  {
    keywords: ["qwen", "qwq", "wan 2.1", "wan 2.2", "wan"],
    logoPath: "/models/logo/svg/qwen-logo.svg",
  },
  {
    keywords: ["baai", "bge-m3", "bge-reranker-"],
    logoPath: "/models/logo/svg/baai-logo.svg",
  },
  {
    keywords: ["animatediff"],
    logoPath: "/models/logo/animate-logo.png",
  },
  {
    keywords: ["flux"],
    logoPath: "/models/logo/svg/flux-logo.svg",
  },
  {
    keywords: ["minimax"],
    logoPath: "/models/logo/svg/minimax-logo.svg",
  },
  {
    keywords: ["fish audio", "fish-audio", "fishaudio"],
    logoPath: "/models/logo/svg/fishaudio-logo.svg",
  },
  {
    keywords: ["vidu"],
    logoPath: "/models/logo/svg/vidu-logo.svg",
  },
  {
    keywords: ["pixverse"],
    logoPath: "/models/logo/svg/pixverse-logo.svg",
  },
  {
    keywords: ["seedream", "seedance"],
    logoPath: "/models/logo/svg/bytedance-logo.svg",
  },
  {
    keywords: ["kling"],
    logoPath: "/models/logo/svg/kling-logo.svg",
  },
  {
    keywords: ["stepfun", "step-", "stepfun-"],
    logoPath: "/models/logo/svg/stepfun-logo.svg",
  },
  {
    keywords: [FUNC_NAME.TXT2IMG],
    logoPath: "/models/logo/text-to-image.svg",
  },
  {
    keywords: [FUNC_NAME.IMG2IMG],
    logoPath: "/models/logo/image-to-image.svg",
  },
  {
    keywords: [
      FUNC_NAME.REMOVE_BACKGROUND,
      FUNC_NAME.REPLACE_BACKGROUND,
      FUNC_NAME.INPAINTING,
    ],
    logoPath: "/models/logo/image-edit-logo.png",
  },
  {
    keywords: [FUNC_NAME.REMOVE_TEXT],
    logoPath: "/models/logo/image-text-edit-logo.png",
  },
  {
    keywords: [FUNC_NAME.CLEANUP],
    logoPath: "/models/logo/image-cleanup-logo.png",
  },
  {
    keywords: [FUNC_NAME.TXT2SPEECH],
    logoPath: "/models/logo/text-to-speech.svg",
  },
  {
    keywords: [FUNC_NAME.TXT2VIDEO, FUNC_NAME.VIDEO_MERGE_FACE],
    logoPath: "/models/logo/video-edit-logo.png",
  },
  {
    keywords: [FUNC_NAME.MERGE_FACE],
    logoPath: "/models/logo/merge-face-logo.png",
  },
  {
    keywords: ["kimi", "moonshot"],
    ModelIcon: Moonshot,
  },
  {
    keywords: ["^gpt-", "/gpt-", "openai", "text-embedding-", "whisper-"],
    ModelIcon: OpenAI,
  },
  {
    keywords: [
      "mistral",
      "mixtral",
      "codestral",
      "mathstral",
      "/mn-",
      "pixtral",
      "ministral",
    ],
    ModelIcon: Mistral.Color,
  },
  {
    keywords: ["baichuan", "baichuan-inc"],
    ModelIcon: Baichuan.Color,
  },
  {
    keywords: ["hunyuan"],
    ModelIcon: Hunyuan.Color,
  },
  {
    keywords: ["glm-", "chatglm", "zai-", "glm"],
    logoPath: "/models/logo/svg/glm-logo.svg",
  },
  {
    keywords: ["kat", "streamlake", "kwaikat"],
    logoPath: "/models/logo/svg/StreamLake.svg",
  },
  {
    keywords: ["wizardlm", "phi3", "phi4", "^/phi-", "^phi-"],
    ModelIcon: Microsoft.Color,
  },
  {
    keywords: ["ernie", "baidu"],
    ModelIcon: Wenxin.Color,
    preferModelIcon: true,
  },
  {
    keywords: ["paddleocr", "paddle"],
    logoPath: "/models/logo/paddleocr-logo.jpg",
  },
  {
    keywords: ["nex-", "^nex\\b"],
    logoPath: "/models/logo/svg/nex-logo.svg",
  },
  {
    keywords: ["\\bmoss\\b", "\\bmosi\\b"],
    logoPath: "/models/logo/svg/mosi-logo.svg",
  },
  {
    keywords: ["xiaomi", "\\bmimo\\b"],
    logoPath: "/models/logo/svg/xiaomi-logo.svg",
  },
  {
    keywords: ["\\btavily\\b"],
    logoPath: "/models/logo/svg/tavily-logo.svg",
  },
  {
    keywords: ["\\bheygen\\b", "heygen-video-translate"],
    logoPath: "/models/logo/svg/heygen-logo.svg",
  },
  {
    keywords: ["\\bexa\\b"],
    ModelIcon: Exa.Color,
  },
];

/**
 * Retrieves the corresponding logo path based on the model name.
 * @param modelName The name of the model.
 * @returns An object containing logoPath and ModelIcon component.
 */
export function getModelLogoFromConfig(modelName: string): ModelLogoResult {
  if (!modelName) {
    return {};
  }
  const lowerModelName = modelName.toLowerCase() || "";

  for (const mapping of MODEL_LOGO_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      try {
        if (new RegExp(keyword, "i").test(modelName)) {
          return {
            logoPath: mapping.logoPath,
            ModelIcon: mapping.ModelIcon,
            preferModelIcon: mapping.preferModelIcon,
          };
        }
      } catch (error) {
        if (lowerModelName.includes(keyword.toLowerCase())) {
          return {
            logoPath: mapping.logoPath,
            ModelIcon: mapping.ModelIcon,
            preferModelIcon: mapping.preferModelIcon,
          };
        }
      }
    }
  }

  return {};
}
