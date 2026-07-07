import { render, screen } from "@testing-library/react";
import { RenderReasoningPart } from "@/app/models-console/llm-playground/components/chat-messages/parts-render/reasoning-parts";

jest.mock("@/components/ai-elements/reasoning", () => ({
  Reasoning: ({ children, isStreaming }: any) => (
    <div data-testid="reasoning" data-streaming={String(isStreaming)}>
      {children}
    </div>
  ),
  ReasoningTrigger: () => <div data-testid="trigger" />,
  ReasoningContent: ({ children }: any) => (
    <div data-testid="content">{children}</div>
  ),
}));

describe("RenderReasoningPart", () => {
  it("renders the reasoning text and trigger", () => {
    render(
      <RenderReasoningPart
        part={{ text: "thinking..." } as any}
        keyPrefix="k"
        status="idle"
      />,
    );
    expect(screen.getByTestId("content")).toHaveTextContent("thinking...");
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("uses the part's explicit isStreaming flag when present", () => {
    render(
      <RenderReasoningPart
        part={{ text: "t", isStreaming: true } as any}
        keyPrefix="k"
        status="idle"
      />,
    );
    expect(screen.getByTestId("reasoning")).toHaveAttribute(
      "data-streaming",
      "true",
    );
  });

  it("falls back to status === 'streaming' when isStreaming is undefined", () => {
    render(
      <RenderReasoningPart
        part={{ text: "t" } as any}
        keyPrefix="k"
        status="streaming"
      />,
    );
    expect(screen.getByTestId("reasoning")).toHaveAttribute(
      "data-streaming",
      "true",
    );
  });
});
