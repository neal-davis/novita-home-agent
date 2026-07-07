import {
  CONSENT_COOKIE_NAMES,
  COOKIEBOT_ID,
  type CookiebotConsentCategory,
} from "@/constants/consent";

export type CookiebotConsentState = Record<CookiebotConsentCategory, boolean>;

const ENABLED_CONSENT: CookiebotConsentState = {
  marketing: true,
  necessary: true,
  preferences: true,
  statistics: true,
};

const DEFAULT_CONSENT: CookiebotConsentState = {
  marketing: false,
  necessary: true,
  preferences: false,
  statistics: false,
};

const CONSENT_EVENTS = [
  "CookiebotOnConsentReady",
  "CookiebotOnAccept",
  "CookiebotOnDecline",
] as const;

export function isCookiebotConfigured() {
  return Boolean(COOKIEBOT_ID);
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export function isCookiebotEnabled() {
  if (!isCookiebotConfigured()) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return getCookieValue(CONSENT_COOKIE_NAMES.cookiebotEnabled) !== "0";
}

export function readCookiebotConsent(
  enabled: boolean = isCookiebotEnabled(),
): CookiebotConsentState {
  if (!enabled) {
    return ENABLED_CONSENT;
  }

  if (typeof window === "undefined") {
    return DEFAULT_CONSENT;
  }

  const consent = window.Cookiebot?.consent;

  if (!consent) {
    return DEFAULT_CONSENT;
  }

  return {
    marketing: Boolean(consent.marketing),
    necessary: true,
    preferences: Boolean(consent.preferences),
    statistics: Boolean(consent.statistics),
  };
}

export function isCookieConsentGranted(category: CookiebotConsentCategory) {
  return readCookiebotConsent()[category];
}

export function addCookiebotConsentListener(
  callback: (consent: CookiebotConsentState) => void,
  enabled: boolean = isCookiebotEnabled(),
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleConsentChange = () => {
    callback(readCookiebotConsent(enabled));
  };

  if (!enabled) {
    handleConsentChange();
    return () => {};
  }

  CONSENT_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, handleConsentChange);
  });

  handleConsentChange();

  return () => {
    CONSENT_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, handleConsentChange);
    });
  };
}

export function openCookieSettings() {
  if (typeof window === "undefined") {
    return;
  }

  window.Cookiebot?.renew?.();
}
