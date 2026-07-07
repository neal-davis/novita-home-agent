/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const webStreams = require("stream/web");
global.ReadableStream = webStreams.ReadableStream;
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const mockStreamText = jest.fn();
const mockConvert = jest.fn((m: any) => m);
jest.mock("ai", () => ({
  streamText: (...a: any[]) => mockStreamText(...a),
  convertToModelMessages: (m: any) => mockConvert(m),
}));
jest.mock("@/app/api/chat/model-provider", () => ({
  createModelProvider: jest.fn(() => ({
    responsesModel: jest.fn((m: string) => ({ id: m })),
  })),
}));
jest.mock("@/app/api/chat/utils", () => ({
  convertToolsToAISDK: jest.fn(() => ({})),
}));

const { POST } = require("@/app/api/response/route");

function req(body: any) {
  return {
    url: "https://novita.ai/api/response",
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

describe("api/response route — additional branches", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("truncates messages to the last 8 before converting", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    const messages = Array.from({ length: 12 }, (_, i) => ({
      role: "user",
      content: String(i),
    }));
    await POST(req({ messages, model: "m", apiKey: "k", tools: [] }));
    const converted = mockConvert.mock.calls[0][0];
    expect(converted).toHaveLength(8);
    expect(converted[0].content).toBe("4");
  });

  it("forwards response sampling params and max_tool_calls/top_logprobs", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(
      req({
        messages: [{ role: "user", content: "hi" }],
        model: "m",
        apiKey: "k",
        tools: [],
        max_output_tokens: 256,
        top_p: 0.8,
        temperature: 0.3,
        top_logprobs: 5,
        max_tool_calls: 2,
      }),
    );
    const call = mockStreamText.mock.calls[0][0];
    expect(call.maxOutputTokens).toBe(256);
    expect(call.topP).toBe(0.8);
    expect(call.temperature).toBe(0.3);
    expect(call.providerOptions.provider.top_logprobs).toBe(5);
    expect(call.providerOptions.provider.max_tool_calls).toBe(2);
  });
});
