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

describe("api/embedding-models route — additional branches", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("forwards the Authorization header when present and accepts an empty data array", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [] }),
    });
    const res = await GET(req("Bearer tok"));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
    expect(reportError).not.toHaveBeenCalled();
  });
});
