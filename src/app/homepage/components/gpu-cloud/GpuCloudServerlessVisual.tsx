"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GpuCloudJobConnector } from "@/lib/icons/VizAssets";
import { useElementActivity } from "@/hooks/useElementActivity";
import { GpuMicroTag } from "./GpuMicroTag";
import { gpuCloudVisualFrameClassName } from "./gpuCloudVisualFrame";
import {
  SERVERLESS_JOB_PHASES,
  SERVERLESS_STEP_DWELL_MS,
  nextServerlessPhaseIndex,
} from "./serverlessJobPhases";
import { useI18nSubscription } from "@/i18n/provider";
const BG = "/home/product/gpu-cloud02.png";

const PILL_IDS = ["queued", "running", "complete"] as const;

/** 与 `SERVERLESS_STEP_TRANSITION_MS`（500）一致 */
const MOTION_DURATION_CLASS = "duration-500";

function subscribeReducedMotion(onStoreChange: () => void) {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function AllocatingStatusDot() {
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

type StepPillProps = {
  children: ReactNode;
  active?: boolean;
  showDot?: boolean;
  motionTransition?: boolean;
};

function StepPill({
  children,
  active = true,
  showDot = false,
  motionTransition = true,
}: StepPillProps) {
  const colorMotion = motionTransition
    ? `transition-[color,border-color] ease-out ${MOTION_DURATION_CLASS}`
    : "";
  const dotMotion = motionTransition
    ? `transition-[width,margin] ease-out ${MOTION_DURATION_CLASS}`
    : "";
  return (
    <div
      className={[
        "bg-white border border-solid h-6 inline-flex items-center px-[5px] py-[2px] rounded-[3px] shrink-0 w-max overflow-hidden",
        colorMotion,
        active ? "border-black" : "border-[var(--element-disabled)]",
      ].join(" ")}
    >
      {/* 与 MODEL APIS 标签一致：宽度随文案；仅左侧高亮块用 width/margin 过渡，外壳不做 min-width 动画 */}
      <span
        className={[
          "rounded-[2px] shrink-0 bg-[var(--brand-0)] overflow-hidden",
          dotMotion,
          showDot ? "size-2 mr-1.5" : "w-0 mr-0 h-2",
        ].join(" ")}
        aria-hidden
      />
      <span
        className={[
          "font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase whitespace-nowrap",
          active ? "text-element-high-em" : "text-[var(--element-disabled)]",
        ].join(" ")}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Figma 1:9330 GPU Cloud — Serverless：指标 / JOB 流程 / 状态 / 进度，design token + font-tt-mono
 * 底图作氛围；若与导出成图字体重叠，可调 IMAGE_OPACITY
 */
const IMAGE_OPACITY = 0.55;

export function GpuCloudServerlessVisual() {
  useI18nSubscription();

  const [phaseIndex, setPhaseIndex] = useState(0);
  const { ref, isActive } = useElementActivity<HTMLDivElement>();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const motionTransition = !reducedMotion;

  const phase = useMemo(() => SERVERLESS_JOB_PHASES[phaseIndex], [phaseIndex]);

  useEffect(() => {
    if (!isActive || reducedMotion) return;

    const id = window.setInterval(() => {
      setPhaseIndex((i) => nextServerlessPhaseIndex(i));
    }, SERVERLESS_STEP_DWELL_MS);
    return () => window.clearInterval(id);
  }, [isActive, reducedMotion]);

  return (
    <div ref={ref} className={gpuCloudVisualFrameClassName}>
      <div className="absolute inset-0 z-0">
        <Image
          src={BG}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain object-center"
          style={{ opacity: IMAGE_OPACITY }}
          loading="lazy"
          priority={false}
          unoptimized
        />
      </div>

      {/*
        <lg：flex 纵横居中；子级宽度用 min(100%,400px)+self-center（仅 items-center 时 w-full 仍会拉满整行，看起来不居中）。
        lg+：内层绝对定位对齐 Figma（top 137/480）。
      */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-3",
          "lg:block lg:justify-normal lg:items-stretch lg:px-0",
        ].join(" ")}
      >
        <div
          className={[
            "box-border flex min-w-0 flex-col gap-4 sm:gap-5",
            "max-lg:w-full max-lg:max-w-none max-lg:self-stretch",
            "lg:absolute lg:left-[calc(126/651*100%)] lg:top-[calc(137/480*100%)] lg:w-[calc(400/651*100%)] lg:max-w-none lg:self-auto",
          ].join(" ")}
        >
          {/* JOB 行左对齐：pill 随文案宽度变化时，避免整行 `justify-center` 反复重算造成 JOB/连线横向抖动 */}
          <div className="flex w-full min-w-0 shrink-0 justify-start">
            <div className="inline-flex items-center flex-nowrap gap-0 min-w-0">
              <GpuMicroTag label="job" />
              <GpuCloudJobConnector className="h-[12px] w-9 shrink-0 self-center text-[var(--element-high-em)] lg:w-16" />
              <div className="flex items-center gap-2 shrink-0">
                {PILL_IDS.map((id) => {
                  const active = phase.activeTag === id;
                  return (
                    <StepPill
                      key={id}
                      active={active}
                      showDot={active}
                      motionTransition={motionTransition}
                    >
                      {id}
                    </StepPill>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 对称说明（在 pill 行与进度条之间） */}
          <div className="relative flex items-start sm:items-center justify-between gap-2 w-full min-w-0 min-h-[22px]">
            <div className="relative flex-1 min-w-0 min-h-[14px]">
              {SERVERLESS_JOB_PHASES.map((p, i) => (
                <p
                  key={`left-${i}`}
                  className={[
                    "absolute left-0 top-0 max-w-[58%] font-tt-mono text-[11px] leading-[1.2] tracking-[0.44px] uppercase text-[var(--element-low-em)]",
                    motionTransition
                      ? `transition-all ease-out ${MOTION_DURATION_CLASS}`
                      : "",
                    i === phaseIndex
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-0.5 pointer-events-none",
                  ].join(" ")}
                  aria-hidden={i !== phaseIndex}
                >
                  {p.leftCaption}
                </p>
              ))}
            </div>
            <div className="relative h-[22px] min-w-0 shrink-0 max-lg:max-w-[min(140px,42%)] lg:min-w-[140px]">
              {SERVERLESS_JOB_PHASES.map((p, i) => (
                <div
                  key={`right-${i}`}
                  className={[
                    "absolute inset-0 flex items-center justify-end gap-2",
                    motionTransition
                      ? `transition-all ease-out ${MOTION_DURATION_CLASS}`
                      : "",
                    i === phaseIndex
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1 pointer-events-none",
                  ].join(" ")}
                  aria-hidden={i !== phaseIndex}
                >
                  <AllocatingStatusDot />
                  <span className="font-tt-mono text-[11px] leading-[1.2] tracking-[0.44px] uppercase text-element-mid-em whitespace-nowrap">
                    {p.rightStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full min-w-0">
            <div className="flex-1 h-3 rounded-sm overflow-hidden bg-[var(--alpha-dark-5)] min-w-0">
              <div
                className={[
                  "h-full bg-[var(--brand-0)]",
                  motionTransition
                    ? `transition-[width] ease-out ${MOTION_DURATION_CLASS}`
                    : "",
                ].join(" ")}
                style={{
                  width: `${phase.progressPercent}%`,
                  minWidth: "4px",
                }}
              />
            </div>
            <span
              data-testid="serverless-progress-pct"
              className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] text-[var(--element-low-em)] shrink-0 tabular-nums"
            >
              {phase.progressPercent}%
            </span>
          </div>

          <div
            className="h-px w-full bg-[var(--alpha-dark-10)] shrink-0"
            aria-hidden
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 w-full min-w-0">
            {(
              [
                {
                  label: "allocated",
                  value: "auto",
                  muted: false,
                  testId: null,
                },
                {
                  label: "duration",
                  value: phase.durationLabel,
                  muted: false,
                  testId: "serverless-duration-value",
                },
                {
                  label: "cost",
                  value: phase.costLabel,
                  muted: false,
                  testId: "serverless-cost-value",
                },
                {
                  label: "idle time",
                  value: "$0.00",
                  muted: true,
                  testId: null,
                },
              ] as const
            ).map((col) => (
              <div
                key={col.label}
                className="flex flex-col gap-1.5 min-w-0 font-tt-mono uppercase not-italic text-[11px] leading-[1.2] tracking-[0.44px] whitespace-nowrap"
              >
                <p className="text-[var(--element-low-em)]">{col.label}</p>
                <p
                  data-testid={col.testId ?? undefined}
                  className={
                    col.muted
                      ? "text-[var(--element-disabled)]"
                      : "text-element-high-em"
                  }
                >
                  {col.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
