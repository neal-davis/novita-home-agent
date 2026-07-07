const DEFAULT_COOKIEBOT_ID = "c1defd1c-c4af-4a52-ac75-e467741e8b3e";

export const COOKIEBOT_ID =
  process.env.NEXT_PUBLIC_COOKIEBOT_ID || DEFAULT_COOKIEBOT_ID;

export const COOKIEBOT_SCRIPT_SRC = "https://consent.cookiebot.com/uc.js";

export const CONSENT_COOKIE_NAMES = {
  cookiebotEnabled: "cookiebot-enabled",
  jurisdiction: "consent-jurisdiction",
  californiaPrivacy: "california-privacy",
  gpcDetected: "gpc-detected",
  gpcOptOutUntil: "gpc-opt-out-until",
} as const;

export type ConsentJurisdiction = "opt-in" | "opt-out";

export type CookiebotRegionMode = "global" | "eu-only" | "disabled";

export const COOKIEBOT_ENABLED_HEADER = "x-cookiebot-enabled";

export const EEA_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
]);

export function getCookiebotRegionMode(): CookiebotRegionMode {
  const mode = process.env.NEXT_PUBLIC_COOKIEBOT_REGION_MODE;

  if (mode === "global" || mode === "disabled" || mode === "eu-only") {
    return mode;
  }

  return "global";
}

export function isCookiebotEnabledForCountry(country: string) {
  const mode = getCookiebotRegionMode();

  if (mode === "global") {
    return true;
  }

  if (mode === "disabled") {
    return false;
  }

  return (
    EEA_COUNTRIES.has(country.toUpperCase()) ||
    country.toUpperCase() === "GB" ||
    country.toUpperCase() === "CH"
  );
}

export type CookiebotConsentCategory =
  | "necessary"
  | "preferences"
  | "statistics"
  | "marketing";
