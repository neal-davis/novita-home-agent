"use client";

import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import { useI18n } from "@/i18n/provider";
import WhyNovitaGetStartedButton from "./WhyNovitaGetStartedButton";

/**
 * WhyNovita section — "Built for AI from day one."
 *
 * Layout (desktop):
 *   Row 1: [Heading + CTA] | [Card: Better price-performance] | [Card: Production reliability]
 *   Row 2: [Card: One platform] | [Card: Scale with workload] | [Card: Dedicated support]
 *
 * Mobile: all stacked vertically, illustrations hidden on very small screens.
 */

/** `public/home/why-novita/*.png` 均为 1430×836 — 窄屏用同比例容器 + contain 才看得全 */
const WHY_CARD_IMAGE_ASPECT_CLASS = "aspect-[1430/836]";

// ── Feature card component ─────────────────────────────────────────────────
interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
}

function FeatureCard({ imageSrc, title, description }: FeatureCardProps) {
  return (
    <div className="border-l border-[var(--border-default)] flex flex-col gap-[32px] px-[32px] py-[16px]">
      {/* Illustration: <lg 按素材比例给高，object-contain 不裁切；lg 固定条高 + cover 贴 Figma */}
      <div
        className={[
          "w-full shrink-0 overflow-hidden border border-[var(--border-2)] bg-fill-4",
          WHY_CARD_IMAGE_ASPECT_CLASS,
          "lg:aspect-auto lg:h-[209px]",
        ].join(" ")}
      >
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain object-center lg:object-cover"
        />
      </div>
      <div className="flex flex-col gap-[18px]">
        <p className="font-paragraph-18 text-[var(--text-1)]">{title}</p>
        <p className="font-paragraph-18 text-[var(--text-3)]">{description}</p>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function WhyNovita() {
  useI18n();

  return (
    <section className="w-full bg-bg-default py-16 md:py-20 lg:py-[80px]">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-[48px]">
        <SectionEyebrow label="Why Novita AI" />

        {/* 3-column grid — ensures all columns share identical widths across both rows */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 lg:gap-y-12">
          {/* Heading + CTA */}
          <div className="flex flex-col gap-10 py-4 mb-8 lg:mb-0">
            <p className="font-heading-h4 text-[var(--text-1)] w-[346px]">
              {
                "Built for AI from day one. Designed for what you're actually building."
              }
            </p>
            <WhyNovitaGetStartedButton />
          </div>

          {/* Card 1: Better price-performance */}
          <FeatureCard
            imageSrc="/home/why-novita/better-price-performance.png"
            title="Better price-performance"
            description="Up to 50% less than major cloud providers. Not because we cut corners, because we built the infrastructure."
          />

          {/* Card 2: Production reliability */}
          <FeatureCard
            imageSrc="/home/why-novita/build-for-production.png"
            title="Built for production reliability"
            description="Stable infrastructure with low latency, high throughput, and reliable uptime at scale."
          />

          {/* Card 3: One platform */}
          <FeatureCard
            imageSrc="/home/why-novita/ai-stack.png"
            title="One platform for the full AI stack"
            description="Model APIs, GPU infrastructure, and agent runtimes — all in one platform."
          />

          {/* Card 4: Scale */}
          <FeatureCard
            imageSrc="/home/why-novita/workload.png"
            title="Scale with your workload"
            description="Start small and scale seamlessly from APIs to dedicated clusters."
          />

          {/* Card 5: Support */}
          <FeatureCard
            imageSrc="/home/why-novita/dedicate-support.png"
            title="Dedicated support when it matters"
            description="Fast technical support from a team that understands AI infrastructure."
          />
        </div>
      </div>
    </section>
  );
}
