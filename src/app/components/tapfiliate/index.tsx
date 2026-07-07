"use client";

import Tap from "@tapfiliate/tapfiliate-js";
import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

export default function Tapfiliate() {
  const hasMarketingConsent = useCookieConsent("marketing");

  useEffect(() => {
    if (!hasMarketingConsent) {
      return;
    }

    Tap.init("49344-64ffb9");
  }, [hasMarketingConsent]);
  return <></>;
}
