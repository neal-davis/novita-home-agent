"use client";

import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import SectionEyebrow from "./SectionEyebrow";
import { DOCS_URL, SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { makeDocsHref } from "@/lib/utils/url";
import { useI18n } from "@/i18n/provider";

function createGuides() {
  return [
    {
      number: "01",
      title: "Quick Start",
      description: "Launch your first sandbox in minutes.",
      link: DOCS_URL.CREATE_SANDBOX,
    },
    {
      number: "02",
      title: "Templates",
      description:
        "Define reusable sandbox environments once and use them across workloads.",
      link: DOCS_URL.SANDBOX_TEMPLATE,
      bg: "/sandbox1/page/build-with/template-bg.png",
    },
    {
      number: "03",
      title: "File system",
      description:
        "Each sandbox includes an isolated filesystem for code, data, and session state.",
      link: DOCS_URL.SANDBOX_FILESYSTEM,
      bg: "/sandbox1/page/build-with/file-system.png",
    },
  ];
}

function createEnterpriseMetrics() {
  return [
    { label: "Uptime SLA", value: "99.95%" },
    { label: "Max vCPUs per Sandbox", value: "Custom" },
    { label: "Deployment Region", value: "Your Choice" },
    { label: "Concurrent Instances", value: "Unlimited" },
  ];
}

export default function BuildWith() {
  useI18n();
  const guides = createGuides();
  const enterpriseMetrics = createEnterpriseMetrics();

  return (
    <section className="w-full bg-white py-[40px] md:py-[var(--space-48)] lg:py-[var(--space-80)]">
      <div className="mx-auto max-w-[1360px] px-[var(--space-20)] md:px-[var(--space-48)] lg:px-[var(--space-48)]">
        <div className="flex flex-col gap-[var(--space-24)]">
          {/* Eyebrow */}
          <SectionEyebrow label="Built with Novita AI" />

          {/* Heading */}
          <div className="flex flex-col gap-[var(--space-16)] py-[var(--space-16)]">
            <h2 className="font-heading-h5 text-element-high-em md:font-heading-h2 md:whitespace-nowrap">
              Start building with Agent Sandbox
            </h2>
            <p className="font-paragraph-16 text-element-mid-em md:font-paragraph-20 md:whitespace-nowrap">
              Get started with quickstarts, reusable templates, and isolated
              sandbox storage.
            </p>
          </div>

          {/* Guide cards */}
          <div className="pt-[var(--space-16)]">
            <div className="flex flex-col md:flex-row gap-[var(--space-24)]">
              {guides.map((guide) => (
                <div
                  key={guide.number}
                  className="flex h-[240px] flex-1 flex-col justify-between overflow-hidden bg-[#f2f1ec] bg-cover bg-center p-[var(--space-24)]"
                  style={
                    guide.bg ? { backgroundImage: `url(${guide.bg})` } : {}
                  }
                >
                  <span className="font-mono-14 leading-[24px] text-element-mid-em">
                    {guide.number}
                  </span>

                  <div className="flex w-full max-w-[320px] flex-col gap-[var(--space-12)] opacity-80">
                    <h3 className="font-heading-h4 text-element-high-em">
                      {guide.title}
                    </h3>
                    <p className="font-paragraph-18 text-element-mid-em">
                      {guide.description}
                    </p>
                  </div>

                  <a
                    href={makeDocsHref(guide.link)}
                    target="_blank"
                    className="flex items-center gap-[var(--space-8)] font-paragraph-15 text-element-high-em transition-opacity hover:opacity-70"
                  >
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise banner */}
          {/* CHK: bg-[#f2f1ec] — no design token for this brand beige; bg image overrides visually */}
          <div
            className="bg-[#f2f1ec] overflow-hidden p-[var(--space-32)] md:p-[var(--space-48)] lg:p-[var(--space-80)]"
            style={{
              backgroundImage: "url(/sandbox1/page/build-with/enterprise.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-[40px]">
              {/* Left text */}
              <div className="flex-1 flex flex-col gap-[40px]">
                <div className="flex flex-col gap-[var(--space-16)]">
                  <h2 className="font-heading-h2 text-element-high-em md:font-heading-h1">
                    Enterprise
                  </h2>
                  <p className="font-paragraph-18 text-element-mid-em max-w-[432px]">
                    For advanced workloads that need higher resource limits,
                    custom deployment regions, or dedicated infrastructure.
                  </p>
                </div>

                <div className="flex flex-col gap-[var(--space-12)] sm:flex-row sm:items-center">
                  <Button
                    type="primary"
                    height={44}
                    renderTag="link"
                    link={`mailto:${SUPPORT_EMAIL_LINK}`}
                    elAttrs={{
                      target: "_blank",
                      rel: "noopener noreferrer",
                      title: "Contact support",
                    }}
                    className="font-paragraph-15 w-full sm:w-auto"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>

              {/* Right metric cards */}
              <div className="shrink-0 flex flex-col gap-[var(--space-12)] lg:px-[40px]">
                {enterpriseMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-[var(--space-12)] md:flex-row md:items-center md:justify-between bg-white rounded-sm px-[var(--space-24)] py-[var(--space-20)] w-full lg:w-[440px] shadow-module border border-white/[0.16]"
                  >
                    <span className="font-paragraph-16 text-element-high-em">
                      {item.label}
                    </span>
                    <span className="font-paragraph-20 whitespace-nowrap text-emerald-600">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
