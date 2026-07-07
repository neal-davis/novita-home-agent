import { fireEvent, render, screen, within } from "@testing-library/react";
import ModelSection from "@/app/pricing/components/ModelSection";

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName, size }: { modelName: string; size: number }) => (
    <span data-testid="model-logo" data-size={size}>
      {modelName}
    </span>
  ),
}));

jest.mock(
  "@/app/components/ModelDetail/ModelFeatures/MultimodalPricingTable",
  () => ({
    __esModule: true,
    default: ({ currencySymbol, pricing, unit }: any) => (
      <div
        data-testid="multimodal-pricing"
        data-currency={currencySymbol}
        data-unit={unit}
      >
        {pricing.input_price?.[0]?.modality}
      </div>
    ),
  }),
);

describe("ModelSection", () => {
  it("renders provider information, model links, discounts and cache pricing", () => {
    render(
      <ModelSection
        description="OpenAI compatible models"
        modelName="OpenAI"
        provider="openai"
        sectionId="pricing-model-openai"
        data={[
          {
            cacheReadPricing: { originPricePerM: 10000, pricePerM: 5000 },
            cacheWrite1hPricing: { originPricePerM: 15000, pricePerM: 15000 },
            cacheWrite5mPricing: { originPricePerM: 20000, pricePerM: 10000 },
            context: 128000,
            id: "openai/gpt-test",
            input: "1",
            name: "GPT Test",
            originalInput: "2",
            originalOutput: "4",
            output: "3",
          },
          {
            context: 8192,
            id: "free/model",
            input: "0",
            name: "Free Model",
            output: "0",
          },
        ]}
      />,
    );

    expect(screen.getAllByTestId("model-logo")[0]).toHaveTextContent("openai");
    expect(
      screen.getAllByText("OpenAI compatible models").length,
    ).toBeGreaterThan(0);

    expect(
      screen
        .getAllByRole("link", { name: "GPT Test" })
        .some(
          (link) =>
            link.getAttribute("href") ===
            "/models/model-detail/openai-gpt-test?from=pricing",
        ),
    ).toBe(true);
    expect(screen.getAllByRole("link", { name: "More" })[0]).toHaveAttribute(
      "href",
      "/models/model-detail/openai-gpt-test?from=pricing",
    );

    expect(screen.getAllByText("128,000").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText((_, element) =>
        Boolean(element?.textContent?.includes("Cache Read $0.5 /Mt")),
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("· Cache Write(5m)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("· Cache Write(1h)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Free").length).toBeGreaterThanOrEqual(2);

    const mobileCards = screen.getAllByTestId("model-section-mobile-card");
    expect(mobileCards).toHaveLength(2);
    expect(within(mobileCards[0]).getByText("GPT Test")).toBeInTheDocument();
    expect(within(mobileCards[0]).getByText("Context")).toBeInTheDocument();
    expect(within(mobileCards[0]).getByText("128,000")).toBeInTheDocument();
    expect(within(mobileCards[0]).getByText("Input")).toBeInTheDocument();
    expect(
      within(mobileCards[0]).getAllByText((_, element) =>
        Boolean(element?.textContent?.includes("Cache Read $0.5 /Mt")),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      within(mobileCards[0]).getByRole("link", { name: "More" }),
    ).toHaveAttribute(
      "href",
      "/models/model-detail/openai-gpt-test?from=pricing",
    );
  });

  it("expands tiered and omnimodal rows with their detail pricing", () => {
    render(
      <ModelSection
        modelName="Mixed"
        data={[
          {
            context: 64000,
            input: "-",
            isTieredBilling: true,
            name: "Tiered Model",
            output: "Tiered pricing",
            tieredBillingConfigs: [
              {
                cache_creation_1_hour_input_pricing: {
                  originPricePerM: 30000,
                  pricePerM: 20000,
                },
                cache_creation_input_pricing: {
                  originPricePerM: 20000,
                  pricePerM: 10000,
                },
                cache_read_input_pricing: {
                  originPricePerM: 10000,
                  pricePerM: 5000,
                },
                input_pricing: { pricePerM: 10000 },
                max_tokens: 1000,
                min_tokens: 0,
                output_max_tokens: -1,
                output_min_tokens: 0,
                output_pricing: { pricePerM: 20000 },
              },
            ],
          },
          {
            context: 128000,
            input: "-",
            isOmnimodal: true,
            multimodalPricing: {
              input_price: [{ modality: "text", price: "1" }],
              output_price: [],
            } as any,
            name: "Omni Model",
            output: "Omnimodal",
          },
        ]}
      />,
    );

    const tierButton = screen.getAllByRole("button", {
      name: "Show tiered pricing",
    })[0];
    expect(tierButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(tierButton);
    expect(tierButton).toHaveAttribute("aria-expanded", "true");

    expect(screen.getAllByText("Input length").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Output length").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cached writes(5m)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cached writes(1h)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cached reads").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[0 - 1,000)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[0 - ∞)").length).toBeGreaterThan(0);

    const omniButton = screen.getAllByRole("button", {
      name: "Show omnimodal pricing",
    })[0];
    fireEvent.click(omniButton);

    const multimodalTable = screen.getAllByTestId("multimodal-pricing")[0];
    expect(multimodalTable).toHaveAttribute("data-currency", "$");
    expect(multimodalTable).toHaveAttribute("data-unit", "Mt");
    expect(within(multimodalTable).getByText("text")).toBeInTheDocument();
  });
});
