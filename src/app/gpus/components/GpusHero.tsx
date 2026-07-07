"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";

export default function GpusHero() {
  const router = useRouter();
  const { isLogin } = useHeaderAuth();

  const handleGetStarted = useCallback(() => {
    const target = NOVITA_URL.GPU_CONSOLE_APPLICATION;
    if (isLogin) {
      router.push(target);
      return;
    }

    localStorage.setItem("redirect", target);
    router.push(
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(target)}`,
    );
  }, [isLogin, router]);

  const handlePricing = useCallback(() => {
    router.push(`${NOVITA_URL.PRICING}?gpu=1`);
  }, [router]);

  return (
    <section className="relative w-full overflow-hidden bg-[var(--gray-50)]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          alt="Novita GPU Cloud hero background"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/gpus/v5/instance-hero-bg.png"
        />
      </div>

      {/*
        窄屏：与首页 Hero 类似，max-width + px-5。
        md/lg：对齐新版页面 rail — md:left 60px / lg:left 124px（用 padding 实现，非 absolute）。
      */}
      <div className="relative mx-auto min-h-[700px] w-full min-w-0 max-w-layout-safe md:min-h-[700px] lg:min-h-[700px]">
        <div
          className={[
            "relative z-10 mx-0 flex min-h-[700px] w-full min-w-0 flex-col items-start text-left",
            "px-5 pb-16 pt-[120px]",
            "md:min-h-[700px] md:pb-12 md:pl-[60px] md:pr-8 md:pt-[215px]",
            "lg:min-h-[700px] lg:pb-[80px] lg:pl-[124px] lg:pr-10 lg:pt-[215px]",
          ].join(" ")}
        >
          <div className="flex w-full min-w-0 max-w-[min(22.75rem,100%)] flex-col gap-[var(--space-24)] md:max-w-[min(35rem,100%)] lg:max-w-[576px]">
            <div className="flex items-center gap-[var(--space-8)]">
              <span
                className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                aria-hidden
              />
              <span className="font-mono-13 uppercase text-[var(--dark-2)]">
                GPU INSTANCE
              </span>
            </div>

            <div className="flex w-full flex-col items-start gap-4 md:max-w-[560px] md:gap-6 lg:max-w-none">
              <h1
                className={[
                  "font-miletus font-heading-h3 text-[var(--text-1)]",
                  "md:text-[52px] md:font-medium md:leading-[58px] md:tracking-[-1.56px]",
                  "lg:font-display-md",
                ].join(" ")}
              >
                Accelerate Your AI with Novita&apos;s GPU Cloud
              </h1>
              <p
                className={[
                  "w-full max-w-[348px] font-miletus font-paragraph-18 text-[var(--text-3)]",
                  "md:max-w-[400px] md:font-paragraph-20",
                  "lg:max-w-[400px] lg:font-paragraph-18",
                ].join(" ")}
              >
                Affordable, scalable GPU cloud tailored for your AI needs. Focus
                on building your AI while we manage the infrastructure.
              </p>
            </div>

            <div className="mt-[var(--space-24)] flex w-full flex-wrap items-center justify-start gap-3">
              <Button
                type="primary"
                height={44}
                width={115}
                onClick={handleGetStarted}
                className="font-miletus font-paragraph-15"
              >
                Get Started
              </Button>
              <Button
                type="text"
                height={44}
                onClick={handlePricing}
                width={115}
                className="font-miletus gap-[var(--space-4)]"
              >
                Pricing
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
