"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";

const PRICING_SECTION_ID = "pricing";

/**
 * Hero section — headline Figma `1:6486`
 *
 * Figma nodes:
 *   Desktop  10957:11751 (1512 × 804)
 *   Tablet   10998:19849 (834 × ~1060)
 *   Mobile   10999:20755 (390 × ~840)
 *
 * Background: bg.png (covers full section)
 * Bottom gradient: h-[124px] tablet / h-[173px] desktop, #faf9f5 → transparent
 * Illustration: hero-main.png, responsive sizing
 *   Desktop: right-0 top-[116px], w-[660px]–[820px]
 *   Tablet:  left-0 top-[444px],  w-[960px], right overflow
 *   Mobile:  left-anchored pl-4,  w-[740px], ~3 hexes in view, right+bottom overflow
 */

export default function Hero() {
  const router = useRouter();
  const { isLogin } = useHeaderAuth();

  const handleGetStarted = useCallback(() => {
    if (isLogin) {
      router.push(NOVITA_URL.SANDBOX_CONSOLE);
      return;
    }

    localStorage.setItem("redirect", NOVITA_URL.SANDBOX_CONSOLE);
    router.push(
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(NOVITA_URL.SANDBOX_CONSOLE)}`,
    );
  }, [isLogin, router]);

  const handlePricing = useCallback(() => {
    router.push(NOVITA_URL.SANDBOX_PRICING);
  }, [router]);

  const handlePricingPart = useCallback(() => {
    const element = document.getElementById(PRICING_SECTION_ID);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* ── Background image ────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Image
          src="/sandbox1/page/bg.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-[1512px]">
        <div
          className="
            relative
            flex flex-col md:block
            px-5 md:px-0
            pt-[100px] md:pt-0
            pb-[20px] md:pb-0
            min-h-[700px] md:min-h-[700px] lg:min-h-[700px]
          "
        >
          {/* ── Text block ──────────────────────────────────── */}
          <div
            className="
              relative z-10
              flex flex-col gap-4 md:gap-6
              max-w-full md:max-w-[560px]
              pb-6
              md:absolute md:left-[60px] md:top-[215px]
              lg:left-[124px]
            "
          >
            <div className="flex items-center gap-[var(--space-8)]">
              <span
                className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                aria-hidden
              />
              <span className="font-mono-13 uppercase text-[var(--dark-2)]">
                AGENT SANDBOX
              </span>
            </div>

            {/*
              Mobile (<640px): Figma H4 — Regular 400 / 28px / 38px lh / -0.56px
              sm+   (≥640px): Figma Display/SM — Medium 500 / 48px / 52px lh / -0.96px
              font-display-sm handles 48px+tokens at sm+; max-sm overrides correct mobile values.
            */}
            <h1 className="font-display-sm max-sm:font-normal max-sm:leading-[38px] max-sm:tracking-[-0.56px] text-element-high-em">
              Runtime for AI agents to execute real-world tasks
            </h1>

            {/* Description — font-body: 16px/22px mobile; font-p: 20px/26px md+ */}
            <p className="font-body md:font-p text-element-mid-em max-w-[345px]">
              Secure, programmable sandboxes for AI-generated code, browser
              workflows, computer use, and long-running tasks.
            </p>

            {/* CTA buttons — gap-4(16) + mt-8(32) = 48px on mobile; gap-6(24) + mt-6(24) = 48px on md+ */}
            <div className="flex items-center gap-3 mt-8 md:mt-6">
              <Button
                type="primary"
                height={44}
                width={231}
                onClick={handleGetStarted}
                className="font-miletus font-paragraph-15"
              >
                Start Free with $100 Credits*
              </Button>
              <Button
                type="text"
                height={44}
                width={115}
                onClick={handlePricing}
                className="font-miletus gap-[var(--space-4)]"
              >
                Pricing
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </Button>
            </div>
            <div
              className="text-element-mid-em font-paragraph-15 cursor-pointer"
              onClick={handlePricingPart}
            >
              No credit card required, valid for 90 days
            </div>
          </div>

          {/* ── Illustration ───────────────────────────────── */}
          {/*
            Mobile  (<768px): flows below text, left-anchored
                              w-[740px] @ 390px → ~3 hexes in view, right bleeds ~350px
                              mt-2 keeps image high; section overflow-hidden clips bottom
            Tablet  (md):     absolute, left-0, top-[444px]
                              w-[960px] @ 768px → ~192px bleeds right
            lg (1024-1339px): right-0, top-[116px]
                              w-[660px] @ 1200px ≈ 55% viewport (Figma ≈57%)
            xl (1340px+):     right-0, w-[820px]
          */}
          <div
            className="
              relative z-0
              mt-2
              flex items-start justify-start pl-4
              select-none

              md:absolute md:left-0 md:top-[444px]
              md:mt-0 md:pl-0

              lg:left-auto
              lg:right-0 lg:top-[116px]
              lg:items-start lg:justify-end
            "
          >
            <Image
              src="/sandbox1/page/hero-main.png"
              alt="Agent Sandbox — GPU Cloud, Agent Applications, Model APIs diagram"
              width={960}
              height={780}
              quality={95}
              className="
                w-[740px]
                md:w-[960px]
                lg:w-[660px]
                xl:w-[820px]
                h-auto object-contain
              "
              priority
            />
          </div>
        </div>
      </div>

      {/* ── Bottom gradient fade ─────────────────────────────── */}
      {/* Desktop h-[173px] / Tablet h-[124px] — Figma: #faf9f5 → transparent */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[124px] lg:h-[173px] pointer-events-none"
        style={{
          background: "linear-gradient(to top, #faf9f5, transparent)",
        }}
      />
    </section>
  );
}
