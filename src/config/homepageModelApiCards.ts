import type { LLMModelWithStatus } from "@/types/models";

export type HomepageModelApiCard = Pick<
  LLMModelWithStatus,
  | "id"
  | "name"
  | "displayName"
  | "context_size"
  | "input_token_price_per_m_toString"
  | "output_token_price_per_m_toString"
  | "tags"
  | "isNew"
  | "isHot"
  | "isDiscount"
  | "discount"
>;

export const HOME_MODEL_API_CARDS: HomepageModelApiCard[] = [
  {
    id: "deepseek/deepseek-v4-pro",
    name: "deepseek-v4-pro",
    displayName: "Deepseek V4 Pro",
    context_size: 1048576,
    input_token_price_per_m_toString: "1.74",
    output_token_price_per_m_toString: "3.48",
    tags: ["LLM", "Serverless"],
    isNew: true,
    isHot: true,
  },
  {
    id: "minimax/minimax-m2.7",
    name: "minimax-m2.7",
    displayName: "MiniMax M2.7",
    context_size: 204800,
    input_token_price_per_m_toString: "0.3",
    output_token_price_per_m_toString: "1.2",
    tags: ["LLM", "Serverless"],
    isNew: true,
    isHot: true,
  },
  {
    id: "zai-org/glm-5.1",
    name: "glm-5.1",
    displayName: "GLM-5.1",
    context_size: 204800,
    input_token_price_per_m_toString: "1.4",
    output_token_price_per_m_toString: "4.4",
    tags: ["LLM", "Serverless"],
    isNew: true,
  },
  {
    id: "moonshotai/kimi-k2.6",
    name: "kimi-k2.6",
    displayName: "Kimi K2.6",
    context_size: 262144,
    input_token_price_per_m_toString: "0.95",
    output_token_price_per_m_toString: "4",
    tags: ["LLM", "Serverless"],
    isNew: true,
  },
  {
    id: "google/gemma-4-31b-it",
    name: "gemma-4-31b-it",
    displayName: "Gemma 4 31B",
    context_size: 262144,
    input_token_price_per_m_toString: "0.14",
    output_token_price_per_m_toString: "0.4",
    tags: ["LLM", "Serverless"],
    isNew: true,
  },
  {
    id: "qwen/qwen3.5-397b-a17b",
    name: "qwen3.5-397b-a17b",
    displayName: "Qwen3.5-397B-A17B",
    context_size: 262144,
    input_token_price_per_m_toString: "0.6",
    output_token_price_per_m_toString: "3.6",
    tags: ["LLM", "Serverless"],
    isNew: true,
  },
];
