# Hero Module Redesign — Design Spec

**Figma:** [Novita 2026 v5 Hero — node 1:11925](https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=1-11925)

---

## Goal

Update the Hero section to match the v5 Figma redesign across four areas:

1. Typography token corrections
2. Agent card layout restructure
3. Background split: full-bleed static image + right-anchored UnicornStudio animation
4. Triangle decoration anchors tied to safe-area coordinates (not full viewport width)

---

## Files

| File                                             | Action                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `src/app/homepage/components/Hero.tsx`           | Modify: typography, subtitle text, agent card restructure         |
| `src/app/homepage/components/HeroBackground.tsx` | Modify: add hero-bg.png full-bleed layer + right-anchor animation |
| `src/app/homepage/components/HeroDecoration.tsx` | Modify: convert to client component, safe-area pixel positioning  |

No new files. No other files touched.

---

## Design Tokens in Use

| Token class             | Value                                             |
| ----------------------- | ------------------------------------------------- |
| `font-display-md`       | 56px / 64px / weight 500 / letter-spacing −1.12px |
| `text-mono-14`          | TT Interphases Pro Mono, 14px                     |
| `font-paragraph-13`     | Miletus Grotesk Trial, 13px / 18px                |
| `font-paragraph-14`     | 14px / 20px                                       |
| `var(--text-1)`         | #0a0a0a                                           |
| `var(--text-3)`         | #737373                                           |
| `var(--border-strong)`  | rgba(10,10,10,0.6)                                |
| `var(--border-subtle)`  | alpha-dark-7                                      |
| `var(--alpha-light-50)` | rgba(255,255,255,0.5)                             |
| `var(--alpha-dark-20)`  | rgba(10,10,10,0.2)                                |

---

## Section 1 — HeroBackground

### Current behaviour

Single UnicornStudio layer: full-width centered, aspect ratio 1512/983, clipped on both sides.

### New behaviour

Two layers:

**Layer 1 — Static background (bottom)**

- `<img>` with `src="/home/hero/hero-bg.png"`
- `absolute inset-0 w-full h-full object-cover`
- Full-bleed: not constrained to safe area
- Always visible (including when `prefers-reduced-motion`)

**Layer 2 — Animation (top, right-anchored)**

- `absolute right-0 top-0 h-full` container
- Inner div: `relative h-full aspect-[1512/983]` — maintains 1512:983 ratio
- `UnicornScene` fills 100%×100% of inner div
- JSON path updated: `/home/hero/remix.json` (was `/home/novita_mar_24_remix_remix.json`)
- Hidden when `prefers-reduced-motion: reduce`
- DPI, fps, lazyLoad, production props unchanged

**Result:** On a 1440px viewport at 983px section height, the animation canvas is 1512px wide — right-aligned, so its left edge is at −72px (slightly off-screen left). The 3D shape (right half of the 1512px canvas) is fully visible. On narrower viewports the canvas proportionally shrinks but stays right-anchored.

### Implementation note

Remove the previous gradient fallback (`bg-gradient-to-br from-[var(--gray-50)] to-[#e8f5f0]`) — the static hero-bg.png replaces it as the reduced-motion fallback.

---

## Section 2 — HeroDecoration

### Root cause of the bug

Current SVG uses viewport-percentage coordinates: anchor C at `left: 83.4%`. On a 2560px viewport: `0.834 × 2560 = 2135px`, past the safe-area right edge of `1952px`. ✗

### Fix: client component with ResizeObserver

Convert to `"use client"`. Attach a `ResizeObserver` to the parent `<section>` element via a ref passed from Hero.tsx (or via `window.innerWidth` and `window.innerHeight` on resize events for simplicity).

**Anchor coordinate formula** (runs on mount and resize):

```ts
const safeLeft = Math.max(0, (sectionW - 1440) / 2) + 48;
const contentW = Math.min(sectionW, 1440) - 96;

const A = { x: safeLeft + 0.626 * contentW, y: 0.275 * sectionH };
const B = { x: safeLeft + 0.545 * contentW, y: 0.435 * sectionH };
const C = { x: safeLeft + 0.857 * contentW, y: 0.62 * sectionH };
```

**Percentage derivation** (from Figma 1512px canvas, 48px padding, 1416px content):

- A: 886 / 1416 = 62.6% of content width, 27.5% of height
- B: 772 / 1416 = 54.5% of content width, 43.5% of height
- C: 1213 / 1416 = 85.7% of content width, 62.0% of height

**Verification:** On 2560px viewport — A=1449px, B=1321px, C=1770px. Safe-area right = 2560−560−48 = 1952px. All anchors ≤ 1952px. ✓

**SVG lines:** Use pixel `x1 y1 x2 y2` attributes (not percentages). SVG element stays `absolute inset-0 w-full h-full`.

**Label divs:** Use `style={{ left: A.x, top: A.y }}` inline pixel styles (with `translate` for centering as before).

**Props:** `HeroDecoration` accepts `sectionRef: RefObject<HTMLElement>` from Hero.tsx so it can observe the section element.

**Initial render:** On first render before measurement, anchors default to `{ x: 0, y: 0 }` — component returns `null` until `sectionW > 0` to avoid flash of mispositioned decoration.

---

## Section 3 — Hero.tsx

### 3a Typography

| Element          | Current class                    | Correct class  |
| ---------------- | -------------------------------- | -------------- |
| Agent card label | `font-mono-13`                   | `text-mono-14` |
| Headline         | `font-miletus font-display-md`   | unchanged ✓    |
| Subtitle         | `font-miletus font-paragraph-18` | unchanged ✓    |

### 3b Subtitle text

```
Before: "Developer-first infrastructure that scales from zero to production."
After:  "Run models, scale GPUs, and build AI agents, all on one platform."
```

### 3c Agent card restructure

Figma node 1:12186 shows this order: **label → description → [link box | copy icon]**

**Current structure:**

```
1. <span> AI Agents label
2. <div flex gap-4>
     <p> "Read [link] and follow instructions." + <CopyButton />
   </div>
3. <p> description
```

**New structure:**

```
1. <span className="text-mono-14 uppercase text-[var(--text-1)]">
     AI Agents
   </span>

2. <p className="font-miletus font-paragraph-13 text-[var(--text-3)] max-w-[382px]">
     Your agent learns to discover, auth, and use Novita AI products autonomously.
   </p>

3. <div className="flex items-center gap-4">
     <div className="border border-[var(--border-strong)] rounded-[2px] p-2">
       <p className="font-miletus font-paragraph-13 text-[var(--text-2)]">
         Read{" "}
         <Link href="https://novita.ai/docs/skill.md" ...>
           https://novita.ai/docs/skill.md
         </Link>
         {" "}and follow the instructions.
       </p>
     </div>
     <CopyButton text="https://novita.ai/docs/skill.md" />
   </div>
```

**Card container** — no structural change needed, only child order changes.

### 3d HeroDecoration wiring

Pass a `sectionRef` to `HeroDecoration`:

```tsx
// Hero.tsx
const sectionRef = useRef<HTMLElement>(null); // Hero becomes "use client"

<section ref={sectionRef} className="relative w-full overflow-hidden ...">
  <HeroBackground />
  <HeroDecoration sectionRef={sectionRef} />
  <div className="relative z-10 max-w-[1440px] ...">...content</div>
</section>;
```

**Note:** Hero.tsx must become `"use client"` to use `useRef`. Since it currently is a Server Component, this is a required change. CopyButton is already client-side, so this doesn't break anything. Alternatively, create a thin `HeroShell` client wrapper that holds the ref — but converting Hero.tsx to client is simpler and the component has no async data fetching that would be lost.

---

## Section 4 — What Does NOT Change

- CTA button styles, links, and structure
- Section min-height breakpoints (`min-h-[640px] md:min-h-[820px] lg:min-h-[983px]`)
- Content padding/spacing (`pt-[237px]`, `pb-[80px]`, `max-w-[560px]`)
- UnicornStudio props (dpi, fps, lazyLoad, production, onError)
- `HeroBackground` reduced-motion detection logic
- Decoration line stroke color (`var(--alpha-dark-20)`, `0.8px`)
- Decoration label font and square dot styles

---

## Non-Goals

- No animation change — UnicornStudio approach stays identical
- No mobile/tablet hero layout changes
- No new dependencies
