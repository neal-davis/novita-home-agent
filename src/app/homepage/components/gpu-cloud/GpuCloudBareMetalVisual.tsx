"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GreenNameSlot } from "@/app/homepage/components/model-viz/GreenNameTag";
import { VizBracket } from "@/lib/icons/VizAssets";
import { useElementActivity } from "@/hooks/useElementActivity";
import { GpuMicroTag } from "./GpuMicroTag";
import {
  BARE_METAL_CLUSTER_GREEN_NAMES,
  BARE_METAL_CLUSTER_SUMMARY_LEFT,
  BARE_METAL_CLUSTER_SUMMARY_RIGHT,
  BARE_METAL_STEP_MS,
  bareMetalFromLinearIndex,
  getBareMetalPhase,
  nextBareMetalLinearIndex,
  type BareMetalClusterId,
  type BareMetalPhaseId,
} from "./bareMetalClusterStates";
import { gpuCloudVisualFrameClassName } from "./gpuCloudVisualFrame";
import { useI18nSubscription } from "@/i18n/provider";

const BG = "/home/product/gpu-cloud03.png";

/** 与 `BARE_METAL_TRANSITION_MS`（500）一致；Tailwind 需静态类名 */
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

function SpecLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-tt-mono text-[9px] leading-[1.2] whitespace-pre-wrap">
      <span className="uppercase text-[var(--element-low-em)]">{label}</span>
      <span className="text-element-high-em">{value}</span>
    </p>
  );
}

function ClusterCell({
  node,
  pct,
  motionTransition,
}: {
  node: string;
  pct: number | null;
  motionTransition: boolean;
}) {
  const barPct = pct ?? 0;
  const valueLine = pct === null ? "-" : `${pct}%`;
  const barMotion = motionTransition
    ? `transition-[width] ease-out ${MOTION_DURATION_CLASS}`
    : "";
  const labelMotion = motionTransition
    ? `transition-opacity ease-out ${MOTION_DURATION_CLASS}`
    : "";
  return (
    <div className="border border-black border-solid flex min-w-0 flex-1 flex-col items-center justify-center gap-[10px] p-2 text-center max-lg:min-w-[5.5rem] lg:items-start lg:text-left">
      <p className="font-tt-mono text-[10px] leading-[1.2] tracking-[0.4px] uppercase text-[var(--element-mid-em)] whitespace-nowrap">
        {node}
      </p>
      <div className="relative h-1 w-full rounded-sm overflow-hidden bg-[var(--alpha-dark-10)]">
        <div
          className={[
            "absolute left-0 top-0 h-full rounded-sm bg-[var(--brand-0)]",
            barMotion,
          ].join(" ")}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p
        className={[
          "font-tt-mono text-[11px] leading-[1.2] tracking-[0.44px] uppercase text-element-high-em whitespace-nowrap",
          labelMotion,
        ].join(" ")}
      >
        {valueLine}
      </p>
    </div>
  );
}

function StackedPhaseMetrics({
  cluster,
  activePhase,
  motionTransition,
}: {
  cluster: BareMetalClusterId;
  activePhase: BareMetalPhaseId;
  motionTransition: boolean;
}) {
  const motion = motionTransition
    ? `transition-opacity ease-out ${MOTION_DURATION_CLASS}`
    : "";
  return (
    <div className="relative w-full min-h-[72px] shrink-0">
      {([0, 1, 2] as const).map((p) => {
        const d = getBareMetalPhase(cluster, p);
        const on = p === activePhase;
        return (
          <div
            key={p}
            className={[
              "absolute left-0 top-0 flex w-full min-w-0 flex-col items-center gap-2 text-center",
              "lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:text-left",
              motion,
              on ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
            ].join(" ")}
            aria-hidden={!on}
          >
            <div className="flex min-w-0 shrink flex-col items-center gap-1.5 lg:items-start">
              <SpecLine label={d.left.gpuLabel} value={d.left.gpuValue} />
              <SpecLine
                label={d.left.gpuMemoryLabel}
                value={d.left.gpuMemoryValue}
              />
              <div className="flex flex-wrap items-baseline justify-center gap-1.5 lg:justify-start">
                <span className="font-tt-mono text-[14px] leading-[1.2] uppercase text-element-high-em tabular-nums">
                  {d.left.capacityValue}
                </span>
                <span className="font-tt-mono text-[11px] leading-[1.2] text-[var(--element-low-em)] whitespace-nowrap">
                  {d.left.capacityUnitLabel}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-0.5 text-center lg:items-end lg:text-right">
              <SpecLine label={d.right.nodesLabel} value={d.right.nodesValue} />
              <SpecLine
                label={d.right.interconnectLabel}
                value={d.right.interconnectValue}
              />
              <SpecLine
                label={d.right.networkLabel}
                value={d.right.networkValue}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Figma `1:9332` — Bare Metal：3 CLUSTER × 每簇 3 数据态（共 9 态），子态切换时进度条与底部指标淡入淡出。
 */
export function GpuCloudBareMetalVisual() {
  useI18nSubscription();

  const [linearIndex, setLinearIndex] = useState(0);
  const { ref, isActive } = useElementActivity<HTMLDivElement>();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const motionTransition = !reducedMotion;

  const { cluster, phase } = useMemo(
    () => bareMetalFromLinearIndex(linearIndex),
    [linearIndex],
  );

  const phaseData = useMemo(
    () => getBareMetalPhase(cluster, phase),
    [cluster, phase],
  );

  useEffect(() => {
    if (!isActive || reducedMotion) return;

    const id = window.setInterval(() => {
      setLinearIndex((j) => nextBareMetalLinearIndex(j));
    }, BARE_METAL_STEP_MS);
    return () => window.clearInterval(id);
  }, [isActive, reducedMotion]);

  const clusterMotion = motionTransition
    ? `transition-opacity ease-out ${MOTION_DURATION_CLASS}`
    : "";

  return (
    <div ref={ref} className={gpuCloudVisualFrameClassName}>
      <div className="absolute inset-0 z-0">
        <Image
          src={BG}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain object-center"
          loading="lazy"
          priority={false}
          unoptimized
        />
      </div>
      {/*
        <lg：flex 纵横居中；宽度与桌面同一比例 w = 528/651×画框宽（外壳不加 horizontal padding，% 与 lg 绝对定位参照一致）。
        lg+：绝对定位对齐 Figma（62,72 / 528×…）。
      */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center",
          "lg:block lg:items-stretch lg:justify-normal",
        ].join(" ")}
      >
        <div
          className={[
            "box-border flex min-w-0 flex-col gap-4",
            "w-[calc(528/651*100%)] max-lg:self-center max-lg:p-3",
            "lg:absolute lg:inset-auto lg:left-[calc(62/651*100%)] lg:top-[calc(72/480*100%)] lg:translate-x-0 lg:self-auto lg:p-6",
          ].join(" ")}
        >
          <div className="w-full flex items-center justify-center">
            <div className="flex items-center gap-3 max-w-full">
              <GpuMicroTag label="cluster" />
              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                <VizBracket
                  className="shrink-0"
                  style={{ height: 23, width: 3.6 }}
                />
                <GreenNameSlot
                  name={BARE_METAL_CLUSTER_GREEN_NAMES[cluster]}
                  autoWidth
                />
                <VizBracket
                  className="shrink-0"
                  style={{ height: 23, width: 3.6, transform: "scaleX(-1)" }}
                />
              </div>
            </div>
          </div>

          <div className="relative w-full min-h-[18px] shrink-0">
            {([0, 1, 2] as const).map((c) => {
              const on = c === cluster;
              return (
                <div
                  key={c}
                  className={[
                    "absolute left-0 top-0 flex w-full min-w-0 flex-col items-center gap-1 text-center font-tt-mono text-[11px] leading-[1.2] uppercase text-[var(--element-low-em)]",
                    "lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:text-left",
                    clusterMotion,
                    on
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none",
                  ].join(" ")}
                  aria-hidden={!on}
                >
                  <span className="whitespace-nowrap">
                    {BARE_METAL_CLUSTER_SUMMARY_LEFT[c]}
                  </span>
                  <span className="whitespace-nowrap max-w-full lg:max-w-[58%] lg:text-right">
                    {BARE_METAL_CLUSTER_SUMMARY_RIGHT[c]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2">
            {phaseData.rows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex w-full min-w-0 flex-wrap justify-center gap-2 lg:flex-nowrap lg:justify-start"
              >
                {row.map((cell) => (
                  <ClusterCell
                    key={cell.node}
                    node={cell.node}
                    pct={cell.pct}
                    motionTransition={motionTransition}
                  />
                ))}
              </div>
            ))}
          </div>

          <div
            className="h-px w-full max-w-full shrink-0 bg-[var(--alpha-dark-10)]"
            aria-hidden
          />

          <StackedPhaseMetrics
            cluster={cluster}
            activePhase={phase}
            motionTransition={motionTransition}
          />
        </div>
      </div>
    </div>
  );
}
