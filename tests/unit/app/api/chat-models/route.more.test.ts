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

describe("api/chat-models route — additional branches", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLog.mockRestore());

  it("sends an empty Authorization header when none is provided", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ data: [] }),
    });
    const res = await GET(req("https://novita.ai/api/chat-models"));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "" }),
      }),
    );
    // empty data array still satisfies the schema -> no report
    expect(reportError).not.toHaveBeenCalled();
  });
});
