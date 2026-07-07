"use client";

import { LOCALE_PREFERENCE_COOKIE_NAME, type Locale } from "./config";
import { isCookieConsentGranted } from "@/lib/consent/cookiebot";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Persist a manual locale switch so the middleware redirect for unprefixed
 * URLs honors it on the next visit. Locale memory is a "preferences" cookie
 * under the Cookiebot taxonomy, so it is only written when that category is
 * granted (regions without Cookiebot count as granted).
 */
export function persistLocalePreference(locale: Locale) {
  if (typeof document === "undefined") return;
  if (!isCookieConsentGranted("preferences")) return;

  document.cookie = `${LOCALE_PREFERENCE_COOKIE_NAME}=${encodeURIComponent(
    locale,
  )}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

export function clearLocalePreference() {
  if (typeof document === "undefined") return;

  document.cookie = `${LOCALE_PREFERENCE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
