import { getUTMParams } from "@/app/components/analytics/utils";

describe("analytics/utils getUTMParams", () => {
  it("extracts all present utm params from an explicit url", () => {
    const url =
      "https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=gpu&utm_content=ad1";
    expect(getUTMParams(url)).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
      utm_term: "gpu",
      utm_content: "ad1",
    });
  });

  it("only includes utm keys that have values and ignores others", () => {
    const url = "https://example.com/?utm_source=x&foo=bar";
    expect(getUTMParams(url)).toEqual({ utm_source: "x" });
  });

  it("returns empty object when no utm params present", () => {
    expect(getUTMParams("https://example.com/path")).toEqual({});
  });

  it("falls back to window.location.href when no url provided", () => {
    const original = window.location.href;
    Object.defineProperty(window, "location", {
      value: new URL("https://site.test/?utm_campaign=fromwindow"),
      writable: true,
    });
    expect(getUTMParams()).toEqual({ utm_campaign: "fromwindow" });
    Object.defineProperty(window, "location", {
      value: new URL(original),
      writable: true,
    });
  });
});
