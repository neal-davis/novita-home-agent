import {
  LLMModelFeatures,
  LLMModelModality,
  ModelType,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

export type AnyModel = LLMModelWithStatus | MediaModel;

export type ConsoleModelFeature =
  | "tool-calling"
  | "json-schema"
  | "reasoning"
  | "long-context";

export type ConsoleModelModality =
  | "llm"
  | "image"
  | "audio"
  | "video"
  | "ai-search"
  | "embedding"
  | "reranker"
  | "vision";

function asLowerArray(values?: string[] | null): string[] {
  return Array.isArray(values)
    ? values.map((item) => String(item).toLowerCase())
    : [];
}

function hasModality(
  model: LLMModelWithStatus,
  field: "inputModalities" | "outputModalities",
  modality: LLMModelModality,
) {
  return model[field]?.some((item) => String(item).toLowerCase() === modality);
}

function isVisionModel(model: AnyModel): boolean {
  if (model.type !== ModelType.Chat) {
    return model.type === ModelType.Vision;
  }

  return (
    hasModality(model, "inputModalities", LLMModelModality.Image) ||
    hasModality(model, "inputModalities", LLMModelModality.Video) ||
    hasModality(model, "outputModalities", LLMModelModality.Image) ||
    hasModality(model, "outputModalities", LLMModelModality.Video) ||
    asLowerArray(model.features).includes(LLMModelFeatures.Vision)
  );
}

export function getModelModalities(model: AnyModel): ConsoleModelModality[] {
  const modalities: ConsoleModelModality[] = [];

  if (model.type === ModelType.Chat) modalities.push("llm");
  if (model.type === ModelType.Images) modalities.push("image");
  if (model.type === ModelType.Audio) modalities.push("audio");
  if (model.type === ModelType.Video) modalities.push("video");
  if (model.type === ModelType.AISearch) modalities.push("ai-search");
  if (model.type === ModelType.Embedding) modalities.push("embedding");
  if (model.type === ModelType.Reranker) modalities.push("reranker");
  if (isVisionModel(model)) modalities.push("vision");

  return modalities;
}

export function getModelCapabilities(model: AnyModel): ConsoleModelFeature[] {
  if (!("features" in model)) {
    return [];
  }

  const features = asLowerArray(model.features);
  const result: ConsoleModelFeature[] = [];

  if (features.includes(LLMModelFeatures.FunctionCalling)) {
    result.push("tool-calling");
  }
  if (features.includes(LLMModelFeatures.StructuredOutputs)) {
    result.push("json-schema");
  }
  if (features.includes(LLMModelFeatures.Reasoning)) {
    result.push("reasoning");
  }
  if (Number(model.context_size) > 128 * 1024) {
    result.push("long-context");
  }

  return result;
}
