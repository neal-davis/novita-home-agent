// middleware.js
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { urlMap } from "./urlRedirect";
import campaignUrls from "./config/registrationCampaignUrls";
import {
  DISABLE_IN_EN_URL,
  DISABLE_EXCLUDE_IN_EN_URL,
  STRAPI_BASE_URL,
} from "@/constants/urls";
import FUNCS, { FUNC_DISABLE_IN_EN } from "@/app/models/constants/funcs";
import { funcFilter } from "./app/models/lib/funcs";
import {
  DEFAULT_LOCALE,
  detectPreferredLocaleFromHeaders,
  getIpCountryFromHeaders,
  getLocalizedPathname,
  getLocalePathPrefix,
  getPathnameLocale,
  LOCALE_PREFERENCE_COOKIE_NAME,
  normalizeLocale,
  shouldLocalizeHref,
} from "@/i18n/config";
import {
  COOKIEBOT_ENABLED_HEADER,
  CONSENT_COOKIE_NAMES,
  isCookiebotEnabledForCountry,
  type ConsentJurisdiction,
} from "@/constants/consent";

const CONSENT_CONTEXT_COOKIE_MAX_AGE = 60 * 60 * 24;
const GPC_OPT_OUT_MAX_AGE = 60 * 60 * 24 * 365;
const GPC_OPT_OUT_DURATION_MS = GPC_OPT_OUT_MAX_AGE * 1000;
const LEGACY_LOCALE_QUERY_PARAM_NAME = "locale";

type ConsentContext = {
  cookiebotEnabled: boolean;
  gpcDetected: boolean;
  isCalifornia: boolean;
  jurisdiction: ConsentJurisdiction;
};

// regex
const regexMap = Object.keys(urlMap).map((key) => {
  const paramNames: string[] = [];
  const regex = new RegExp(
    `^${key.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    })}$`,
  );
  return { regex, target: urlMap[key], paramNames };
});

export const fetchCache = "force-no-store";
export const revalidate = 0;
export const dynamic = "force-dynamic";

function getVisitorCountry(req: NextRequest) {
  // Single source of truth for visitor country, shared with locale detection
  // (config's getIpCountryFromHeaders). Defaults to "DE" (strict opt-in) when
  // no edge geo header is present.
  return (getIpCountryFromHeaders(req.headers) || "DE").toUpperCase();
}

function getConsentContext(req: NextRequest): ConsentContext {
  const country = getVisitorCountry(req);
  const cookiebotEnabled = isCookiebotEnabledForCountry(country);

  return {
    cookiebotEnabled,
    gpcDetected: req.headers.get("sec-gpc") === "1",
    isCalifornia: country === "US",
    jurisdiction: cookiebotEnabled ? "opt-in" : "opt-out",
  };
}

function setConsentRequestHeaders(
  requestHeaders: Headers,
  consentContext: ConsentContext,
) {
  requestHeaders.set(
    COOKIEBOT_ENABLED_HEADER,
    consentContext.cookiebotEnabled ? "1" : "0",
  );
  requestHeaders.set("x-consent-jurisdiction", consentContext.jurisdiction);
  requestHeaders.set(
    "x-california-privacy",
    consentContext.isCalifornia ? "1" : "0",
  );
  requestHeaders.set("x-gpc-detected", consentContext.gpcDetected ? "1" : "0");
}

function setConsentContextCookies(
  req: NextRequest,
  response: NextResponse,
  consentContext: ConsentContext,
) {
  response.cookies.set(
    CONSENT_COOKIE_NAMES.cookiebotEnabled,
    consentContext.cookiebotEnabled ? "1" : "0",
    {
      maxAge: CONSENT_CONTEXT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    },
  );
  response.cookies.set(
    CONSENT_COOKIE_NAMES.jurisdiction,
    consentContext.jurisdiction,
    {
      maxAge: CONSENT_CONTEXT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    },
  );
  response.cookies.set(
    CONSENT_COOKIE_NAMES.californiaPrivacy,
    consentContext.isCalifornia ? "1" : "0",
    {
      maxAge: CONSENT_CONTEXT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    },
  );
  response.cookies.set(
    CONSENT_COOKIE_NAMES.gpcDetected,
    consentContext.gpcDetected ? "1" : "0",
    {
      maxAge: CONSENT_CONTEXT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    },
  );

  if (consentContext.gpcDetected && req.cookies.get("token")) {
    response.cookies.set(
      CONSENT_COOKIE_NAMES.gpcOptOutUntil,
      String(Date.now() + GPC_OPT_OUT_DURATION_MS),
      {
        maxAge: GPC_OPT_OUT_MAX_AGE,
        path: "/",
        sameSite: "lax",
      },
    );
  }

  return response;
}

function finalizeResponse(
  req: NextRequest,
  response: NextResponse,
  consentContext: ConsentContext,
) {
  return setConsentContextCookies(req, response, consentContext);
}

function setRequestLocale(requestHeaders: Headers, locale: string) {
  requestHeaders.set("x-locale", locale);
}

function getAppSearch(search: string) {
  if (!search) return "";

  const searchParams = new URLSearchParams(search);
  searchParams.delete(LEGACY_LOCALE_QUERY_PARAM_NAME);
  const nextSearch = searchParams.toString();

  return nextSearch ? `?${nextSearch}` : "";
}

function redirectWithoutCache(url: URL, status = 307) {
  const response = NextResponse.redirect(url, status);
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function isHtmlDocumentRequest(req: NextRequest) {
  if (req.method !== "GET") return false;
  if (req.nextUrl.searchParams.has("_rsc")) return false;

  const accepts = req.headers.get("accept")?.toLowerCase() || "";
  return accepts.split(",").some((accept) => {
    return accept.trim().startsWith("text/html");
  });
}

function getMarkdownSourcePath(pathname: string) {
  if (!pathname.endsWith(".md")) return null;
  if (pathname === "/auth.md") return null;
  if (pathname === "/docs/skill.md") return null;

  const withoutExtension = pathname.slice(0, -3);

  if (!withoutExtension || withoutExtension === "/index") {
    return "/";
  }

  return withoutExtension.endsWith("/index")
    ? withoutExtension.slice(0, -"/index".length) || "/"
    : withoutExtension;
}

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;
  const consentContext = getConsentContext(req);
  const pathLocale = getPathnameLocale(pathname);
  const businessPathname = pathLocale.pathname;
  const legacyLocaleParam = req.nextUrl.searchParams.get(
    LEGACY_LOCALE_QUERY_PARAM_NAME,
  );
  const appSearch = getAppSearch(search);

  const requestHeaders = new Headers(req.headers);
  setConsentRequestHeaders(requestHeaders, consentContext);

  if (
    legacyLocaleParam &&
    shouldLocalizeHref(`${businessPathname}${appSearch}`)
  ) {
    const url = req.nextUrl.clone();
    const legacyLocale = normalizeLocale(legacyLocaleParam);
    url.pathname = getLocalizedPathname(businessPathname, legacyLocale);
    url.search = appSearch;
    if (url.pathname !== pathname || url.search !== search) {
      return finalizeResponse(req, redirectWithoutCache(url), consentContext);
    }
  }

  if (
    pathLocale.locale &&
    pathLocale.prefix !== getLocalePathPrefix(pathLocale.locale)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = getLocalizedPathname(businessPathname, pathLocale.locale);
    return finalizeResponse(
      req,
      NextResponse.redirect(url, 308),
      consentContext,
    );
  }

  if (!pathLocale.locale && isHtmlDocumentRequest(req)) {
    const preferredLocale = detectPreferredLocaleFromHeaders(
      req.headers,
      // Manual choice persisted on locale switch (consent permitting); takes
      // precedence over the Accept-Language / IP-country heuristics.
      req.cookies.get(LOCALE_PREFERENCE_COOKIE_NAME)?.value,
    );
    const shouldRedirectToPreferredLocale =
      preferredLocale !== DEFAULT_LOCALE &&
      shouldLocalizeHref(`${businessPathname}${appSearch}`);

    if (shouldRedirectToPreferredLocale) {
      const url = req.nextUrl.clone();
      url.pathname = getLocalizedPathname(businessPathname, preferredLocale);
      url.search = appSearch;
      return finalizeResponse(req, redirectWithoutCache(url), consentContext);
    }
  }

  const locale = pathLocale.locale || DEFAULT_LOCALE;
  setRequestLocale(requestHeaders, locale);

  const isCampaign = campaignUrls.some((url) => businessPathname === url);
  const markdownSourcePath = getMarkdownSourcePath(businessPathname);

  if (req.method === "GET" && markdownSourcePath) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/markdown";
    url.search = "";
    url.searchParams.set("path", markdownSourcePath);
    if (appSearch) {
      url.searchParams.set("search", appSearch);
    }
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    return finalizeResponse(req, response, consentContext);
  }

  const acceptsMarkdown = requestHeaders
    .get("accept")
    ?.toLowerCase()
    .split(",")
    .some((accept) => accept.trim().startsWith("text/markdown"));
  const shouldServeMarkdown =
    req.method === "GET" &&
    acceptsMarkdown &&
    requestHeaders.get("x-markdown-bypass") !== "1" &&
    !businessPathname.startsWith("/api/") &&
    !businessPathname.startsWith("/_next/") &&
    !businessPathname.includes(".");

  if (shouldServeMarkdown) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/markdown";
    url.search = "";
    url.searchParams.set("path", businessPathname);
    if (appSearch) {
      url.searchParams.set("search", appSearch);
    }
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    return finalizeResponse(req, response, consentContext);
  }

  if (isCampaign) {
    const campaignSlug = isCampaign
      ? businessPathname.split("/").slice(-1)[0]
      : "";
    const url = req.nextUrl.clone();
    url.pathname = "/user/login";
    requestHeaders.set("x-search", `${campaignSlug}=1`);
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    return finalizeResponse(req, response, consentContext);
  }

  requestHeaders.set("x-pathname", businessPathname);

  if (appSearch) {
    requestHeaders.set("x-search", appSearch);
  }

  // deprecated product pages
  if (businessPathname.includes("/product/")) {
    const product = businessPathname.split("/").slice(-1)[0];

    let doRedirect = false;
    const func = Object.values(FUNCS).find((f) => f.name === product);
    if (func) {
      doRedirect = !funcFilter(func, "product");
    } else {
      if (FUNC_DISABLE_IN_EN.includes(product)) {
        doRedirect = true;
      }
    }
    if (doRedirect) {
      const response = NextResponse.redirect(
        new URL(
          pathLocale.locale
            ? getLocalizedPathname("/models/end-of-service", locale)
            : "/models/end-of-service",
          origin,
        ),
        302,
      );
      return finalizeResponse(req, response, consentContext);
    }
  }

  const isExclude = DISABLE_EXCLUDE_IN_EN_URL.some((urlPrefix) => {
    return businessPathname.indexOf(urlPrefix) > -1;
  });
  const isDisabled = DISABLE_IN_EN_URL.some((urlPrefix) => {
    return businessPathname.indexOf(urlPrefix) > -1;
  });
  if (!isExclude && isDisabled) {
    const response = NextResponse.redirect(
      new URL(
        pathLocale.locale ? getLocalizedPathname("/", locale) : "/",
        origin,
      ),
      302,
    );
    return finalizeResponse(req, response, consentContext);
  }

  // redirect
  for (const { regex, target, paramNames } of regexMap) {
    if (
      !businessPathname.includes("/model") &&
      !businessPathname.includes("/llm") &&
      businessPathname.split("/").slice(-1)[0]?.includes(".")
    ) {
      return finalizeResponse(
        req,
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
        consentContext,
      );
    }
    const match = businessPathname.match(regex);
    if (match) {
      let redirectUrl = target;
      match.slice(1).forEach((param, index) => {
        redirectUrl = redirectUrl.replace(`:${paramNames[index]}`, param);
      });
      if (pathLocale.locale) {
        redirectUrl = getLocalizedPathname(redirectUrl, locale);
      }
      // add query string
      if (appSearch) {
        redirectUrl += appSearch;
      }
      // # why not 301 ? https://www.rfc-editor.org/rfc/rfc9110.html#name-301-moved-permanently (NOTE)
      const response = NextResponse.redirect(new URL(redirectUrl, origin), 308);
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return finalizeResponse(req, response, consentContext);
    }
  }

  // proxy for strapi only use in server side render
  if (businessPathname.startsWith("/api/config")) {
    const targetUrl = `${STRAPI_BASE_URL}${businessPathname.replace(
      "/api/config",
      "",
    )}`;

    const fetchUrl = new URL(targetUrl + appSearch).toString();
    console.log("fetchUrl: ", fetchUrl);
    try {
      const response = await fetch(fetchUrl, {
        method: req.method,
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: req.body,
      });

      const responseData = await response.json();
      return finalizeResponse(
        req,
        NextResponse.json(responseData),
        consentContext,
      );
    } catch (error) {
      console.error("fetch error: ", error);
      return finalizeResponse(
        req,
        new NextResponse(null, { status: 500 }),
        consentContext,
      );
    }
  }

  // normal
  const response = pathLocale.locale
    ? NextResponse.rewrite(new URL(`${businessPathname}${appSearch}`, origin), {
        request: {
          headers: requestHeaders,
        },
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
  return finalizeResponse(req, response, consentContext);
}

export const config = {
  // Skip static assets: without a matcher the middleware (and its consent
  // Set-Cookie headers, which many CDNs treat as uncacheable) runs on every
  // _next chunk, image and font request. Extensionless app/RSC routes and
  // .md paths (markdown rewrite) still go through. Model slugs with version
  // dots (e.g. /llm/deepseek-v3.1) stay matched because their trailing
  // dot-suffix starts with a digit, not a letter.
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|map|txt|xml|json|woff2?|ttf|otf|eot|mp[34]|webm|mov|pdf|zip|gz|wasm)$).*)",
  ],
};
