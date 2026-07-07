import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModelAPIPrice from "@/app/pricing/components/ModelAPIPrice";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import analytics from "@/app/components/analytics/analytics";

const mockFilterProps: any[] = [];
const mockLlmProps: any[] = [];
const mockCalculatorProps: any[] = [];

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

jest.mock("@/app/pricing/components/PricingModelFilter", () => ({
  __esModule: true,
  default: (props: any) => {
    mockFilterProps.push(props);
    return (
      <div data-testid="pricing-filter">
        <input
          aria-label="model-search"
          value={props.searchValue}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
        <button type="button" onClick={() => props.onFilterTypeChange("Image")}>
          filter-image
        </button>
        <button type="button" onClick={() => props.onFilterTypeChange("Cache")}>
          filter-cache
        </button>
        <button type="button" onClick={() => props.onProviderChange("openai")}>
          provider-openai
        </button>
      </div>
    );
  },
}));

jest.mock("@/app/pricing/components/LLMModelsSection", () => ({
  __esModule: true,
  default: (props: any) => {
    mockLlmProps.push(props);
    return (
      <section data-testid="llm-section">
        {props.llmList.map((model: any) => (
          <div key={model.id}>{model.displayName}</div>
        ))}
      </section>
    );
  },
}));

jest.mock("@/app/pricing/components/CalculatorModal", () => ({
  __esModule: true,
  default: (props: any) => {
    mockCalculatorProps.push(props);
    return props.calcFunc ? (
      <div data-testid="calculator-modal">{props.calcFunc}</div>
    ) : null;
  },
}));

jest.mock("@/lib/utils/dynamic-pricing/model-table-adapter", () => ({
  generateDynamicMultimodalPricingTableRows: jest.fn((config: any) => {
    if (config.modelConfig.config.category === "image_gen") {
      return [
        {
          func: "dynamic-image-func",
          isDynamic: true,
          name: "Dynamic Image",
          price: "$0.25 /image",
          resolution: "1024*1024",
        },
      ];
    }
    if (config.modelConfig.config.category === "audio_gen") {
      return [
        {
          func: "dynamic-audio-func",
          isDynamic: true,
          mode: "fast",
          name: "Dynamic Audio",
          price: "$1 /1M characters",
        },
      ];
    }
    return [];
  }),
}));

jest.mock("@/lib/utils/dynamic-pricing/model-library-adapter", () => ({
  extractPrimaryPath: jest.fn((schema: any) => schema?.path),
}));

jest.mock("@/lib/utils/static-row-path", () => ({
  getPathForStaticRow: jest.fn((row: any) => row.path),
}));

describe("ModelAPIPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFilterProps.length = 0;
    mockLlmProps.length = 0;
    mockCalculatorProps.length = 0;
  });

  function renderPrice() {
    return render(
      <ModelAPIPrice
        isConsole
        dynamicModelConfigs={
          [
            {
              modelConfig: {
                config: { category: "image_gen" },
                openapiSchema: { path: "/dynamic-image" },
                skuMappings: [{ sku: "image" }],
              },
            },
            {
              modelConfig: {
                config: { category: "audio_gen" },
                openapiSchema: { path: "/dynamic-audio" },
                skuMappings: [{ sku: "audio" }],
              },
            },
            {
              modelConfig: {
                config: { category: "video_gen" },
                openapiSchema: { path: "/dynamic-video" },
                skuMappings: [],
              },
            },
          ] as any
        }
        dynamicPriceMap={{ image: { unitPrice: 25 } } as any}
        embeddingList={
          [
            {
              context_size: 8192,
              displayName: "Embed Small",
              input_token_price_per_m: 20000,
              name: "embed-small",
            },
          ] as any
        }
        llmList={
          [
            {
              cache_read_input_token_price_per_m: 1000,
              displayName: "OpenAI Cached",
              id: "openai/cached",
              name: "cached",
            },
            {
              displayName: "Anthropic Regular",
              id: "anthropic/regular",
              name: "regular",
            },
          ] as any
        }
      />,
    );
  }

  it("renders filters, LLM provider data and dynamic model rows", () => {
    renderPrice();

    expect(mockFilterProps.at(-1)).toMatchObject({
      availableProviders: ["anthropic", "openai"],
      filterType: "All",
      isConsole: true,
      searchValue: "",
      selectedProvider: "",
    });
    expect(mockLlmProps.at(-1).llmList.map((model: any) => model.id)).toEqual([
      "openai/cached",
      "anthropic/regular",
    ]);

    expect(screen.getAllByText("Embed Small").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dynamic Image").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$0.25 /image").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dynamic Audio").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$1 /1M characters").length).toBeGreaterThan(0);
  });

  it("updates filter state, provider state and opens the calculator", async () => {
    renderPrice();

    fireEvent.click(screen.getByText("provider-openai"));
    expect(mockFilterProps.at(-1)).toMatchObject({
      selectedProvider: "openai",
    });
    expect(mockLlmProps.at(-1).llmList.map((model: any) => model.id)).toEqual([
      "openai/cached",
    ]);

    fireEvent.click(screen.getByText("filter-cache"));
    expect(mockFilterProps.at(-1)).toMatchObject({
      filterType: "Cache",
      selectedProvider: "",
    });
    expect(mockLlmProps.at(-1).llmList.map((model: any) => model.id)).toEqual([
      "openai/cached",
    ]);

    fireEvent.click(screen.getByText("filter-image"));
    expect(mockFilterProps.at(-1)).toMatchObject({
      filterType: "Image",
    });
    expect(screen.queryByTestId("llm-section")).not.toBeInTheDocument();
    expect(screen.getAllByText("Dynamic Image").length).toBeGreaterThan(0);
    expect(screen.queryByText("Dynamic Audio")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Pricing Calculator"));

    await waitFor(() => {
      expect(screen.getByTestId("calculator-modal")).toHaveTextContent(
        FUNC_NAME.TXT2IMG,
      );
    });
    expect(analytics.trackClick).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ calcFunc: FUNC_NAME.TXT2IMG }),
    );
    expect(mockCalculatorProps.at(-1)).toMatchObject({
      calcFunc: FUNC_NAME.TXT2IMG,
    });
  });
});
