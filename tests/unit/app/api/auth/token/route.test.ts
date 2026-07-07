/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/lib/utils/url", () => ({
  isWhitelistedRedirectUrl: jest.fn((url: string) => url.includes("novita.ai")),
}));

const { cookies } = require("next/headers");
const { GET } = require("@/app/api/auth/token/route");
const {
  AUTH_RESULT,
  AUTH_RESULT_SUCCESS,
  AUTH_IS_NEW_REGISTER,
} = require("@/constants/auth");

const mockCookies = cookies as jest.Mock;

function makeCookieStore() {
  return { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
}

function req(url: string) {
  return { url } as Request;
}

describe("api/auth/token route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockReturnValue(makeCookieStore());
  });

  it("redirects to origin when token is missing", async () => {
    const res = await GET(req("https://novita.ai/api/auth/token"));
    expect(res.headers.get("location")).toBe("https://novita.ai/");
  });

  it("sets cookie and redirects to console by default", async () => {
    const store = makeCookieStore();
    mockCookies.mockReturnValue(store);
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&is_reg=true"),
    );
    expect(store.set).toHaveBeenCalledWith("token", "tok", {
      maxAge: 60 * 60 * 24 * 7,
    });
    const loc = res.headers.get("location");
    expect(loc).toContain("/console");
    expect(loc).toContain(`${AUTH_RESULT}=${AUTH_RESULT_SUCCESS}`);
    expect(loc).toContain(`${AUTH_IS_NEW_REGISTER}=true`);
  });

  it("redirects to team-invite when invite_token present", async () => {
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&invite_token=inv"),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain("/team-invite");
    expect(loc).toContain("token=inv");
  });

  it("honors a whitelisted absolute redirect", async () => {
    const res = await GET(
      req(
        "https://novita.ai/api/auth/token?token=tok&redirect=" +
          encodeURIComponent("https://app.novita.ai/dashboard"),
      ),
    );
    expect(res.headers.get("location")).toContain(
      "https://app.novita.ai/dashboard",
    );
  });

  it("falls back to console for a non-whitelisted absolute redirect", async () => {
    const res = await GET(
      req(
        "https://novita.ai/api/auth/token?token=tok&redirect=" +
          encodeURIComponent("https://evil.example.com/x"),
      ),
    );
    expect(res.headers.get("location")).toContain("/console");
  });

  it("honors a relative redirect path", async () => {
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&redirect=/settings"),
    );
    expect(res.headers.get("location")).toContain("/settings");
  });
});
