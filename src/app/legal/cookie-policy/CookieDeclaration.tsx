"use client";

import { useEffect, useRef } from "react";
import { COOKIEBOT_ID } from "@/constants/consent";

export default function CookieDeclaration() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !COOKIEBOT_ID) {
      return;
    }

    container.innerHTML = "";

    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.src = `https://consent.cookiebot.com/${COOKIEBOT_ID}/cd.js`;
    script.type = "text/javascript";
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  if (!COOKIEBOT_ID) {
    return (
      <p className="rounded border border-[var(--border)] bg-[var(--fill-4)] p-4 text-[var(--dark-1)]">
        Cookiebot is not configured yet. Add NEXT_PUBLIC_COOKIEBOT_ID to enable
        the live cookie declaration.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
