import { getModelCapabilities, getModelModalities } from "../capabilities";
import type { FacetDefinition } from "./types";

export function getConsoleModelLibraryFacets(
  localeKey?: unknown,
): FacetDefinition[] {
  void localeKey;

  return [
    {
      key: "modalities",
      label: "Modality",
      matchMode: "any",
      kind: "bitmask",
      options: [
        { label: "LLM", value: "llm", bit: 1 << 0 },
        { label: "Vision", value: "vision", bit: 1 << 1 },
        { label: "Image", value: "image", bit: 1 << 2 },
        { label: "Audio", value: "audio", bit: 1 << 3 },
        { label: "Video", value: "video", bit: 1 << 4 },
        { label: "Embedding", value: "embedding", bit: 1 << 5 },
        { label: "Reranker", value: "reranker", bit: 1 << 6 },
        { label: "AI Search", value: "ai-search", bit: 1 << 7 },
      ],
      getValues: getModelModalities,
    },
    {
      key: "series",
      label: "Provider",
      matchMode: "any",
      kind: "set",
      getValues: (model) => (model.series ? [model.series] : []),
    },
    {
      key: "features",
      label: "Features",
      matchMode: "all",
      kind: "bitmask",
      options: [
        { label: "Tool calling", value: "tool-calling", bit: 1 << 0 },
        { label: "JSON schema", value: "json-schema", bit: 1 << 1 },
        { label: "Reasoning", value: "reasoning", bit: 1 << 2 },
        { label: "Long context", value: "long-context", bit: 1 << 3 },
      ],
      getValues: getModelCapabilities,
    },
  ];
}
