import { act, renderHook, waitFor } from "@testing-library/react";
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

jest.mock("@ai-sdk/react", () => ({ useChat: () => chatApi }));
jest.mock("ai", () => ({
  DefaultChatTransport: class {
    constructor(_config: any) {}
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

describe("useResponseLogic (more branches)", () => {
  it("regenerates with merged params when logged in and not streaming", () => {
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).toHaveBeenCalledWith({
      messageId: "m1",
      body: { model: "r", max_output_tokens: 100 },
    });
  });

  it("sends without getChatParams (defaults to empty params)", () => {
    const { result } = renderHook(() => useResponseLogic({ apiKey: "k" }));
    act(() => result.current.sendMessage("hi", [] as any));
    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      { text: "hi", files: [] },
      { body: {} },
    );
  });

  it("onSaveTool falls back to the raw string when JSON parsing fails", () => {
    const { result } = renderHook(() =>
      useResponseLogic({ apiKey: "k", getChatParams }),
    );
    act(() => result.current.setMockToolOutput("not-json"));
    act(() => result.current.onSaveTool("t", "c"));
    expect(chatApi.addToolResult).toHaveBeenCalledWith({
      tool: "t",
      toolCallId: "c",
      output: "not-json",
    });
    // follow-up message disables thinking
    expect(chatApi.sendMessage).toHaveBeenCalledWith(undefined, {
      body: { model: "r", max_output_tokens: 100, enable_thinking: false },
    });
  });

  it("onMockTool posts to /api/tool-mock and stores the formatted output", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });
    const { result } = renderHook(() => useResponseLogic({ apiKey: "k" }));
    await act(async () => {
      await result.current.onMockTool({ name: "fn" } as any, { a: 1 });
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tool-mock",
      expect.objectContaining({ method: "POST" }),
    );
    await waitFor(() =>
      expect(result.current.mockToolOutput).toBe(
        JSON.stringify({ ok: true }, null, 2),
      ),
    );
  });

  it("onMockTool logs and swallows fetch errors", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useResponseLogic({ apiKey: "k" }));
    await act(async () => {
      await result.current.onMockTool({ name: "fn" } as any, {});
    });
    expect(consoleError).toHaveBeenCalled();
    expect(result.current.mockToolOutput).toBe("");
    consoleError.mockRestore();
  });

  it("regenerate and onSaveTool default to empty params without getChatParams", () => {
    const { result } = renderHook(() => useResponseLogic({ apiKey: "k" }));
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).toHaveBeenCalledWith({
      messageId: "m1",
      body: {},
    });

    act(() => result.current.setMockToolOutput('{"y":2}'));
    act(() => result.current.onSaveTool("t", "c"));
    expect(chatApi.addToolResult).toHaveBeenCalledWith({
      tool: "t",
      toolCallId: "c",
      output: { y: 2 },
    });
    expect(chatApi.sendMessage).toHaveBeenCalledWith(undefined, {
      body: { enable_thinking: false },
    });
  });
});
