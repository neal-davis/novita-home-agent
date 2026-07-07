/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const webStreams = require("stream/web");
global.ReadableStream = webStreams.ReadableStream;
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const mockStreamText = jest.fn();
jest.mock("ai", () => ({
  streamText: (...a: any[]) => mockStreamText(...a),
  convertToModelMessages: jest.fn((m: any) => m),
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
const { convertToolsToAISDK } = require("@/app/api/chat/utils");

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

describe("api/response route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("streams an SSE response and converts tools", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    const res = await POST(
      req({ messages: [{ role: "user" }], model: "m", apiKey: "k", tools: [] }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "text/event-stream; charset=utf-8",
    );
    expect(convertToolsToAISDK).toHaveBeenCalled();
  });

  it("returns a 500 JSON error when streamText throws", async () => {
    mockStreamText.mockRejectedValueOnce(new Error("resp boom"));
    const res = await POST(
      req({ messages: [], model: "m", apiKey: "k", tools: [] }),
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ message: "resp boom" });
  });
});
