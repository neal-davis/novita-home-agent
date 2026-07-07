"use client";

import { memo, type Ref } from "react";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import { NOVITA_URL } from "@/constants/urls";
import { AgentSandboxVisual } from "@/app/homepage/components/agent-sandbox/AgentSandboxVisual";
import { useI18nSubscription } from "@/i18n/provider";

/** 与 `ProductGpuCloudSection` / Figma `1:9320` 一致：图 651、文案 346、gap 40px */
const AGENT_SANDBOX_ROW_GRID =
  "lg:grid lg:grid-cols-[minmax(0,651fr)_minmax(0,346fr)] lg:gap-10 lg:items-end lg:w-full";

function ProductAgentSandboxSection({
  sectionRef,
}: {
  sectionRef: Ref<HTMLDivElement>;
}) {
  useI18nSubscription();

  return (
    <div
      ref={sectionRef}
      data-section-id="agent-sandbox"
      className="flex flex-col gap-6 mt-[80px]"
    >
      <SectionEyebrow label="AGENT SANDBOX" />
      <div
        className={[
          "flex flex-col gap-10 items-start",
          AGENT_SANDBOX_ROW_GRID,
        ].join(" ")}
      >
        <div className="min-w-0 w-full">
          <div className="relative w-full rounded-[6px] overflow-hidden">
            <AgentSandboxVisual />
          </div>
        </div>
        <div className="min-w-0 w-full flex flex-col gap-8 items-start">
          <div className="flex items-center gap-4">
            <div className="bg-dark-1 flex items-center justify-center rounded-sm size-5 shrink-0">
              <span className="font-mono-13 uppercase text-white">1</span>
            </div>
            <span className="font-mono-13 uppercase text-dark-2">
              Agent sandbox
            </span>
          </div>
          <div className="flex flex-col gap-4 max-w-[364px]">
            <h2 className="text-heading-h5 font-miletus text-dark-1">
              Secure, isolated runtimes. Built for agents that actually do
              things.
            </h2>
            <p className="text-paragraph-16 font-miletus text-dark-3">
              Not a notebook. Not a container you configure yourself. A
              purpose-built environment where agents run, use tools, call
              models, and execute tasks — cleanly, in isolation, every time.
            </p>
          </div>
          <Button
            type="secondary"
            height={44}
            renderTag="link"
            link={NOVITA_URL.SANDBOX_INDEX}
            className="gap-2 font-paragraph-15 font-miletus"
          >
            Get Started
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductAgentSandboxSection);
