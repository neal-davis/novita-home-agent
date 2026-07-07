/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("@/lib/utils/reporter", () => ({ reportError: jest.fn() }));
jest.mock("@/api/model", () => ({ getFullLLMModels: jest.fn() }));
jest.mock("next/headers", () => ({ headers: jest.fn() }));

const { GET } = require("@/app/api/llm-models/route");
const { getFullLLMModels } = require("@/api/model");
const { reportError } = require("@/lib/utils/reporter");
const { headers } = require("next/headers");

function req(url: string) {
  return { url } as unknown as Request;
}

describe("api/llm-models route", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
    headers.mockReturnValue({ get: jest.fn(() => "Bearer abc") });
  });
  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("defaults filter to chat and strips the bearer prefix from the token", async () => {
    getFullLLMModels.mockResolvedValueOnce([{ id: "m1" }]);
    const res = await GET(req("https://novita.ai/api/llm-models"));
    expect(res.status).toBe(200);
    expect(getFullLLMModels).toHaveBeenCalledWith(["chat"], "abc");
    const body = await res.json();
    expect(body.data).toEqual([{ id: "m1" }]);
    expect(body.cached_at).toBeDefined();
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
  });

  it("parses a comma-separated filter list", async () => {
    getFullLLMModels.mockResolvedValueOnce([]);
    await GET(req("https://novita.ai/api/llm-models?filter=chat,embedding"));
    expect(getFullLLMModels).toHaveBeenCalledWith(["chat", "embedding"], "abc");
  });

  it("returns 500 and reports the error when fetching fails", async () => {
    getFullLLMModels.mockRejectedValueOnce(new Error("upstream"));
    const res = await GET(req("https://novita.ai/api/llm-models"));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Failed to fetch LLM models",
      message: "upstream",
    });
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "api_llm-models_fetch_failed" }),
    );
  });
});
