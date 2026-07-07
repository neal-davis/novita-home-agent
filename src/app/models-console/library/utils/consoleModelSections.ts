import { ModelType } from "@/types/models";
import type { AnyModel } from "@/lib/model-library/capabilities";

export type ConsoleModelSection = {
  key: string;
  title: string;
  modality: string;
  models: AnyModel[];
};

function getSectionOrder(): Array<{
  type: ModelType;
  title: string;
  modality: string;
}> {
  return [
    { type: ModelType.Chat, title: "LLM", modality: "llm" },
    { type: ModelType.Images, title: "Image", modality: "image" },
    { type: ModelType.Audio, title: "Audio", modality: "audio" },
    { type: ModelType.Video, title: "Video", modality: "video" },
    { type: ModelType.Embedding, title: "Embedding", modality: "embedding" },
    { type: ModelType.Reranker, title: "Reranker", modality: "reranker" },
    { type: ModelType.AISearch, title: "AI Search", modality: "ai-search" },
    { type: ModelType.Vision, title: "Vision", modality: "vision" },
  ];
}

export function groupConsoleModelsByType(
  models: AnyModel[],
): ConsoleModelSection[] {
  return getSectionOrder()
    .map((section) => ({
      key: section.type,
      title: section.title,
      modality: section.modality,
      models: models.filter((model) => model.type === section.type),
    }))
    .filter((section) => section.models.length > 0);
}
