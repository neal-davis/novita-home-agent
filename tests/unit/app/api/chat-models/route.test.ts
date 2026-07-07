/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("@/lib/utils/reporter", () => ({ reportError: jest.fn() }));

const { GET } = require("@/app/api/chat-models/route");
const { reportError } = require("@/lib/utils/reporter");

const mockFetch = global.fetch as jest.Mock;

function req(url: string, auth?: string) {
  return {
    url,
    headers: {
      get: (k: string) => (k === "Authorization" ? (auth ?? null) : null),
    },
  } as unknown as Request;
}

const validModel = {
  context_size: 1,
  created: 1,
  description: "d",
  id: "m",
  input_token_price_per_m: 1,
  object: "model",
  output_token_price_per_m: 1,
  owned_by: "novita",
  status: 1,
  title: "t",
};

describe("api/chat-models route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("returns upstream models and forwards query string + auth", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [validModel] }),
    });
    const res = await GET(
      req("https://novita.ai/api/chat-models?model_type=chat", "Bearer x"),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: [validModel] });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/openai/v1/models?model_type=chat"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer x" }),
      }),
    );
    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports a schema error but still returns the response", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [{ id: "bad" }] }),
    });
    const res = await GET(req("https://novita.ai/api/chat-models"));
    expect(res.status).toBe(200);
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "api_chat-models_schema_error" }),
    );
  });

  it("reports and returns an error response on fetch failure", async () => {
    const err: any = new Error("boom");
    err.status = 502;
    mockFetch.mockRejectedValueOnce(err);
    const res = await GET(req("https://novita.ai/api/chat-models"));
    expect(res.status).toBe(502);
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "api_chat-models_fetch_failed" }),
    );
  });
});
