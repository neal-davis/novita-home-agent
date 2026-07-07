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

describe("api/completion route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("streams an SSE response on success", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    const res = await POST(req({ prompt: "hi", model: "m", apiKey: "k" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "text/event-stream; charset=utf-8",
    );
    expect(res.headers.get("Connection")).toBe("keep-alive");
  });

  it("uses the dedicated endpoint base url when endpoint query is present", async () => {
    mockStreamText.mockResolvedValueOnce({
      toUIMessageStreamResponse: jest.fn(() => uiResp()),
    });
    await POST(
      req(
        { prompt: "hi", model: "m", apiKey: "k" },
        "https://novita.ai/api/completion?endpoint=ep1",
      ),
    );
    expect(createModelProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining("/dedicated/v1/openai"),
      }),
    );
  });

  it("returns a 500 JSON error when streamText throws", async () => {
    mockStreamText.mockRejectedValueOnce(new Error("model boom"));
    const res = await POST(req({ prompt: "hi", model: "m", apiKey: "k" }));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ message: "model boom" });
  });
});
