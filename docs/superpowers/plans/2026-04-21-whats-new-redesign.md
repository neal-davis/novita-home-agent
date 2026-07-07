# What's New Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update WhatsNewClient.tsx to match the v5 Figma redesign — cycling overlay thumbnails, updated tag badge tokens, Lucide nav icons, and ResizeObserver.

**Architecture:** The server component (WhatsNew.tsx) is unchanged. All changes are in WhatsNewClient.tsx: thumbnail overlay cycling, token corrections, icon swap, ResizeObserver, and max-width fix.

**Tech Stack:** Next.js App Router, Tailwind CSS, CSS design tokens, lucide-react, next/image

---

## Task 1: Update WhatsNewClient.tsx

**Files:**

- Modify: `src/app/homepage/components/WhatsNewClient.tsx`

- [ ] Replace the entire contents of `src/app/homepage/components/WhatsNewClient.tsx` with the following:

```tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

interface BannerCard {
  title: string;
  description: string;
  subTitle?: string;
  hightlightStr?: string;
  link?: string;
  coBrandLogo?: string;
  coBrandInfo?: string[];
  tags?: string[];
  logo?: string;
  type?: string;
}

interface WhatsNewClientProps {
  cards: BannerCard[];
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
  if (card.tags && card.tags.length > 0) {
    return card.tags[0].toUpperCase();
  }
  if (card.coBrandLogo && card.coBrandLogo.trim() !== "") {
    return "CASE STUDY";
  }
  return "ANNOUNCEMENT";
}

const OVERLAY_ASSETS = [
  "/home/what-new/whatnew-01.png",
  "/home/what-new/whatnew-02.png",
  "/home/what-new/whatnew-01.png",
] as const;

function WhatsNewCard({ card, index }: { card: BannerCard; index: number }) {
  const typeLabel = resolveCardType(card);
  const Tag = card.link ? "a" : "div";
  const linkProps = card.link
    ? { href: card.link, target: "_blank", rel: "noopener noreferrer" }
    : {};
  const bgVariant = index % 3;

  return (
    <Tag
      className="flex flex-col gap-6 py-4 cursor-pointer group"
      {...linkProps}
    >
      {/* Type badge */}
      <div className="inline-flex items-center justify-center px-1.5 py-1 bg-[var(--fill-3)] rounded-4 w-fit">
        <span className="text-mono-14 text-[var(--text-2)] uppercase">
          {typeLabel}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className="relative h-[264px] border border-[var(--border-subtle)] rounded-2 overflow-hidden"
        style={{
          background:
            "linear-gradient(187deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)",
        }}
      >
        {/* Cycling overlay */}
        <Image
          src={OVERLAY_ASSETS[bgVariant]}
          alt=""
          fill
          className="object-cover"
        />

        {/* Card logo (if present) renders on top of overlay */}
        {card.logo && (
          <Image
            src={card.logo}
            alt={card.title}
            fill
            className="object-cover"
            unoptimized
          />
        )}

        {/* Novita logo bottom-right */}
        <div className="absolute bottom-3 right-3">
          <Image
            src="/logo/logo.svg"
            alt="Novita AI"
            width={88}
            height={24}
            className="opacity-80"
          />
        </div>
      </div>

      {/* Title */}
      <p className="font-heading-h5 text-[var(--text-1)] group-hover:text-[var(--text-brand)] transition-colors">
        {card.title}
      </p>

      {/* Description */}
      <p className="font-paragraph-18 text-[var(--text-3)]">
        {card.description}
      </p>
    </Tag>
  );
}

const CARD_GAP = 40;
const VISIBLE_CARDS = 3;

export default function WhatsNewClient({ cards }: WhatsNewClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const total = entry.contentRect.width;
      setCardWidth(
        Math.floor((total - CARD_GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS),
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxIndex = Math.max(0, cards.length - VISIBLE_CARDS);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  }, [maxIndex]);

  const translateX = cardWidth > 0 ? currentIndex * (cardWidth + CARD_GAP) : 0;

  if (cards.length === 0) return null;

  return (
    <section className="py-space-16 md:py-space-20 lg:py-space-80">
      <div className="max-w-[1360px] mx-auto px-5 md:px-12 lg:px-[48px]">
        <div className="flex flex-col gap-6">
          <SectionEyebrow label="What's New" />

          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={!canPrev}
                aria-label="Previous"
                className={`flex items-center justify-center size-8 border rounded-2 transition-colors
                  ${
                    canPrev
                      ? "border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--overlay-hover)] cursor-pointer"
                      : "border-[var(--element-disabled)] text-[var(--element-disabled)] cursor-not-allowed opacity-50"
                  }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                disabled={!canNext}
                aria-label="Next"
                className={`flex items-center justify-center size-8 border rounded-2 transition-colors
                  ${
                    canNext
                      ? "border-[var(--border-strong)] text-[var(--text-1)] hover:bg-[var(--overlay-hover)] cursor-pointer"
                      : "border-[var(--element-disabled)] text-[var(--element-disabled)] cursor-not-allowed opacity-50"
                  }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-0 overflow-hidden" ref={containerRef}>
          <div
            className="flex"
            style={{
              gap: CARD_GAP,
              transform: `translateX(-${translateX}px)`,
              transition: "transform 0.5s ease",
            }}
          >
            {cards.map((card, index) => (
              <div
                key={`${card.title ?? "card"}-${index}`}
                style={{
                  width:
                    cardWidth > 0
                      ? cardWidth
                      : `calc((100% - ${CARD_GAP * (VISIBLE_CARDS - 1)}px) / ${VISIBLE_CARDS})`,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    borderLeft:
                      index > 0 ? "1px solid var(--border-2)" : "none",
                    paddingLeft: index > 0 ? 40 : 0,
                    height: "100%",
                  }}
                >
                  <WhatsNewCard card={card} index={index} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] Run type-check: `npx tsc --noEmit`
  - Expected: no type errors

- [ ] Commit the change:
  ```bash
  git add src/app/homepage/components/WhatsNewClient.tsx && git commit -m "feat: update WhatsNew thumbnail overlays and token/icon corrections"
  ```

---

## Task 2: Visual verification

- [ ] Start the dev server:

  ```bash
  npm run dev
  ```

- [ ] Open http://localhost:3000 in a browser

- [ ] Scroll to the "What's New" section

- [ ] Verify: tag badges show `bg-[var(--fill-3)]` (slightly darker gray than before)

- [ ] Verify: thumbnail shows the gradient background (`linear-gradient(187deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)`) + overlay image cycling — `whatnew-01.png` for card 0, `whatnew-02.png` for card 1, `whatnew-01.png` for card 2

- [ ] Verify: nav buttons show `ChevronLeft`/`ChevronRight` Lucide icons (not iconfont glyphs)

- [ ] Verify: Prev button is disabled on load (greyed out border, `opacity-50`, `cursor-not-allowed`)

- [ ] If more than 3 items: click Next — slider advances one card; click Prev — returns to original position

- [ ] At last position: Next button should be disabled (greyed out border, `opacity-50`, `cursor-not-allowed`)

- [ ] Resize browser window — cards should reflow to fill the container (ResizeObserver recalculates `cardWidth` on each resize event)
