/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("ai", () => ({ generateText: jest.fn() }));
jest.mock("@/app/api/tool-mock/utils", () => ({
  createMockGenerationPrompt: jest.fn(() => "PROMPT"),
}));
jest.mock("@/app/api/chat/model-provider", () => ({
  createModelProvider: jest.fn(() => (modelId: string) => ({ modelId })),
}));

const { generateText } = require("ai");
const { POST } = require("@/app/api/tool-mock/route");

function makeReq(body: unknown) {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as Request;
}

describe("api/tool-mock route", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("returns 400 when apiKey is missing", async () => {
    const res = await POST(makeReq({ functionDefinition: {}, parameters: {} }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "API key is required" });
  });

  it("returns 400 when functionDefinition/parameters missing", async () => {
    const res = await POST(makeReq({ apiKey: "k" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Function definition and parameters are required",
    });
  });

  it("returns generated mock data on the first model success", async () => {
    generateText.mockResolvedValue({ text: '```json\n{"foo":1}\n```' });
    const res = await POST(
      makeReq({
        functionDefinition: { a: 1 },
        parameters: { b: 2 },
        apiKey: "k",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ foo: 1 });
    expect(body.model).toBe("qwen/qwen3-coder-480b-a35b-instruct");
  });

  it("returns 500 when all models fail to produce valid JSON", async () => {
    // Non-JSON text -> extractAndParseJSON returns null -> throws -> retries exhausted
    generateText.mockResolvedValue({ text: "not json at all" });
    const res = await POST(
      makeReq({ functionDefinition: {}, parameters: {}, apiKey: "k" }),
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe(
      "Failed to generate mock data with all available models",
    );
  });

  it("returns 500 on unexpected error parsing the request body", async () => {
    const badReq = {
      json: jest.fn().mockRejectedValue(new Error("bad body")),
    } as unknown as Request;
    const res = await POST(badReq);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
    expect(body.details).toBe("bad body");
  });
});
