# Spec: What's New — Redesign

**Date:** 2026-04-21
**Status:** Ready for implementation
**Files to replace in-place:**

- `src/app/homepage/components/WhatsNew.tsx`
- `src/app/homepage/components/WhatsNewClient.tsx`

---

## 1. Goals

Redesign the homepage "What's New" section to match the agreed Figma layout:

- Full-width section with constrained inner content (max 1360 px)
- Section eyebrow row with a green dot, B612 Mono label, and a bottom border
- Navigation row (Prev / Next buttons) separated from the eyebrow by spacing
- Horizontal slider showing 3 cards at a time with a fixed-width layout (468 px per card, 40 px gaps)
- Per-card decorative thumbnail with 3 cycling gradient-plus-overlay variants
- Clean card anatomy: tag badge → thumbnail → title → description

---

## 2. Architecture

### `WhatsNew.tsx` — server component

Fetches data and passes it down. No rendering logic of its own.

```tsx
import { getBannerConfigInServerEnv } from "@/api/config";
import WhatsNewClient from "./WhatsNewClient";

export default async function WhatsNew() {
  const items = await getBannerConfigInServerEnv();
  return <WhatsNewClient items={items} />;
}
```

Key points:

- `getBannerConfigInServerEnv()` returns `BannerCard[]` (see Section 4 for the interface).
- On fetch failure the API already catches and returns `[]`; `WhatsNewClient` handles the empty case.
- No `"use client"` directive — this file stays a pure async server component.

### `WhatsNewClient.tsx` — client component

Owns all slider state and renders the full section. Must start with `"use client"`.

---

## 3. Component tree

```
<section>                         full-width wrapper
  <div>                           max-w-[1360px] px-[48px] mx-auto
    <SectionEyebrow />            "WHAT'S NEW" label row
    <NavRow />                    flex justify-between, mt-[var(--space-24)]
    <SliderViewport>              overflow-hidden w-full, mt-[var(--space-24)]
      <SliderTrack>               flex flex-row, transition-transform
        <WhatsNewCard />  × n
```

---

## 4. Data shape

Source: `getBannerConfigInServerEnv()` — returns the `data` array from the Strapi `/banner-config` endpoint.

```ts
interface BannerCard {
  title: string;
  description: string;
  type?: string; // primary tag discriminator: "announcement" | "case-study" | "research"
  tags?: string[]; // fallback tag source when type is absent
  logo?: string; // thumbnail image URL (may be absent — use gradient placeholder)
  link?: string; // if present, card is an <a>; otherwise a <div>
  subTitle?: string;
  hightlightStr?: string;
  coBrandLogo?: string;
  coBrandInfo?: string[];
}
```

> **Note:** Confirm this interface at implementation time by reading the existing
> `src/app/homepage/components/WhatsNewClient.tsx`. The fields above are the full
> set observed in the current production component.

### Tag label resolution

```ts
const TYPE_LABELS: Record<string, string> = {
  announcement: "ANNOUNCEMENT",
  "case-study": "CASE STUDY",
  casestudy: "CASE STUDY",
  research: "RESEARCH",
};

function resolveTag(card: BannerCard): string {
  if (card.type)
    return TYPE_LABELS[card.type.toLowerCase()] ?? card.type.toUpperCase();
  if (card.tags?.length) return card.tags[0].toUpperCase();
  if (card.coBrandLogo?.trim()) return "CASE STUDY";
  return "ANNOUNCEMENT";
}
```

---

## 5. Section layout

```tsx
<section className="py-[var(--space-16)]">
  <div className="max-w-[1360px] px-[48px] mx-auto">...</div>
</section>
```

---

## 6. SectionEyebrow

Reuses the existing `SectionEyebrow` component
(`src/app/sandbox1/components/SectionEyebrow.tsx`).
It renders the green dot + B612 Mono uppercase label row, and a bottom border.

Expected visual output:

- Green dot: `bg-[var(--brand-0)] rounded-[var(--radius-2)] size-[8px]`
- Label: B612 Mono font, uppercase, `text-[var(--text-2)]`
- Row has `border-b border-[var(--border-strong)] pb-[var(--space-8)]`

Pass `label="WHAT'S NEW"` (all-caps) or `label="What's New"` — confirm which
the existing component expects.

---

## 7. Navigation row

```tsx
<div className="flex items-center justify-between mt-[var(--space-24)]">
  <div /> {/* left spacer — reserved for future content */}
  <div className="flex items-center gap-2">
    <PrevButton />
    <NextButton />
  </div>
</div>
```

### Button styles

| State    | Classes                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------- |
| Base     | `flex items-center justify-center size-[32px] rounded-[var(--radius-2)] border transition-colors`   |
| Enabled  | `border-[var(--border-strong)] text-[var(--text-1)] cursor-pointer hover:bg-[var(--overlay-hover)]` |
| Disabled | `border-[var(--element-disabled)] text-[var(--element-disabled)] cursor-not-allowed opacity-50`     |

Icon: `ChevronLeft` / `ChevronRight` from `lucide-react`, size `16`.

> **Current implementation note:** The existing code uses iconfont classes
> (`icon-arrow-left`, `icon-arrow-right`). The redesign switches to Lucide icons
> per the project icon conventions. The iconfont fallback is acceptable if Lucide
> icons render incorrectly at this size, but prefer Lucide.

---

## 8. Slider

### Viewport and track

```tsx
{
  /* Viewport — clips overflow */
}
<div className="overflow-hidden w-full mt-[var(--space-24)]">
  {/* Track — all cards in a single flex row */}
  <div
    className="flex flex-row transition-transform duration-500 ease-in-out"
    style={{
      gap: `${CARD_GAP}px`,
      transform: `translateX(-${translateX}px)`,
    }}
  >
    {items.map((item, i) => (
      <WhatsNewCard key={`${item.title}-${i}`} item={item} bgVariant={i % 3} />
    ))}
  </div>
</div>;
```

### Card dimensions

| Constant        | Value            | Notes                                                               |
| --------------- | ---------------- | ------------------------------------------------------------------- |
| `CARD_WIDTH`    | computed (fluid) | `(containerWidth - CARD_GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS` |
| `CARD_GAP`      | `40` (px)        | Gap between cards                                                   |
| `VISIBLE_CARDS` | `3`              | Cards visible at once                                               |

> **Why fluid, not fixed:** The inner container is `max-w-[1360px] - px-[48px]*2 = 1264px`. Three fixed 468 px cards + two 40 px gaps = 1484 px, which overflows the container. Use a fluid card width that exactly fills the viewport, matching the existing implementation's approach.

### Slider state

```ts
const containerRef = useRef<HTMLDivElement>(null);
const [containerWidth, setContainerWidth] = useState(0);

useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  const ro = new ResizeObserver(([entry]) => {
    setContainerWidth(entry.contentRect.width);
  });
  ro.observe(el);
  return () => ro.disconnect();
}, []);

const cardWidth =
  containerWidth > 0
    ? (containerWidth - CARD_GAP * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS
    : 0;

const [currentIndex, setCurrentIndex] = useState(0);

const maxIndex = Math.max(0, items.length - VISIBLE_CARDS);
const canPrev = currentIndex > 0;
const canNext = currentIndex < maxIndex;

const translateX = currentIndex * (cardWidth + CARD_GAP); // px

const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));
```

Attach `containerRef` to the slider viewport div. Render `null` (or a skeleton) until `cardWidth > 0` to avoid a layout flash.

---

## 9. WhatsNewCard anatomy

```tsx
function WhatsNewCard({
  item,
  index,          // position in the items array (0-based)
  bgVariant,      // 0 | 1 | 2  — controls thumbnail gradient overlay
}: {
  item: BannerCard;
  index: number;
  bgVariant: 0 | 1 | 2;
}) { ... }
```

The outer wrapper is `<a>` when `item.link` is set, otherwise `<div>`.

### Card container

```
width: 468px  (CARD_WIDTH constant)
flex-shrink: 0
border-left: index === 0 ? none : 1px solid var(--border-2)
padding: px-[40px] py-[var(--space-16)]
display: flex flex-col gap-[var(--space-24)]
```

### Tag badge

```tsx
<div
  className="inline-flex items-center justify-center
                px-[var(--space-6)] py-[var(--space-4)]
                bg-[var(--fill-3)] rounded-4
                w-fit"
>
  <span className="text-mono-14 uppercase text-[var(--text-2)]">
    {resolveTag(item)}
  </span>
</div>
```

> **Token note:** `text-mono-14` is the correct Tailwind utility (defined in `tailwind.config.ts` under `fontSize["mono-14"]`). There is no `font-mono-14` SCSS mixin. `rounded-4` maps to `var(--radius-4)` via the `borderRadius` config.

### Thumbnail

```tsx
<div
  className="w-[468px] h-[264px] overflow-hidden
                border border-[var(--border-subtle)]
                rounded-[var(--radius-2)] relative"
>
  {/* Gradient base — same for all variants */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(187deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)",
    }}
  />

  {/* Decorative overlay — variant-specific (see Section 10) */}
  <Image src={OVERLAY_ASSETS[bgVariant]} alt="" fill className="object-cover" />

  {/* If the card has a logo image, render it on top */}
  {item.logo && (
    <Image
      src={item.logo}
      alt={item.title}
      fill
      className="object-cover"
      unoptimized
    />
  )}

  {/* Novita logo — bottom-right corner */}
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
```

### Title

```tsx
<p
  className="font-heading-h5 text-[var(--text-1)]
              group-hover:text-[var(--text-brand)] transition-colors"
>
  {item.title}
</p>
```

Add `group` class to the card container so the hover colour change works.

### Description

```tsx
<p className="font-paragraph-18 text-[var(--text-3)]">{item.description}</p>
```

---

## 10. Thumbnail gradient overlay variants

All three variants share the same CSS gradient base:

```
linear-gradient(187deg, rgb(254,252,244) 2.5%, rgb(241,240,233) 94.3%)
```

Each variant adds a distinct decorative SVG/image overlay on top of the base.
The three overlay asset files are TBD — they will be imported from the Figma
export and placed in `public/images/whats-new/` (or similar).

```ts
const OVERLAY_ASSETS = [
  "/home/what-new/whatnew-01.png",
  "/home/what-new/whatnew-02.png",
  "/home/what-new/whatnew-01.png", // cycles back — only 2 assets available
] as const;
```

The overlay renders behind the card's own `logo` image but above the gradient.
When `item.logo` is set, the overlay will be partially or fully covered.

---

## 11. Edge cases

| Condition                   | Behaviour                                                               |
| --------------------------- | ----------------------------------------------------------------------- |
| `items.length === 0`        | Return `null` — render nothing                                          |
| `items.length <= 3`         | Render all cards; disable both Prev and Next buttons (`maxIndex === 0`) |
| `items.length === 1` or `2` | Same as above                                                           |
| No `item.logo`              | Show gradient + overlay only; no `<Image>` for the card logo            |
| No `item.link`              | Render card as `<div>` instead of `<a>`                                 |

---

## 12. Accessibility

- Prev/Next `<button>` elements must have `aria-label="Previous"` / `aria-label="Next"`.
- Disabled buttons use the HTML `disabled` attribute (not just visual styling) so screen readers announce them correctly.
- Card `<a>` links should have meaningful text content (title is sufficient).

---

## 13. Open questions / implementation notes

1. **`SectionEyebrow` label casing** — Confirm whether the existing
   `SectionEyebrow` component expects `"WHAT'S NEW"` or `"What's New"` and
   whether it uppercases internally.

2. **Max container width** — The spec says `max-w-[1360px]`; the current
   `WhatsNewClient.tsx` uses `max-w-[1440px]`. Use `max-w-[1360px]` to match
   the Figma and other homepage sections unless the product team directs otherwise.

> **Resolved:** Card width is fluid (computed via `ResizeObserver`), not fixed 468 px.
> **Resolved:** `hover:bg-[var(--overlay-hover)]` is valid — `overlay.hover` is defined in `tailwind.config.ts`.
