import { ModelType, type LLMModelWithStatus } from "@/types/models";
import {
  getFeaturedModels,
  shouldShowFeaturedSection,
  shouldUseFlatModelResults,
  sortModelsByNewest,
} from "@/lib/model-library/sections";

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

describe("model-library sections", () => {
  it("shows featured only for default all state", () => {
    expect(
      shouldShowFeaturedSection({
        modalities: [],
        series: [],
        features: [],
      }),
    ).toBe(true);
    expect(
      shouldShowFeaturedSection({
        modalities: ["llm"],
        series: [],
        features: [],
      }),
    ).toBe(false);
  });

  it("uses flat results after selecting modality or model series", () => {
    expect(
      shouldUseFlatModelResults({
        modalities: [],
        series: [],
        features: ["reasoning"],
      }),
    ).toBe(false);
    expect(
      shouldUseFlatModelResults({
        modalities: ["llm"],
        series: [],
        features: [],
      }),
    ).toBe(true);
    expect(
      shouldUseFlatModelResults({
        modalities: [],
        series: ["DeepSeek"],
        features: [],
      }),
    ).toBe(true);
  });

  it("limits featured models to five", () => {
    const models = Array.from({ length: 8 }, (_, index) =>
      model(`model-${index}`, { isFeatured: true }),
    );

    expect(getFeaturedModels(models).map((item) => item.id)).toEqual([
      "model-0",
      "model-1",
      "model-2",
      "model-3",
      "model-4",
    ]);
  });

  it("sorts filtered results by newest Novita release date", () => {
    const models = [
      model("older", { platform_release_at: "2025-01-01T00:00:00Z" }),
      model("undated", {}),
      model("newer", { platform_release_at: "2026-01-01T00:00:00Z" }),
      model("newest-timestamp-string", { platform_release_at: "1778821471" }),
    ];

    expect(sortModelsByNewest(models).map((item) => item.id)).toEqual([
      "newest-timestamp-string",
      "newer",
      "older",
      "undated",
    ]);
  });

  it("does not fall back to model release date for newest sorting", () => {
    const models = [
      model("has-novita-date", {
        platform_release_at: "2025-01-01T00:00:00Z",
      }),
      model("model-release-only", {
        model_released_at: "2026-01-01T00:00:00Z",
      }),
    ];

    expect(sortModelsByNewest(models).map((item) => item.id)).toEqual([
      "has-novita-date",
      "model-release-only",
    ]);
  });
});
