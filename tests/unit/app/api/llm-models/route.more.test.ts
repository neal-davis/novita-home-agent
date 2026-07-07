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
const { headers } = require("next/headers");

function req(url: string) {
  return { url } as unknown as Request;
}

describe("api/llm-models route — additional branches", () => {
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

  it("passes an undefined token when the authorization header is absent", async () => {
    headers.mockReturnValue({ get: jest.fn(() => null) });
    getFullLLMModels.mockResolvedValueOnce([{ id: "x" }]);
    const res = await GET(req("https://novita.ai/api/llm-models"));
    expect(res.status).toBe(200);
    expect(getFullLLMModels).toHaveBeenCalledWith(["chat"], undefined);
  });

  it("drops empty entries from a comma-separated filter list", async () => {
    headers.mockReturnValue({ get: jest.fn(() => "Bearer abc") });
    getFullLLMModels.mockResolvedValueOnce([]);
    await GET(req("https://novita.ai/api/llm-models?filter=chat,,embedding,"));
    expect(getFullLLMModels).toHaveBeenCalledWith(["chat", "embedding"], "abc");
  });
});
