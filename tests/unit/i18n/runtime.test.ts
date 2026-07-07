import {
  __t,
  getI18nLocale,
  getI18nMessages,
  setI18nMessages,
} from "@/i18n/runtime";

describe("i18n runtime", () => {
  afterEach(() => {
    // reset to default
    setI18nMessages({ locale: "en", messages: {}, fallbackMessages: {} });
  });

  it("sets and reads locale + messages", () => {
    setI18nMessages({
      locale: "fr",
      messages: { greeting: "Bonjour" },
      fallbackMessages: { greeting: "Hello" },
    });
    expect(getI18nLocale()).toBe("fr");
    expect(getI18nMessages()).toEqual({ greeting: "Bonjour" });
    expect(document.documentElement.lang).toBe("fr");
    expect(window.__NOVITA_I18N__?.locale).toBe("fr");
  });

  it("normalizes an unsupported locale to the default", () => {
    setI18nMessages({ locale: "xx", messages: {}, fallbackMessages: {} });
    expect(getI18nLocale()).toBe("en");
  });

  it("falls back to empty objects when messages omitted", () => {
    setI18nMessages({ locale: "de" } as never);
    expect(getI18nMessages()).toEqual({});
  });

  describe("__t", () => {
    beforeEach(() => {
      setI18nMessages({
        locale: "fr",
        messages: { hi: "Salut {name}" },
        fallbackMessages: { bye: "Au revoir" },
      });
    });

    it("returns the active message", () => {
      expect(__t("hi", "fallback")).toBe("Salut {name}");
    });

    it("interpolates named params", () => {
      expect(__t("hi", "fallback", { name: "Bob" })).toBe("Salut Bob");
    });

    it("leaves unmatched placeholders intact", () => {
      expect(__t("hi", "fallback", { other: "x" })).toBe("Salut {name}");
    });

    it("uses fallbackMessages when the key is not in messages", () => {
      expect(__t("bye", "default")).toBe("Au revoir");
    });

    it("uses the inline fallback when neither catalog has the key", () => {
      expect(__t("missing", "Inline default")).toBe("Inline default");
    });
  });
});
