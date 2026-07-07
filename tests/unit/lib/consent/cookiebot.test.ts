import {
  addCookiebotConsentListener,
  isCookieConsentGranted,
  isCookiebotConfigured,
  isCookiebotEnabled,
  openCookieSettings,
  readCookiebotConsent,
} from "@/lib/consent/cookiebot";
import { CONSENT_COOKIE_NAMES } from "@/constants/consent";

type CookiebotWin = Window & {
  Cookiebot?: {
    consent?: Record<string, boolean>;
    renew?: jest.Mock;
  };
};

function clearAllCookies() {
  document.cookie
    .split(";")
    .forEach(
      (c) =>
        (document.cookie = `${c.split("=")[0].trim()}=; path=/; max-age=0`),
    );
}

describe("cookiebot consent helpers", () => {
  beforeEach(() => {
    clearAllCookies();
    delete (window as CookiebotWin).Cookiebot;
  });

  it("is configured because a default Cookiebot id exists", () => {
    expect(isCookiebotConfigured()).toBe(true);
  });

  it("is enabled by default and disabled when the cookie is '0'", () => {
    expect(isCookiebotEnabled()).toBe(true);
    document.cookie = `${CONSENT_COOKIE_NAMES.cookiebotEnabled}=0; path=/`;
    expect(isCookiebotEnabled()).toBe(false);
  });

  it("returns all-granted consent when disabled", () => {
    const consent = readCookiebotConsent(false);
    expect(consent).toEqual({
      marketing: true,
      necessary: true,
      preferences: true,
      statistics: true,
    });
  });

  it("returns default (mostly denied) consent when enabled but no Cookiebot object", () => {
    const consent = readCookiebotConsent(true);
    expect(consent.necessary).toBe(true);
    expect(consent.marketing).toBe(false);
    expect(consent.preferences).toBe(false);
  });

  it("maps the window Cookiebot consent object when present", () => {
    (window as CookiebotWin).Cookiebot = {
      consent: { marketing: true, preferences: false, statistics: true },
    };
    const consent = readCookiebotConsent(true);
    expect(consent.marketing).toBe(true);
    expect(consent.statistics).toBe(true);
    expect(consent.preferences).toBe(false);
    expect(consent.necessary).toBe(true);
  });

  it("isCookieConsentGranted reads a single category", () => {
    document.cookie = `${CONSENT_COOKIE_NAMES.cookiebotEnabled}=0; path=/`;
    expect(isCookieConsentGranted("marketing")).toBe(true);
  });

  it("addCookiebotConsentListener fires immediately and on events when enabled", () => {
    const cb = jest.fn();
    const unsubscribe = addCookiebotConsentListener(cb, true);
    expect(cb).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event("CookiebotOnAccept"));
    expect(cb).toHaveBeenCalledTimes(2);
    unsubscribe();
    window.dispatchEvent(new Event("CookiebotOnAccept"));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("addCookiebotConsentListener fires once with granted consent when disabled", () => {
    const cb = jest.fn();
    const unsubscribe = addCookiebotConsentListener(cb, false);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ marketing: true }),
    );
    expect(typeof unsubscribe).toBe("function");
  });

  it("openCookieSettings calls Cookiebot.renew when available", () => {
    const renew = jest.fn();
    (window as CookiebotWin).Cookiebot = { renew };
    openCookieSettings();
    expect(renew).toHaveBeenCalled();
  });
});
