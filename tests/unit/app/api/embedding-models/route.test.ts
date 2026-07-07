/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("@/lib/utils/reporter", () => ({ reportError: jest.fn() }));

const { GET } = require("@/app/api/embedding-models/route");
const { reportError } = require("@/lib/utils/reporter");

const mockFetch = global.fetch as jest.Mock;

function req(auth?: string) {
  return {
    url: "https://novita.ai/api/embedding-models",
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

describe("api/embedding-models route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("queries the embedding model type and returns data", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [validModel] }),
    });
    const res = await GET(req("Bearer x"));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("model_type=embedding"),
      expect.any(Object),
    );
    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports schema mismatches", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [{ id: "bad" }] }),
    });
    await GET(req());
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "api_chat-models_schema_error" }),
    );
  });

  it("returns an error response on fetch failure", async () => {
    const err: any = new Error("down");
    err.status = 500;
    mockFetch.mockRejectedValueOnce(err);
    const res = await GET(req());
    expect(res.status).toBe(500);
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "api_chat-models_fetch_failed" }),
    );
  });
});
