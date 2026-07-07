# Hero Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Hero section to match the v5 Figma redesign: background split, right-anchored animation, safe-area triangle decoration, typography corrections, and agent card restructure.

**Architecture:** Three files change in dependency order — HeroBackground first (independent), HeroDecoration second (new client component with safe-area ResizeObserver), Hero last (becomes "use client", wires sectionRef, fixes card + typography). No new files.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS, unicornstudio-react, CSS design tokens

**Spec:** `docs/superpowers/specs/2026-04-21-hero-redesign.md`

---

## Task 1: Update HeroBackground — static bg layer + centered animation

**Files:**

- Modify: `src/app/homepage/components/HeroBackground.tsx`

### Context

Current file renders one UnicornStudio layer: full-width centered, aspect-ratio 1512/983, clipped on sides.

New design: two stacked layers —

1. `hero-bg.png` full-bleed static image (always visible, even with reduced-motion)
2. UnicornStudio animation centered (`absolute inset-x-0 top-1/2 -translate-y-1/2`, full-width, aspect-ratio preserved), hidden with reduced-motion. `showPlaceholderWhileLoading={false}` prevents gray flash during load.

JSON path changes from `/home/novita_mar_24_remix_remix.json` → `/home/hero/remix.json`.

Remove the gradient fallback div — hero-bg.png replaces it.

- [ ] Replace the entire contents of `src/app/homepage/components/HeroBackground.tsx` with:

```tsx
"use client";
import UnicornScene from "unicornstudio-react/next";
import { useEffect, useState } from "react";

export default function HeroBackground() {
  const [dpi, setDpi] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setDpi(Math.min(window.devicePixelRatio ?? 1, 2));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Full-bleed static background — always visible */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/hero/hero-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Layer 2: Centered animation — full hero height, auto width, centered */}
      {!reducedMotion && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full">
          <div className="relative h-full aspect-[1512/983]">
            <UnicornScene
              jsonFilePath="/home/hero/remix.json"
              width="100%"
              height="100%"
              scale={1}
              dpi={dpi}
              fps={30}
              lazyLoad={true}
              production={true}
              showPlaceholderWhileLoading={false}
              showPlaceholderOnError={false}
              onError={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] Run type-check:

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] Commit:

```bash
git add src/app/homepage/components/HeroBackground.tsx
git commit -m "feat: split hero background into full-bleed static layer + centered animation"
```

---

## Task 2: Update HeroDecoration — client component with safe-area pixel coordinates

**Files:**

- Modify: `src/app/homepage/components/HeroDecoration.tsx`

### Context

Current file is a Server Component. It uses SVG percentage coordinates based on the full viewport width. On a 2560px viewport, anchor C lands at 2135px — past the safe-area right edge (1952px). Bug confirmed.

New design: `"use client"` component that accepts a `sectionRef: React.RefObject<HTMLElement>` prop. On mount and resize (via ResizeObserver on the section element), it computes anchor positions in pixels using the safe-area formula:

```
safeLeft = max(0, (sectionW − 1440) / 2) + 48
contentW = min(sectionW, 1440) − 96
A = { x: safeLeft + 0.626 * contentW,  y: 0.275 * sectionH }
B = { x: safeLeft + 0.545 * contentW,  y: 0.435 * sectionH }
C = { x: safeLeft + 0.857 * contentW,  y: 0.620 * sectionH }
```

SVG `<line>` elements use pixel `x1 y1 x2 y2`. Label `<div>`s use `style={{ left: px, top: px }}`. Returns `null` until first measurement to avoid a flash of misplaced content.

The percentages (62.6%, 54.5%, 85.7%) are derived from the Figma 1512px canvas (48px padding each side, 1416px content): A=886/1416, B=772/1416, C=1213/1416.

- [ ] Replace the entire contents of `src/app/homepage/components/HeroDecoration.tsx` with:

```tsx
"use client";

import { useEffect, useState, type RefObject } from "react";

interface Anchor {
  x: number;
  y: number;
}

interface Anchors {
  A: Anchor;
  B: Anchor;
  C: Anchor;
}

interface HeroDecorationProps {
  sectionRef: RefObject<HTMLElement>;
}

function computeAnchors(sectionW: number, sectionH: number): Anchors {
  const safeLeft = Math.max(0, (sectionW - 1440) / 2) + 48;
  const contentW = Math.min(sectionW, 1440) - 96;
  return {
    A: { x: safeLeft + 0.626 * contentW, y: 0.275 * sectionH },
    B: { x: safeLeft + 0.545 * contentW, y: 0.435 * sectionH },
    C: { x: safeLeft + 0.857 * contentW, y: 0.62 * sectionH },
  };
}

export default function HeroDecoration({ sectionRef }: HeroDecorationProps) {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [sectionRef]);

  if (dims.w === 0) return null;

  const { A, B, C } = computeAnchors(dims.w, dims.h);

  return (
    <div
      className="hidden lg:block absolute inset-0 pointer-events-none z-[5]"
      aria-hidden="true"
    >
      {/* Triangle connecting lines */}
      <svg className="absolute inset-0 w-full h-full" fill="none">
        {/* A → B */}
        <line
          x1={A.x}
          y1={A.y}
          x2={B.x}
          y2={B.y}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
        />
        {/* A → C */}
        <line
          x1={A.x}
          y1={A.y}
          x2={C.x}
          y2={C.y}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
        />
        {/* B → C */}
        <line
          x1={B.x}
          y1={B.y}
          x2={C.x}
          y2={C.y}
          stroke="var(--alpha-dark-20)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Anchor A — top: ■ label */}
      <div
        className="absolute flex items-center gap-2 -translate-y-1/2"
        style={{ left: A.x, top: A.y }}
      >
        <div className="shrink-0 size-2 bg-[var(--text-1)]" />
        <span className="font-miletus font-paragraph-14 text-[var(--text-1)] whitespace-nowrap">
          Invisible System
        </span>
      </div>

      {/* Anchor B — mid-left: label ■ (text left of dot) */}
      <div
        className="absolute flex items-center gap-2 -translate-x-full -translate-y-1/2"
        style={{ left: B.x, top: B.y }}
      >
        <span className="font-miletus font-paragraph-14 text-[var(--text-1)] whitespace-nowrap">
          Invisible System
        </span>
        <div className="shrink-0 size-2 bg-[var(--text-1)]" />
      </div>

      {/* Anchor C — bottom-right: ■ label */}
      <div
        className="absolute flex items-center gap-2 -translate-y-1/2"
        style={{ left: C.x, top: C.y }}
      >
        <div className="shrink-0 size-2 bg-[var(--text-1)]" />
        <span className="font-miletus font-paragraph-14 text-[var(--text-1)] whitespace-nowrap">
          Invisible System
        </span>
      </div>
    </div>
  );
}
```

- [ ] Run type-check:

```bash
npx tsc --noEmit
```

Expected: no errors. If you see `RefObject<HTMLElement>` type mismatch with `useRef<HTMLElement>(null)` (React 18 returns `RefObject<HTMLElement>` which has `current: HTMLElement | null`), the null-guard in the `useEffect` handles it — no change needed.

- [ ] Commit:

```bash
git add src/app/homepage/components/HeroDecoration.tsx
git commit -m "feat: convert HeroDecoration to client component with safe-area pixel anchor positions"
```

---

## Task 3: Update Hero.tsx — "use client", sectionRef wiring, typography + agent card

**Files:**

- Modify: `src/app/homepage/components/Hero.tsx`

### Context

Hero.tsx is currently a Server Component. It needs to become `"use client"` to use `useRef` for passing `sectionRef` to the updated `HeroDecoration`.

Three content changes:

1. Subtitle text updated to Figma copy
2. Agent card label token: `font-mono-13` → `text-mono-14`
3. Agent card child order restructured: label → description → [link box | copy button]

The link box is a new `<div>` with `border border-[var(--border-strong)] rounded-[2px] p-2` wrapping the "Read [url] and follow the instructions." paragraph. The copy button moves from next to the description paragraph to next to the link box.

- [ ] Replace the entire contents of `src/app/homepage/components/Hero.tsx` with:

```tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import HeroBackground from "./HeroBackground";
import HeroDecoration from "./HeroDecoration";
import CopyButton from "./CopyButton";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-[640px] md:min-h-[820px] lg:min-h-[983px] bg-[var(--gray-50)]"
    >
      {/* UnicornStudio WebGL background */}
      <HeroBackground />

      {/* Decorative triangle + anchor labels */}
      <HeroDecoration sectionRef={sectionRef} />

      {/* Main content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-12 lg:px-[48px]">
        <div className="flex flex-col items-start pt-[120px] pb-16 md:pt-[160px] md:pb-20 lg:pt-[237px] lg:pb-[80px] max-w-full md:max-w-[560px]">
          <div className="flex flex-col gap-[24px] items-start w-full">
            {/* Heading + CTAs */}
            <div className="flex flex-col gap-[48px] items-start w-full">
              <div className="flex flex-col gap-[24px] items-start w-full">
                <h1 className="font-miletus font-display-md text-[var(--text-1)]">
                  The AI cloud for every builder and agent
                </h1>
                <p className="font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]">
                  Run models, scale GPUs, and build AI agents, all on one
                  platform.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="primary"
                  height={40}
                  renderTag="link"
                  link={NOVITA_URL.USER_REGISTER}
                  className="!rounded-[999px] !bg-[var(--gray-950)] !text-[var(--white)] hover:!bg-[var(--gray-800)] !px-5 font-paragraph-14 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),inset_0px_2px_0px_0px_var(--alpha-light-20)]"
                >
                  Start Building
                </Button>
                <Button
                  type="text"
                  height={44}
                  renderTag="link"
                  link="https://calendly.com/novita-ai/30min"
                  className="!rounded-[999px] !px-5 !no-underline font-paragraph-14 text-[var(--gray-800)] flex items-center gap-1"
                >
                  Talk to Us
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            {/* AI Agents card */}
            <div className="relative rounded-[4px] border-[0.5px] border-[var(--border-subtle)] bg-[var(--alpha-light-50)] p-6 flex flex-col gap-4 items-start shadow-[inset_0px_0px_12px_0px_var(--alpha-light-50)] w-full max-w-[430px]">
              {/* Label */}
              <span className="text-mono-14 uppercase text-[var(--text-1)]">
                AI Agents
              </span>

              {/* Description */}
              <p className="font-miletus font-paragraph-13 text-[var(--text-3)] max-w-[382px]">
                Your agent learns to discover, auth, and use Novita AI products
                autonomously.
              </p>

              {/* Link box + copy button */}
              <div className="flex items-center gap-4 w-full">
                <div className="border border-[var(--border-strong)] rounded-[2px] p-2 flex-1">
                  <p className="font-miletus font-paragraph-13 text-[var(--text-2)]">
                    Read{" "}
                    <Link
                      href="https://novita.ai/docs/skill.md"
                      target="_blank"
                      className="underline text-[var(--text-2)] hover:text-[var(--text-1)]"
                    >
                      https://novita.ai/docs/skill.md
                    </Link>{" "}
                    and follow the instructions.
                  </p>
                </div>
                <CopyButton text="https://novita.ai/docs/skill.md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] Run type-check:

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] Commit:

```bash
git add src/app/homepage/components/Hero.tsx
git commit -m "feat: add sectionRef wiring, fix typography tokens, restructure agent card to match Figma"
```

---

## Task 4: Visual verification

- [ ] Start the dev server:

```bash
npm run dev
```

- [ ] Open `http://localhost:3000` in a browser and scroll to the top (Hero section).

- [ ] Verify background:
  - The `hero-bg.png` static image fills the entire hero section
  - The UnicornStudio 3D animation appears in the right portion of the hero (right-anchored)
  - The left side of the hero shows the static background without the animation

- [ ] Verify animation JSON path: open DevTools → Network → filter "remix.json" — confirm it loads from `/home/hero/remix.json` (not the old path)

- [ ] Verify typography:
  - Headline: bold/medium weight, ~56px, tight letter-spacing
  - Subtitle: "Run models, scale GPUs, and build AI agents, all on one platform."
  - Agent card label: "AI AGENTS" in monospace 14px uppercase

- [ ] Verify agent card order:
  - Top: "AI AGENTS" mono uppercase label
  - Middle: description paragraph ("Your agent learns…")
  - Bottom row: link box (bordered, rounded-[2px]) with copy icon to its right

- [ ] Verify triangle decoration (desktop, viewport ≥ 1024px):
  - Three anchor squares and "Invisible System" labels visible
  - Triangle lines connect the three anchors
  - Resize browser to 2560px width (or simulate in DevTools) — confirm anchor C does **not** extend outside the safe area right boundary

- [ ] Verify reduced-motion (DevTools → Rendering → Emulate prefers-reduced-motion):
  - Animation layer hidden
  - `hero-bg.png` still visible as background ✓
