import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import {
  ChatConfigProvider,
  useChatConfig,
} from "@/app/models-console/llm-playground/providers/ChatConfigProvider";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

let mockKeys: any;
jest.mock("@/lib/hooks/useSelectKeys", () => ({
  useSelectKeys: () => mockKeys,
}));

function Consumer() {
  const {
    chatMode,
    setChatMode,
    chatConfig,
    setChatConfig,
    apiKey,
    enableThinking,
    setEnableThinking,
    clearChatHistory,
    onClearHistoryChange,
  } = useChatConfig();
  return (
    <div>
      <span data-testid="mode">{chatMode}</span>
      <span data-testid="apiKey">{apiKey}</span>
      <span data-testid="thinking">{String(enableThinking)}</span>
      <span data-testid="config">{JSON.stringify(chatConfig)}</span>
      <button onClick={() => setChatMode(ChatMode.Completion)}>mode</button>
      <button onClick={() => setEnableThinking(false)}>think</button>
      <button onClick={() => setChatConfig({ temperature: 0.5 })}>
        config
      </button>
      <button
        onClick={() => {
          onClearHistoryChange(() => {
            const el = document.getElementById("cleared");
            if (el) el.textContent = "yes";
          });
          clearChatHistory();
        }}
      >
        clear
      </button>
      <span id="cleared" />
    </div>
  );
}

const renderWithProvider = () =>
  render(
    <ChatConfigProvider>
      <Consumer />
    </ChatConfigProvider>,
  );

describe("ChatConfigProvider", () => {
  beforeEach(() => {
    mockKeys = ["session_abc", "session_def"];
  });

  it("defaults to chat mode, thinking enabled, empty config", () => {
    renderWithProvider();
    expect(screen.getByTestId("mode")).toHaveTextContent(ChatMode.Chat);
    expect(screen.getByTestId("thinking")).toHaveTextContent("true");
    expect(screen.getByTestId("config")).toHaveTextContent("{}");
  });

  it("derives apiKey from the first select key", () => {
    renderWithProvider();
    expect(screen.getByTestId("apiKey")).toHaveTextContent("session_abc");
  });

  it("uses empty apiKey when keys is not an array", () => {
    mockKeys = undefined;
    renderWithProvider();
    expect(screen.getByTestId("apiKey")).toHaveTextContent("");
  });

  it("updates mode, thinking and config via setters", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("mode"));
    fireEvent.click(screen.getByText("think"));
    fireEvent.click(screen.getByText("config"));
    expect(screen.getByTestId("mode")).toHaveTextContent(ChatMode.Completion);
    expect(screen.getByTestId("thinking")).toHaveTextContent("false");
    expect(screen.getByTestId("config")).toHaveTextContent("0.5");
  });

  it("invokes the registered clear-history callback", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("clear"));
    expect(document.getElementById("cleared")).toHaveTextContent("yes");
  });

  it("throws when used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useChatConfig())).toThrow(
      "useChatConfig must be used within ChatConfigProvider",
    );
    spy.mockRestore();
  });
});
