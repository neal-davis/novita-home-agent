import { render } from "@testing-library/react";
import MarketingAttributionCollector from "@/app/components/consent/MarketingAttributionCollector";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

jest.mock("@/hooks/useCookiebotConsent", () => ({
  useCookieConsent: jest.fn(),
}));

const mockConsent = useCookieConsent as jest.Mock;

function clearStorage() {
  localStorage.clear();
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

function setLocation(href: string) {
  Object.defineProperty(window, "location", {
    value: new URL(href),
    writable: true,
  });
}

describe("MarketingAttributionCollector more branches", () => {
  beforeEach(() => {
    clearStorage();
    mockConsent.mockReturnValue(true);
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });
  });

  it("stores utm_campaign cookie with numeric expiry from the last part", () => {
    setLocation("https://novita.ai/?utm_campaign=spring_30");
    render(<MarketingAttributionCollector />);
    expect(document.cookie).toContain("utm_campaign=spring_30");
    expect(localStorage.getItem("utm_campaign")).toBe("spring_30");
  });

  it("handles utm_campaign with a non-numeric last part (NaN -> 1 day)", () => {
    setLocation("https://novita.ai/?utm_campaign=spring_promo");
    render(<MarketingAttributionCollector />);
    expect(document.cookie).toContain("utm_campaign=spring_promo");
  });

  it("keeps ref out of localStorage (cookie-only) but still derives source", () => {
    setLocation("https://novita.ai/?ref=partnersite");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("ref")).toBeNull();
    // ref is the source fallback after utm_source/referrer
    expect(localStorage.getItem("source")).toBe("partnersite");
  });

  it("derives source from the referrer domain when no utm_source", () => {
    Object.defineProperty(document, "referrer", {
      value: "https://www.google.com/search",
      configurable: true,
    });
    setLocation("https://novita.ai/");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("source")).toBe("google.com");
  });

  it("does not overwrite an existing non-Direct source", () => {
    localStorage.setItem("source", "existing-source");
    setLocation("https://novita.ai/?utm_source=google");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("source")).toBe("existing-source");
  });

  it("recomputes source when the stored source is Direct", () => {
    localStorage.setItem("source", "Direct");
    setLocation("https://novita.ai/?utm_source=newsletter");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("source")).toBe("newsletter");
  });

  it("does not store source that contains the current domain", () => {
    setLocation("https://novita.ai/?utm_source=novita.ai");
    render(<MarketingAttributionCollector />);
    // source contains currentDomain -> skipped, stays null
    expect(localStorage.getItem("source")).toBeNull();
  });

  it("preserves an existing landingpage and does not overwrite it", () => {
    localStorage.setItem("landingpage", "https://novita.ai/first");
    setLocation("https://novita.ai/second");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("landingpage")).toBe("https://novita.ai/first");
  });

  it("does not store an already-present query key again", () => {
    localStorage.setItem("utm_medium", "preset");
    setLocation("https://novita.ai/?utm_medium=cpc");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("utm_medium")).toBe("preset");
  });
});
