import { renderHook } from "@testing-library/react";
import { useModelLibrary } from "@/hooks/useModelLibrary";
import {
  ModelLabelMap,
  ModelType,
  type LLMModelWithStatus,
} from "@/types/models";

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      multimodal: {
        configs: [],
        priceMap: {},
      },
    }),
}));

jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: () => undefined,
}));

jest.mock("@/constants/model-library-config", () => ({
  getAISearchModelList: () => [],
  getImageModelList: () => [],
  getAudioModelList: () => [],
  getVideoModelList: () => [],
}));

jest.mock("@/lib/utils/dynamic-pricing/model-library-adapter", () => ({
  generatePriceInfoString: () => [],
}));

function createModel(
  id: string,
  overrides: Partial<LLMModelWithStatus> = {},
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
    series: "OpenAI",
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

describe("useModelLibrary", () => {
  it("uses current Featured labels instead of stale isFeatured flags", () => {
    const staleFeaturedModel = createModel("stale-featured", {
      isFeatured: true,
      labels: [],
    });
    const labeledFeaturedModel = createModel("labeled-featured", {
      isFeatured: false,
      labels: [{ key: ModelLabelMap.Filter, value: ModelLabelMap.Featured }],
    });

    const { result } = renderHook(() =>
      useModelLibrary(
        [staleFeaturedModel, labeledFeaturedModel],
        "featured",
        undefined,
      ),
    );

    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "labeled-featured",
    ]);
    expect(result.current.categoryCounts[ModelType.Featured]).toBe(1);
  });
});
