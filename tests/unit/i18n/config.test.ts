import {
  detectLocaleFromCountry,
  detectPreferredLocale,
  detectPreferredLocaleFromHeaders,
  detectSupportedLocaleFromAcceptLanguage,
  getLocalizedPath,
  getLocalizedPathname,
  getLocaleFromPathPrefix,
  getPathnameLocale,
  getPathnameWithoutLocale,
  normalizeLocale,
  shouldLocalizeHref,
} from "@/i18n/config";

const chinesePrefix = ["z", "h"].join("");

describe("i18n locale path helpers", () => {
  it("normalizes supported locale aliases", () => {
    expect(normalizeLocale(chinesePrefix)).toBe("zh-CN");
    expect(normalizeLocale("cn")).toBe("zh-CN");
    expect(normalizeLocale("jp")).toBe("ja");
    expect(normalizeLocale("pt")).toBe("pt-BR");
  });

  it("parses locale prefixes from pathnames", () => {
    expect(getPathnameLocale("/en/models")).toEqual({
      locale: "en",
      pathname: "/models",
      prefix: "en",
    });
    expect(getPathnameLocale("/zh/models")).toEqual({
      locale: "zh-CN",
      pathname: "/models",
      prefix: chinesePrefix,
    });
    expect(getPathnameLocale("/ja")).toEqual({
      locale: "ja",
      pathname: "/",
      prefix: "ja",
    });
    expect(getPathnameLocale("/pt-BR/pricing")).toEqual({
      locale: "pt-BR",
      pathname: "/pricing",
      prefix: "pt-BR",
    });
  });

  it("returns null for non-locale first segments", () => {
    expect(getLocaleFromPathPrefix("models")).toBeNull();
    expect(getPathnameWithoutLocale("/models/llm")).toBe("/models/llm");
  });

  it("builds short localized pathnames", () => {
    expect(getLocalizedPathname("/", "en")).toBe("/");
    expect(getLocalizedPathname("/models", "en")).toBe("/models");
    expect(getLocalizedPathname("/", "zh-CN")).toBe("/zh");
    expect(getLocalizedPathname("/models", "ja")).toBe("/ja/models");
    expect(getLocalizedPathname("/zh/models", "en")).toBe("/models");
    expect(getLocalizedPathname("/en/models", "en")).toBe("/models");
    expect(getLocalizedPathname("/pt-BR/pricing", "pt-BR")).toBe("/pt/pricing");
  });

  it("preserves query strings and hashes when localizing hrefs", () => {
    expect(getLocalizedPath("/models?type=llm#top", "ja")).toBe(
      "/ja/models?type=llm#top",
    );
    expect(getLocalizedPath("/zh/models?provider=OpenAI", "fr")).toBe(
      "/fr/models?provider=OpenAI",
    );
    expect(getLocalizedPath("/fr/models?provider=OpenAI", "en")).toBe(
      "/models?provider=OpenAI",
    );
  });

  it("does not localize external, docs, api, next or asset hrefs", () => {
    expect(shouldLocalizeHref("https://novita.ai")).toBe(false);
    expect(shouldLocalizeHref("mailto:support@novita.ai")).toBe(false);
    expect(shouldLocalizeHref("/docs/guides/introduction")).toBe(false);
    expect(shouldLocalizeHref("/api/config/foo")).toBe(false);
    expect(shouldLocalizeHref("/_next/static/app.js")).toBe(false);
    expect(shouldLocalizeHref("/logo/logo.svg")).toBe(false);
    expect(shouldLocalizeHref("/sitemap.xml")).toBe(false);
    expect(shouldLocalizeHref("/auth.md")).toBe(false);
    expect(shouldLocalizeHref("/archive.tar.gz")).toBe(false);
  });

  it("localizes model routes whose slugs contain version dots", () => {
    expect(shouldLocalizeHref("/llm/deepseek-v3.1")).toBe(true);
    expect(shouldLocalizeHref("/models/qwen-2.5-72b-instruct")).toBe(true);
    expect(shouldLocalizeHref("/llm/meta-llama-llama-3.1-8b?tab=api")).toBe(
      true,
    );
    expect(getLocalizedPath("/llm/deepseek-v3.1", "ja")).toBe(
      "/ja/llm/deepseek-v3.1",
    );
  });
});

describe("i18n locale detection", () => {
  it("detects supported browser locale aliases and language families", () => {
    expect(detectSupportedLocaleFromAcceptLanguage("ja-JP, en;q=0.8")).toBe(
      "ja",
    );
    expect(detectSupportedLocaleFromAcceptLanguage("fr-CA, en;q=0.8")).toBe(
      "fr",
    );
    expect(detectSupportedLocaleFromAcceptLanguage("pt-PT")).toBe("pt-BR");
  });

  it("honors Accept-Language q priority and ignores disabled languages", () => {
    expect(
      detectSupportedLocaleFromAcceptLanguage("fr-FR;q=0.5, de-DE;q=0.9"),
    ).toBe("de");
    expect(detectSupportedLocaleFromAcceptLanguage("fr-FR;q=0")).toBeNull();
    expect(detectSupportedLocaleFromAcceptLanguage("ko-KR")).toBeNull();
  });

  it("uses browser locale before IP country locale", () => {
    expect(
      detectPreferredLocale({
        acceptLanguage: "fr-CA, fr;q=0.9",
        country: "JP",
      }),
    ).toBe("fr");
  });

  it("uses IP country locale when browser locale is unsupported", () => {
    expect(
      detectPreferredLocale({
        acceptLanguage: "ko-KR, ko;q=0.9",
        country: "JP",
      }),
    ).toBe("ja");
    expect(detectLocaleFromCountry("BR")).toBe("pt-BR");
  });

  it("falls back to English when browser and IP do not match", () => {
    expect(
      detectPreferredLocale({
        acceptLanguage: "ko-KR, ko;q=0.9",
        country: "KR",
      }),
    ).toBe("en");
  });

  it("prefers the persisted cookie locale over browser and IP signals", () => {
    expect(
      detectPreferredLocale({
        acceptLanguage: "fr-CA, fr;q=0.9",
        cookieLocale: chinesePrefix + "-CN",
        country: "JP",
      }),
    ).toBe("zh-CN");
    // A manual switch to the default locale must also stick (no redirect).
    expect(
      detectPreferredLocale({
        acceptLanguage: chinesePrefix + "-CN",
        cookieLocale: "en",
        country: "CN",
      }),
    ).toBe("en");
    // Garbage cookies fall through to the heuristics.
    expect(
      detectPreferredLocale({
        acceptLanguage: "fr-CA",
        cookieLocale: "klingon",
        country: "JP",
      }),
    ).toBe("fr");
    const headers = new Headers({ "accept-language": "fr-CA" });
    expect(
      detectPreferredLocaleFromHeaders(headers, chinesePrefix + "-CN"),
    ).toBe("zh-CN");
  });

  it("detects locale from common edge country headers", () => {
    const headers = new Headers({
      "accept-language": "ko-KR, ko;q=0.9",
      "cf-ipcountry": "BR",
    });

    expect(detectPreferredLocaleFromHeaders(headers)).toBe("pt-BR");
  });
});
