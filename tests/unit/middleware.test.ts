/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock("@/constants/urls", () => ({
  DISABLE_EXCLUDE_IN_EN_URL: ["/disabled/allowed"],
  DISABLE_IN_EN_URL: ["/disabled"],
  STRAPI_BASE_URL: "https://strapi.example.test",
}));

jest.mock("@/config/registrationCampaignUrls", () => ["/campaign/welcome"]);

jest.mock("@/urlRedirect", () => ({
  urlMap: {
    "/old/:slug": "/new/:slug",
  },
}));

jest.mock("@/app/models/constants/funcs", () => ({
  __esModule: true,
  default: {
    txt2img: { name: "legacy-product" },
  },
  FUNC_DISABLE_IN_EN: ["disabled-product"],
}));

jest.mock("@/app/models/lib/funcs", () => ({
  funcFilter: jest.fn(() => false),
}));

jest.mock("@/i18n/config", () => ({
  DEFAULT_LOCALE: "en",
  LOCALE_PREFERENCE_COOKIE_NAME: "novita_preferred_locale",
  detectPreferredLocaleFromHeaders: jest.fn(
    (headers: Headers) => headers.get("x-preferred-locale") || "en",
  ),
  getIpCountryFromHeaders: jest.fn((headers: Headers) =>
    headers.get("x-vercel-ip-country"),
  ),
  getLocalizedPathname: jest.fn((pathname: string, locale: string) =>
    locale === "en"
      ? pathname
      : `/${locale}${pathname === "/" ? "" : pathname}`,
  ),
  getLocalePathPrefix: jest.fn((locale: string) =>
    locale === "en" ? "" : locale,
  ),
  getPathnameLocale: jest.fn((pathname: string) => {
    const match = pathname.match(/^\/(de|fr)(\/.*)?$/);
    if (!match) {
      return { locale: null, pathname, prefix: null };
    }
    return {
      locale: match[1],
      pathname: match[2] || "/",
      prefix: match[1],
    };
  }),
  normalizeLocale: jest.fn((locale?: string | null) => locale || "en"),
  shouldLocalizeHref: jest.fn((href: string) => !href.startsWith("/api")),
}));

jest.mock("@/constants/consent", () => ({
  COOKIEBOT_ENABLED_HEADER: "x-cookiebot-enabled",
  CONSENT_COOKIE_NAMES: {
    californiaPrivacy: "california-privacy",
    cookiebotEnabled: "cookiebot-enabled",
    gpcDetected: "gpc-detected",
    gpcOptOutUntil: "gpc-opt-out-until",
    jurisdiction: "consent-jurisdiction",
  },
  isCookiebotEnabledForCountry: jest.fn((country: string) => country === "DE"),
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

const { NextRequest } = require("next/server");
const { middleware } = require("@/middleware");

const mockFetch = global.fetch as jest.Mock;

function request(path: string, init?: RequestInit) {
  return new NextRequest(`https://novita.test${path}`, {
    method: init?.method || "GET",
    headers: init?.headers,
    body: init?.body,
  });
}

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ ok: true }),
    });
  });

  it("redirects legacy locale query params and removes locale from search", async () => {
    const response = await middleware(
      request("/models?locale=de&foo=bar", {
        headers: { accept: "text/html", "x-vercel-ip-country": "DE" },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://novita.test/de/models?foo=bar",
    );
    expect(response.headers.get("Cache-Control")).toBe(
      "no-cache, no-store, must-revalidate",
    );
    expect(response.cookies.get("cookiebot-enabled")?.value).toBe("1");
  });

  it("rewrites markdown source requests with consent request headers", async () => {
    const response = await middleware(
      request("/guide.md?utm=campaign", {
        headers: {
          accept: "text/html",
          "sec-gpc": "1",
          "x-vercel-ip-country": "US",
          cookie: "token=abc",
        },
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://novita.test/api/markdown?path=%2Fguide&search=%3Futm%3Dcampaign",
    );
    expect(response.cookies.get("california-privacy")?.value).toBe("1");
    expect(response.cookies.get("gpc-detected")?.value).toBe("1");
    expect(response.cookies.get("gpc-opt-out-until")?.value).toEqual(
      expect.any(String),
    );
  });

  it("rewrites campaign URLs to login and preserves campaign slug in request headers", async () => {
    const response = await middleware(
      request("/campaign/welcome", {
        headers: { accept: "text/html" },
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://novita.test/user/login",
    );
  });

  it("redirects deprecated product and disabled English routes", async () => {
    const productResponse = await middleware(
      request("/product/legacy-product", {
        headers: { accept: "text/html" },
      }),
    );
    expect(productResponse.status).toBe(302);
    expect(productResponse.headers.get("location")).toBe(
      "https://novita.test/models/end-of-service",
    );

    const disabledResponse = await middleware(
      request("/disabled/path", {
        headers: { accept: "text/html" },
      }),
    );
    expect(disabledResponse.status).toBe(302);
    expect(disabledResponse.headers.get("location")).toBe(
      "https://novita.test/",
    );
  });

  it("redirects urlMap matches and preserves query parameters", async () => {
    const response = await middleware(
      request("/old/demo?x=1", {
        headers: { accept: "text/html" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://novita.test/new/demo?x=1",
    );
  });

  it("proxies Strapi config requests and returns 500 when fetch fails", async () => {
    const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

    const successResponse = await middleware(
      request("/api/config/banner?limit=1", {
        method: "POST",
        body: JSON.stringify({ filter: true }),
      }),
    );
    await expect(successResponse.json()).resolves.toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://strapi.example.test/banner?limit=1",
      expect.objectContaining({
        method: "POST",
        mode: "cors",
      }),
    );

    mockFetch.mockRejectedValueOnce(new Error("network"));
    const failedResponse = await middleware(request("/api/config/banner"));
    expect(failedResponse.status).toBe(500);

    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it("passes normal localized requests through as rewrites", async () => {
    const response = await middleware(
      request("/de/models?foo=bar", {
        headers: { accept: "text/html" },
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://novita.test/models?foo=bar",
    );
  });
});
