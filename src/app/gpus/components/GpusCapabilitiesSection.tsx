"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Infinity, Timer, Zap } from "lucide-react";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getCapabilityTiles() {
  return [
    {
      title: "One-click templates",
      description: "PyTorch, JAX and CUDA images ready to run.",
    },
    {
      title: "Developer-first",
      description: "REST, gRPC, Terraform and a powerful CLI.",
    },
    {
      title: "14 global regions",
      description: "Low-latency backbone with private peering.",
    },
    {
      title: "Managed storage",
      description: "POSIX, object and parallel filesystems.",
    },
    {
      title: "Private networking",
      description: "Per-project VPC, peering and transit gateway.",
    },
    {
      title: "Cost controls",
      description: "Budgets, quotas and per-team showback.",
    },
    {
      title: "24/7 support",
      description: "Named TAM available on Enterprise plans.",
    },
    {
      title: "Instant Deployment",
      description: "Sub-second startup after pre-warming",
    },
  ] as const;
}

export default function GpusCapabilitiesSection() {
  useI18nSubscription();
  const capabilityTiles = getCapabilityTiles();
  const router = useRouter();
  const { isLogin } = useHeaderAuth();

  const handleGetStarted = useCallback(() => {
    if (isLogin) {
      router.push(NOVITA_URL.GPU_CONSOLE_EXPLORE);
      return;
    }

    localStorage.setItem("redirect", NOVITA_URL.GPU_CONSOLE_EXPLORE);
    router.push(
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(NOVITA_URL.GPU_CONSOLE_EXPLORE)}`,
    );
  }, [isLogin, router]);

  const handleServerlessDeployCta = useCallback(() => {
    const target = NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY;
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
    <section className="mt-space-80">
      <div className="flex h-[33px] flex-col border-b border-[var(--border-strong)] py-[var(--space-8)]">
        <div className="flex w-full items-center gap-[var(--space-8)]">
          <div
            className="size-[8px] shrink-0 rounded-[2px] bg-[var(--brand-0)]"
            aria-hidden
          />
          <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--element-high-em)]">
            Platform capabilities
          </span>
        </div>
      </div>

      <div className="mt-space-48 flex flex-col gap-space-48">
        {/* Module 1 */}
        <div>
          <div className="flex flex-col gap-space-24 lg:flex-row lg:items-end lg:gap-[20px]">
            <div className="min-w-0 lg:basis-[57.5%] lg:shrink lg:grow-0">
              <div className="relative aspect-[651/397] w-full overflow-hidden rounded-[6px] bg-[var(--fill-4)]">
                <Image
                  src="/gpus/v5/instance-gpu-model.png"
                  alt=""
                  fill
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            <div className="min-w-0 w-full px-[33px] py-[17px] lg:basis-[42.5%] lg:shrink lg:grow-0">
              <div className="flex flex-col gap-[var(--space-16)]">
                <h3 className="font-miletus font-heading-h4 text-[var(--text-1)]">
                  Save up to 50% on Costs
                </h3>
                <p className="font-paragraph-18 text-[var(--text-3)]">
                  Deploy GPU instances closer to your users through our
                  worldwide network. Ensure minimal latency and fast access, no
                  matter where your users or teams are located.
                </p>
              </div>

              <div className="mt-space-32 flex flex-wrap items-start gap-space-32">
                <Button
                  type="secondary"
                  height={44}
                  width={115}
                  className="font-paragraph-15 px-[var(--space-20)]"
                  onClick={handlePricing}
                >
                  See Pricing
                </Button>
                <Button
                  type="text"
                  height={44}
                  className="px-[var(--space-12)]"
                  icon={
                    <ChevronRight className="ml-[6px] size-4" aria-hidden />
                  }
                  onClick={handleGetStarted}
                >
                  Spot Instance Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2 */}
        <div
          className="relative min-h-[472px] overflow-hidden rounded-[8px] border border-[var(--green-100)]"
          style={{
            backgroundImage: "url('/gpus/v5/instance-auto-card-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute left-[-80px] top-[-96px] size-[420px] rounded-full bg-[var(--green-200)] opacity-60 blur-[110px]" />

          <div className="relative flex flex-col gap-space-32 p-space-24 lg:h-full lg:flex-row lg:items-center lg:gap-[40px] lg:p-space-80">
            <div className="min-w-0 lg:max-w-[626px] lg:flex-1">
              <h3 className="font-miletus font-display-sm text-[var(--text-1)]">
                Auto-scale with
              </h3>
              <p className="mt-space-16 max-w-[576px] font-paragraph-18 text-[var(--text-3)]">
                Novita&apos;s serverless GPU platform automatically scales to
                your workload demands. Billed only for the resources consumed.
              </p>

              <div className="mt-space-32 flex flex-wrap items-center gap-[var(--space-12)]">
                <Button
                  type="primary"
                  height={44}
                  width={115}
                  onClick={handleServerlessDeployCta}
                  className="font-miletus font-paragraph-15"
                >
                  Start Now
                </Button>
                <Button
                  type="text"
                  height={44}
                  onClick={handlePricing}
                  width={115}
                  className="px-[var(--space-12)]"
                  icon={
                    <ChevronRight className="ml-[6px] size-4" aria-hidden />
                  }
                >
                  Pricing
                </Button>
              </div>

              <div className="mt-space-32 flex flex-col gap-space-12 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-[var(--space-8)]">
                  <span className="flex size-[24px] items-center justify-center rounded-[8px] border border-[var(--alpha-light-60)] bg-[var(--alpha-light-80)]">
                    <Timer
                      className="size-[14px] text-[var(--text-2)]"
                      aria-hidden
                    />
                  </span>
                  <span className="font-paragraph-15 text-[var(--text-2)]">
                    Scales to zero in 30s
                  </span>
                </div>
                <div className="flex items-center gap-[var(--space-8)]">
                  <span className="flex size-[24px] items-center justify-center rounded-[8px] border border-[var(--alpha-light-60)] bg-[var(--alpha-light-80)]">
                    <Infinity
                      className="size-[14px] text-[var(--text-2)]"
                      aria-hidden
                    />
                  </span>
                  <span className="font-paragraph-15 text-[var(--text-2)]">
                    Unlimited concurrency
                  </span>
                </div>
                <div className="flex items-center gap-[var(--space-8)]">
                  <span className="flex size-[24px] items-center justify-center rounded-[8px] border border-[var(--alpha-light-60)] bg-[var(--alpha-light-80)]">
                    <Zap
                      className="size-[14px] text-[var(--text-2)]"
                      aria-hidden
                    />
                  </span>
                  <span className="font-paragraph-15 text-[var(--text-2)]">
                    Per-second billing
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:basis-[43.2%] lg:shrink lg:grow-0">
              <div className="relative mx-auto aspect-[436/332] w-full max-w-[520px]">
                <Image
                  src="/gpus/v5/instance-auto-line.png"
                  alt=""
                  fill
                  className="object-contain"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module 3 */}
        <div className="grid grid-cols-1 gap-[var(--space-16)] sm:grid-cols-2 lg:grid-cols-4">
          {capabilityTiles.map((tile, idx) => (
            <div
              key={tile.title}
              className="min-h-[167px] rounded-[6px] border border-[var(--border-strong)] bg-[var(--white)] p-[var(--space-20)]"
            >
              <div className="flex size-[36px] items-center justify-center rounded-[10px] bg-[var(--brand-3)]">
                <Image
                  src={`/gpus/v5/capablities/icon${idx + 1}.png`}
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden
                />
              </div>
              <h3 className="mt-[var(--space-16)] font-paragraph-16-medium text-[var(--text-1)] tracking-[-0.3125px]">
                {tile.title}
              </h3>
              <p className="mt-[var(--space-4)] font-paragraph-14 text-[var(--text-3)]">
                {tile.description}
              </p>
            </div>
          ))}
        </div>

        {/* Module 4 */}
        <section className="relative mt-space-48 overflow-hidden rounded-[8px]">
          <div className="border-b border-[var(--border-strong)] py-[var(--space-12)]">
            <div className="flex items-center gap-[var(--space-8)]">
              <span className="size-[8px] rounded-[2px] bg-[var(--brand-0)]" />
              <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--element-high-em)]">
                GPU PRICING
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-space-24 px-space-24 pb-space-24 pt-[calc(var(--space-48)+var(--space-12))] lg:flex-row lg:items-start lg:gap-[60px]">
            <div className="min-w-0 lg:basis-[42%] lg:shrink lg:grow-0">
              <div className="flex flex-col gap-space-24 py-[var(--space-24)]">
                <div className="max-w-[430px]">
                  <h3 className="font-miletus text-[28px] font-normal leading-[38px] tracking-[-0.56px] text-[var(--text-1)]">
                    Global Deployment
                  </h3>
                  <p className="mt-[var(--space-16)] font-paragraph-18 leading-[24px] text-[var(--text-3)]">
                    Deploy GPU instances closer to your users through our
                    worldwide network. Ensure minimal latency and fast access,
                    no matter where your users or teams are located.
                  </p>
                </div>

                <div className="flex flex-row flex-nowrap items-start justify-between gap-2 sm:justify-start sm:gap-space-24">
                  <div className="min-w-0 flex-1 border-r border-[var(--border-2)] py-[9px] pr-2 sm:pr-[var(--space-24)]">
                    <div className="font-miletus text-[22px] font-normal leading-[28px] tracking-[-0.44px] text-[var(--text-1)] sm:text-[28px] sm:leading-[36px] sm:tracking-[-0.56px] md:text-[32px] md:leading-[40px] lg:text-[36px] lg:leading-[44px] lg:tracking-[-0.72px]">
                      20+
                    </div>
                    <div className="font-miletus text-[11px] leading-[14px] text-[var(--text-1)] sm:font-paragraph-16 sm:leading-[24px] sm:tracking-[-0.3125px]">
                      locations
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-[9px] pr-2 sm:pr-[var(--space-24)]">
                    <div className="font-miletus text-[22px] font-normal leading-[28px] tracking-[-0.44px] text-[var(--text-1)] sm:text-[28px] sm:leading-[36px] sm:tracking-[-0.56px] md:text-[32px] md:leading-[40px] lg:text-[36px] lg:leading-[44px] lg:tracking-[-0.72px]">
                      4+
                    </div>
                    <div className="font-miletus text-[11px] leading-[14px] text-[var(--text-1)] sm:font-paragraph-16 sm:leading-[24px] sm:tracking-[-0.3125px]">
                      continents
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 w-full overflow-hidden rounded-[6px] bg-[var(--fill-4)] lg:basis-[58%] lg:shrink lg:grow-0">
              <div className="relative aspect-[647/397] w-full">
                <Image
                  src="/gpus/v5/gpu-pricing/right-bg.png"
                  alt=""
                  fill
                  className="object-contain"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
