import { render, screen } from "@testing-library/react";
import LLMModelsSection from "@/app/pricing/components/LLMModelsSection";

const modelSectionProps: any[] = [];

jest.mock("@/app/pricing/components/ModelSection", () => ({
  __esModule: true,
  default: (props: any) => {
    modelSectionProps.push(props);
    return (
      <section data-testid="model-section" data-provider={props.provider}>
        <h2>{props.modelName}</h2>
        <pre>{JSON.stringify(props.data)}</pre>
      </section>
    );
  },
}));

jest.mock("@/constants/models", () => ({
  MODEL_DESC_MAP: [
    { id: "DeepSeek", description: "DeepSeek description" },
    { id: "OpenAI", description: "OpenAI description" },
  ],
  MODEL_GROUP_TITLE_MAP: {
    deepseek: "DeepSeek",
    openai: "OpenAI",
  },
}));

describe("LLMModelsSection", () => {
  beforeEach(() => {
    modelSectionProps.length = 0;
  });

  it("renders an empty state for no models", () => {
    render(<LLMModelsSection llmList={[]} />);

    expect(screen.getByText("No models found")).toBeInTheDocument();
    expect(modelSectionProps).toEqual([]);
  });

  it("groups models by series, sorts known providers first and transforms pricing rows", () => {
    render(
      <LLMModelsSection
        isConsole
        llmList={
          [
            {
              context_size: 8192,
              displayName: "Other Model",
              id: "other-1",
              input_token_price_per_m: 10000,
              name: "other",
              output_token_price_per_m: 20000,
              series: "",
            },
            {
              cache_creation_1_hour_input_pricing: {
                originPricePerM: 40000,
                pricePerM: 20000,
              },
              cache_creation_input_pricing: {
                originPricePerM: 30000,
                pricePerM: 15000,
              },
              cache_read_input_pricing: {
                originPricePerM: 10000,
                pricePerM: 5000,
              },
              context_size: 64000,
              displayName: "DeepSeek Tiered",
              id: "deepseek-tiered",
              input_token_price_per_m: 0,
              is_tiered_billing: true,
              name: "deepseek-tiered",
              output_token_price_per_m: 0,
              series: "DeepSeek",
              tiered_billing_configs: [
                {
                  input_pricing: { originPricePerM: 10000, pricePerM: 8000 },
                  max_tokens: 1000,
                  min_tokens: 0,
                  output_pricing: { originPricePerM: 20000, pricePerM: 16000 },
                },
              ],
            },
            {
              context_size: 128000,
              displayName: "OpenAI Omni",
              id: "openai-omni",
              input_pricing: { originPricePerM: 30000, pricePerM: 10000 },
              input_token_price_per_m: 10000,
              multimodal_pricing: {
                input_price: [{ modality: "text", price: "1" }],
                output_price: [],
              },
              name: "openai-omni",
              output_pricing: { originPricePerM: 50000, pricePerM: 25000 },
              output_token_price_per_m: 25000,
              series: "OpenAI",
            },
            {
              context_size: 32768,
              displayName: "OpenAI Text",
              id: "openai-text",
              input_pricing: { originPricePerM: 20000, pricePerM: 20000 },
              input_token_price_per_m: 20000,
              name: "openai-text",
              output_pricing: { originPricePerM: 40000, pricePerM: 30000 },
              output_token_price_per_m: 30000,
              series: "OpenAI",
            },
          ] as any
        }
      />,
    );

    expect(screen.getAllByTestId("model-section")).toHaveLength(3);
    expect(modelSectionProps.map((props) => props.provider)).toEqual([
      "deepseek",
      "openai",
      "others",
    ]);
    expect(modelSectionProps[0]).toMatchObject({
      description: "DeepSeek description",
      isConsole: true,
      modelName: "DeepSeek",
      sectionId: "pricing-model-deepseek",
    });

    expect(modelSectionProps[0].data).toEqual([
      expect.objectContaining({
        cacheReadPricing: { originPricePerM: 10000, pricePerM: 5000 },
        cacheWrite1hPricing: { originPricePerM: 40000, pricePerM: 20000 },
        cacheWrite5mPricing: { originPricePerM: 30000, pricePerM: 15000 },
        context: 64000,
        input: "-",
        isTieredBilling: true,
        name: "DeepSeek Tiered",
        output: "Tiered pricing",
        tieredBillingConfigs: expect.any(Array),
      }),
    ]);

    expect(modelSectionProps[1].data).toEqual([
      expect.objectContaining({
        context: 128000,
        input: "1",
        isOmnimodal: true,
        isTieredBilling: false,
        name: "OpenAI Omni",
        originalInput: "3",
        originalOutput: "5",
        output: "Omnimodal",
      }),
      expect.objectContaining({
        context: 32768,
        input: "2",
        isTieredBilling: false,
        name: "OpenAI Text",
        originalInput: null,
        originalOutput: "4",
        output: "3",
      }),
    ]);

    expect(modelSectionProps[2].data).toEqual([
      expect.objectContaining({
        context: 8192,
        input: "1",
        name: "Other Model",
        output: "2",
      }),
    ]);
  });
});
