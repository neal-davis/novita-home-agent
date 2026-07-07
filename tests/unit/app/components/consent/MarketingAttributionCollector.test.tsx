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

describe("MarketingAttributionCollector", () => {
  beforeEach(() => {
    clearStorage();
    Object.defineProperty(document, "referrer", {
      value: "",
      configurable: true,
    });
  });

  it("does not collect attribution without marketing consent", () => {
    mockConsent.mockReturnValue(false);
    setLocation("https://novita.ai/?utm_source=google");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("utm_source")).toBeNull();
  });

  it("persists allowed query params to localStorage and cookies", () => {
    mockConsent.mockReturnValue(true);
    setLocation("https://novita.ai/landing?utm_source=google&utm_medium=cpc");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("utm_source")).toBe("google");
    expect(localStorage.getItem("utm_medium")).toBe("cpc");
    expect(document.cookie).toContain("utm_source=google");
  });

  it("ignores blocked query keys like login/code/token", () => {
    mockConsent.mockReturnValue(true);
    setLocation("https://novita.ai/?login=1&code=abc&token=xyz&utm_term=foo");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("login")).toBeNull();
    expect(localStorage.getItem("code")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("utm_term")).toBe("foo");
  });

  it("derives source from utm_source when source is unset", () => {
    mockConsent.mockReturnValue(true);
    setLocation("https://novita.ai/?utm_source=newsletter");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("source")).toBe("newsletter");
  });

  it("falls back to Direct source when nothing is available", () => {
    mockConsent.mockReturnValue(true);
    setLocation("https://novita.ai/plain");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("source")).toBe("Direct");
  });

  it("stores external referrer domain in localStorage", () => {
    mockConsent.mockReturnValue(true);
    Object.defineProperty(document, "referrer", {
      value: "https://www.external.com/page",
      configurable: true,
    });
    setLocation("https://novita.ai/");
    render(<MarketingAttributionCollector />);
    expect(localStorage.getItem("referrer")).toBe("external.com");
  });

  it("does not throw if collection encounters an error", () => {
    mockConsent.mockReturnValue(true);
    // Force an internal error by making localStorage.setItem throw once.
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error("boom");
    });
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    setLocation("https://novita.ai/?utm_source=x");
    expect(() => render(<MarketingAttributionCollector />)).not.toThrow();
    expect(errSpy).toHaveBeenCalled();
    Storage.prototype.setItem = original;
    errSpy.mockRestore();
  });
});
