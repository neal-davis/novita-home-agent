"use client";

import Image from "next/image";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import SectionEyebrow from "./SectionEyebrow";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useI18n } from "@/i18n/provider";

function createFeatureCards() {
  return [
    {
      title: "Sub-second startup",
      description:
        "Launch sandbox instances in under 200ms on average, optimized for bursty and high-frequency workloads.",
      image: "/sandbox1/page/why-novita/level-startup.png",
      alt: "Sub-second startup under 200ms",
    },
    {
      title: "Secure isolation",
      description:
        "Each task runs in an isolated sandbox with system-level separation to reduce data leakage and unauthorized access risks.",
      image: "/sandbox1/page/why-novita/isolation.png",
      alt: "Secure isolation tasks",
    },
  ];
}

export default function WhyNovita() {
  useI18n();
  const router = useRouter();
  const { isLogin } = useHeaderAuth();
  const featureCards = createFeatureCards();

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

  return (
    <section className="w-full bg-white py-16 md:py-20 lg:py-[80px]">
      <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
        <SectionEyebrow label="Agent Sandbox" />

        <div className="mt-6 flex max-w-[430px] flex-col items-start gap-[var(--space-16)] py-[var(--space-16)]">
          <h2 className="font-heading-h5 text-element-high-em md:font-heading-h2">
            Fast startup. Strong isolation. Massive concurrency.
          </h2>
          <p className="font-paragraph-16 text-element-mid-em md:font-paragraph-20">
            Launch sandbox instances in milliseconds, isolate every task, and
            scale to thousands of concurrent executions for real-world agent
            workloads.
          </p>
        </div>

        <div className="mt-[var(--space-24)] flex flex-col gap-[var(--space-24)]">
          <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="flex min-w-0 flex-col gap-[40px] pb-[40px]"
              >
                <div className="relative h-[320px] w-full overflow-hidden border border-border-subtle bg-[#f4f1ef]">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
                <div className="flex max-w-[382px] flex-col gap-[var(--space-16)]">
                  <h3 className="font-heading-h5 text-element-high-em">
                    {feature.title}
                  </h3>
                  <p className="font-paragraph-18 text-[#727272]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex min-h-[360px] flex-col overflow-hidden border border-border-subtle bg-[#dff0e7] px-[var(--space-24)] py-[var(--space-32)] md:px-[var(--space-48)] lg:min-h-[389px] lg:flex-row lg:items-center lg:justify-between lg:pl-[100px] lg:pr-[80px] lg:py-[40px]">
            <Image
              src="/sandbox1/page/operation-bg.png"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />

            <div className="relative z-10 flex max-w-[361px] flex-col gap-[var(--space-32)]">
              <div className="flex flex-col gap-[var(--space-16)]">
                <h3 className="font-heading-h5 text-element-high-em">
                  High concurrency at scale
                </h3>
                <p className="font-paragraph-18 text-[#727272]">
                  Run thousands of sandbox instances in parallel with
                  consistently low latency for high-throughput agent workloads.
                </p>
              </div>

              <Button
                type="primary"
                height={44}
                onClick={handleGetStarted}
                className="w-fit font-paragraph-15"
              >
                Try Now
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="relative z-10 mt-[var(--space-32)] flex w-full justify-center lg:mt-0 lg:w-[462px] lg:justify-end">
              <Image
                src="/sandbox1/page/operating.png"
                alt="Operating 1,159 instances"
                width={560}
                height={389}
                className="h-auto w-full max-w-[462px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
