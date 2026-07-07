import { render, screen } from "@testing-library/react";
import { ConsoleModelSidebar } from "@/app/models-console/library/components/ConsoleModelSidebar";
import { ModelType, type LLMModelWithStatus } from "@/types/models";

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: { modelName: string }) => <span>{modelName}</span>,
}));

describe("ConsoleModelSidebar", () => {
  it("keeps the Model Series scroller vertical-only", () => {
    const models = [
      {
        id: "sidebar-model",
        name: "sidebar-model",
        displayName: "Sidebar Model",
        type: ModelType.Chat,
        series: "OpenAI",
        description: "Sidebar test model",
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
      },
    ] as LLMModelWithStatus[];

    render(
      <ConsoleModelSidebar
        filters={{}}
        models={models}
        options={{
          modalities: [{ label: "LLM", value: "llm", count: 1 }],
          series: Array.from({ length: 20 }, (_, index) => ({
            label: `Series ${index + 1}`,
            value: `series-${index + 1}`,
            count: 1,
          })),
          features: [],
        }}
        onToggle={() => {}}
      />,
    );

    const title = screen.getByText("Model Series");
    const section = title.closest("section");
    const scroller = section?.querySelector(
      ".scrollBar_container",
    ) as HTMLElement | null;

    expect(scroller).not.toBeNull();
    expect(scroller?.className).toContain("overflow-y-auto");
    expect(scroller?.className).toContain("overflow-x-hidden");
  });
});
