import { act, renderHook } from "@testing-library/react";
import { LLMModelModality, ModelLabelMap, ModelType } from "@/types/models";
import { useModelLibrary } from "@/hooks/useModelLibrary";

const mockState = {
  multimodal: {
    configs: [] as any[],
    priceMap: {} as Record<string, any>,
  },
};

jest.mock("@/store", () => ({
  useAppSelector: jest.fn((selector) => selector(mockState)),
}));

jest.mock("@/config/campaign", () => jest.fn(() => ({ active: true })));

jest.mock("@/lib/utils/dynamic-pricing/model-library-adapter", () => ({
  generatePriceInfoString: jest.fn(() => ["$0.01 / image", "$0.02 / image"]),
}));

jest.mock("@/constants/model-library-config", () => ({
  getAISearchModelList: jest.fn(() => []),
  getAudioModelList: jest.fn(() => [
    {
      id: "static-audio",
      infos: [["$1 / 1M characters"]],
      isFeatured: false,
      link: "/audio",
      name: "Static Audio",
      path: "/v3/audio/static",
      series: "AudioSeries",
      tags: ["Text to Audio"],
      type: "Audio",
    },
  ]),
  getImageModelList: jest.fn(() => [
    {
      id: "static-image",
      infos: [["$0.10 / image"]],
      isFeatured: false,
      isHot: false,
      isNew: false,
      link: "/image",
      name: "Static Image",
      path: "/v3/image/:id",
      rank: 30,
      series: "StaticSeries",
      tags: ["Text to Image"],
      type: "Images",
    },
    {
      id: "unmatched-image",
      infos: [["$0.20 / image"]],
      isFeatured: false,
      link: "/unmatched",
      name: "Unmatched Image",
      path: "/v3/image/unmatched",
      rank: 40,
      series: "OtherSeries",
      tags: ["Image to Image"],
      type: "Images",
    },
  ]),
  getVideoModelList: jest.fn(() => [
    {
      id: "static-video",
      infos: [["$1 / video"]],
      isFeatured: false,
      link: "/video",
      name: "Static Video",
      path: "/v3/video/static",
      rank: 50,
      series: "VideoSeries",
      tags: ["Text to Video"],
      type: "Video",
    },
  ]),
}));

const llmModels = [
  {
    id: "chat-text",
    isFeatured: false,
    name: "Text Chat",
    outputModalities: [LLMModelModality.Text],
    series: "OpenAI",
    tags: [],
    type: ModelType.Chat,
  },
  {
    id: "chat-image",
    isFeatured: true,
    name: "Image Chat",
    outputModalities: [LLMModelModality.Image],
    series: "OpenAI",
    tags: [],
    type: ModelType.Chat,
  },
  {
    id: "chat-audio",
    isFeatured: false,
    name: "Audio Chat",
    outputModalities: [LLMModelModality.Audio],
    series: "AudioSeries",
    tags: [],
    type: ModelType.Chat,
  },
  {
    id: "vision-input",
    inputModalities: [LLMModelModality.Image],
    isFeatured: false,
    name: "Vision Input",
    outputModalities: [LLMModelModality.Text],
    series: "VisionSeries",
    tags: [],
    type: ModelType.Chat,
  },
  {
    id: "embedding",
    isFeatured: false,
    name: "Embedding",
    series: "OpenAI",
    tags: [],
    type: ModelType.Embedding,
  },
  {
    id: "reranker",
    isFeatured: false,
    name: "Reranker",
    series: "OpenAI",
    tags: [],
    type: ModelType.Reranker,
  },
  {
    id: "serverless-chat",
    isFeatured: false,
    name: "Serverless Chat",
    outputModalities: [LLMModelModality.Text],
    series: "ServerlessSeries",
    tags: ["Serverless"],
    type: ModelType.Chat,
  },
  {
    id: "campaign-chat",
    isFeatured: false,
    name: "Campaign Chat",
    output_pricing: { originPricePerM: 2 },
    output_token_price_per_m: 1,
    series: "CampaignSeries",
    tags: [],
    type: ModelType.Chat,
  },
] as any[];

function dynamicConfig(overrides: Record<string, any> = {}) {
  return {
    fusionConfig: {
      displayName: "Dynamic Image",
      labels: [
        { key: ModelLabelMap.Display, value: "NEW" },
        { key: "features", value: "Dynamic Feature" },
        { key: "features", value: "Text to Image" },
        { key: ModelLabelMap.Filter, value: "Featured" },
      ],
      name: "dynamic-image",
      rank: 2,
      series: "Zai-org",
    },
    modelConfig: {
      config: {
        category: "image_gen",
        openapiSchema: JSON.stringify({
          paths: {
            "/v3/image/abc": {},
          },
        }),
      },
    },
    ...overrides,
  };
}

describe("useModelLibrary", () => {
  beforeEach(() => {
    mockState.multimodal.configs = [
      dynamicConfig(),
      dynamicConfig({
        fusionConfig: {
          displayName: "Dynamic Audio",
          labels: ["HOT", { key: "features", value: "Text to Audio" }],
          name: "dynamic-audio",
          rank: 1,
          series: "AudioSeries",
        },
        modelConfig: {
          config: {
            category: "audio_gen",
            openapiSchema: JSON.stringify({
              paths: {
                "/v3/audio/new": {},
              },
            }),
          },
        },
      }),
      dynamicConfig({
        fusionConfig: {
          displayName: "Unsupported",
          labels: [],
          name: "unsupported",
          series: "Other",
        },
        modelConfig: {
          config: {
            category: "unsupported",
            openapiSchema: "{}",
          },
        },
      }),
    ];
    mockState.multimodal.priceMap = { dynamic_image: 1 };
  });

  it("merges dynamic multimodal configs with static models and sorts by rank", () => {
    const { result } = renderHook(() => useModelLibrary(llmModels));

    const dynamicImage = result.current.allModels.find(
      (model) => model.id === "dynamic-image",
    ) as any;
    const dynamicAudio = result.current.allModels.find(
      (model) => model.id === "dynamic-audio",
    ) as any;

    expect(dynamicImage).toMatchObject({
      displayName: "Dynamic Image",
      infos: [["$0.01 / image", "$0.02 / image"]],
      isFeatured: true,
      isNew: true,
      link: "/models-console/multimodal-playground?model=dynamic-image",
      path: "/v3/image/:id",
      series: "Zai-org",
      tags: ["Dynamic Feature", "Text to Image"],
      type: ModelType.Images,
    });
    expect(dynamicAudio).toMatchObject({
      isHot: true,
      tags: ["Text to Audio"],
      type: ModelType.Audio,
    });
    expect(result.current.allModels.map((model) => model.id)).toEqual(
      expect.arrayContaining(["unmatched-image", "static-video"]),
    );
    expect(result.current.allModels).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "unsupported" })]),
    );
  });

  it("applies default type and normalized provider filters", () => {
    const { result } = renderHook(() =>
      useModelLibrary(llmModels, "images", "z.ai"),
    );

    expect(result.current.selectedCategory).toBe(ModelType.Images);
    expect(result.current.selectedProvider).toBe("Zai-org");
    expect(result.current.filteredModels).toHaveLength(1);
    expect(result.current.filteredModels[0]).toMatchObject({
      id: "dynamic-image",
      series: "Zai-org",
    });
  });

  it("filters categories, providers and quick LLM modes", () => {
    const { result } = renderHook(() => useModelLibrary(llmModels));

    act(() => {
      result.current.actions.handleCategoryChange(ModelType.Chat);
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "chat-text",
      "chat-image",
      "chat-audio",
      "vision-input",
      "serverless-chat",
      "campaign-chat",
    ]);

    act(() => {
      result.current.actions.handleLlmQuickFilterChange("text-to-image");
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "chat-image",
      "dynamic-image",
    ]);

    act(() => {
      result.current.actions.handleLlmQuickFilterChange("text-embeddings");
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "embedding",
    ]);

    act(() => {
      result.current.actions.handleLlmQuickFilterChange("text-to-audio");
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "chat-audio",
      "dynamic-audio",
      "static-audio",
    ]);

    act(() => {
      result.current.actions.handleProviderChange(" openai ");
    });
    expect(result.current.filteredModels).toEqual([]);

    act(() => {
      result.current.clearFilter();
    });
    expect(result.current.selectedCategory).toBe(ModelType.All);
    expect(result.current.selectedProvider).toBe("");
    expect(result.current.selectedLlmQuickFilter).toBe("all");
  });

  it("tracks category and provider counts across all models", () => {
    const { result } = renderHook(() => useModelLibrary(llmModels));

    expect(result.current.categoryCounts).toMatchObject({
      [ModelType.All]: 13,
      [ModelType.Audio]: 2,
      [ModelType.Chat]: 6,
      [ModelType.Embedding]: 1,
      [ModelType.Featured]: 2,
      [ModelType.Images]: 2,
      [ModelType.Reranker]: 1,
      [ModelType.Serverless]: 1,
      [ModelType.Video]: 1,
      [ModelType.Vision]: 2,
    });
    expect(result.current.providerCounts).toMatchObject({
      AudioSeries: 3,
      OpenAI: 4,
      "Zai-org": 1,
    });
  });

  it("filters discount campaign, serverless and vision categories", () => {
    const { result } = renderHook(() => useModelLibrary(llmModels));

    act(() => {
      result.current.actions.handleCategoryChange(ModelType.Campaign);
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "campaign-chat",
      "dynamic-image",
      "dynamic-audio",
    ]);

    act(() => {
      result.current.actions.handleCategoryChange(ModelType.Serverless);
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "serverless-chat",
    ]);

    act(() => {
      result.current.actions.handleCategoryChange(ModelType.Vision);
    });
    expect(result.current.filteredModels.map((model) => model.id)).toEqual([
      "chat-image",
      "vision-input",
    ]);
  });
});
