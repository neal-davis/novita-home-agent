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

describe("api/tool-mock route — additional branches", () => {
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

  it("falls through to the next model when the first model throws", async () => {
    generateText
      .mockRejectedValueOnce(new Error("model-1 down")) // model 1 attempt 1 -> rethrow (not SyntaxError)
      .mockResolvedValueOnce({ text: '{"ok":true}' }); // model 2 attempt 1 -> success
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
    expect(body.model).toBe("moonshotai/kimi-k2-instruct");
  });

  it("retries within a model after a SyntaxError then succeeds", async () => {
    const synErr = new SyntaxError("Unexpected token");
    generateText
      .mockRejectedValueOnce(synErr) // attempt 1 -> SyntaxError -> continue
      .mockResolvedValueOnce({ text: '```json\n{"v":9}\n```' }); // attempt 2 -> success
    const res = await POST(
      makeReq({ functionDefinition: {}, parameters: {}, apiKey: "k" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ v: 9 });
    expect(body.model).toBe("qwen/qwen3-coder-480b-a35b-instruct");
  });

  it("parses plain JSON output without code fences", async () => {
    generateText.mockResolvedValue({ text: '   {"plain": 1}   ' });
    const res = await POST(
      makeReq({ functionDefinition: {}, parameters: {}, apiKey: "k" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ plain: 1 });
  });
});
