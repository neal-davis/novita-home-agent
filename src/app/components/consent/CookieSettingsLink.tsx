"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  isCookiebotEnabled,
  openCookieSettings,
} from "@/lib/consent/cookiebot";

type CookieSettingsLinkProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
};

export default function CookieSettingsLink({
  children,
  className,
  id,
  title,
}: CookieSettingsLinkProps) {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    setShouldShow(isCookiebotEnabled());
  }, []);

  if (!shouldShow) {
    return null;
  }

  return (
    <button
      className={className}
      id={id}
      title={title}
      type="button"
      onClick={openCookieSettings}
    >
      {children}
    </button>
  );
}
