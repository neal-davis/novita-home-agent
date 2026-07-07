"use client";

import Image from "next/image";
import Link from "next/link";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  theme = "default",
  alt = "Novita AI",
}: {
  href?: string;
  className?: string;
  theme?: "default" | "dark";
  alt?: string;
}) {
  const { locale } = useI18n();

  return (
    <Link
      href={getLocalizedPath(href, locale)}
      style={{ width: 88, height: 24 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
      id={CLICK_BTN_IDs.HEADER_LINK_IDs.LOGO}
    >
      <Image
        width={88}
        height={24}
        src={theme === "dark" ? "/logo/white-logo.svg" : "/logo/logo.svg"}
        alt={alt}
        priority
        style={{
          width: "100%",
          height: "100%",
          userSelect: "none",
          display: "block",
        }}
      />
    </Link>
  );
}
