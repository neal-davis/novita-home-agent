"use client";

import Image from "next/image";
import Link from "next/link";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Images,
  Mic,
  Video,
  Eye,
  LucideIcon,
} from "lucide-react";
import Button from "@/app/components/button/Button";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import ProductAgentSandboxSection from "@/app/homepage/components/ProductAgentSandboxSection";
import ProductGpuCloudSection from "@/app/homepage/components/ProductGpuCloudSection";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import {
  HOME_MODEL_API_CARDS,
  type HomepageModelApiCard,
} from "@/config/homepageModelApiCards";
import { NOVITA_URL } from "@/constants/urls";
import { useElementActivity } from "@/hooks/useElementActivity";
import { transformModelIdToPath } from "@/lib/utils";
import {
  VizBracket,
  VizConnector1,
  VizConnector2,
  VizConnector3,
  VizConnector4,
  VizConnector5,
  VizIconLlm,
} from "@/lib/icons/VizAssets";
import {
  GreenNameSlot,
  GreenNameTag,
} from "@/app/homepage/components/model-viz/GreenNameTag";
import { ORI_HEADER_HEIGHT, useHeaderHeight } from "@/hooks/useHeaderHeight";
import { useI18nSubscription } from "@/i18n/provider";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Static data ─────────────────────────────────────────────────────────────

const MODEL_TYPE_LABELS = ["LLM", "IMAGE", "AUDIO", "VIDEO", "VISION"] as const;
type ModelLabel = (typeof MODEL_TYPE_LABELS)[number];

const PRODUCT_SECTION_SCROLL_GAP_PX = 24;
const STICKY_SIDEBAR_EXTRA_TOP_PX = 62;
/** Matches card column `w-[240px]` + parent `gap-3` (12px) */
const MODEL_CARD_WIDTH_PX = 240;
const MODEL_CARD_GAP_PX = 12;
const MODEL_CARD_SCROLL_STEP_PX = MODEL_CARD_WIDTH_PX + MODEL_CARD_GAP_PX;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A single model card (tokens aligned with Inference viz pills) */
function getModelCardName(model: HomepageModelApiCard) {
  return model.displayName || model.name;
}

function getModelCardHref(model: HomepageModelApiCard) {
  return `/models/model-detail/${transformModelIdToPath(model.id)}`;
}

function getModelCardPricing(model: HomepageModelApiCard) {
  return `$${model.input_token_price_per_m_toString}/Mt Input · $${model.output_token_price_per_m_toString}/Mt Output`;
}

function getModelCardContext(model: HomepageModelApiCard) {
  return `${model.context_size} Context`;
}

function ModelCard({ card }: { card: HomepageModelApiCard }) {
  const href = getModelCardHref(card);
  const modelName = getModelCardName(card);
  const tag = card.tags?.[0] || "LLM";
  return (
    <Link
      href={href}
      className={[
        "flex h-[210px] w-[240px] shrink-0 flex-col items-stretch overflow-hidden",
        "rounded-8 bg-fill-4",
        /* Figma 1:12340: pt 24, px 12, pb 10; column gap 16 between logo block / price / tag */
        "pt-6 px-3 pb-[10px] gap-4",
        "cursor-pointer transition-opacity hover:opacity-90",
        "no-underline text-inherit outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex min-h-0 flex-col gap-2 shrink-0">
        <div className="relative size-6 shrink-0 overflow-hidden rounded-[2px]">
          <ModelLogo
            modelName={modelName}
            size={24}
            loading="lazy"
            className="object-contain"
          />
        </div>
        <p className="line-clamp-2 w-full text-paragraph-16 font-miletus text-gray-800">
          {modelName}
        </p>
      </div>
      <div>
        <p className="line-clamp-2 shrink-0 w-full text-paragraph-14 font-miletus text-gray-700">
          {getModelCardPricing(card)}
        </p>
        <p className="line-clamp-2 shrink-0 w-full text-paragraph-14 font-miletus text-gray-700">
          {getModelCardContext(card)}
        </p>
      </div>
      <span
        className={[
          "inline-flex w-fit shrink-0 items-center justify-center",
          "rounded-4 border border-gray-400 px-[6px] py-[4px]",
          "font-tt-mono text-[10px] font-normal uppercase leading-[1.2] tracking-[0.4px] text-gray-800",
        ].join(" ")}
      >
        {tag}
      </span>
    </Link>
  );
}

/**
 * Horizontal scroll: tripled list + scrollLeft correction so manual swipe feels
 * infinite in both directions. No auto-marquee.
 */
function ModelCardScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef(false);
  const loopWidth = HOME_MODEL_API_CARDS.length * MODEL_CARD_SCROLL_STEP_PX;
  const infiniteCards = [
    ...HOME_MODEL_API_CARDS,
    ...HOME_MODEL_API_CARDS,
    ...HOME_MODEL_API_CARDS,
  ];

  const jumpWithoutAnimation = useCallback((left: number) => {
    const el = scrollRef.current;
    if (!el) return;

    isJumpingRef.current = true;
    el.scrollLeft = left;

    requestAnimationFrame(() => {
      isJumpingRef.current = false;
    });
  }, []);

  const correctLoopPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isJumpingRef.current) return;

    if (el.scrollLeft >= loopWidth * 2) {
      jumpWithoutAnimation(el.scrollLeft - loopWidth);
      return;
    }

    if (el.scrollLeft < loopWidth) {
      jumpWithoutAnimation(el.scrollLeft + loopWidth);
    }
  }, [jumpWithoutAnimation, loopWidth]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      jumpWithoutAnimation(loopWidth);
    });
    return () => cancelAnimationFrame(raf);
  }, [jumpWithoutAnimation, loopWidth]);

  const handleScroll = useCallback(() => {
    correctLoopPosition();
  }, [correctLoopPosition]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex min-w-0 w-full gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        scrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {infiniteCards.map((card, index) => (
        <div key={`${card.id}-${index}`} className="w-[240px] shrink-0">
          <ModelCard card={card} />
        </div>
      ))}
    </div>
  );
}

// ─── VIZ card state data ──────────────────────────────────────────────────────

interface VizStat {
  value: string;
  label: string;
}

interface VizState {
  Icon:
    | LucideIcon
    | React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isLucideIcon?: boolean;
  modelName: string;
  slotWidth: number;
  stats: VizStat[];
  statsOrder: "value-first" | "label-first";
}

const VIZ_STATES: Record<ModelLabel, VizState> = {
  LLM: {
    Icon: VizIconLlm,
    modelName: '"KIMI-K2.5"',
    slotWidth: 114,
    stats: [
      { value: "200+", label: "models" }, // i18n-disable-line
      { value: "200ms", label: "latency" }, // i18n-disable-line
      { value: "99.5%", label: "uptime" }, // i18n-disable-line
    ],
    statsOrder: "value-first",
  },
  IMAGE: {
    Icon: Images,
    isLucideIcon: true,
    modelName: '"FLUX/1/SCHNELL"',
    slotWidth: 158,
    stats: [
      { value: "200+", label: "models" }, // i18n-disable-line
      { value: "200ms", label: "latency" }, // i18n-disable-line
      { value: "99.5%", label: "uptime" }, // i18n-disable-line
    ],
    statsOrder: "value-first",
  },
  AUDIO: {
    Icon: Mic,
    isLucideIcon: true,
    modelName: '"WHISPER-LARGE-V3"',
    slotWidth: 176,
    stats: [
      { value: "200+", label: "models" }, // i18n-disable-line
      { value: "200ms", label: "latency" }, // i18n-disable-line
      { value: "99.5%", label: "uptime" }, // i18n-disable-line
    ],
    statsOrder: "value-first",
  },
  VIDEO: {
    Icon: Video,
    isLucideIcon: true,
    modelName: '"WAN-2.1-I2V"',
    slotWidth: 131,
    stats: [
      { value: "200+", label: "models" }, // i18n-disable-line
      { value: "200ms", label: "latency" }, // i18n-disable-line
      { value: "99.5%", label: "uptime" }, // i18n-disable-line
    ],
    statsOrder: "value-first",
  },
  VISION: {
    Icon: Eye,
    isLucideIcon: true,
    modelName: '"QWEN3.5-27B"',
    slotWidth: 131,
    stats: [
      { label: "models", value: "200+" }, // i18n-disable-line
      { label: "latency", value: "<100ms" }, // i18n-disable-line
      { label: "uptime", value: "99.9%" }, // i18n-disable-line
    ],
    statsOrder: "label-first",
  },
};

/**
 * Five connector SVGs (one per tag→MODEL). Numeric fields match Figma mobile / desktop;
 * tablet (768–1023) interpolates using MODEL row tops: mobile 110 → md 170 → lg 220.
 */
type InferenceConnectorLine = {
  Comp: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  width: number;
  mobileLeftPx: number;
  desktopLeftPx: number;
  mobileTop: number;
  desktopTop: number;
  mobileHeight: number;
  desktopHeight: number;
};

const FIXED_LINES: readonly InferenceConnectorLine[] = [
  {
    Comp: VizConnector1,
    width: 155,
    mobileLeftPx: -43,
    desktopLeftPx: -34.73,
    mobileTop: 55,
    desktopTop: 152.5,
    mobileHeight: 48,
    desktopHeight: 67.5,
  },
  {
    Comp: VizConnector2,
    width: 106,
    mobileLeftPx: -15,
    desktopLeftPx: -10.23,
    mobileTop: 55,
    desktopTop: 152.5,
    mobileHeight: 48,
    desktopHeight: 67.5,
  },
  {
    Comp: VizConnector3,
    width: 49,
    mobileLeftPx: 15,
    desktopLeftPx: 18.27,
    mobileTop: 55,
    desktopTop: 152.5,
    mobileHeight: 48,
    desktopHeight: 67.5,
  },
  {
    Comp: VizConnector4,
    width: 11.666,
    mobileLeftPx: 42,
    desktopLeftPx: 48.6,
    mobileTop: 55,
    desktopTop: 152.5,
    mobileHeight: 48,
    desktopHeight: 67.5,
  },
  {
    Comp: VizConnector5,
    width: 64,
    mobileLeftPx: 66,
    desktopLeftPx: 74.77,
    mobileTop: 55,
    desktopTop: 152.5,
    mobileHeight: 48,
    desktopHeight: 67.5,
  },
];

/** Aligns with `top-[110px] md:top-[170px] lg:top-[220px]` on the MODEL row */
const INFERENCE_CONNECTOR_TABLET_T = (170 - 110) / (220 - 110);

function inferenceConnectorLerp(m: number, d: number): number {
  return m + (d - m) * INFERENCE_CONNECTOR_TABLET_T;
}

function inferenceConnectorLeftStyle(px: number): string {
  const abs = Math.abs(px);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(2);
  return px >= 0 ? `calc(50% + ${body}px)` : `calc(50% - ${body}px)`;
}

/**
 * Animates a single value+label pair when their display order swaps.
 * dir=+1: value moves right (value-first → label-first)
 * dir=-1: value moves left (label-first → value-first)
 */
function VizStatItem({
  stat,
  statsOrder,
}: {
  stat: VizStat;
  statsOrder: "value-first" | "label-first";
}) {
  const [curr, setCurr] = useState({ stat, statsOrder });
  const [next, setNext] = useState<{
    stat: VizStat;
    statsOrder: typeof statsOrder;
  } | null>(null);
  const [animating, setAnimating] = useState(false);
  // +1 = value exits right / label exits left; -1 = opposite
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    const orderChanged = statsOrder !== curr.statsOrder;
    const valueChanged =
      stat.value !== curr.stat.value || stat.label !== curr.stat.label;
    if (!orderChanged && !valueChanged) return;

    setDir(orderChanged ? (statsOrder === "label-first" ? 1 : -1) : 1);
    setNext({ stat, statsOrder });
    setAnimating(false);

    let raf2: number | undefined;
    let tid: ReturnType<typeof setTimeout> | undefined;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnimating(true);
        tid = setTimeout(() => {
          setCurr({ stat, statsOrder });
          setNext(null);
          setAnimating(false);
        }, 310);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== undefined) cancelAnimationFrame(raf2);
      if (tid !== undefined) clearTimeout(tid);
    };
  }, [statsOrder, stat.value, stat.label]); // eslint-disable-line react-hooks/exhaustive-deps

  const X = 14;
  // Separate transitions per property: container owns opacity, spans own transform.
  // Using inline style.transition avoids transition-all triggering layout properties.
  const opacityT = animating ? "opacity 260ms ease-in-out" : "none";
  const transformT = animating ? "transform 260ms ease-in-out" : "none";

  function renderLayer(
    s: { stat: VizStat; statsOrder: typeof statsOrder },
    phase: "exit" | "enter",
  ) {
    const vX =
      phase === "exit" ? (animating ? dir * X : 0) : animating ? 0 : -dir * X;
    const lX =
      phase === "exit" ? (animating ? -dir * X : 0) : animating ? 0 : dir * X;
    const opacity = phase === "exit" ? (animating ? 0 : 1) : animating ? 1 : 0;

    const valueEl = (
      <span
        key="v"
        className="inline-block text-element-high-em"
        style={{ transform: `translateX(${vX}px)`, transition: transformT }}
      >
        {s.stat.value}
      </span>
    );
    const labelEl = (
      <span
        key="l"
        className="inline-block text-element-mid-em"
        style={{ transform: `translateX(${lX}px)`, transition: transformT }}
      >
        {s.stat.label}
      </span>
    );

    return (
      <div
        className="flex items-center gap-[10px]"
        style={{ opacity, transition: opacityT }}
      >
        {s.statsOrder === "value-first" ? (
          <>
            {valueEl}
            {labelEl}
          </>
        ) : (
          <>
            {labelEl}
            {valueEl}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {renderLayer(curr, "exit")}
      {next && (
        <div className="absolute inset-0 flex items-center">
          {renderLayer(next, "enter")}
        </div>
      )}
    </div>
  );
}

const StatsRowContent = memo(function StatsRowContent({
  stats,
  statsOrder,
}: {
  stats: VizStat[];
  statsOrder: "value-first" | "label-first";
}) {
  return (
    <div className="flex items-center gap-5">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && (
            <div className="bg-gray-950 rounded-[1px] shrink-0 size-[6px]" />
          )}
          <div className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase whitespace-nowrap">
            <VizStatItem stat={stat} statsOrder={statsOrder} />
          </div>
        </div>
      ))}
    </div>
  );
});

/** Static background image — never changes per-tick. */
const InferenceVizBackground = memo(function InferenceVizBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Image
        src="/home/product/models-api-card-bg.png"
        alt=""
        fill
        loading="lazy"
        sizes="(max-width: 1024px) 100vw, 620px"
        className="object-cover object-center"
      />
    </div>
  );
});

/**
 * One pill in the LLM/IMAGE/AUDIO/VIDEO/VISION row. Memoized so only the pill
 * whose `isActive` actually flips re-renders on a tick — and the surrounding
 * `contain: layout paint` on the card scopes any width/margin reflow to this
 * subtree (it can't propagate to the sticky sidebar's containing block).
 */
const InferenceTagPill = memo(function InferenceTagPill({
  label,
  isActive,
}: {
  label: ModelLabel;
  isActive: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center h-[22px] min-w-[51px] px-[4px] py-[2px] rounded-[3px] border border-solid bg-white font-tt-mono text-[10px] leading-[1.2] tracking-[0.4px] uppercase transition-colors duration-300 md:h-[24px] md:min-w-0 md:px-[5px] md:text-[12px] md:tracking-[0.48px]",
        isActive
          ? "border-black text-element-high-em"
          : "border-[var(--alpha-dark-30)] text-[var(--alpha-dark-30)]",
      ].join(" ")}
    >
      <span
        className={[
          "h-[8px] rounded-2 bg-brand-0 shrink-0 overflow-hidden transition-all duration-300",
          isActive ? "w-[8px] mr-[4px] md:mr-[6px]" : "w-0 mr-0",
        ].join(" ")}
      />
      {label}
    </div>
  );
});

const InferenceTagRow = memo(function InferenceTagRow({
  activeLabel,
}: {
  activeLabel: ModelLabel;
}) {
  return (
    <div className="absolute top-8 md:top-[84px] lg:top-[130px] left-1/2 -translate-x-1/2 flex items-center gap-[4px] md:gap-[8px]">
      {MODEL_TYPE_LABELS.map((label) => (
        <InferenceTagPill
          key={label}
          label={label}
          isActive={label === activeLabel}
        />
      ))}
    </div>
  );
});

const InferenceConnector = memo(function InferenceConnector({
  activeLabel,
}: {
  activeLabel: ModelLabel;
}) {
  const i = MODEL_TYPE_LABELS.indexOf(activeLabel);
  const line = FIXED_LINES[i]!;
  const { Comp: ConnectorSvg, width } = line;

  // Positions are emitted as CSS custom properties and selected by media
  // queries (md/lg) — same mechanism as the TAG/MODEL rows. This keeps first
  // paint correct under SSR (no `window`/matchMedia, no hydration mismatch).
  const tabletTop = inferenceConnectorLerp(line.mobileTop, line.desktopTop);
  const tabletHeight = inferenceConnectorLerp(
    line.mobileHeight,
    line.desktopHeight,
  );
  const tabletLeftPx = inferenceConnectorLerp(
    line.mobileLeftPx,
    line.desktopLeftPx,
  );

  return (
    <ConnectorSvg
      className={
        "absolute -translate-x-1/2 transition-opacity duration-300 opacity-100 " +
        "top-[var(--c-top)] md:top-[var(--c-top-md)] lg:top-[var(--c-top-lg)] " +
        "h-[var(--c-h)] md:h-[var(--c-h-md)] lg:h-[var(--c-h-lg)] " +
        "left-[var(--c-left)] md:left-[var(--c-left-md)] lg:left-[var(--c-left-lg)]"
      }
      style={
        {
          width,
          "--c-top": `${line.mobileTop}px`,
          "--c-top-md": `${tabletTop}px`,
          "--c-top-lg": `${line.desktopTop}px`,
          "--c-h": `${line.mobileHeight}px`,
          "--c-h-md": `${tabletHeight}px`,
          "--c-h-lg": `${line.desktopHeight}px`,
          "--c-left": inferenceConnectorLeftStyle(line.mobileLeftPx),
          "--c-left-md": inferenceConnectorLeftStyle(tabletLeftPx),
          "--c-left-lg": inferenceConnectorLeftStyle(line.desktopLeftPx),
        } as React.CSSProperties
      }
    />
  );
});

const InferenceModelRow = memo(function InferenceModelRow({
  activeLabel,
}: {
  activeLabel: ModelLabel;
}) {
  const { Icon, isLucideIcon, slotWidth, modelName } = VIZ_STATES[activeLabel];
  return (
    <div className="absolute top-[110px] md:top-[170px] lg:top-[220px] left-1/2 -translate-x-1/2 flex items-center gap-[6px] scale-[0.8] md:scale-[0.92] lg:scale-100 origin-top">
      <div className="bg-white border-[1px] border-solid border-black flex items-center gap-[6px] pl-[3px] pr-[6px] py-[2px] rounded-[3px] shrink-0">
        <Icon
          {...(isLucideIcon
            ? { size: 20, strokeWidth: 1.5 }
            : { style: { width: 15, height: 15 } })}
          className="shrink-0"
        />
        <span className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase text-element-high-em whitespace-nowrap">
          MODEL
        </span>
      </div>
      <VizBracket className="shrink-0" style={{ height: 23, width: 3.6 }} />
      <GreenNameSlot name={modelName} slotWidth={slotWidth} />
      <VizBracket
        className="shrink-0"
        style={{ height: 23, width: 3.6, transform: "scaleX(-1)" }}
      />
    </div>
  );
});

const InferenceStatsRow = memo(function InferenceStatsRow({
  activeLabel,
}: {
  activeLabel: ModelLabel;
}) {
  const { stats, statsOrder } = VIZ_STATES[activeLabel];
  return (
    <div className="absolute bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 scale-[0.72] md:scale-[0.9] lg:scale-100 origin-bottom">
      <StatsRowContent stats={stats} statsOrder={statsOrder} />
    </div>
  );
});

/** Inference visualization card (left panel of sub-section 1) */
const InferenceVizCard = memo(function InferenceVizCard({
  activeLabel,
}: {
  activeLabel: ModelLabel;
}) {
  return (
    <div
      className="flex-1 min-w-0 h-[320px] md:h-[420px] lg:h-[480px] overflow-hidden relative rounded-6"
      // Isolate the card's paint/layout: any reflow inside the slot/icon swap
      // never propagates up to the sticky sidebar's containing block.
      style={{ contain: "layout paint" }}
    >
      <InferenceVizBackground />
      <InferenceTagRow activeLabel={activeLabel} />
      <InferenceConnector activeLabel={activeLabel} />
      <InferenceModelRow activeLabel={activeLabel} />
      <InferenceStatsRow activeLabel={activeLabel} />
    </div>
  );
});

/** Figma `1:12398` — BASE_URL 行、括号绿标、白卡顶栏 OPERATIONAL + 左侧状态点（背景图为静态资源） */
function DedicatedEndpointsVizOverlay() {
  const bracketSize = { height: 23, width: 3.6 } as const;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      {/* Figma `1:12398`：整体下移；BASE_URL 块与 OPERATIONAL 间距 token --space-26 */}
      <div className="absolute left-1/2 top-[14%] flex -translate-x-1/2 flex-col items-center gap-space-26 scale-[0.82] md:top-[15%] md:scale-90 lg:scale-100 origin-top max-w-[calc(100%-16px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-[6px] rounded-[3px] border border-solid border-black bg-white py-[2px] pl-[3px] pr-[6px]">
            <Image
              src="/home/product/base-url-icon.png"
              alt=""
              width={20}
              height={20}
              loading="lazy"
              className="size-5 shrink-0 object-contain"
            />
            <span className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase text-element-high-em whitespace-nowrap">
              BASE_URL
            </span>
          </div>
          <div className="flex min-w-0 max-w-full items-center justify-center gap-[6px]">
            <VizBracket className="shrink-0" style={bracketSize} />
            <GreenNameTag name={`"API.NOVITA.AI/YOUR-ENDPOINT"`} />
            <VizBracket
              className="shrink-0"
              style={{ ...bracketSize, transform: "scaleX(-1)" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="size-1.5 shrink-0 rounded-full bg-brand-0 shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-0)_32%,transparent)]"
            aria-hidden
          />
          <span className="font-tt-mono text-[12px] leading-[1.2] tracking-[0.48px] uppercase text-element-high-em whitespace-nowrap">
            OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
}

function ModelApisInferenceSection() {
  useI18nSubscription();

  const [activeLabel, setActiveLabel] = useState<ModelLabel>("LLM");
  // Tick only while the *Inference card itself* is on screen — not the whole
  // MODEL APIs section (which is >1000px tall and would keep the timer alive
  // even when the card has scrolled out the top of the viewport).
  const { ref: vizRef, isActive: isVizVisible } =
    useElementActivity<HTMLDivElement>();

  useEffect(() => {
    if (!isVizVisible) return;

    const timer = setInterval(() => {
      setActiveLabel((current) => {
        const idx = MODEL_TYPE_LABELS.indexOf(current);
        return MODEL_TYPE_LABELS[(idx + 1) % MODEL_TYPE_LABELS.length];
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [isVizVisible]);

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
        <div ref={vizRef} className="w-full flex-1 min-w-0">
          <InferenceVizCard activeLabel={activeLabel} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-8 items-start">
          <div className="flex items-center gap-4">
            <div className="bg-dark-1 flex items-center justify-center rounded-sm size-5 shrink-0">
              <span className="font-mono-13 uppercase text-white">1</span>
            </div>
            <span className="font-mono-13 uppercase text-dark-2">
              Serverless Model APIs
            </span>
          </div>

          <div className="flex w-full max-w-[515px] flex-col gap-4">
            <h2 className="text-heading-h5 font-miletus text-dark-1">
              Run 200+ models through a single API.{" "}
              <br className="hidden lg:block" />
              No infrastructure to manage.
            </h2>
            <p className="w-full text-paragraph-16 font-miletus text-[var(--text-3)]">
              Text, image, audio, video — all serverless, all
              <br className="hidden lg:block" />
              production-ready. You call it, we run it. Billed by the{" "}
              <br className="hidden lg:block" />
              token, not the hour.
            </p>
          </div>

          <Button
            type="secondary"
            height={44}
            width={184}
            renderTag="link"
            link={NOVITA_URL.MODEL_LIBRARY_INDEX}
            className="gap-2 font-paragraph-15 font-miletus"
          >
            Explore All Models
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Product component ───────────────────────────────────────────────────

export default function Product() {
  useI18nSubscription();

  const { noticeHeight } = useHeaderHeight(undefined, undefined, false);
  const stickySidebarTopPx =
    ORI_HEADER_HEIGHT + noticeHeight + STICKY_SIDEBAR_EXTRA_TOP_PX;
  const sectionScrollOffsetPx =
    stickySidebarTopPx + PRODUCT_SECTION_SCROLL_GAP_PX;

  const [activeSidebarItem, setActiveSidebarItem] =
    useState<string>("model-apis");

  const modelApisSectionRef = useRef<HTMLDivElement>(null);
  const gpuCloudSectionRef = useRef<HTMLDivElement>(null);
  const agentSandboxSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback(
    (id: string) => {
      setActiveSidebarItem(id);
      const el = document.querySelector<HTMLElement>(
        `[data-section-id="${id}"]`,
      );
      if (!el) return;

      const targetTop =
        el.getBoundingClientRect().top + window.scrollY - sectionScrollOffsetPx;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: "smooth",
      });
    },
    [sectionScrollOffsetPx],
  );

  // IntersectionObserver: track which sub-section is in view for sidebar highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.sectionId;
            if (id) setActiveSidebarItem(id);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    const el0 = modelApisSectionRef.current;
    const el1 = agentSandboxSectionRef.current;
    const el2 = gpuCloudSectionRef.current;
    if (el0) observer.observe(el0);
    if (el1) observer.observe(el1);
    if (el2) observer.observe(el2);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-bg-default py-[120px] max-md:py-20">
      <div className="flex items-start gap-12 max-w-[1440px] mx-auto px-5 md:px-12 lg:px-[48px]">
        {/* ── Sticky sidebar ── */}
        <aside
          className="sticky self-start shrink-0 w-[227px] hidden lg:block"
          style={{ top: stickySidebarTopPx }}
          aria-label="Product navigation"
        >
          <div className="flex flex-col">
            {/*
              Built per-render so each `label` literal is re-evaluated when the
              i18n store updates. If this array were hoisted to module scope
              the strings would be frozen at module init and never reflect a
              locale switch.
            */}
            {[
              { id: "model-apis", label: "Model APIs" },
              { id: "agent-sandbox", label: "Agent Sandbox" },
              { id: "gpu-cloud", label: "GPU Cloud" },
            ].map((item) => {
              const isActive = activeSidebarItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={[
                    "group flex items-center gap-2 py-4 border-b border-border-color-2 text-left w-full transition-colors",
                    "hover:text-dark-1",
                    isActive ? "text-dark-1" : "text-dark-2",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-2 rounded-2 bg-brand-0 shrink-0 overflow-hidden transition-[width,opacity] duration-200",
                      isActive
                        ? "w-2 opacity-100"
                        : "w-0 opacity-0 group-hover:w-2 group-hover:opacity-100",
                    ].join(" ")}
                  />
                  <span className="font-mono-13 uppercase">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div
            ref={modelApisSectionRef}
            data-section-id="model-apis"
            className="flex flex-col gap-6"
          >
            <SectionEyebrow label="MODEL APIS" />

            {/* ── Sub-section 1: Serverless Model APIs ── */}
            <ModelApisInferenceSection />

            {/* Model card horizontal scroll — below Serverless block, above Dedicated */}
            <ModelCardScroll />

            {/* ── Sub-section 2: Dedicated Endpoints ── */}
            <div className="flex flex-col lg:flex-row gap-10 items-end mt-[80px]">
              {/* Text + CTA */}
              <div className="flex flex-col gap-8 items-start shrink-0 lg:w-[346px]">
                {/* Section label */}
                <div className="flex items-center gap-4">
                  <div className="bg-dark-1 flex items-center justify-center rounded-sm size-5 shrink-0">
                    <span className="font-mono-13 uppercase text-white">2</span>
                  </div>
                  <span className="font-mono-13 uppercase text-dark-2">
                    Dedicated Endpoints
                  </span>
                </div>

                {/* Heading + body */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-heading-h5 font-miletus text-dark-1">
                    Private endpoints. Guaranteed performance. No noisy
                    neighbors.
                  </h2>
                  <p className="text-paragraph-16 font-miletus text-dark-3">
                    Your model. Your compute. Isolated resources mean consistent
                    latency at any throughput. Because production doesn&apos;t
                    have a retry budget.
                  </p>
                </div>

                {/* CTA button */}
                <Button
                  type="secondary"
                  height={44}
                  renderTag="link"
                  link={NOVITA_URL.DEDICATED_ENDPOINT}
                  className="gap-2 font-paragraph-15 font-miletus"
                >
                  Get Started
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Viz：资源 2608×1920，用 intrinsic 宽高比 + w-full，避免 fill+固定高度压扁 */}
              <div className="flex min-h-0 w-full flex-1 max-md:justify-center">
                <div className="relative w-full max-w-[680px] overflow-hidden rounded-6">
                  <Image
                    src="/home/product/dedicated-endpoints.png"
                    alt="Dedicated Endpoints"
                    width={2608}
                    height={1920}
                    unoptimized
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="h-auto w-full object-contain object-center"
                  />
                  <DedicatedEndpointsVizOverlay />
                </div>
              </div>
            </div>
          </div>

          <ProductAgentSandboxSection sectionRef={agentSandboxSectionRef} />
          <ProductGpuCloudSection sectionRef={gpuCloudSectionRef} />
        </div>
      </div>
    </section>
  );
}
