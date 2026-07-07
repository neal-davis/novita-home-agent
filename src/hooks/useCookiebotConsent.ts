"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addCookiebotConsentListener,
  readCookiebotConsent,
  type CookiebotConsentState,
} from "@/lib/consent/cookiebot";
import { useCookiebotEnabled } from "@/app/components/consent/ConsentProvider";
import type { CookiebotConsentCategory } from "@/constants/consent";

export function useCookiebotConsent() {
  // Server-authoritative flag (from the request header), serialized into the
  // client via context. Using it for the initial state — instead of the
  // client-only cookie read — keeps the SSR output and the first client render
  // identical and avoids a hydration mismatch.
  const enabled = useCookiebotEnabled();
  const [consent, setConsent] = useState<CookiebotConsentState>(() =>
    readCookiebotConsent(enabled),
  );

  useEffect(() => {
    return addCookiebotConsentListener(setConsent, enabled);
  }, [enabled]);

  return consent;
}

export function useCookieConsent(category: CookiebotConsentCategory) {
  const consent = useCookiebotConsent();

  return useMemo(() => consent[category], [category, consent]);
}
