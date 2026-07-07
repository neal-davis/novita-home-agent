"use client";

import { createContext, useContext } from "react";
import { isCookiebotConfigured } from "@/lib/consent/cookiebot";

/**
 * Carries the server-authoritative "is Cookiebot active for this request"
 * decision (derived from the `x-cookiebot-enabled` request header in the root
 * layout) down to the consent hooks.
 *
 * Why this exists: the client-side `isCookiebotEnabled()` reads the
 * `cookiebot-enabled` cookie, but during SSR there is no such signal, so the
 * bare helper used to return `true` unconditionally. That made the server and
 * the first client render disagree whenever the region resolved to disabled
 * (server: deny-by-default → renders nothing; client: grant-all → renders
 * analytics), producing a hydration mismatch. Feeding both renders the same
 * serialized boolean keeps them byte-identical.
 */
const CookiebotEnabledContext = createContext<boolean>(isCookiebotConfigured());

export function ConsentProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <CookiebotEnabledContext.Provider value={enabled}>
      {children}
    </CookiebotEnabledContext.Provider>
  );
}

export function useCookiebotEnabled() {
  return useContext(CookiebotEnabledContext);
}
