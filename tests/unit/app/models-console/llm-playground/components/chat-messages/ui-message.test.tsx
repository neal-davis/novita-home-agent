import { render, screen } from "@testing-library/react";
import ChatMessage from "@/app/models-console/llm-playground/components/chat-messages/ui-message";

jest.mock("@/components/ai-elements/message", () => ({
  Message: ({ children, from }: any) => (
    <div data-testid="message" data-from={from}>
      {children}
    </div>
  ),
  MessageAvatar: () => <div data-testid="avatar" />,
  MessageContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ai-elements/conversation", () => ({
  Conversation: ({ children }: any) => <div>{children}</div>,
  ConversationContent: ({ children }: any) => <div>{children}</div>,
  ConversationScrollButton: () => <div data-testid="scroll-btn" />,
}));

jest.mock("@/components/ai-elements/loader", () => ({
  Loader: () => <div data-testid="loader" />,
}));

jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/parts-render",
  () => ({
    MessageRole: {},
    preprocessMessageParts: (parts: any[]) => parts,
    shouldRenderPartType: () => true,
    RenderActions: () => <div data-testid="actions" />,
    RenderAudioParts: () => <div data-testid="audio" />,
    RenderFilePart: () => <div data-testid="file" />,
    RenderReasoningPart: () => <div data-testid="reasoning" />,
    RenderSlaMetrics: () => <div data-testid="sla" />,
    RenderTextPart: () => <div data-testid="text" />,
    RenderToolPart: () => <div data-testid="tool" />,
  }),
);

jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/logo.svg",
  () => "logo.svg",
  { virtual: true },
);

const baseHandlers = {
  regenerate: jest.fn(),
  currentTools: [],
  mockToolOutput: "",
  setMockToolOutput: jest.fn(),
  onSaveTool: jest.fn(),
  onMockTool: jest.fn(),
};

function renderMessages(messages: any[], status: any = "ready") {
  return render(
    <ChatMessage messages={messages} status={status} {...baseHandlers} />,
  );
}

describe("ui-message ChatMessage", () => {
  it("renders a user text message without avatar", () => {
    renderMessages([
      {
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "hi", state: "done" }],
      },
    ]);
    expect(screen.getByTestId("text")).toBeInTheDocument();
    expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
  });

  it("renders reasoning, tool, and file parts for an assistant message with avatar", () => {
    renderMessages([
      {
        id: "m2",
        role: "assistant",
        parts: [
          { type: "reasoning", text: "think", state: "done" },
          { type: "tool-search", state: "done" },
          { type: "file", mediaType: "image/png", url: "u", state: "done" },
        ],
      },
    ]);
    expect(screen.getByTestId("reasoning")).toBeInTheDocument();
    expect(screen.getByTestId("tool")).toBeInTheDocument();
    expect(screen.getByTestId("file")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    // assistant -> actions rendered (message done)
    expect(screen.getByTestId("actions")).toBeInTheDocument();
  });

  it("renders audio parts once for audio-raw files", () => {
    renderMessages([
      {
        id: "m3",
        role: "assistant",
        parts: [
          { type: "file", mediaType: "audio-raw", url: "a", state: "done" },
        ],
      },
    ]);
    expect(screen.getByTestId("audio")).toBeInTheDocument();
    // audio-raw file should not render as a normal file part
    expect(screen.queryByTestId("file")).not.toBeInTheDocument();
  });

  it("renders SLA metrics when a text part carries provider metadata", () => {
    renderMessages([
      {
        id: "m4",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "out",
            state: "done",
            providerMetadata: { provider: "novita" },
          },
        ],
      },
    ]);
    expect(screen.getByTestId("sla")).toBeInTheDocument();
  });

  it("does not render actions while a part is still streaming", () => {
    renderMessages([
      {
        id: "m5",
        role: "assistant",
        parts: [{ type: "text", text: "partial", state: "streaming" }],
      },
    ]);
    expect(screen.queryByTestId("actions")).not.toBeInTheDocument();
  });

  it("shows the loader when status is submitted", () => {
    renderMessages([], "submitted");
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("does not show the loader for non-submitted status", () => {
    renderMessages([], "ready");
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });
});
