/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const webStreams = require("stream/web");
global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const mockStreamText = jest.fn();
const mockChatModel = jest.fn((m: string) => ({ id: m }));
jest.mock("ai", () => ({
  streamText: (...a: any[]) => mockStreamText(...a),
  convertToModelMessages: jest.fn((m: any) => m),
}));
jest.mock("@/app/api/chat/model-provider", () => ({
  createModelProvider: jest.fn(() => ({
    chatModel: (...a: any[]) => mockChatModel(...a),
  })),
}));
jest.mock("@/app/api/chat/stream-transform", () => ({
  slaTransform: jest.fn(() => ({})),
}));
jest.mock("@/app/api/chat/utils", () => ({
  convertToolsToAISDK: jest.fn(() => ({ myTool: {} })),
}));

const { POST } = require("@/app/api/chat/route");
const { createModelProvider } = require("@/app/api/chat/model-provider");
const { convertToolsToAISDK } = require("@/app/api/chat/utils");

function req(body: any, url = "https://novita.ai/api/chat") {
  return {
    url,
    json: jest.fn().mockResolvedValue(body),
    signal: undefined,
  } as any;
}

function uiResp() {
  return {
    body: new ReadableStream({
      start(c: any) {
        c.close();
      },
    }),
    headers: new Headers(),
    status: 200,
    statusText: "OK",
  };
}

describe("api/chat route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("streams an SSE response on success with keep-alive headers", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    const res = await POST(
      req({
        messages: [{ role: "user", content: "hi" }],
        model: "m",
        apiKey: "k",
        tools: [],
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "text/event-stream; charset=utf-8",
    );
    expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(res.headers.get("Connection")).toBe("keep-alive");
    expect(convertToolsToAISDK).toHaveBeenCalledWith([]);
  });

  it("uses the default base url when no endpoint query is present", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(req({ messages: [], model: "m", apiKey: "k" }));
    expect(createModelProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining("/openai/v1"),
      }),
    );
  });

  it("uses the endpoint query value as the base url when provided", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(
      req(
        { messages: [], model: "m", apiKey: "k" },
        "https://novita.ai/api/chat?endpoint=https://custom.host/v1",
      ),
    );
    expect(createModelProvider).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://custom.host/v1" }),
    );
  });

  it("passes enable_thinking only for reasoning models", async () => {
    mockStreamText.mockResolvedValue({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });

    await POST(
      req({
        messages: [],
        model: "m",
        apiKey: "k",
        isReasoningModel: true,
        enable_thinking: true,
      }),
    );
    const reasoningCall = mockStreamText.mock.calls[0][0];
    expect(reasoningCall.providerOptions.provider.enable_thinking).toBe(true);

    mockStreamText.mockClear();
    await POST(
      req({
        messages: [],
        model: "m",
        apiKey: "k",
        isReasoningModel: false,
        enable_thinking: true,
      }),
    );
    const nonReasoningCall = mockStreamText.mock.calls[0][0];
    expect("enable_thinking" in nonReasoningCall.providerOptions.provider).toBe(
      false,
    );
  });

  it("prefers character_content over system_content for the system prompt", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(
      req({
        messages: [],
        model: "m",
        apiKey: "k",
        system_content: "sys",
        character_content: "char",
      }),
    );
    expect(mockStreamText.mock.calls[0][0].system).toBe("char");
  });

  it("returns a 500 JSON error when streamText throws", async () => {
    mockStreamText.mockRejectedValueOnce(new Error("chat boom"));
    const res = await POST(req({ messages: [], model: "m", apiKey: "k" }));
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    await expect(res.json()).resolves.toEqual({ message: "chat boom" });
  });

  it("returns 500 when the request body cannot be parsed", async () => {
    const badReq = {
      url: "https://novita.ai/api/chat",
      json: jest.fn().mockRejectedValue(new Error("bad json")),
    } as any;
    await expect(POST(badReq)).rejects.toThrow("bad json");
  });
});
