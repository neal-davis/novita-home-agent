import { act, renderHook } from "@testing-library/react";
import { useChatLogic } from "@/app/models-console/llm-playground/hooks/useChatLogic";

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
jest.mock("@ai-sdk/react", () => ({
  useChat: () => chatApi,
}));
jest.mock("ai", () => ({
  DefaultChatTransport: class {
    config: any;
    constructor(config: any) {
      this.config = config;
      lastTransportConfig = config;
    }
  },
}));

let checkLoginResult = true;
jest.mock("@/app/models-console/llm-playground/hooks/useLoginGuard", () => ({
  useLoginGuard: () => ({ checkLogin: () => checkLoginResult }),
}));

const getChatParams = jest.fn(() => ({ model: "m", temperature: 0.5 }));

beforeEach(() => {
  jest.clearAllMocks();
  checkLoginResult = true;
  chatApi.status = "ready";
});

describe("useChatLogic", () => {
  it("passes through messages/status/error from useChat", () => {
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    expect(result.current.messages).toEqual([{ id: "m1" }]);
    expect(result.current.status).toBe("ready");
  });

  it("uses the plain /api/chat endpoint without a dedicated endpoint", () => {
    renderHook(() => useChatLogic({ apiKey: "k" }));
    expect(lastTransportConfig.api).toBe("/api/chat");
    expect(lastTransportConfig.body).toEqual({ apiKey: "k" });
  });

  it("sends a message with chat params merged into the body", () => {
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.sendMessage("hello", [] as any));
    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      { text: "hello", files: [] },
      { body: { model: "m", temperature: 0.5 } },
    );
  });

  it("blocks sending when the login guard fails", () => {
    checkLoginResult = false;
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.sendMessage("hi", [] as any));
    expect(chatApi.sendMessage).not.toHaveBeenCalled();
  });

  it("does not regenerate while streaming", () => {
    chatApi.status = "streaming";
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).not.toHaveBeenCalled();
  });

  it("regenerates with params when ready", () => {
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).toHaveBeenCalledWith({
      messageId: "m1",
      body: { model: "m", temperature: 0.5 },
    });
  });

  it("clearHistory empties the message list", () => {
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    act(() => result.current.clearHistory());
    expect(chatApi.setMessages).toHaveBeenCalledWith([]);
  });

  it("onSaveTool parses JSON output and submits a follow-up message", () => {
    const { result } = renderHook(() =>
      useChatLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.setMockToolOutput('{"ok":true}'));
    act(() => result.current.onSaveTool("myTool", "call-1"));
    expect(chatApi.addToolResult).toHaveBeenCalledWith({
      tool: "myTool",
      toolCallId: "call-1",
      output: { ok: true },
    });
    expect(chatApi.sendMessage).toHaveBeenCalledWith(undefined, {
      body: { model: "m", temperature: 0.5, enable_thinking: false },
    });
  });

  it("onSaveTool keeps raw string output when not JSON", () => {
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    act(() => result.current.setMockToolOutput("not json"));
    act(() => result.current.onSaveTool("t", "c"));
    expect(chatApi.addToolResult).toHaveBeenCalledWith(
      expect.objectContaining({ output: "not json" }),
    );
  });

  it("onMockTool posts to the tool-mock endpoint and stores the output", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ value: 1 }),
    });
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    await act(async () => {
      await result.current.onMockTool({ name: "fn" } as any, { a: 1 });
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tool-mock",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.current.mockToolOutput).toContain('"value": 1');
  });
});
