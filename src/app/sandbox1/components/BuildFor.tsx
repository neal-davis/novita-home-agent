"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import { DOCS_URL } from "@/constants/urls";
import { makeDocsHref } from "@/lib/utils/url";
import { useI18n } from "@/i18n/provider";

type WorkloadCardItem = {
  number?: string;
  title?: string;
  description?: string;
  backgroundImage?: string;
  href?: string;
};

function createWorkloadCards(): WorkloadCardItem[] {
  return [
    {
      number: "01",
      title: "Coding Agents",
      description:
        "Run agents that write, execute, and iterate on code in isolated sandbox environments.",
      href: DOCS_URL.CREATE_SANDBOX,
    },
    {
      number: "02",
      title: "Browser Automation",
      description:
        "Power agents that browse the web, complete multi-step tasks, and extract structured results.",
      backgroundImage: "/sandbox1/page/build-for/card-bg01.png",
      href: DOCS_URL.SANDBOX_BROWSER_USE,
    },
    {
      number: "03",
      title: "Computer Use",
      description:
        "Enable agents to interact with full desktop environments for GUI-based workflows and human-like actions.",
      backgroundImage: "/sandbox1/page/build-for/card-bg02.png",
      href: DOCS_URL.SANDBOX_E2B_DESKTOP,
    },
    {
      number: "04",
      title: "Evaluations & RL",
      description:
        "Run repeatable evaluation and reinforcement learning workloads in controlled environments for testing, training, and iterative optimization.",
      href: DOCS_URL.CREATE_SANDBOX,
    },
    {
      number: "05",
      title: "AI-Powered CI/CD",
      description:
        "Run code review, test generation, and validation workflows in isolated sandboxes across your CI/CD pipelines.",
      backgroundImage: "/sandbox1/page/build-for/card-bg01.png",
      href: DOCS_URL.SANDBOX_INTRODUCTION,
    },
    {
      number: "06",
      title: "Long-running Workflows",
      description:
        "Keep multi-step agent tasks running across extended sessions without breaking execution flow.",
      backgroundImage: "/sandbox1/page/build-for/card-bg02.png",
      href: DOCS_URL.SANDBOX_OPENCLAW_CLI,
    },
  ];
}

function WorkloadCard({
  number,
  title,
  description,
  backgroundImage,
  href,
}: WorkloadCardItem) {
  const hasContent = number && title && description;

  return (
    <div
      className="flex h-[240px] flex-col overflow-hidden bg-[#f2f1ec] bg-cover bg-center p-[var(--space-24)]"
      style={
        backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
      }
    >
      {hasContent ? (
        <>
          <span className="font-mono-13 text-element-mid-em">{number}</span>
          <div className="mt-[var(--space-12)] flex w-full max-w-[320px] flex-col gap-[var(--space-12)]">
            <h3 className="font-heading-h5 text-element-high-em md:font-heading-h4">
              {title}
            </h3>
            <p className="font-paragraph-16 text-element-mid-em md:font-paragraph-18">
              {description}
            </p>
          </div>
          <Link
            href={makeDocsHref(href)}
            target="_blank"
            className="mt-auto inline-flex w-fit items-center gap-[var(--space-8)] font-paragraph-14 text-element-high-em no-underline transition-opacity hover:opacity-70"
          >
            Learn more
            <ChevronRight className="size-[14px]" strokeWidth={1.8} />
          </Link>
        </>
      ) : null}
    </div>
  );
}

export default function BuildFor() {
  useI18n();
  const workloadCards = createWorkloadCards();

  return (
    <section className="w-full bg-white py-[40px] md:py-[var(--space-48)] lg:py-[var(--space-80)]">
      <div className="mx-auto max-w-[1360px] px-[var(--space-20)] md:px-[var(--space-48)]">
        <div className="flex flex-col gap-[var(--space-24)]">
          <SectionEyebrow label="Built for AI-native workloads" />

          <div className="flex max-w-[430px] flex-col gap-[var(--space-16)] py-[var(--space-16)]">
            <h2 className="font-heading-h4 text-element-high-em md:font-heading-h2">
              From agent execution to evals and RL
            </h2>
            <p className="font-paragraph-16 text-element-mid-em md:font-paragraph-20">
              Support the full range of AI-native workloads—from coding agents
              and browser automation to evaluations, reinforcement learning
              environments, and long-running workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[var(--space-24)] pt-[var(--space-16)] md:grid-cols-2 lg:grid-cols-3">
            {workloadCards.map((card, index) => (
              <WorkloadCard key={card.number ?? `visual-${index}`} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
