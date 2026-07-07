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

describe("api/auth/bind-github route", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    mockCookies.mockReturnValue({ get: jest.fn(() => ({ value: "tok" })) });
  });
  afterEach(() => consoleLog.mockRestore());

  it("redirects to referral when code is missing", async () => {
    const res = await GET(req("https://novita.ai/api/auth/bind-github"));
    expect(res.headers.get("location")).toBe("https://novita.ai/referral");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("redirects with success result on successful bind", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ code: 200 }),
    });
    const res = await GET(
      req("https://novita.ai/api/auth/bind-github?code=abc"),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain(`${AUTH_BIND_GITHUB_RESULT}=${AUTH_RESULT_SUCCESS}`);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v1/activity/related-github",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("redirects with failed result and reason on error code", async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ code: 400, reason: "already_bound" }),
    });
    const res = await GET(
      req("https://novita.ai/api/auth/bind-github?code=abc"),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain(`${AUTH_RESULT}=${AUTH_RESULT_FAILED}`);
    expect(loc).toContain(`${AUTH_FAILED_REASON}=already_bound`);
  });

  it("redirects with failed result when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    const res = await GET(
      req("https://novita.ai/api/auth/bind-github?code=abc"),
    );
    expect(res.headers.get("location")).toContain(
      `${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );
  });
});
