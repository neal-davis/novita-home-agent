"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";

// oauth can only read collect attributes(source, medium...) from Cookies
// define some attributes in localstorage need to be set in Cookies when page load

const STORAGE_KEYS = [
  "source",
  "utm_id",
  "utm_campaign",
  "utm_medium",
  "ref",
  "collect",
  "user_agent",
  "redirect", // affect login redirect page
  "invited_code", // affect register logic, send voucher
  "utm_adgroup",
  "utm_content",
  "utm_term",
  "utm_source",
  "landingpage",
];

export function StorageTransform() {
  useEffect(() => {
    STORAGE_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) {
        Cookies.set(key, value);
      }
    });
  }, []);
  return null;
}
