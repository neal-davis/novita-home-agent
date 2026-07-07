import { fireEvent, render, screen } from "@testing-library/react";
import {
  RenderActions,
  RenderSlaMetrics,
  RenderTextContent,
  RenderTextPart,
} from "@/app/models-console/llm-playground/components/chat-messages/parts-render/text-parts";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ai-elements/response", () => ({
  Response: ({ children }: any) => <div data-testid="response">{children}</div>,
}));
jest.mock("@/components/ai-elements/actions", () => ({
  Actions: ({ children }: any) => <div data-testid="actions">{children}</div>,
  Action: ({ children, onClick, label }: any) => (
    <button onClick={onClick} aria-label={label}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ai-elements/sla-metrics", () => ({
  SlaMetrics: ({ tps, ttft_ms }: any) => (
    <div data-testid="sla" data-tps={tps} data-ttft={ttft_ms} />
  ),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));

describe("RenderTextContent", () => {
  it("renders a plain div for user messages", () => {
    render(<RenderTextContent text="hi" keyPrefix="k" role="user" />);
    expect(screen.getByText("hi")).toBeInTheDocument();
    expect(screen.queryByTestId("response")).not.toBeInTheDocument();
  });

  it("renders the Response markdown component for assistant messages", () => {
    render(<RenderTextContent text="bot" keyPrefix="k" role="assistant" />);
    expect(screen.getByTestId("response")).toHaveTextContent("bot");
  });
});

describe("RenderTextPart", () => {
  it("delegates to RenderTextContent with the part text", () => {
    render(
      <RenderTextPart
        part={{ text: "content" } as any}
        keyPrefix="k"
        role="assistant"
      />,
    );
    expect(screen.getByTestId("response")).toHaveTextContent("content");
  });
});

describe("RenderSlaMetrics", () => {
  it("returns null when there is no sla data", () => {
    const { container } = render(
      <RenderSlaMetrics part={{ providerMetadata: {} } as any} keyPrefix="k" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders SLA metrics from providerMetadata", () => {
    render(
      <RenderSlaMetrics
        part={
          { providerMetadata: { provider: { tps: 10, ttft_ms: 200 } } } as any
        }
        keyPrefix="k"
      />,
    );
    const sla = screen.getByTestId("sla");
    expect(sla).toHaveAttribute("data-tps", "10");
    expect(sla).toHaveAttribute("data-ttft", "200");
  });
});

describe("RenderActions", () => {
  it("copies text and notifies on Copy, and calls onRegenerate on Retry", () => {
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    const onRegenerate = jest.fn();

    render(
      <RenderActions
        part={{ text: "copy me" } as any}
        keyPrefix="k"
        onRegenerate={onRegenerate}
      />,
    );

    fireEvent.click(screen.getByLabelText("Copy"));
    expect(writeText).toHaveBeenCalledWith("copy me");
    expect((message as any).success).toHaveBeenCalledWith(
      "Copied to clipboard",
    );

    fireEvent.click(screen.getByLabelText("Retry"));
    expect(onRegenerate).toHaveBeenCalled();
  });
});
