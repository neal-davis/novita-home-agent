import { fireEvent, render, screen, within } from "@testing-library/react";
import { ConsoleModelCard } from "@/app/models-console/library/components/ConsoleModelCard";
import {
  ModelType,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

describe("ConsoleModelCard", () => {
  function expectDateRow(label: string, value: string) {
    const row = screen.getByText(label).parentElement;
    expect(row).not.toBeNull();
    expect(within(row!).getByText(value)).toBeInTheDocument();
  }

  function createMultimodalModel() {
    return {
      id: "multimodal-card",
      name: "multimodal-card",
      displayName: "Multimodal Card",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Multimodal card test model",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
      multimodal_pricing: {
        input_price: [
          {
            modals: ["text"],
            input_token_discount_price: 1200,
            input_token_base_price: 2400,
            cache_read_input_discount_price: 300,
            cache_read_input_base_price: 600,
            cache_creation_input_discount_price: 450,
            cache_creation_input_base_price: 900,
            cache_creation_1_hour_input_discount_price: 500,
            cache_creation_1_hour_input_base_price: 1000,
          },
          {
            modals: ["image"],
            input_token_discount_price: 22000,
            input_token_base_price: 26000,
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
          {
            modals: ["image"],
            output_token_discount_price: 32000,
            output_token_base_price: 40000,
          },
        ],
      },
    } as LLMModelWithStatus;
  }

  it("shows Text-prefixed summary lines and expands multimodal detail lines", () => {
    const model = createMultimodalModel();

    render(<ConsoleModelCard model={model} />);

    expect(screen.getByText("Multimodal")).toBeInTheDocument();
    expect(screen.queryByText("Expand details")).not.toBeInTheDocument();
    expect(screen.getByText("Text · Input")).toBeInTheDocument();
    expect(screen.getByText("Text · Output")).toBeInTheDocument();
    expect(screen.queryByText("Text · Cache Read")).not.toBeInTheDocument();
    expect(screen.queryByText("Text · Cache Write")).not.toBeInTheDocument();
    expect(screen.queryByText("Text · Cache Write 1h")).not.toBeInTheDocument();
    expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Expand model details" }),
    );

    expect(screen.getByText("Text · Cache Read")).toBeInTheDocument();
    expect(screen.getByText("Text · Cache Write")).toBeInTheDocument();
    expect(screen.getByText("Text · Cache Write 1h")).toBeInTheDocument();
    expect(screen.getByText("Image · Input")).toBeInTheDocument();
    expect(screen.getByText("Image · Output")).toBeInTheDocument();
    expect(screen.queryByText("Model released")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Multimodal Card/ }));
    expect(screen.getByText("Image · Output")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse model details" }),
    );
    expect(screen.queryByText("Image · Output")).not.toBeInTheDocument();
  });

  it("keeps the Multimodal label when a card only has non-text multimodal prices", () => {
    const model = {
      id: "multimodal-card-non-text-only",
      name: "multimodal-card-non-text-only",
      displayName: "Multimodal Card Non Text",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Multimodal non-text-only card",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
      multimodal_pricing: {
        input_price: [
          {
            modals: ["image"],
            input_token_discount_price: 22000,
            input_token_base_price: 26000,
          },
        ],
        output_price: [
          {
            modals: ["image"],
            output_token_discount_price: 32000,
            output_token_base_price: 40000,
          },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelCard model={model} />);

    expect(screen.getByText("Multimodal")).toBeInTheDocument();
    expect(screen.queryByText("Expand details")).not.toBeInTheDocument();
  });

  it("uses platform_release_at for the On Novita date instead of today's date", () => {
    const dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2030-01-01T00:00:00Z").getTime());
    const model = {
      ...createMultimodalModel(),
      model_released_at: "2025-01-01T00:00:00Z",
      platform_release_at: "2025-02-01T00:00:00Z",
    };

    try {
      render(<ConsoleModelCard model={model} />);

      expectDateRow("Model released", "Jan 1 , 2025");
      expectDateRow("On Novita", "Feb 1 , 2025");
      expect(screen.queryByText("Jan 1 , 2030")).not.toBeInTheDocument();
    } finally {
      dateNowSpy.mockRestore();
    }
  });

  it("shows a dash for On Novita when platform_release_at is missing", () => {
    const model = {
      ...createMultimodalModel(),
      model_released_at: "2025-01-01T00:00:00Z",
    };

    render(<ConsoleModelCard model={model} />);

    expectDateRow("Model released", "Jan 1 , 2025");
    expectDateRow("On Novita", "-");
  });

  it("expands non-LLM cards from the card body without the labeled button", () => {
    const model = {
      id: "image-card",
      name: "image-card",
      displayName: "Image Card",
      type: ModelType.Images,
      tags: ["Text to Image", "Flux"],
      infos: [["$0.02/image"], ["1024x1024"], ["Fast generation"]],
      path: "/models/image-card",
      model_released_at: "2025-01-01",
      platform_release_at: "2025-02-01",
    } as MediaModel;

    render(<ConsoleModelCard model={model} />);

    const trigger = screen.getByRole("button", { name: /Image Card/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Text to Image")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand model details" }),
    ).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Text to Image")).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Text to Image")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse model details" }),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Text to Image")).not.toBeInTheDocument();
  });

  it("uses a non-button container for the card body so text remains selectable", () => {
    const model = createMultimodalModel();

    render(<ConsoleModelCard model={model} />);

    const trigger = screen.getByRole("button", { name: /Multimodal Card/ });
    expect(trigger.tagName).not.toBe("BUTTON");
  });

  it("disables hidden footer actions until the card is active", () => {
    const model = createMultimodalModel();
    const { container } = render(<ConsoleModelCard model={model} />);

    const moreInfoLink = screen.getByRole("link", { name: "More info" });
    expect(moreInfoLink.parentElement).toHaveClass("pointer-events-none");

    const card = container.querySelector("article");
    expect(card).not.toBeNull();

    fireEvent.mouseEnter(card!);

    expect(moreInfoLink.parentElement).toHaveClass("pointer-events-auto");
  });

  it("keeps legacy LLM cards expandable without showing the labeled button", () => {
    const model = {
      id: "legacy-card",
      name: "legacy-card",
      displayName: "Legacy Card",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Legacy LLM card",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$0.12/Mt",
        outputPricing: "$0.48/Mt",
        cacheReadPricing: "$0.03/Mt",
        cacheWrite5mPricing: "$0.05/Mt",
        cacheWrite1hPricing: "$0.08/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelCard model={model} />);

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByText("Cache read")).toBeInTheDocument();
    expect(screen.getByText("Cache write")).toBeInTheDocument();
    expect(screen.queryByText("Cache write 1h")).not.toBeInTheDocument();
    expect(
      screen.getByText("128K Context · 8K Max Output"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Expand model details" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Tiered")).not.toBeInTheDocument();
    expect(screen.queryByText("Multimodal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Legacy Card/ }));

    expect(screen.getByRole("button", { name: /Legacy Card/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Cache write 1h")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Expand model details" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Legacy Card/ }));
    expect(screen.getByRole("button", { name: /Legacy Card/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse model details" }),
    );
    expect(screen.getByRole("button", { name: /Legacy Card/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps Tiered label for tiered card rows", () => {
    const model = {
      id: "tiered-card",
      name: "tiered-card",
      displayName: "Tiered Card",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Tiered LLM card",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$0.12/Mt",
        outputPricing: "$0.48/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
      is_tiered_billing: true,
      tiered_billing_configs: [
        {
          min_tokens: 1,
          max_tokens: 262144,
          output_min_tokens: 0,
          input_pricing: { pricePerM: 1200, originPricePerM: 1200 },
          output_pricing: { pricePerM: 4800, originPricePerM: 4800 },
          cache_read_input_pricing: { pricePerM: 300, originPricePerM: 300 },
          cache_creation_input_pricing: {
            pricePerM: 500,
            originPricePerM: 500,
          },
        },
      ],
    } as LLMModelWithStatus;

    render(<ConsoleModelCard model={model} />);

    expect(screen.getByText("Tiered")).toBeInTheDocument();
    expect(screen.queryByText("Multimodal")).not.toBeInTheDocument();
  });
});
