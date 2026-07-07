"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import debounce from "lodash/debounce";
import { updateRecentlyVisited } from "@/api/user";
import { CONSOLE_PAGE_INFO, CONSOLE_PAGE_PATH_MAP } from "@/constants/console";
import { getPathnameWithoutLocale } from "@/i18n/config";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

export default function PageTracker() {
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const hasPreferencesConsent = useCookieConsent("preferences");

  const updateConsoleVisited = debounce((key: string) => {
    updateRecentlyVisited(key);
  }, 300);

  useEffect(() => {
    if (!hasPreferencesConsent) {
      return;
    }

    if (CONSOLE_PAGE_PATH_MAP[businessPathname]) {
      const key = CONSOLE_PAGE_PATH_MAP[
        businessPathname
      ] as keyof typeof CONSOLE_PAGE_INFO;
      updateConsoleVisited(key);
    }
  }, [businessPathname, hasPreferencesConsent, updateConsoleVisited]);

  return null;
}
