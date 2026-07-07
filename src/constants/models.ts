export const DISCOUNT_MODELS: Record<string, string> = {
  "deepseek/deepseek-r1-turbo": "60%",
};

export const NEW_MODELS: string[] = ["baai/bge-m3"];

export function isQwen3Model(modelId: string) {
  return modelId.startsWith("qwen/qwen3");
}

export function isThinkingModel(modelId: string) {
  return (
    modelId.includes("glm-4.5") ||
    modelId === "deepseek/deepseek-v3.1" ||
    (modelId.startsWith("qwen/qwen3") &&
      ![
        "qwen/qwen3-235b-a22b-instruct-2507",
        "qwen/qwen3-coder-480b-a35b-instruct",
      ].includes(modelId))
  );
}

export const MODEL_GROUP_TITLE_MAP: Record<string, string> = {
  deepseek: "Deepseek",
  "meta-llama": "Llama",
  qwen: "Qwen",
  baidu: "Baidu",
  google: "Gemma",
  "zai-org": "Zai-org",
  minimaxai: "MiniMax",
  Sao10K: "Sao10K",
  mistralai: "Mistralai",
  nousresearch: "Nousresearch",
  cognitivecomputations: "CognitiveComputations",
  sophosympatheia: "Sophosympatheia",
  gryphe: "Gryphe",
  microsoft: "Microsoft",
  other: "Other",
  others: "Others",
};

interface ModelDescription {
  id: string;
  description: string;
}

export const MODEL_DESC_MAP: ModelDescription[] = [
  {
    id: "Deepseek",
    description:
      "Advanced AI models from DeepSeek, offering cutting-edge reasoning capabilities and competitive pricing for enterprise and research applications.",
  },
  {
    id: "Llama",
    description:
      "Meta's Llama models providing state-of-the-art language understanding with open architecture designed for diverse applications.",
  },
  {
    id: "Qwen",
    description:
      "Qwen series models offering efficient language processing with various parameter sizes, from lightweight to enterprise-grade solutions.",
  },
  {
    id: "Baidu",
    description:
      "Baidu's ERNIE models providing advanced Chinese language understanding and multimodal capabilities, optimized for Chinese applications with competitive pricing.",
  },
  {
    id: "Gemma",
    description:
      "Google's Gemma models offering high-quality language processing with excellent performance for various NLP tasks.",
  },
  {
    id: "Zai-org",
    description:
      "GLM series models from Tsinghua University, featuring advanced Chinese language understanding and generation capabilities.",
  },
  {
    id: "MiniMax",
    description:
      "Minimax AI's advanced language models delivering robust conversational AI capabilities with optimized performance for customer service, content generation, and creative applications, featuring strong multilingual support and enterprise-ready scalability.",
  },
  {
    id: "Sao10K",
    description:
      "Specialized fine-tuned models optimized for creative and roleplay applications with enhanced storytelling capabilities.",
  },
  {
    id: "Mistralai",
    description:
      "Efficient and powerful language models from Mistral AI, designed for both commercial and open-source applications.",
  },
  {
    id: "Nousresearch",
    description:
      "Research-focused AI models designed for advanced reasoning and enhanced instruction following capabilities.",
  },
  {
    id: "CognitiveComputations",
    description:
      "Specialized AI models focused on advanced cognitive tasks and complex reasoning applications.",
  },
  {
    id: "Sophosympatheia",
    description:
      "Fine-tuned models designed for enhanced emotional intelligence and nuanced conversational capabilities.",
  },
  {
    id: "Gryphe",
    description:
      "Innovative AI models from Gryphe, delivering specialized language understanding with a focus on efficiency and adaptability for niche applications.",
  },
  {
    id: "Microsoft",
    description:
      "Microsoft's models deliver state-of-the-art multilingual capabilities with enterprise-grade security, seamlessly integrated into the Azure cloud ecosystem. Optimized for cross-platform collaboration and business intelligence, these models excel in document understanding and generation—key strengths for Microsoft 365 workflows.",
  },
  {
    id: "Other Models",
    description: "",
  },
];
