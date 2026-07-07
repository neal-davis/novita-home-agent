export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = [
  "en",
  "zh-CN",
  "es",
  "pt-BR",
  "fr",
  "de",
  "ja",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  "pt-BR": "Português",
  "zh-CN": "简体中文",
};

const SHORT_CHINESE_LOCALE_PREFIX = ["z", "h"].join("");

export const LOCALE_PATH_PREFIXES: Record<Locale, string> = {
  de: "de",
  en: "",
  es: "es",
  fr: "fr",
  ja: "ja",
  "pt-BR": "pt",
  "zh-CN": SHORT_CHINESE_LOCALE_PREFIX,
};

const LOCALE_ALIASES: Record<string, Locale> = {
  cn: "zh-CN",
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  ja: "ja",
  jp: "ja",
  "pt-br": "pt-BR",
  pt: "pt-BR",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
};

const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  AD: "es",
  AR: "es",
  AT: "de",
  BO: "es",
  BR: "pt-BR",
  CL: "es",
  CN: "zh-CN",
  CO: "es",
  CR: "es",
  CU: "es",
  DE: "de",
  DO: "es",
  EC: "es",
  ES: "es",
  FR: "fr",
  GF: "fr",
  GP: "fr",
  GT: "es",
  HN: "es",
  HK: "zh-CN",
  JP: "ja",
  LI: "de",
  MC: "fr",
  MO: "zh-CN",
  MQ: "fr",
  MX: "es",
  NI: "es",
  PA: "es",
  PE: "es",
  PF: "fr",
  PR: "es",
  PT: "pt-BR",
  PY: "es",
  RE: "fr",
  SV: "es",
  TW: "zh-CN",
  UY: "es",
  VE: "es",
  YT: "fr",
};

const IP_COUNTRY_HEADER_NAMES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "fastly-client-country",
  "x-appengine-country",
  "x-country-code",
  "x-client-country",
  "x-geo-country",
] as const;

const LOCALE_PREFIX_ALIASES: Record<string, Locale> = {
  ...LOCALE_ALIASES,
  "pt-br": "pt-BR",
  "zh-cn": "zh-CN",
};

const LOCALIZED_HREF_EXCLUDED_PREFIXES = [
  "/_next",
  "/api",
  "/docs",
  "/i18n",
  "/static",
  "/.well-known",
];

/**
 * Manually chosen locale, persisted client-side only when the visitor has
 * granted the Cookiebot "preferences" category (see src/i18n/preference.ts).
 */
export const LOCALE_PREFERENCE_COOKIE_NAME = "novita_preferred_locale";

type LocaleDetectionInput = {
  acceptLanguage?: string | null;
  country?: string | null;
  cookieLocale?: string | null;
};

type HeaderGetter = {
  get(name: string): string | null;
};

function getSupportedLocaleAlias(value?: string | null): Locale | null {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;

  const exact = SUPPORTED_LOCALES.find((locale) => locale === normalized);
  if (exact) return exact;

  return LOCALE_ALIASES[normalized.toLowerCase()] || null;
}

export function normalizeLocale(value?: string | null): Locale {
  return getSupportedLocaleAlias(value) || DEFAULT_LOCALE;
}

export function getLocalePathPrefix(locale: Locale) {
  return LOCALE_PATH_PREFIXES[normalizeLocale(locale)];
}

export function getLocaleFromPathPrefix(value?: string | null): Locale | null {
  if (!value) return null;
  return LOCALE_PREFIX_ALIASES[value.trim().toLowerCase()] || null;
}

export function getPathnameLocale(pathname: string): {
  locale: Locale | null;
  pathname: string;
  prefix: string | null;
} {
  if (!pathname.startsWith("/")) {
    return {
      locale: null,
      pathname,
      prefix: null,
    };
  }

  const segments = pathname.split("/");
  const prefix = segments[1] || "";
  const locale = getLocaleFromPathPrefix(prefix);
  if (!locale) {
    return {
      locale: null,
      pathname,
      prefix: null,
    };
  }

  const rest = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
  return {
    locale,
    pathname: rest || "/",
    prefix,
  };
}

export function getPathnameWithoutLocale(pathname: string) {
  return getPathnameLocale(pathname).pathname;
}

export function getLocalizedPathname(pathname: string, locale: Locale) {
  const { pathname: unprefixedPathname } = getPathnameLocale(pathname);
  const normalizedPathname = unprefixedPathname.startsWith("/")
    ? unprefixedPathname
    : `/${unprefixedPathname}`;
  const prefix = getLocalePathPrefix(locale);

  if (!prefix) return normalizedPathname;

  return normalizedPathname === "/"
    ? `/${prefix}`
    : `/${prefix}${normalizedPathname}`;
}

// A trailing ".xml" / ".png" style suffix marks a static file. The extension
// must start with a letter: model routes legitimately contain version dots in
// their last segment (e.g. /llm/deepseek-v3.1, /models/qwen-2.5-72b) and must
// stay localizable.
const FILE_EXTENSION_PATTERN = /\.[a-z][a-z\d]*$/i;

export function shouldLocalizeHref(href?: string | null) {
  if (!href || href.startsWith("#")) return false;
  if (/^[a-z][a-z\d+\-.]*:/i.test(href)) return false;
  if (href.startsWith("//")) return false;
  if (!href.startsWith("/")) return false;
  const lastSegment = href.split(/[?#]/)[0].split("/").pop() || "";
  if (FILE_EXTENSION_PATTERN.test(lastSegment)) return false;

  return !LOCALIZED_HREF_EXCLUDED_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`),
  );
}

export function getLocalizedPath(href: string, locale: Locale) {
  if (!shouldLocalizeHref(href)) return href;

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const hrefWithoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = hrefWithoutHash.indexOf("?");
  const pathname =
    queryIndex >= 0 ? hrefWithoutHash.slice(0, queryIndex) : hrefWithoutHash;
  const search = queryIndex >= 0 ? hrefWithoutHash.slice(queryIndex) : "";

  return `${getLocalizedPathname(pathname || "/", locale)}${search}${hash}`;
}

export function isSupportedLocale(value?: string | null): value is Locale {
  if (!value) return false;

  return SUPPORTED_LOCALES.includes(value.trim() as Locale);
}

function parseAcceptLanguage(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item, order) => {
      const [tag = "", ...params] = item.split(";").map((part) => part.trim());
      const qValue = params.find((param) => /^q=/i.test(param));
      const q = qValue ? Number(qValue.slice(2)) : 1;

      return {
        order,
        q: Number.isFinite(q) ? q : 0,
        tag,
      };
    })
    .filter(({ q, tag }) => tag && tag !== "*" && q > 0)
    .sort((a, b) => b.q - a.q || a.order - b.order);
}

export function detectSupportedLocaleFromAcceptLanguage(
  value?: string | null,
): Locale | null {
  const languages = parseAcceptLanguage(value);

  for (const language of languages) {
    const locale = getSupportedLocaleAlias(language.tag);
    if (locale) {
      return locale;
    }

    const family = language.tag.split("-")[0];
    const familyLocale = getSupportedLocaleAlias(family);
    if (familyLocale) {
      return familyLocale;
    }
  }

  return null;
}

export function detectLocaleFromCountry(value?: string | null): Locale | null {
  if (!value) return null;

  const country = value.trim().split(/[,\s]/)[0]?.toUpperCase();

  if (!country || !/^[A-Z]{2}$/.test(country)) return null;

  return COUNTRY_LOCALE_MAP[country] || null;
}

export function getIpCountryFromHeaders(headers: HeaderGetter) {
  for (const headerName of IP_COUNTRY_HEADER_NAMES) {
    const country = headers.get(headerName);
    if (country) return country;
  }

  return null;
}

export function detectPreferredLocale({
  acceptLanguage,
  country,
  cookieLocale,
}: LocaleDetectionInput = {}): Locale {
  // An explicit user choice (persisted on manual switch, consent permitting)
  // beats browser/IP heuristics.
  return (
    getSupportedLocaleAlias(cookieLocale) ||
    detectSupportedLocaleFromAcceptLanguage(acceptLanguage) ||
    detectLocaleFromCountry(country) ||
    DEFAULT_LOCALE
  );
}

export function detectPreferredLocaleFromHeaders(
  headers: HeaderGetter,
  cookieLocale?: string | null,
): Locale {
  return detectPreferredLocale({
    acceptLanguage: headers.get("accept-language"),
    cookieLocale,
    country: getIpCountryFromHeaders(headers),
  });
}
