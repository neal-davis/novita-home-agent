import { render, screen } from "@testing-library/react";
import { UICompletion } from "@/app/models-console/llm-playground/components/chat-messages/ui-completion";

jest.mock("@/components/ai-elements/conversation", () => ({
  Conversation: ({ children }: any) => <div>{children}</div>,
  ConversationContent: ({ children }: any) => <div>{children}</div>,
  ConversationScrollButton: () => <div data-testid="scroll-btn" />,
}));
jest.mock("@/components/ai-elements/loader", () => ({
  Loader: () => <div data-testid="loader" />,
}));
jest.mock("@/components/ai-elements/response", () => ({
  Response: ({ children }: any) => <div data-testid="response">{children}</div>,
}));
jest.mock("@/components/ai-elements/sla-metrics", () => ({
  SlaMetrics: () => <div data-testid="sla" />,
}));
jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/parts-render",
  () => ({ RenderActions: () => <div data-testid="actions" /> }),
);

describe("UICompletion", () => {
  it("shows the prompt block, completion text, and actions when done", () => {
    render(
      <UICompletion
        submitPrompt="my prompt"
        isLoading={false}
        completion="the answer"
        onRegenerate={jest.fn()}
      />,
    );
    expect(screen.getByText("Prompt")).toBeInTheDocument();
    expect(screen.getByText("my prompt")).toBeInTheDocument();
    expect(screen.getByTestId("response")).toHaveTextContent("the answer");
    expect(screen.getByTestId("actions")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("shows the loader while loading with no completion yet", () => {
    render(<UICompletion isLoading={true} completion="" />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("actions")).not.toBeInTheDocument();
  });

  it("renders SLA metrics when provided", () => {
    render(
      <UICompletion
        isLoading={false}
        completion="x"
        slaMetrics={{ tps: 10, ttft_ms: 100 }}
      />,
    );
    expect(screen.getByTestId("sla")).toBeInTheDocument();
  });

  it("hides the prompt block when no submitPrompt", () => {
    render(<UICompletion isLoading={false} completion="x" />);
    expect(screen.queryByText("Prompt")).not.toBeInTheDocument();
  });
});
