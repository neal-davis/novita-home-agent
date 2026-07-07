"use client";

import styles from "./Header.module.scss";
import { cn } from "@/lib/utils";
import { Logo } from "./partials/Logo";
import { useEffect, useRef, useState } from "react";

import {
  ORI_HEADER_HEIGHT,
  CONSOLE_ORI_HEADER_HEIGHT,
} from "@/hooks/useHeaderHeight";

/**
 * The header layout includes only the logo on the left side.
 * usage:
 * 1. oauth page header
 */
export default function AuthHeader({
  position,
  page,
  noMobile,
}: {
  page?: "playground" | "console";
  position?: "relative"; // fixed or relative
  noMobile?: boolean; // when set noMobile, it will not show mobile menu
}) {
  const originalHeaderHeight =
    page === "console" ? CONSOLE_ORI_HEADER_HEIGHT : ORI_HEADER_HEIGHT;

  const noticeHight = 0;
  const [headerHeight, setHeaderHeight] = useState(
    position === "relative" ? originalHeaderHeight + noticeHight : noticeHight,
  );
  const headerRef = useRef<HTMLDivElement>(null);

  // calculate
  useEffect(() => {
    let finalheaderHeight = 0;
    if (position === "relative") {
      finalheaderHeight += originalHeaderHeight;
    }
    setHeaderHeight(finalheaderHeight);
  }, [originalHeaderHeight, position]);

  return (
    <div style={{ height: headerHeight }}>
      <header
        className={cn(styles.header, {
          [styles.header_console]: page === "console",
          [styles.no_mobile]: noMobile,
        })}
        ref={headerRef}
        style={{
          top: "0px",
          position: position || "fixed",
          boxShadow: "none",
          backgroundColor: "var(--gray-3)",
          border: "none",
        }}
      >
        <nav className={`${styles.nav} max_width_container`}>
          <div className={`${styles.nav_wrapper} px-web`}>
            <div className={styles.nav_left}>
              <Logo />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
