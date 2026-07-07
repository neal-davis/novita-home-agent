import { ModelType, type LLMModelWithStatus } from "@/types/models";
import { getConsoleModelLibraryFacets } from "@/lib/model-library/facets/definitions";
import {
  applyFacetFilters,
  buildFacetRecords,
  getFacetOptions,
} from "@/lib/model-library/facets/engine";

function model(
  id: string,
  overrides: Partial<LLMModelWithStatus>,
): LLMModelWithStatus {
  return {
    id,
    name: id,
    displayName: id,
    type: ModelType.Chat,
    context_size: 131072,
    description: "",
    input_token_price_per_m: 0,
    input_token_price_per_m_toString: "0",
    output_token_price_per_m: 0,
    output_token_price_per_m_toString: "0",
    series: "DeepSeek",
    features: [],
    tags: [],
    infos: {
      inputPricing: "$0/Mt",
      outputPricing: "$0/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    ...overrides,
  };
}

describe("model-library facet engine", () => {
  const facets = getConsoleModelLibraryFacets();
  const models = [
    model("deepseek-reasoning", {
      series: "DeepSeek",
      features: ["reasoning", "function-calling"],
      context_size: 262144,
    }),
    model("anthropic-json", {
      series: "Anthropic",
      features: ["structured-outputs"],
      context_size: 131072,
    }),
    model("image-model", {
      type: ModelType.Images as never,
      series: "Seedream",
      features: [],
    }),
  ];

  it("matches OR inside modality and series but AND inside features", () => {
    const records = buildFacetRecords(models, facets);
    const result = applyFacetFilters(records, facets, {
      modalities: ["llm", "vision"],
      series: ["DeepSeek", "Anthropic"],
      features: ["tool-calling", "reasoning"],
    });

    expect(result.map((item) => item.id)).toEqual(["deepseek-reasoning"]);
  });

  it("does not constrain empty facet groups", () => {
    const records = buildFacetRecords(models, facets);
    const result = applyFacetFilters(records, facets, {
      modalities: [],
      series: [],
      features: [],
    });

    expect(result).toHaveLength(3);
  });

  it("derives facet options with counts", () => {
    const records = buildFacetRecords(models, facets);
    const options = getFacetOptions(records, facets);

    expect(options.series.some((item) => item.value === "DeepSeek")).toBe(true);
    expect(options.features.some((item) => item.value === "reasoning")).toBe(
      true,
    );
  });
});
