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

describe("api/auth/token route — additional branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockReturnValue(makeCookieStore());
  });

  it("prefixes a slash onto a relative redirect that omits it", async () => {
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&redirect=settings"),
    );
    expect(res.headers.get("location")).toContain("/settings");
  });

  it("omits is_reg from the redirect when not provided", async () => {
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&redirect=/dash"),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain("/dash");
    expect(loc).toContain(`${AUTH_RESULT}=${AUTH_RESULT_SUCCESS}`);
    expect(loc).not.toContain(AUTH_IS_NEW_REGISTER);
  });

  it("ignores a redirect equal to '/' and goes to console", async () => {
    const res = await GET(
      req("https://novita.ai/api/auth/token?token=tok&redirect=/"),
    );
    expect(res.headers.get("location")).toContain("/console");
  });

  it("falls back to console for a non-whitelisted absolute redirect and keeps is_reg", async () => {
    const res = await GET(
      req(
        "https://novita.ai/api/auth/token?token=tok&is_reg=false&redirect=" +
          encodeURIComponent("https://evil.example.com/x"),
      ),
    );
    const loc = res.headers.get("location");
    expect(loc).toContain("/console");
    expect(loc).toContain(`${AUTH_IS_NEW_REGISTER}=false`);
  });
});
