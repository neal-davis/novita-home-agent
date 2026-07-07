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

Object.assign(global, {
  TextDecoder,
  TextEncoder,
});

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

describe("auth callback route", () => {
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

  it("redirects to origin when auth params are missing or Hugging Face state mismatches", async () => {
    mockCookies.mockReturnValue(makeCookieStore());
    const missingResponse = await GET(request("https://novita.ai/api/auth"));
    expect(missingResponse.headers.get("location")).toBe("https://novita.ai/");

    mockCookies.mockReturnValue(
      makeCookieStore({
        [AUTH_TYPE]: AUTH_TYPE_HUGGINGFACE,
        [AUTH_STATE]: "expected",
      }),
    );
    const mismatchResponse = await GET(
      request("https://novita.ai/api/auth?code=abc&state=actual"),
    );
    expect(mismatchResponse.headers.get("location")).toBe("https://novita.ai/");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns failed auth redirect for unknown auth types and failed upstream responses", async () => {
    mockCookies.mockReturnValue(makeCookieStore({ [AUTH_TYPE]: "unknown" }));

    const unknownResponse = await GET(
      request("https://novita.ai/api/auth?code=abc"),
    );
    expect(unknownResponse.headers.get("location")).toBe(
      `https://novita.ai/?${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );

    mockCookies.mockReturnValue(
      makeCookieStore({ [AUTH_TYPE]: AUTH_TYPE_GITHUB }),
    );
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });
    const failedResponse = await GET(
      request("https://novita.ai/api/auth?code=abc"),
    );
    expect(failedResponse.headers.get("location")).toBe(
      `https://novita.ai/?${AUTH_RESULT}=${AUTH_RESULT_FAILED}`,
    );
  });

  it("posts auth form data and redirects successful login to console", async () => {
    const cookieStore = makeCookieStore({
      [AUTH_TYPE]: AUTH_TYPE_GOOGLE,
      [AUTH_CB_URL_KEY]: encodeURIComponent("/console"),
      source: "ad",
      utm_campaign: "launch",
      campaign_code: "CAMP",
    });
    mockCookies.mockReturnValue(cookieStore);

    const response = await GET(request("https://novita.ai/api/auth?code=abc"));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v1/user/googleAuth",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual(
      expect.objectContaining({
        code: "abc",
        source: "ad",
        campaignName: "launch",
        fromInviteCode: "CAMP",
        redirectUrl: "/console",
        verify_code: "website_verify1234",
      }),
    );
    expect(cookieStore.set).toHaveBeenCalledWith("token", "token-1", {
      maxAge: 60 * 60 * 24 * 7,
      domain: ".novita.ai",
    });
    expect(response.headers.get("location")).toBe(
      `https://novita.ai//console?${AUTH_RESULT}=${AUTH_RESULT_SUCCESS}&is_reg=true`,
    );
  });

  it("redirects invite-token logins to team invite and clears the invite cookie", async () => {
    const cookieStore = makeCookieStore({
      [AUTH_TYPE]: AUTH_TYPE_GOOGLE,
      invite_token: "invite-1",
    });
    mockCookies.mockReturnValue(cookieStore);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "token-2", isReg: "false" }),
    });

    const response = await GET(request("https://novita.ai/api/auth?code=abc"));

    expect(response.headers.get("location")).toBe(
      `https://novita.ai//team-invite?token=invite-1&${AUTH_RESULT}=${AUTH_RESULT_SUCCESS}&is_reg=false`,
    );
    expect(cookieStore.delete).toHaveBeenCalledWith("invite_token");
  });

  it("redirects unified auth relay states to the relay token endpoint", async () => {
    const state = encodedState({
      origin: "https://relay.example.test",
      authType: AUTH_TYPE_GITHUB,
      redirectUrl: "/models",
      inviteToken: "invite-state",
    });
    const cookieStore = makeCookieStore();
    mockCookies.mockReturnValue(cookieStore);

    const response = await GET(
      request(`https://novita.ai/api/auth?code=abc&state=${state}`),
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v2/user/githubAuth",
      expect.any(Object),
    );
    expect(response.headers.get("location")).toBe(
      "https://relay.example.test/api/auth/token?token=token-1&is_reg=true&invite_token=invite-state",
    );
    expect(cookieStore.set).not.toHaveBeenCalledWith(
      "token",
      expect.any(String),
      expect.any(Object),
    );
  });

  it("uses preview API origin for test environment state origins", async () => {
    const state = encodedState({
      origin: "https://preview.novita.ai",
      authType: AUTH_TYPE_GOOGLE,
    });
    mockCookies.mockReturnValue(makeCookieStore());

    await GET(request(`https://novita.ai/api/auth?code=abc&state=${state}`));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://preview-api.example.test/v1/user/googleAuth",
      expect.any(Object),
    );
  });
});
