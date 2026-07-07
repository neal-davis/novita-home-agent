import { fireEvent, render, screen } from "@testing-library/react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

// Response pulls in streamdown via next/dynamic; stub it out.
jest.mock("@/components/ai-elements/response", () => ({
  __esModule: true,
  Response: ({ children }: any) => <div>{children}</div>,
}));

describe("Reasoning", () => {
  it("shows 'Thinking...' while streaming and renders content open", () => {
    render(
      <Reasoning isStreaming defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>chain of thought</ReasoningContent>
      </Reasoning>,
    );
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
    expect(screen.getByText("chain of thought")).toBeInTheDocument();
  });

  it("shows the thought duration when not streaming", () => {
    render(
      <Reasoning isStreaming={false} duration={5} open>
        <ReasoningTrigger />
        <ReasoningContent>done</ReasoningContent>
      </Reasoning>,
    );
    expect(screen.getByText("Thought for 5 seconds")).toBeInTheDocument();
  });

  it("renders a custom trigger child", () => {
    render(
      <Reasoning open>
        <ReasoningTrigger>custom trigger</ReasoningTrigger>
        <ReasoningContent>x</ReasoningContent>
      </Reasoning>,
    );
    expect(screen.getByText("custom trigger")).toBeInTheDocument();
  });

  it("toggles open state when the trigger is clicked", () => {
    render(
      <Reasoning isStreaming defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>visible body</ReasoningContent>
      </Reasoning>,
    );
    expect(screen.getByText("visible body")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Thinking...").closest("button")!);
    expect(screen.queryByText("visible body")).not.toBeInTheDocument();
  });
});
