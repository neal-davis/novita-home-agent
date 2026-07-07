"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

export default function ConsentControlledVercelInsights() {
  const hasStatisticsConsent = useCookieConsent("statistics");

  if (!hasStatisticsConsent) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
