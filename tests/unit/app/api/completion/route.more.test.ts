/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const webStreams = require("stream/web");
global.ReadableStream = webStreams.ReadableStream;
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const mockStreamText = jest.fn();
jest.mock("ai", () => ({ streamText: (...a: any[]) => mockStreamText(...a) }));
jest.mock("@/app/api/chat/model-provider", () => ({
  createModelProvider: jest.fn(() => ({
    completionModel: jest.fn((m: string) => ({ id: m })),
  })),
}));
jest.mock("@/app/api/chat/stream-transform", () => ({
  slaTransform: jest.fn(() => ({})),
}));

const { POST } = require("@/app/api/completion/route");
const { createModelProvider } = require("@/app/api/chat/model-provider");

function req(body: any, url = "https://novita.ai/api/completion") {
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

describe("api/completion route — additional branches", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("uses the plain openai base url when no endpoint query is present", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(req({ prompt: "hi", model: "m", apiKey: "k" }));
    expect(createModelProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining("/openai/v1"),
      }),
    );
    const baseURL = (createModelProvider as jest.Mock).mock.calls[0][0].baseURL;
    expect(baseURL).not.toContain("/dedicated/");
  });

  it("forwards completion sampling params to streamText", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(
      req({
        prompt: "hi",
        model: "m",
        apiKey: "k",
        top_p: 0.9,
        top_k: 40,
        max_tokens: 128,
        repetition_penalty: 1.1,
        min_p: 0.05,
        response_format: { type: "json" },
      }),
    );
    const call = mockStreamText.mock.calls[0][0];
    expect(call.topP).toBe(0.9);
    expect(call.topK).toBe(40);
    expect(call.maxOutputTokens).toBe(128);
    expect(call.providerOptions.provider.repetition_penalty).toBe(1.1);
    expect(call.providerOptions.provider.min_p).toBe(0.05);
  });
});
