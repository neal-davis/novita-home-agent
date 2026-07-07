import { act, renderHook } from "@testing-library/react";
import { useChatLogic } from "@/app/models-console/llm-playground/hooks/useChatLogic";

const chatApi = {
  messages: [],
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

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useSearchParams: () => new URLSearchParams("endpoint=ep-123"),
}));

beforeEach(() => {
  jest.clearAllMocks();
  checkLoginResult = true;
  chatApi.status = "ready";
});

describe("useChatLogic (more branches)", () => {
  it("targets the dedicated endpoint api url when deEndpoint is set", () => {
    renderHook(() => useChatLogic({ apiKey: "k", deEndpoint: "de-1" }));
    expect(lastTransportConfig.api).toBe("/api/chat?endpoint=ep-123");
  });

  it("blocks regenerate when not logged in", () => {
    checkLoginResult = false;
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    act(() => result.current.regenerate("m1"));
    expect(chatApi.regenerate).not.toHaveBeenCalled();
  });

  it("logs and swallows onMockTool fetch errors", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("net"));
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    await act(async () => {
      await result.current.onMockTool({ name: "fn" } as any, {});
    });
    expect(consoleError).toHaveBeenCalled();
    expect(result.current.mockToolOutput).toBe("");
    consoleError.mockRestore();
  });

  it("sends and saves a tool result with empty params when getChatParams is absent", () => {
    const { result } = renderHook(() => useChatLogic({ apiKey: "k" }));
    act(() => result.current.sendMessage("hi", [] as any));
    expect(chatApi.sendMessage).toHaveBeenCalledWith(
      { text: "hi", files: [] },
      { body: {} },
    );
  });
});
