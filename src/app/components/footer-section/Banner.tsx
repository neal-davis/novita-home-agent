"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const FOOTER_BANNER_SAFE_MAX_PX = 1512;
const FOOTER_BANNER_SAFE_HALF_PX = FOOTER_BANNER_SAFE_MAX_PX / 2;
const EDGE_FADE_PX = 143;

const gutterWidth = `max(0px, calc(50% - ${FOOTER_BANNER_SAFE_HALF_PX}px))`;

const edgeFadeStyle = {
  width: `min(${EDGE_FADE_PX}px, ${gutterWidth})`,
} as const;

const gradientRight =
  "linear-gradient(90deg, transparent 0%, var(--bg-default) 87.063%, var(--bg-default) 100%)";
const gradientLeft =
  "linear-gradient(90deg, var(--bg-default) 0%, transparent 87.063%, transparent 100%)";

export interface FooterBannerProps {
  getStartedHref?: string;
}

export default function Banner({ getStartedHref }: FooterBannerProps) {
  const router = useRouter();
  const { isLogin } = useHeaderAuth();
  const { locale } = useI18n();

  const handleGetStarted = useCallback(() => {
    if (getStartedHref) {
      router.push(getLocalizedPath(getStartedHref, locale));
      return;
    }

    const consoleHref = getLocalizedPath(NOVITA_URL.CONSOLE, locale);
    if (isLogin) {
      router.push(consoleHref);
      return;
    }

    localStorage.setItem("redirect", consoleHref);
    router.push(
      getLocalizedPath(
        `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(consoleHref)}`,
        locale,
      ),
    );
  }, [getStartedHref, isLogin, locale, router]);

  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg-default)] min-h-[608px]">
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[var(--layout-safe-max)] -translate-x-1/2 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footer/v5/banner.png')" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 z-[1] -translate-x-[40%]"
        style={{
          ...edgeFadeStyle,
          left: `calc(50% - ${FOOTER_BANNER_SAFE_HALF_PX}px)`,
          background: gradientLeft,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 z-[1] -translate-x-[60%]"
        style={{
          ...edgeFadeStyle,
          left: `calc(50% + ${FOOTER_BANNER_SAFE_HALF_PX}px)`,
          background: gradientRight,
        }}
        aria-hidden="true"
      />

      {/*
        Figma 1:9068（<lg）：纵向 stack、items-start、区块间距 24px；桌面保持左右分栏。
      */}
      <div
        className={[
          "relative z-10 mx-auto flex max-w-[1360px] min-w-0 flex-col items-start gap-6 px-5 py-12 sm:px-8",
          "lg:flex-row lg:justify-between lg:gap-0 lg:px-[32px] lg:py-[80px]",
        ].join(" ")}
      >
        {/* Heading — 窄屏 H3 规格，桌面 display-sm */}
        <h2
          className={[
            "w-full shrink-0 font-miletus font-heading-h3 text-[var(--text-1)]",
            "lg:w-[537px] lg:font-display-sm",
          ].join(" ")}
        >
          Everything you need to build production AI.
        </h2>

        {/* Subcopy + CTA — 窄屏跟在标题下；lg 为右栏 */}
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-6 lg:w-[480px] lg:gap-space-24">
          <p className="font-miletus font-paragraph-16 text-[var(--text-3)]">
            200+ models, on-demand GPUs, and secure agent runtimes — unified
            under one API. Free to start, scales as you grow.
          </p>
          <div>
            <Button
              type="secondary"
              height={44}
              onClick={handleGetStarted}
              className="gap-2 font-paragraph-15 w-fit"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
