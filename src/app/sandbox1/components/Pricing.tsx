"use client";

import { Fragment } from "react";
import Link from "next/link";
import SectionEyebrow from "./SectionEyebrow";
import { useI18n } from "@/i18n/provider";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";

/**
 * Pricing section - "Flexible, Usage-Based Pricing"
 *
 * Figma node: 10925:325
 *
 * Layout:
 * - Section header with eyebrow
 * - Title + description with "Learn more" link
 * - 3-column pricing table (flex columns, not HTML table)
 *   Col 1: Sample Configuration (280px fixed, nowrap)
 *   Col 2: Usage Example (flex-1)
 *   Col 3: Estimated Cost (200px fixed, right-aligned, nowrap)
 *
 * Responsive:
 * - md+ (768px): 3-column flex table
 * - <md: single-column card list, bottom-border only
 */

function createBillingBasisRows() {
  return [
    {
      basis: "vCPU",
      description: "Calculated per allocated vCPU-second",
      price: "$0.0000098 / vCPU-second",
    },
    {
      basis: "Memory",
      description: "Calculated per allocated GiB-second",
      price: "$0.0000032 / GiB-second",
    },
    {
      basis: "Storage",
      description: "Measured hourly and charged daily. First 60 GB included",
      price: "$0.00009 / GB-hour",
    },
  ];
}

function createPricingRows() {
  return [
    {
      config: "1 vCPU + 512 MiB RAM",
      usage: "Short-lived agent task (5 min)",
      cost: "~$0.0034",
    },
    {
      config: "2 vCPU + 1 GiB RAM",
      usage: "Code execution job (1 hr)",
      cost: "~$0.0821",
    },
    {
      config: "8 vCPU + 8 GiB RAM",
      usage: "Multi-agent or RL workload (1 hr)",
      cost: "~$0.3744",
    },
  ];
}

export default function Pricing() {
  useI18n();
  const router = useRouter();
  const pricingRows = createPricingRows();
  const billingBasisRows = createBillingBasisRows();

  return (
    <section
      id="pricing"
      className="w-full bg-white py-10 md:py-12 lg:py-[60px]"
    >
      <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
        <div className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex flex-col gap-6">
            <SectionEyebrow label="Pricing" />

            <div className="flex flex-col gap-4 py-4">
              {/* H5 on tablet/mobile (24px), H2 on desktop (40px) */}
              <h2 className="text-2xl leading-8 tracking-[-0.48px] lg:text-[40px] lg:leading-[48px] lg:tracking-[-0.8px] font-normal text-black">
                Flexible, Usage-Based Pricing
              </h2>
              {/* 16px on tablet/mobile, 20px on desktop */}
              <p className="text-base leading-[22px] lg:text-[20px] lg:leading-[26px] text-[rgba(10,10,10,0.6)]">
                Per-second billing based on vCPU and memory allocation. No
                plans, no lock-ins, no hidden costs.{" "}
                <Link
                  href="/pricing?sandbox=1"
                  // target="_blank"
                  className="mt-auto inline-flex w-fit items-center gap-[var(--space-8)] font-paragraph-16-medium text-element-high-em no-underline transition-opacity hover:opacity-70"
                >
                  Learn more
                  <ChevronRight className="size-[14px]" strokeWidth={1.8} />
                </Link>
                {/* <a
                  href="/pricing?sandbox=1"
                  className="text-[rgba(10,10,10,0.6)] hover:underline"
                >
                  Learn more
                </a> */}
              </p>
            </div>
          </div>

          {/* Desktop table — CSS grid ensures all rows share the same height */}
          <div className="hidden md:grid grid-cols-[280px_1fr_200px]">
            {/* Header row */}
            <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Billing Basis
              </span>
            </div>
            <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Billing Basis
              </span>
            </div>
            <div className="flex items-center justify-end px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Unit Price
              </span>
            </div>

            {/* Data rows */}
            {billingBasisRows.map((row) => (
              <Fragment key={row.basis}>
                <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-para-18 text-gray-800 whitespace-nowrap">
                    {row.basis}
                  </span>
                </div>
                <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-para-18 text-[rgba(10,10,10,0.6)] whitespace-nowrap">
                    {row.description}
                  </span>
                </div>
                <div className="flex items-center justify-end px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-p-medium text-green-700 whitespace-nowrap">
                    {row.price}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Mobile list layout — bottom border only, no card box */}
          <div className="mt-0 flex flex-col md:hidden">
            {billingBasisRows.map((row) => (
              <div
                key={row.basis}
                className="border-b border-[rgba(10,10,10,0.1)] px-3 py-7 flex flex-col gap-6"
              >
                {/* Config + Usage */}
                <div className="flex flex-col gap-2">
                  <p className="text-[18px] leading-6 text-gray-800">
                    {row.basis}
                  </p>
                  <p className="text-[18px] leading-6 text-[rgba(10,10,10,0.6)]">
                    {row.description}
                  </p>
                </div>
                {/* Est. Cost */}
                <div className="flex flex-col gap-2">
                  <span className="font-tt-mono text-[13px] leading-[13px] uppercase tracking-[0.26px] text-[rgba(10,10,10,0.4)]">
                    Unit Price
                  </span>
                  <span className="text-xl leading-[26px] font-medium text-green-700">
                    {row.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl mt-10 leading-8 tracking-[-0.48px] lg:text-[40px] lg:leading-[48px] lg:tracking-[-0.8px] font-normal text-black">
            Usage-Based Pricing Examples
          </h2>
          {/* Desktop table — CSS grid ensures all rows share the same height */}
          <div className="hidden md:grid grid-cols-[280px_1fr_200px]">
            {/* Header row */}
            <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Sample Configuration
              </span>
            </div>
            <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Usage Example
              </span>
            </div>
            <div className="flex items-center justify-end px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
              <span className="font-mono-13 uppercase text-[rgba(10,10,10,0.4)] whitespace-nowrap">
                Estimated Cost
              </span>
            </div>

            {/* Data rows */}
            {pricingRows.map((row) => (
              <Fragment key={row.config}>
                <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-para-18 text-gray-800 whitespace-nowrap">
                    {row.config}
                  </span>
                </div>
                <div className="flex items-center px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-para-18 text-[rgba(10,10,10,0.6)] whitespace-nowrap">
                    {row.usage}
                  </span>
                </div>
                <div className="flex items-center justify-end px-3 py-7 border-b border-[rgba(10,10,10,0.1)]">
                  <span className="font-p-medium text-green-700 whitespace-nowrap">
                    {row.cost}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Mobile list layout — bottom border only, no card box */}
        <div className="mt-0 flex flex-col md:hidden">
          {pricingRows.map((row) => (
            <div
              key={row.config}
              className="border-b border-[rgba(10,10,10,0.1)] px-3 py-7 flex flex-col gap-6"
            >
              {/* Config + Usage */}
              <div className="flex flex-col gap-2">
                <p className="text-[18px] leading-6 text-gray-800">
                  {row.config}
                </p>
                <p className="text-[18px] leading-6 text-[rgba(10,10,10,0.6)]">
                  {row.usage}
                </p>
              </div>
              {/* Est. Cost */}
              <div className="flex flex-col gap-2">
                <span className="font-tt-mono text-[13px] leading-[13px] uppercase tracking-[0.26px] text-[rgba(10,10,10,0.4)]">
                  Est. Cost
                </span>
                <span className="text-xl leading-[26px] font-medium text-green-700">
                  {row.cost}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 mb-16 text-paragraph-16">
          <span className="text-text-2">* Free tier quota:</span>{" "}
          <span className="text-text-3">
            5 concurrent sandboxes, 1-hour max session. Top up your balance and
            use the sandbox to unlock paid tier (100 concurrent, 24-hour
            session) automatically.
          </span>
        </p>
        <div className="md:p-20 flex flex-col gap-4 md:bg-[url('/sandbox1/page/pricing/bg.png')] bg-cover bg-center">
          <div className="flex justify-between items-center gap-4">
            <div className="md:text-heading-h2 text-heading-h5 text-black">
              Free vs Paid Tier
            </div>
            <Button
              type="primary"
              height={44}
              width={116}
              onClick={() => {
                router.push(NOVITA_URL.SANDBOX_CONSOLE);
              }}
              className="text-element-inverse font-paragraph-15"
            >
              Try now
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Button>
          </div>
          <div className="md:text-paragraph-20 text-paragraph-16 text-element-mid-em">
            Start with free tier with $100 on us. Top up your balance to unlock
            production-grade resources automatically
          </div>
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="md:w-1/2 w-full rounded-md border border-border-2 bg-white p-3">
              <div className="text-heading-4 text-element-low-em border-b border-default px-2 py-6">
                FREE TIER
              </div>
              <div className="flex flex-col gap-2 text-paragraph-16 text-element-mid-em px-2 py-6">
                <span>$ 100 free usage</span>
                <span>5 concurrent sandboxes</span>
                <span>1 hour max session length</span>
                <span>2 vCPU per Sandbox</span>
                <span>4 GB RAM per Sandbox</span>
                <span>No priority scheduling</span>
              </div>
            </div>
            <div className="md:w-1/2 w-full rounded-md border border-brand-1 bg-white p-3">
              <div className="text-heading-4 text-brand-1 border-b border-default px-2 py-6">
                PAID TIER
              </div>
              <div className="flex flex-col gap-2 text-paragraph-16 text-element-mid-em px-2 py-6">
                <span>Pay-as-you-go</span>
                <span>100 concurrent sandboxes</span>
                <span>24 hours max session length</span>
                <span>Up to 8 vCPU per sandbox</span>
                <span>Up to 8 GB RAM per sandbox</span>
                <span>Support priority scheduling</span>
              </div>
            </div>
          </div>
          <div className="text-paragraph-20 text-text-3">
            Paid tier unlocks automatically once your account balance is above
            $0.
          </div>
        </div>
      </div>
    </section>
  );
}
