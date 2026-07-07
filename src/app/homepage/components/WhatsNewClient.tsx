"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import CarouselNavButton from "./CarouselNavButton";
import { useI18nSubscription } from "@/i18n/provider";

interface CoBrandInfoItem {
  brandLogo?: string;
  brandName?: string;
}

interface BannerCard {
  title: string;
  description: string;
  subTitle?: string;
  hightlightStr?: string;
  link?: string;
  coBrandLogo?: string;
  coBrandInfo?: CoBrandInfoItem[];
  tags?: string[];
  logo?: string;
  type?: string;
}

interface BannerCardRaw {
  title?: string | string[];
  description?: string | string[];
  subTitle?: string | string[];
  hightlightStr?: string | string[];
  link?: string;
  coBrandLogo?: string;
  coBrandInfo?: CoBrandInfoItem[];
  tags?: string[];
  logo?: string;
  type?: string;
}

interface WhatsNewClientProps {
  cards: BannerCardRaw[];
}

const TYPE_LABELS: Record<string, string> = {
  announcement: "ANNOUNCEMENT",
  "case-study": "CASE STUDY",
  casestudy: "CASE STUDY",
  research: "RESEARCH",
};

function resolveCardType(card: BannerCard): string {
  if (card.type) {
    return TYPE_LABELS[card.type.toLowerCase()] ?? card.type.toUpperCase();
  }
  if (card.coBrandLogo && card.coBrandLogo.trim() !== "") {
    return "CASE STUDY";
  }
  return "ANNOUNCEMENT";
}

function pickFirst(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalizeCoBrandInfo(value?: CoBrandInfoItem[]): CoBrandInfoItem[] {
  if (!value || value.length === 0) {
    return [];
  }

  return value.filter((item) => item.brandLogo || item.brandName);
}

function normalizeCard(card: BannerCardRaw): BannerCard {
  return {
    title: pickFirst(card.title),
    description: pickFirst(card.description),
    subTitle: pickFirst(card.subTitle),
    hightlightStr: pickFirst(card.hightlightStr),
    link: card.link || "",
    coBrandLogo: card.coBrandLogo || "",
    coBrandInfo: normalizeCoBrandInfo(card.coBrandInfo),
    tags: card.tags || [],
    logo: card.logo || "",
    type: card.type || "",
  };
}

function resolveThumbnailDescription(
  card: BannerCard,
  titleLine: string,
): string {
  const candidates = [card.description, card.subTitle, card.hightlightStr];
  return candidates.find((item) => item && item !== titleLine) || "";
}

function resolveBrandLogo(card: BannerCard): string | null {
  if (card.logo && card.logo.trim() !== "") {
    return card.logo;
  }
  if (card.coBrandLogo && card.coBrandLogo.trim() !== "") {
    return card.coBrandLogo;
  }
  const firstCoBrandLogo = card.coBrandInfo?.find((info) =>
    info.brandLogo?.trim(),
  )?.brandLogo;
  if (firstCoBrandLogo) {
    return firstCoBrandLogo;
  }
  return null;
}

function isGenericTitle(value: string, typeLabel: string): boolean {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return true;
  return (
    normalized === typeLabel ||
    normalized === "ANNOUNCEMENT" ||
    normalized === "CASE STUDY" ||
    normalized === "RESEARCH"
  );
}

function resolveTitleLine(card: BannerCard, typeLabel: string): string {
  if (!isGenericTitle(card.title, typeLabel)) {
    return card.title;
  }

  const coBrandNames = card.coBrandInfo
    ?.map((info) => info.brandName?.trim())
    .filter((name): name is string => Boolean(name));

  if (coBrandNames?.length) {
    return coBrandNames.join(" X ");
  }

  return card.description || card.subTitle || card.hightlightStr || card.title;
}

/** e.g. ANNOUNCEMENT + tags LLM → pill "LLM" (Figma Thumbnail 830:7288). */
function resolveThumbnailPill(
  card: BannerCard,
  typeLabel: string,
): string | null {
  const t0 = card.tags?.[0]?.trim();
  if (!t0) return null;
  const upper = t0.toUpperCase();
  if (upper === typeLabel) return null;
  return upper;
}

function resolveSpecsLine(card: BannerCard): string {
  const line = (card.subTitle || card.hightlightStr || "").trim();
  if (line && line === card.description.trim()) {
    return "";
  }
  // Figma uses pipe; CMS sometimes uses letter I between clauses (e.g. "MTokens I 204800").
  return line.replace(/\sI\s(?=\d)/g, " | ");
}

function BrandLogo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`block h-6 w-auto max-w-[120px] shrink-0 object-contain object-left ${className ?? ""}`}
    />
  );
}

function CoBrandTitleRow({ card }: { card: BannerCard }) {
  const coBrandInfo = card.coBrandInfo?.filter(
    (info) => info.brandLogo || info.brandName,
  );

  if (!coBrandInfo?.length) {
    return null;
  }

  return (
    <div className="flex min-w-0 max-w-full items-center gap-space-8 overflow-hidden">
      {coBrandInfo.map((info, infoIndex) => (
        <div
          key={`${info.brandName ?? info.brandLogo ?? "brand"}-${infoIndex}`}
          className="flex min-w-0 items-center gap-space-8"
        >
          {info.brandLogo ? (
            <BrandLogo
              src={info.brandLogo}
              alt={info.brandName || "brand logo"}
              className="max-w-[80px]"
            />
          ) : null}
          {info.brandName ? (
            <span className="truncate font-paragraph-16-medium text-[var(--text-1)]">
              {info.brandName}
            </span>
          ) : null}
          {infoIndex !== coBrandInfo.length - 1 ? (
            <span className="shrink-0 font-paragraph-16 text-[var(--text-3)]">
              X
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ThumbnailMeta({
  thumbnailPill,
  specsLine,
}: {
  thumbnailPill: string | null;
  specsLine: string;
}) {
  if (!thumbnailPill && !specsLine) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-start gap-space-8">
      {thumbnailPill ? (
        <div className="inline-flex w-fit items-center justify-center rounded-2 bg-[var(--alpha-dark-10)] p-space-4">
          <span className="font-mono-12 uppercase leading-none text-[var(--text-1)]">
            {thumbnailPill}
          </span>
        </div>
      ) : null}
      {specsLine ? (
        <p className="w-full font-paragraph-12 text-[var(--text-2)]">
          {specsLine}
        </p>
      ) : null}
    </div>
  );
}

/** Localized under `locales/en/public/home/what-new/` → `/home/what-new/bg00.png` … `bg07.png` */
const OVERLAY_ASSETS = [
  "/home/what-new/bg00.png",
  "/home/what-new/bg01.png",
  "/home/what-new/bg02.png",
  "/home/what-new/bg03.png",
  "/home/what-new/bg04.png",
  "/home/what-new/bg05.png",
  "/home/what-new/bg06.png",
  "/home/what-new/bg07.png",
] as const;

function WhatsNewCard({ card, index }: { card: BannerCard; index: number }) {
  const typeLabel = resolveCardType(card);
  const titleLine = resolveTitleLine(card, typeLabel);
  const thumbnailDescription = resolveThumbnailDescription(card, titleLine);
  const thumbnailPill = resolveThumbnailPill(card, typeLabel);
  const specsLine = resolveSpecsLine(card);
  const brandLogo = resolveBrandLogo(card);
  const hasCoBrandTitleRow = Boolean(card.coBrandInfo?.length);
  const cardHref = card.link?.trim() || undefined;
  const bgVariant = index % OVERLAY_ASSETS.length;

  return (
    <a
      href={cardHref}
      target={cardHref ? "_blank" : undefined}
      rel={cardHref ? "noopener noreferrer" : undefined}
      aria-disabled={cardHref ? undefined : true}
      className={`group flex h-full w-full min-w-0 flex-col gap-space-24 py-space-16 ${
        cardHref ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div
        className="relative aspect-[468/264] w-full shrink-0 overflow-hidden rounded-2 border border-subtle"
        style={{
          background:
            "linear-gradient(187deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)",
        }}
      >
        <img
          src={OVERLAY_ASSETS[bgVariant]}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover:rotate-[3deg] group-hover:scale-110 motion-reduce:scale-100 motion-reduce:rotate-0 motion-reduce:transition-none"
        />

        {/* Figma 830:7294: category row, then fixed logo+title row, then description; meta sits at bottom. */}
        <div className="pointer-events-none absolute inset-x-7 inset-y-6 flex flex-col items-start gap-space-24">
          <p className="w-full font-mono-12 uppercase leading-none text-[var(--text-3)]">
            {typeLabel}
          </p>

          <div className="flex h-[162px] w-full flex-col items-start justify-between">
            <div className="flex w-full flex-col items-start gap-space-8">
              <div className="flex w-full items-center gap-space-8">
                {hasCoBrandTitleRow ? (
                  <CoBrandTitleRow card={card} />
                ) : (
                  <>
                    {brandLogo ? (
                      <BrandLogo src={brandLogo} alt={`${titleLine} logo`} />
                    ) : null}
                    <p className="min-w-0 truncate font-paragraph-16-medium text-[var(--text-1)]">
                      {titleLine}
                    </p>
                  </>
                )}
              </div>
              {thumbnailDescription ? (
                <p className="line-clamp-2 w-full font-paragraph-16 text-[var(--text-1)]">
                  {thumbnailDescription}
                </p>
              ) : null}
            </div>

            <ThumbnailMeta
              thumbnailPill={thumbnailPill}
              specsLine={specsLine}
            />
          </div>
        </div>
      </div>
    </a>
  );
}

/** 与 `_design-tokens.scss` 中 `--space-40` 保持一致（横向 gap + scroll 步进） */
const CARD_GAP = 40;
const VISIBLE_CARDS = 3;
const DESKTOP_CAROUSEL_MQ = "(min-width: 1024px)";

export default function WhatsNewClient({ cards }: WhatsNewClientProps) {
  useI18nSubscription();

  const normalizedCards = cards.map(normalizeCard);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLgCarousel, setIsLgCarousel] = useState(false);
  const [slideWidth, setSlideWidth] = useState(320);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_CAROUSEL_MQ);
    const syncMq = () => setIsLgCarousel(mq.matches);
    syncMq();
    mq.addEventListener("change", syncMq);
    return () => mq.removeEventListener("change", syncMq);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (isLgCarousel) {
        setSlideWidth(
          Math.floor((w - CARD_GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS),
        );
      } else {
        setSlideWidth(Math.floor(w));
      }
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [isLgCarousel]);

  const maxIndex = isLgCarousel
    ? Math.max(0, normalizedCards.length - VISIBLE_CARDS)
    : Math.max(0, normalizedCards.length - 1);

  useEffect(() => {
    setCurrentIndex((i) => (i > maxIndex ? maxIndex : i));
  }, [maxIndex]);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const prev = useCallback(() => {
    const next = Math.max(0, currentIndex - 1);
    setCurrentIndex(next);
    trackRef.current?.scrollTo({
      left: next * (slideWidth + CARD_GAP),
      behavior: "smooth",
    });
  }, [currentIndex, slideWidth]);

  const next = useCallback(() => {
    const nextIdx = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(nextIdx);
    trackRef.current?.scrollTo({
      left: nextIdx * (slideWidth + CARD_GAP),
      behavior: "smooth",
    });
  }, [currentIndex, maxIndex, slideWidth]);

  const onScroll = useCallback(() => {
    if (!trackRef.current || slideWidth === 0) return;
    const idx = Math.round(
      trackRef.current.scrollLeft / (slideWidth + CARD_GAP),
    );
    setCurrentIndex(Math.min(idx, maxIndex));
  }, [maxIndex, slideWidth]);

  if (normalizedCards.length === 0) return null;

  return (
    <section className="py-space-16 md:py-space-20 lg:py-space-80">
      <div
        ref={containerRef}
        className="mx-auto w-full min-w-0 max-w-[1440px] px-5 md:px-12 lg:px-[48px]"
      >
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="w-full min-w-0">
            <SectionEyebrow label="What's New" />
          </div>

          <div className="flex w-full min-w-0 items-center justify-between">
            <CarouselNavButton
              direction="previous"
              onClick={prev}
              disabled={!canPrev}
              label="Previous"
            />
            <CarouselNavButton
              direction="next"
              onClick={next}
              disabled={!canNext}
              label="Next"
            />
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-6 flex w-full min-w-0 gap-space-40 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={onScroll}
        >
          {normalizedCards.map((card, index) => (
            <div
              key={`${card.title ?? "card"}-${index}`}
              className="relative box-border"
              style={{
                width: slideWidth,
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              {index > 0 ? (
                <div className="pointer-events-none absolute bottom-space-16 left-[-20px] top-space-16 w-px bg-[var(--border-2)]" />
              ) : null}
              <WhatsNewCard card={card} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
