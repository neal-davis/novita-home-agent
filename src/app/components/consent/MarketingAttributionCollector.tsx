"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

const COOKIE_SYNC_KEYS = [
  "source",
  "utm_id",
  "utm_campaign",
  "utm_medium",
  "ref",
  "collect",
  "user_agent",
  "redirect",
  "invited_code",
  "utm_adgroup",
  "utm_content",
  "utm_term",
  "utm_source",
  "landingpage",
] as const;

const BLOCKED_QUERY_KEYS = new Set(["login", "code", "token"]);
const COOKIE_ONLY_QUERY_KEYS = new Set(["ref"]);

function normalizeDomain(url: string) {
  return (
    url
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split("/")[0] || url
  );
}

function setCookie(name: string, value: string, days?: number) {
  let expires = "";

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function collectAttribution() {
  const fallbackValues: Partial<
    Record<(typeof COOKIE_SYNC_KEYS)[number], string>
  > = {
    landingpage: `unknown_${window.location.href}`,
  };
  const searchParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  const currentDomain = normalizeDomain(window.location.origin);
  const queryValues = new Map<string, string>();

  if (referrer && !referrer.includes(window.location.host)) {
    localStorage.setItem("referrer", normalizeDomain(referrer));
  }

  searchParams.forEach((rawValue, rawKey) => {
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    if (BLOCKED_QUERY_KEYS.has(key)) {
      return;
    }

    if (!COOKIE_ONLY_QUERY_KEYS.has(key) && !localStorage.getItem(key)) {
      localStorage.setItem(key, value);
    }

    if (!queryValues.has(key)) {
      queryValues.set(key, value);
    }

    if (key === "utm_campaign") {
      const campaignParts = value.split("_");
      const lastPart = Number(campaignParts.at(-1));
      setCookie(key, value, Number.isNaN(lastPart) ? 1 : lastPart);
    }
  });

  const landingPage = localStorage.getItem("landingpage");
  const landingPageCookie = getCookie("landingpage");

  if (!landingPage) {
    localStorage.setItem(
      "landingpage",
      landingPageCookie || window.location.href,
    );
  }

  if (
    !localStorage.getItem("source") ||
    localStorage.getItem("source") === "Direct"
  ) {
    let source = queryValues.get("utm_source");

    if (!source && referrer) {
      source = normalizeDomain(referrer);
    }

    source = source || queryValues.get("ref") || "Direct";

    if (!source.includes(currentDomain)) {
      localStorage.setItem("source", source);
    }
  }

  COOKIE_SYNC_KEYS.forEach((key) => {
    const value = localStorage.getItem(key) || fallbackValues[key];

    if (value) {
      setCookie(key, value);
    }
  });
}

export default function MarketingAttributionCollector() {
  const hasMarketingConsent = useCookieConsent("marketing");

  useEffect(() => {
    if (!hasMarketingConsent) {
      return;
    }

    try {
      collectAttribution();
    } catch (error) {
      console.error("collect error", error);
    }
  }, [hasMarketingConsent]);

  return null;
}
