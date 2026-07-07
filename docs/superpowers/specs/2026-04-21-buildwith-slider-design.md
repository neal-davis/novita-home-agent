# Build With — Carousel Redesign Spec

**Date:** 2026-04-21  
**File:** `src/app/homepage/components/BuiltWith.tsx`  
**Approach:** Option A — native scrollTo + currentIndex state

---

## Goal

Upgrade the existing `BuiltWith` carousel from a placeholder implementation to the Figma-accurate design:

- 6 real cards with actual background images
- Centered Novita text logo overlay on each card image
- Arrow nav advances/rewinds by exactly 1 card, with accurate disabled states

---

## Data Layer

Add a `bgImage` field to the `UseCase` interface. Background images cycle through the three local assets (served from `public/home/build-with/`):

```
/home/build-with/build-with1.png
/home/build-with/build-with2.png
/home/build-with/build-with3.png
```

Each card also carries a `gradientStyle` (inline CSS string) matching the Figma card-specific gradient overlay. Cards 5–6 use placeholder title/description.

### 6 Cards

| #   | title                | description                                                                                                                                   | bgImage         | gradientStyle (overlay, 60% opacity)                |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------- |
| 1   | Novita OpenClaw CLI  | Deploy OpenClaw as a developer tool with full CLI access. Instant model connectivity and auto-connect support, no manual configuration.       | build-with1.png | `linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)`  |
| 2   | DeepSeek OCR         | Deploy DeepSeek OCR in minutes for high-accuracy document recognition and structured data extraction at scale.                                | build-with2.png | `linear-gradient(100deg, #e3dfde 22%, #fffbf7 79%)` |
| 3   | Build a coding agent | Use Novita's Agent Sandbox to run a fully autonomous coding agent — writes code, runs tests, and iterates without you touching a thing.       | build-with3.png | `linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)`  |
| 4   | Build a coding agent | Use Novita's LLMs and Agent Sandbox to build a secure environment where your agent can code, build, and experiment without breaking anything. | build-with1.png | `linear-gradient(100deg, #d8d2d1 22%, #fffbf7 79%)` |
| 5   | Coming Soon          | More powerful integrations and tooling are on the way — stay tuned.                                                                           | build-with2.png | `linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)`  |
| 6   | Coming Soon          | Explore the full potential of Novita AI with upcoming features designed for scale.                                                            | build-with3.png | `linear-gradient(100deg, #e3dfde 22%, #fffbf7 79%)` |

---

## Component Structure

```
<section>                               ← full-width, bg-white, py-[80px]
  <div max-w-[1440px] px-[48px]>
    <div flex flex-col gap-[24px]>
      <SectionEyebrow />                ← "BUILT WITH NOVITA AI"
      <div flex justify-between>
        <NavButton direction="prev" />  ← disabled when currentIndex === 0
        <NavButton direction="next" />  ← disabled when currentIndex >= MAX_INDEX
      </div>
    </div>
  </div>

  <div overflow-hidden marginLeft=...>  ← bleeds right past viewport
    <div ref={scrollRef} flex gap …>
      {cards.map(card => <Card />)}
    </div>
  </div>
</section>
```

---

## Card Structure

```
<div w-[418px] border-l border-[var(--border-2)] flex flex-col gap-[24px] px-[48px] py-[16px]>

  {/* Image area — h-[308px] w-[322px] */}
  <div relative h-[308px] w-[322px] border border-[var(--border-subtle)] overflow-hidden>

    {/* Background image */}
    <img src={card.bgImage} alt="" class="absolute inset-0 w-full h-full object-cover" />

    {/* Gradient overlay — inline style (exact Figma degrees).
        Colors are design-only values with no token equivalent:
        #fefcf4, #f1f0e9, #e3dfde, #fffbf7, #d8d2d1 — business exception,
        document in commit message. */}
    <div
      class="absolute inset-0"
      style={{ backgroundImage: card.gradientStyle, opacity: 0.65 }}
    />

    {/* Novita text logo — centered placeholder */}
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="font-mono-13 uppercase tracking-[0.52px] text-element-high-em opacity-50">
        novita ai
      </span>
    </div>

  </div>

  {/* Text content */}
  <p class="font-heading-h5 text-[var(--text-1)] whitespace-nowrap">{card.title}</p>
  <p class="font-paragraph-18 text-[var(--text-3)]">{card.description}</p>

</div>
```

> **Logo note:** The centered overlay is a placeholder with "novita ai" text in mono style. When the actual logo SVG is provided, replace with `<img src={logoSvg} />` inside the same container div.

---

## Nav Button Logic

```ts
const CARD_WIDTH = 418; // px — Figma card w-[418px] with px-[48px], no flex gap
const VISIBLE_COUNT = 3; // rough visible count at 1440px wide
const MAX_INDEX = USE_CASES.length - VISIBLE_COUNT; // = 3

const [currentIndex, setCurrentIndex] = useState(0);

function scrollPrev() {
  const next = Math.max(0, currentIndex - 1);
  setCurrentIndex(next);
  scrollRef.current?.scrollTo({ left: next * CARD_WIDTH, behavior: "smooth" });
}

function scrollNext() {
  const next = Math.min(MAX_INDEX, currentIndex + 1);
  setCurrentIndex(next);
  scrollRef.current?.scrollTo({ left: next * CARD_WIDTH, behavior: "smooth" });
}
```

**Disabled states:**

- Left arrow: `disabled={currentIndex === 0}` → `opacity-30`
- Right arrow: `disabled={currentIndex >= MAX_INDEX}` → `opacity-30`

---

## Styling Tokens Used

| Token                    | Value                            | Usage                                 |
| ------------------------ | -------------------------------- | ------------------------------------- |
| `var(--border-subtle)`   | `rgba(10,10,10,0.07)`            | card image border                     |
| `var(--element-high-em)` | `#262626`                        | nav button border + logo text         |
| `var(--text-1)`          | `#0a0a0a`                        | card title                            |
| `var(--text-3)`          | `#737373`                        | card description                      |
| `var(--brand-0)`         | `#23d57c`                        | eyebrow green dot (in SectionEyebrow) |
| `font-heading-h5`        | 24px / 32px / -0.48px            | card title                            |
| `font-paragraph-18`      | 18px / 24px                      | card description                      |
| `font-mono-13`           | B612 Mono 13px / tracking 0.26px | logo placeholder text                 |

---

## Files Touched

| File                                        | Change                                  |
| ------------------------------------------- | --------------------------------------- |
| `src/app/homepage/components/BuiltWith.tsx` | Full rewrite of component per this spec |

## Files NOT Touched

- `SectionEyebrow` — reused as-is
- Design tokens / globals — no changes
- Other homepage components — untouched

---

## Out of Scope

- Actual logo SVG (user will provide later — slot already prepared)
- Mobile/responsive breakpoints (not specified)
- Pagination dots / indicator bar (not in Figma)
- Card 5–6 real content (user to supply)
