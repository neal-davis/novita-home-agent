import { act, renderHook } from "@testing-library/react";
import { useResponseLogic } from "@/app/models-console/llm-playground/hooks/useResponseLogic";

const chatApi = {
  messages: [{ id: "m1" }],
  error: undefined,
  setMessages: jest.fn(),
  stop: jest.fn(),
  sendMessage: jest.fn(),
  status: "ready",
  regenerate: jest.fn(),
  addToolResult: jest.fn(),
};

let lastTransportConfig: any;
jest.mock("@ai-sdk/react", () => ({ useChat: () => chatApi }));
jest.mock("ai", () => ({
  DefaultChatTransport: class {
    constructor(config: any) {
      lastTransportConfig = config;
    }
  },
}));

let checkLoginResult = true;
jest.mock("@/app/models-console/llm-playground/hooks/useLoginGuard", () => ({
  useLoginGuard: () => ({ checkLogin: () => checkLoginResult }),
}));

const getChatParams = jest.fn(() => ({ model: "r", max_output_tokens: 100 }));

beforeEach(() => {
  jest.clearAllMocks();
  checkLoginResult = true;
  chatApi.status = "ready";
});

describe("useResponseLogic", () => {
  it("uses the /api/response endpoint", () => {
    renderHook(() => useResponseLogic({ apiKey: "k" }));
    expect(lastTransportConfig.api).toBe("/api/response");
    expect(lastTransportConfig.body).toEqual({ apiKey: "k" });
  });

  it("sends a message with merged params", () => {
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.sendMessage("hi", [] as any));
    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      { text: "hi", files: [] },
      { body: { model: "r", max_output_tokens: 100 } },
    );
  });

  it("blocks send and regenerate when not logged in", () => {
    checkLoginResult = false;
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.sendMessage("hi", [] as any));
    act(() => result.current.regenerate("m1"));
    expect(chatApi.sendMessage).not.toHaveBeenCalled();
    expect(chatApi.regenerate).not.toHaveBeenCalled();
  });

  it("does not regenerate while streaming", () => {
    chatApi.status = "streaming";
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).not.toHaveBeenCalled();
  });

  it("onSaveTool adds a parsed tool result and follow-up message", () => {
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.setMockToolOutput('{"x":1}'));
    act(() => result.current.onSaveTool("t", "c"));
    expect(chatApi.addToolResult).toHaveBeenCalledWith({
      tool: "t",
      toolCallId: "c",
      output: { x: 1 },
    });
  });

  it("clearHistory empties messages", () => {
    const { result } = renderHook(() => useResponseLogic({ apiKey: "k" }));
    act(() => result.current.clearHistory());
    expect(chatApi.setMessages).toHaveBeenCalledWith([]);
  });
});
