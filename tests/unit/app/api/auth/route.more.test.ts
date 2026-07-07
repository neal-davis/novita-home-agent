/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "verify1234"),
}));

jest.mock("@/lib/utils/url", () => ({
  isTestEnvironmentOrigin: jest.fn((origin: string) =>
    origin.includes("preview"),
  ),
  isUnifiedAuthRelayOrigin: jest.fn(
    (origin: string) => origin === "https://relay.example.test",
  ),
  isWhitelistedRedirectUrl: jest.fn((url: string) => url.includes("novita.ai")),
}));

const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });

const {
  Headers: UndiciHeaders,
  Request: UndiciRequest,
  Response: UndiciResponse,
} = require("undici");
Object.assign(global, {
  Headers: UndiciHeaders,
  Request: UndiciRequest,
  Response: UndiciResponse,
});

process.env.NEXT_PUBLIC_BASE_URL = "https://api.example.test";
process.env.NEXT_PUBLIC_PREVIEW_BASE_URL = "https://preview-api.example.test";

const { cookies } = require("next/headers");
const { GET } = require("@/app/api/auth/route");
const {
  AUTH_CB_URL_KEY,
  AUTH_RESULT,
  AUTH_RESULT_FAILED,
  AUTH_RESULT_SUCCESS,
  AUTH_STATE,
  AUTH_TYPE,
  AUTH_TYPE_GITHUB,
  AUTH_TYPE_GOOGLE,
  AUTH_TYPE_HUGGINGFACE,
} = require("@/constants/auth");

const mockCookies = cookies as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

type CookieRecord = Record<string, string | undefined>;

function makeCookieStore(initial: CookieRecord = {}) {
  return {
    get: jest.fn((name: string) =>
      initial[name] === undefined ? undefined : { value: initial[name] },
    ),
    set: jest.fn(),
    delete: jest.fn(),
  };
}

function request(url: string) {
  return { url } as Request;
}

function encodedState(state: Record<string, unknown>) {
  return btoa(JSON.stringify(state));
}

describe("auth callback route (additional branches)", () => {
  let mockConsoleInfo: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "https://api.example.test";
    process.env.NEXT_PUBLIC_PREVIEW_BASE_URL =
      "https://preview-api.example.test";
    mockConsoleInfo = jest.spyOn(console, "info").mockImplementation();
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "token-1", isReg: "true" }),
    });
  });

  afterEach(() => {
    mockConsoleInfo.mockRestore();
    mockConsoleError.mockRestore();
  });

  it("hits the huggingface endpoint when state matches the stored auth state", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({
        [AUTH_TYPE]: AUTH_TYPE_HUGGINGFACE,
        [AUTH_STATE]: "matchme",
      }),
    );
    const res = await GET(
      request("https://novita.ai/api/auth?code=abc&state=matchme"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v1/user/huggingfaceAuth",
      expect.any(Object),
    );
    expect(res.headers.get("location")).toContain("/console");
  });

  it("hits the github endpoint via cookie auth type", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({ [AUTH_TYPE]: AUTH_TYPE_GITHUB }),
    );
    await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v2/user/githubAuth",
      expect.any(Object),
    );
  });

  it("appends is_reg=false to the default console redirect when isReg is not 'true'", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({ [AUTH_TYPE]: AUTH_TYPE_GOOGLE }),
    );
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "t", isReg: "false" }),
    });
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    const loc = res.headers.get("location");
    expect(loc).toContain("/console");
    expect(loc).toContain(`${AUTH_RESULT}=${AUTH_RESULT_SUCCESS}`);
    expect(loc).toContain("is_reg=false");
  });

  it("falls back to console when an absolute redirect cookie is not whitelisted", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({
        [AUTH_TYPE]: AUTH_TYPE_GOOGLE,
        redirect: "https://evil.example.com/steal",
      }),
    );
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toContain("/console");
  });

  it("honors a whitelisted absolute redirect cookie", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({
        [AUTH_TYPE]: AUTH_TYPE_GOOGLE,
        redirect: "https://app.novita.ai/dashboard",
      }),
    );
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toContain(
      "https://app.novita.ai/dashboard",
    );
  });

  it("honors a relative redirect cookie path", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({
        [AUTH_TYPE]: AUTH_TYPE_GOOGLE,
        redirect: "settings/profile",
      }),
    );
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toContain("/settings/profile");
  });

  it("adds redirect (not invite) to the relay token url when no invite token exists", async () => {
    const state = encodedState({
      origin: "https://relay.example.test",
      authType: AUTH_TYPE_GOOGLE,
      redirectUrl: "/models",
    });
    mockCookies.mockReturnValue(makeCookieStore());
    const res = await GET(
      request(`https://novita.ai/api/auth?code=abc&state=${state}`),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain("https://relay.example.test/api/auth/token");
    expect(loc).toContain("redirect=%2Fmodels");
    expect(loc).not.toContain("invite_token");
  });

  it("does not append redirect to the relay url when redirectUrl is '/'", async () => {
    const state = encodedState({
      origin: "https://relay.example.test",
      authType: AUTH_TYPE_GOOGLE,
      redirectUrl: "/",
    });
    mockCookies.mockReturnValue(makeCookieStore());
    const res = await GET(
      request(`https://novita.ai/api/auth?code=abc&state=${state}`),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain("https://relay.example.test/api/auth/token");
    expect(loc).not.toContain("redirect=");
  });

  it("uses the state callbackUrl when no auth callback cookie is set", async () => {
    const state = encodedState({
      authType: AUTH_TYPE_GOOGLE,
      callbackUrl: "/from-state",
    });
    mockCookies.mockReturnValue(makeCookieStore());
    await GET(request(`https://novita.ai/api/auth?code=abc&state=${state}`));
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.redirectUrl).toBe("/from-state");
  });

  it("logs and redirects as failed when the upstream auth response has no token", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({ [AUTH_TYPE]: AUTH_TYPE_GOOGLE }),
    );
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ isReg: "true" }),
    });
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toBe(
      `https://novita.ai/?${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );
  });

  it("logs and redirects as failed when the upstream fetch rejects", async () => {
    mockCookies.mockReturnValue(
      makeCookieStore({ [AUTH_TYPE]: AUTH_TYPE_GOOGLE }),
    );
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toBe(
      `https://novita.ai/?${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Auth request error:",
      expect.any(Error),
    );
  });

  it("falls back to the error redirect when an unexpected error is thrown inside the handler", async () => {
    // cookies() throwing forces the outer try/catch path
    mockCookies.mockImplementationOnce(() => {
      throw new Error("cookie store blew up");
    });
    const res = await GET(request("https://novita.ai/api/auth?code=abc"));
    expect(res.headers.get("location")).toBe(
      `https://novita.ai/?${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Unexpected error in auth handler:",
      expect.any(Error),
    );
  });

  it("uses preview API origin for github when the state origin is a test environment", async () => {
    const state = encodedState({
      origin: "https://preview.novita.ai",
      authType: AUTH_TYPE_GITHUB,
    });
    mockCookies.mockReturnValue(makeCookieStore());
    await GET(request(`https://novita.ai/api/auth?code=abc&state=${state}`));
    expect(mockFetch).toHaveBeenCalledWith(
      "https://preview-api.example.test/v2/user/githubAuth",
      expect.any(Object),
    );
  });
});
