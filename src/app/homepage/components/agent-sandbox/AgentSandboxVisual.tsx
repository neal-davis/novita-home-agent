"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GreenNameSlot } from "@/app/homepage/components/model-viz/GreenNameTag";
import { VizBracket } from "@/lib/icons/VizAssets";
import { useElementActivity } from "@/hooks/useElementActivity";
import { gpuCloudVisualFrameClassName } from "@/app/homepage/components/gpu-cloud/gpuCloudVisualFrame";
import {
  AGENT_SANDBOX_STEP_MS,
  agentSandboxTaskIconSrc,
  createAgentSandboxVariants,
  nextAgentSandboxVariantIndex,
  type AgentSandboxMetric,
  type AgentSandboxTaskRow,
  type AgentSandboxTaskStatus,
} from "./agentSandboxVisualData";
import { useI18nSubscription } from "@/i18n/provider";

const BG = "/home/product/agent-sandbox.png";
const TOP_AGENT_ICON = "/home/product/sandbox/top-icon.png";

function AgentSandboxMicroTag({ label }: { label: string }) {
  return (
    <div className="bg-white border border-black border-solid flex gap-[6px] items-center pl-[3px] pr-[6px] py-[2px] rounded-[3px] shrink-0">
      <Image
        src={TOP_AGENT_ICON}
        alt=""
        width={20}
        height={20}
        loading="lazy"
        className="shrink-0 size-5"
      />
      <span className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase text-element-high-em whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function SandboxRuntimeDot() {
  return (
    <div className="relative size-3 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, var(--alpha-light-80), var(--alpha-light-80)), linear-gradient(90deg, var(--brand-0), var(--brand-0))`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "var(--brand-0)" }}
      />
    </div>
  );
}

function AgentStatusPill({ status }: { status: AgentSandboxTaskStatus }) {
  const base =
    "font-tt-mono text-[10px] leading-[1.2] tracking-[0.4px] uppercase whitespace-nowrap px-1 py-1 rounded-[2px] shrink-0";
  if (status === "queued") {
    return (
      <div
        className={`${base} bg-[var(--status-neutral-bg)] text-[var(--status-neutral)]`}
      >
        queued
      </div>
    );
  }
  if (status === "running") {
    return (
      <div
        className={`${base} bg-[var(--status-info-bg)] text-[var(--status-info)]`}
      >
        running
      </div>
    );
  }
  return (
    <div
      className={`${base} bg-[var(--status-success-bg)] text-[var(--status-success)]`}
    >
      done
    </div>
  );
}

function taskLineTone(status: AgentSandboxTaskStatus) {
  return status === "done"
    ? "text-[var(--element-low-em)]"
    : "text-[var(--element-mid-em)]";
}

function TaskRow({
  row,
  iconSrc,
}: {
  row: AgentSandboxTaskRow;
  iconSrc: string;
}) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-[3px] border border-black border-solid bg-white">
          <Image
            src={iconSrc}
            alt=""
            width={12}
            height={12}
            loading="lazy"
            className="size-3 shrink-0 object-contain"
          />
        </div>
        <p
          className={[
            "min-w-0 truncate font-tt-mono text-[10px] leading-[1.2]",
            taskLineTone(row.status),
          ].join(" ")}
        >
          {row.text}
        </p>
      </div>
      <AgentStatusPill status={row.status} />
    </div>
  );
}

function MetricCell({ metric }: { metric: AgentSandboxMetric }) {
  const valueClass =
    metric.tone === "brand"
      ? "text-[var(--status-info)]"
      : "text-element-high-em";
  return (
    <div className="flex min-w-0 flex-col gap-1 font-tt-mono uppercase">
      <span className="text-[11px] leading-[1.2] tracking-[0.44px] text-[var(--element-low-em)]">
        {metric.label}
      </span>
      <span
        className={[
          "text-[11px] leading-[1.2] tracking-[0.44px] whitespace-nowrap",
          valueClass,
        ].join(" ")}
      >
        {metric.value}
      </span>
    </div>
  );
}

/**
 * Figma `1:10608` — Agent Sandbox：顶栏 agent 标 + 绿标四态轮播；中部摘要 + 四行任务（icon 随态）；底栏四列指标。
 */
export function AgentSandboxVisual() {
  useI18nSubscription();

  const variants = createAgentSandboxVariants();
  const [variantIndex, setVariantIndex] = useState(0);
  const { ref, isActive } = useElementActivity<HTMLDivElement>();
  const variant = variants[variantIndex];

  useEffect(() => {
    if (!isActive) return;

    const id = window.setInterval(() => {
      setVariantIndex((j) => nextAgentSandboxVariantIndex(j, variants.length));
    }, AGENT_SANDBOX_STEP_MS);
    return () => window.clearInterval(id);
  }, [isActive, variants.length]);

  return (
    <div ref={ref} className={gpuCloudVisualFrameClassName}>
      <div className="absolute inset-0 z-0">
        <Image
          src={BG}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain object-center max-lg:object-[50%_0%]"
          loading="lazy"
          priority={false}
        />
      </div>
      {/*
        <lg：外层 flex 纵横居中；内层宽度与桌面一致 w = 528/651×画框（与 Bare Metal 前景区一致，不用 left50%+translate）。
        lg+：Figma 绝对区（62/651、72/480、528/651）。
      */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center",
          "lg:block lg:items-stretch lg:justify-normal",
        ].join(" ")}
      >
        <div
          className={[
            "box-border flex min-h-0 min-w-0 flex-col gap-3",
            "w-[calc(528/651*100%)] max-lg:self-center max-lg:p-4",
            "lg:absolute lg:inset-auto lg:left-[calc(62/651*100%)] lg:top-[calc(72/480*100%)] lg:translate-x-0 lg:self-auto lg:gap-4 lg:p-6",
          ].join(" ")}
        >
          <div className="flex w-full shrink-0 items-center justify-center">
            <div className="flex max-w-full items-center gap-3">
              <AgentSandboxMicroTag label="agent" />
              <div className="flex min-w-0 shrink-0 items-center gap-1.5">
                <VizBracket
                  className="shrink-0"
                  style={{ height: 23, width: 3.6 }}
                />
                <GreenNameSlot name={variant.greenTagDisplay} autoWidth />
                <VizBracket
                  className="shrink-0"
                  style={{ height: 23, width: 3.6, transform: "scaleX(-1)" }}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-end justify-between gap-4 font-tt-mono text-[11px] leading-[1.2] tracking-[0.44px] text-[var(--element-low-em)]">
            <span className="whitespace-nowrap uppercase">
              {variant.summaryLeft}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <SandboxRuntimeDot />
              <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.4px]">
                {variant.summaryRight}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col justify-center gap-2 max-lg:justify-start">
            {variant.tasks.map((row, i) => (
              <TaskRow
                key={`${variant.id}-${i}`}
                row={row}
                iconSrc={agentSandboxTaskIconSrc(
                  variant.assetFolder,
                  i as 0 | 1 | 2 | 3,
                )}
              />
            ))}
          </div>

          <div
            className="h-px w-full max-w-full shrink-0 bg-[var(--alpha-dark-10)]"
            aria-hidden
          />

          <div className="grid w-full shrink-0 grid-cols-2 gap-4 sm:grid-cols-4 sm:justify-between">
            {variant.metrics.map((m) => (
              <MetricCell key={m.label} metric={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
