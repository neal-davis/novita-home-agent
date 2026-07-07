import { fireEvent, render, screen, within } from "@testing-library/react";
import { ConsoleModelList } from "@/app/models-console/library/components/ConsoleModelList";
import { ModelType, type LLMModelWithStatus } from "@/types/models";

describe("ConsoleModelList", () => {
  it("renders Text-prefixed summary labels and expands multimodal details in row mode", () => {
    const model = {
      id: "multimodal-list",
      name: "multimodal-list",
      displayName: "Multimodal List",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Multimodal list test model",
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
          {
            modals: ["audio"],
            input_token_discount_price: 18000,
            input_token_base_price: 20000,
          },
          {
            modals: ["video"],
            input_token_discount_price: 4600,
            input_token_base_price: 5000,
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
          {
            modals: ["audio"],
            output_token_discount_price: 17880,
            output_token_base_price: 20000,
          },
          {
            modals: ["image"],
            output_token_discount_price: 32000,
            output_token_base_price: 40000,
          },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelList models={[model]} />);

    expect(screen.getByText(/Text · Input/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Multimodal" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Expand details" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Text · Cache Read/)).not.toBeInTheDocument();
    expect(
      screen.queryByText((content) =>
        content.includes("Text · Cache Write 1h"),
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Text · Cache Write/)).not.toBeInTheDocument();
    expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Multimodal" }));

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("$0.12/Mt")).toBeInTheDocument();
    expect(screen.getByText("$1.8/Mt")).toBeInTheDocument();
    expect(screen.getByText("$2.2/Mt")).toBeInTheDocument();
    expect(screen.getByText("$0.46/Mt")).toBeInTheDocument();
    expect(screen.getByText("$0.48/Mt")).toBeInTheDocument();
    expect(screen.getByText("$1.788/Mt")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(screen.queryByText("Text · Cache Read")).not.toBeInTheDocument();
    expect(
      screen.queryByText((content) =>
        content.includes("Text · Cache Write 1h"),
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();
    expect(screen.queryByText("Image · Output")).not.toBeInTheDocument();
    expect(screen.queryByText("Context")).not.toBeInTheDocument();
  });

  it("keeps legacy LLM rows expandable without showing a labeled button", () => {
    const model = {
      id: "legacy-list",
      name: "legacy-list",
      displayName: "Legacy List",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Legacy LLM list model",
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

    const { container } = render(<ConsoleModelList models={[model]} />);

    expect(screen.getByText(/Input\s+\$0\.12\/Mt/)).toBeInTheDocument();
    expect(screen.queryByText("Cache Read")).not.toBeInTheDocument();
    expect(screen.queryByText("Tiered")).not.toBeInTheDocument();
    expect(screen.queryByText("Multimodal")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Expand details" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Legacy List/ }),
    ).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByText("Legacy List"));

    const expandedPriceContainer = container.querySelector(
      '[data-testid="legacy-expanded-price-block"]',
    ) as HTMLElement | null;

    expect(expandedPriceContainer).not.toBeNull();
    expect(screen.getByRole("button", { name: /Legacy List/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      within(expandedPriceContainer!).getByText("Cache write 1h"),
    ).toBeInTheDocument();
  });

  it("does not expand legacy LLM rows when clicking action links", () => {
    const model = {
      id: "legacy-list-actions",
      name: "legacy-list-actions",
      displayName: "Legacy List Actions",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Legacy LLM list action test model",
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

    render(<ConsoleModelList models={[model]} />);

    fireEvent.click(screen.getByRole("link", { name: "More" }));
    expect(screen.queryByText("Reasoning")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Legacy List Actions/ }),
    ).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("link", { name: "Playground" }));
    expect(screen.queryByText("Reasoning")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Legacy List Actions/ }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps Tiered label only for tiered pricing rows", () => {
    const model = {
      id: "tiered-list",
      name: "tiered-list",
      displayName: "Tiered List",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Tiered list model",
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

    render(<ConsoleModelList models={[model]} />);

    expect(screen.getByRole("button", { name: "Tiered" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tiered List"));

    expect(screen.getByRole("button", { name: /Tiered List/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Input length")).toBeInTheDocument();
  });

  it("uses the multimodal label for multimodal list rows", () => {
    const model = {
      id: "multimodal-list-label",
      name: "multimodal-list-label",
      displayName: "Multimodal List Label",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Multimodal label test model",
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
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelList models={[model]} />);

    expect(
      screen.getByRole("button", { name: "Multimodal" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tiered" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Expand details" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Multimodal List Label"));

    expect(
      screen.getByRole("button", { name: /Multimodal List Label/ }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Text · Input")).toBeInTheDocument();
    expect(screen.getByText("Text · Output")).toBeInTheDocument();
  });

  it("does not expand a multimodal row when clicking action links", () => {
    const model = {
      id: "multimodal-list-actions",
      name: "multimodal-list-actions",
      displayName: "Multimodal List Actions",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Multimodal action test model",
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
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelList models={[model]} />);

    fireEvent.click(screen.getByRole("link", { name: "More" }));
    expect(screen.queryByText("Text · Output")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Multimodal List Actions/ }),
    ).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("link", { name: "Playground" }));
    expect(screen.queryByText("Text · Output")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Multimodal List Actions/ }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("reserves right-side width for actions in list rows", () => {
    const model = {
      id: "long-summary-list",
      name: "long-summary-list",
      displayName: "Long Summary List",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Long summary layout test",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM", "Multimodal", "Vision", "Audio", "Video"],
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
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
        ],
      },
    } as LLMModelWithStatus;

    const { container } = render(<ConsoleModelList models={[model]} />);
    const headerGrid = container.querySelector(
      '.grid[class*="grid-cols-"]',
    ) as HTMLElement | null;

    expect(headerGrid).not.toBeNull();
    expect(headerGrid?.className).toContain(
      "grid-cols-[minmax(250px,36%)_minmax(0,1fr)_minmax(132px,auto)]",
    );
  });

  it("right-aligns the list release date column", () => {
    const model = {
      id: "dated-list",
      name: "dated-list",
      displayName: "Dated List",
      type: ModelType.Chat,
      series: "OpenAI",
      description: "Date alignment test",
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
      platform_release_at: "2026-01-01T00:00:00Z",
    } as LLMModelWithStatus;

    render(<ConsoleModelList models={[model]} />);

    const releaseText = screen.getByText("Jan 1 , 2026");
    expect(releaseText.className).toContain("text-right");
    expect(releaseText.className).toContain("justify-self-end");
  });
});
