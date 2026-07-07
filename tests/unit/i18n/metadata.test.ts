import {
  getLocalizedCanonicalUrl,
  getLocalizedMetadataAlternates,
} from "@/i18n/metadata";

describe("i18n metadata helpers", () => {
  it("keeps default English canonical URLs unprefixed", () => {
    expect(getLocalizedCanonicalUrl("https://novita.ai/models", "en")).toBe(
      "https://novita.ai/models",
    );
    expect(getLocalizedCanonicalUrl("/models", "en")).toBe(
      "https://novita.ai/models",
    );
  });

  it("adds locale prefixes for non-default canonical URLs", () => {
    expect(getLocalizedCanonicalUrl("https://novita.ai/models", "zh-CN")).toBe(
      "https://novita.ai/zh/models",
    );
    expect(getLocalizedCanonicalUrl("https://novita.ai/models", "pt-BR")).toBe(
      "https://novita.ai/pt/models",
    );
    expect(getLocalizedCanonicalUrl("/models?type=llm", "ja")).toBe(
      "https://novita.ai/ja/models?type=llm",
    );
  });

  it("normalizes existing locale prefixes before building canonical URLs", () => {
    expect(getLocalizedCanonicalUrl("/zh/models", "en")).toBe(
      "https://novita.ai/models",
    );
    expect(getLocalizedCanonicalUrl("/en/models", "de")).toBe(
      "https://novita.ai/de/models",
    );
    expect(getLocalizedCanonicalUrl("/pt-BR/pricing", "pt-BR")).toBe(
      "https://novita.ai/pt/pricing",
    );
  });

  it("builds canonical and hreflang alternates", () => {
    expect(getLocalizedMetadataAlternates("/gpus", "fr")).toEqual({
      canonical: "https://novita.ai/fr/gpus",
      languages: {
        de: "https://novita.ai/de/gpus",
        en: "https://novita.ai/gpus",
        es: "https://novita.ai/es/gpus",
        fr: "https://novita.ai/fr/gpus",
        ja: "https://novita.ai/ja/gpus",
        "pt-BR": "https://novita.ai/pt/gpus",
        "x-default": "https://novita.ai/gpus",
        "zh-CN": "https://novita.ai/zh/gpus",
      },
    });
  });

  it("leaves external canonical URLs untouched", () => {
    expect(
      getLocalizedCanonicalUrl("https://docs.novita.ai/reference", "zh-CN"),
    ).toBe("https://docs.novita.ai/reference");
  });
});
