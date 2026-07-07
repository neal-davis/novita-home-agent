import {
  getCookiebotRegionMode,
  isCookiebotEnabledForCountry,
} from "@/constants/consent";

describe("cookiebot region helpers", () => {
  const original = process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE;
  afterEach(() => {
    process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = original;
  });

  describe("getCookiebotRegionMode", () => {
    it.each(["global", "disabled", "eu-only"])(
      "returns the explicit mode %s",
      (mode) => {
        process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = mode;
        expect(getCookiebotRegionMode()).toBe(mode);
      },
    );
    it("defaults to global for an unrecognized value", () => {
      process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = "nonsense";
      expect(getCookiebotRegionMode()).toBe("global");
    });
  });

  describe("isCookiebotEnabledForCountry", () => {
    it("is enabled everywhere in global mode", () => {
      process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = "global";
      expect(isCookiebotEnabledForCountry("US")).toBe(true);
    });
    it("is disabled everywhere in disabled mode", () => {
      process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = "disabled";
      expect(isCookiebotEnabledForCountry("DE")).toBe(false);
    });
    it("enables only EEA + GB + CH in eu-only mode", () => {
      process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE = "eu-only";
      expect(isCookiebotEnabledForCountry("de")).toBe(true);
      expect(isCookiebotEnabledForCountry("gb")).toBe(true);
      expect(isCookiebotEnabledForCountry("ch")).toBe(true);
      expect(isCookiebotEnabledForCountry("us")).toBe(false);
    });
  });
});
