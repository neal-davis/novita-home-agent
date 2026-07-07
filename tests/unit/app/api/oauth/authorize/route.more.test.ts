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
  "https://novita.ai/api/oauth/authorize?client_id=c1&redirect_uri=https%3A%2F%2Fapp%2Fcb&response_type=code&state=st&scope=read";

describe("api/oauth/authorize route — additional branches", () => {
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

  it("forwards optional state and scope params in the upstream query string", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      json: jest.fn().mockResolvedValue({ ok: true }),
    });
    await GET(req(FULL));
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("state=st");
    expect(calledUrl).toContain("scope=read");
  });

  it("returns the raw text body when the response is not JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers({ "Content-Type": "text/html" }),
      json: jest.fn().mockRejectedValue(new Error("not json")),
      text: jest.fn().mockResolvedValue("<html>hi</html>"),
    });
    const res = await GET(req(FULL));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html");
    await expect(res.text()).resolves.toBe("<html>hi</html>");
  });

  it("falls through to JSON parsing when a 301 carries no Location header", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 301,
      headers: new Headers(), // no Location
      json: jest.fn().mockResolvedValue({ ok: "no-location" }),
    });
    const res = await GET(req(FULL));
    expect(res.status).toBe(301);
    await expect(res.json()).resolves.toEqual({ ok: "no-location" });
  });
});
