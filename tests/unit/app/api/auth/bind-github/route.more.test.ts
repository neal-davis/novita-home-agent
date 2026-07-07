/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("next/headers", () => ({ cookies: jest.fn() }));

process.env.NEXT_PUBLIC_BASE_URL = "https://api.example.test";

const { cookies } = require("next/headers");
const { GET } = require("@/app/api/auth/bind-github/route");
const {
  AUTH_RESULT,
  AUTH_RESULT_FAILED,
  AUTH_RESULT_SUCCESS,
  AUTH_BIND_GITHUB_RESULT,
  AUTH_FAILED_REASON,
} = require("@/constants/auth");

const mockCookies = cookies as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

function req(url: string) {
  return { url } as Request;
}

describe("api/auth/bind-github route — additional branches", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    mockCookies.mockReturnValue({ get: jest.fn(() => ({ value: "tok" })) });
  });
  afterEach(() => consoleLog.mockRestore());

  it("uses data.message as the failure reason when reason is absent", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ code: 403, message: "forbidden" }),
    });
    const res = await GET(req("https://novita.ai/api/auth/bind-github?code=c"));
    const loc = res.headers.get("location");
    expect(loc).toContain(`${AUTH_RESULT}=${AUTH_RESULT_FAILED}`);
    expect(loc).toContain(`${AUTH_FAILED_REASON}=forbidden`);
  });

  it("treats a response without a code field as success", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ ok: true }),
    });
    const res = await GET(req("https://novita.ai/api/auth/bind-github?code=c"));
    expect(res.headers.get("location")).toContain(
      `${AUTH_BIND_GITHUB_RESULT}=${AUTH_RESULT_SUCCESS}`,
    );
  });
});
