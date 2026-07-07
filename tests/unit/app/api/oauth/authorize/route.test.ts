/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/api/api", () => ({
  service_base_url: "https://api.example.test",
}));

process.env.NEXT_PUBLIC_SITE_URL = "https://novita.ai";

const { cookies } = require("next/headers");
const { GET } = require("@/app/api/oauth/authorize/route");

const mockCookies = cookies as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

function req(url: string) {
  const u = new URL(url);
  return { nextUrl: { searchParams: u.searchParams } } as any;
}

const FULL =
  "https://novita.ai/api/oauth/authorize?client_id=c1&redirect_uri=https%3A%2F%2Fapp%2Fcb&response_type=code&client_name=App";

describe("api/oauth/authorize route", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
    mockCookies.mockReturnValue({ get: jest.fn(() => ({ value: "tok" })) });
  });
  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("returns 400 when required params are missing", async () => {
    const res = await GET(
      req("https://novita.ai/api/oauth/authorize?client_id=c1"),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Missing required parameters",
    });
  });

  it("returns 401 when no token cookie is present", async () => {
    mockCookies.mockReturnValue({ get: jest.fn(() => undefined) });
    const res = await GET(req(FULL));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Not authenticated" });
  });

  it("redirects to the success page on an upstream 302", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 302,
      headers: new Headers({ Location: "https://app/cb?code=xyz" }),
    });
    const res = await GET(req(FULL));
    expect(res.headers.get("location")).toContain("?redirect=");
    expect(res.headers.get("location")).toContain("client_name=App");
  });

  it("redirects to success page when JSON body carries redirect_url", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      json: jest.fn().mockResolvedValue({ redirect_url: "https://app/done" }),
    });
    const res = await GET(req(FULL));
    expect(res.headers.get("location")).toContain("?redirect=");
  });

  it("returns the raw JSON body when there is no redirect_url", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      json: jest.fn().mockResolvedValue({ ok: true }),
    });
    const res = await GET(req(FULL));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("returns 500 when the upstream call throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("net"));
    const res = await GET(req(FULL));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Failed to process authorization request",
    });
  });
});
