# Testimonials — Grid Redesign Spec

**Date:** 2026-04-21  
**File:** `src/app/homepage/components/Testimonials.tsx`  
**Figma:** node-id=1:12601

---

## Goal

Rewrite the `Testimonials` section to match Figma exactly:

- 3-column × 2-row CSS grid, cells 2 and 4 empty (stagger pattern)
- All cells equal-height — no `mt-*` offset hacks
- Gradient placeholder background (warm beige, replaces complex Figma bg image)
- Token-compliant typography and color classes
- 4 testimonial cards with logo, quote, avatar, name, title

---

## Layout

```
Grid cell:  1        2        3
Row 1:   [Card 1]  [empty]  [Card 2]
Row 2:   [empty]  [Card 3]  [Card 4]
```

Implementation: flat `grid grid-cols-3 gap-[16px] items-stretch` with 6 children.
Empty cells are `<div />` (invisible, occupy grid space to maintain equal column widths and row heights).

No `mt-*`, `mt-16`, or `-mt-8` on any card. Cards in the same row share height via `items-stretch` + `h-full` on the card.

---

## Section Background

Gradient placeholder approximating Figma's warm beige + green-tint atmosphere:

```tsx
// business exception: no token for this gradient — document in commit
style={{ background: "linear-gradient(135deg, #eeebe6 0%, #f0ede7 60%, #e9f4ee 100%)" }}
```

Section padding: `py-[80px]`  
Container: `max-w-[1440px] mx-auto px-[48px]`

---

## Section Heading

```tsx
// business exception: 32px has no direct token in new system (h3=36px, h4=28px)
// document in commit message
<h2 className="mt-[48px] text-[32px] leading-[1.2] text-[var(--text-1)] font-normal">
  Don&rsquo;t take our word for it.
</h2>
```

---

## Card Structure

Each card is `flex flex-col h-full bg-[var(--bg-light)] border border-[var(--border-default)]`.

### Body (flex-1)

```
padding: p-[32px]
gap: gap-[20px]
children:
  1. Logo — <Image src="/logo/logo.svg" alt="Novita AI" width={88} height={24} />
             h-[24px], width auto
  2. Quote  — font-paragraph-18 text-[var(--text-2)]
              wrapped in &ldquo; ... &rdquo;
```

### Footer

```
border-t: border-[var(--border-default)]
padding: px-[32px] py-[20px]   (horizontal aligns with body p-[32px])
gap: gap-[20px] items-center
children:
  1. Avatar — size-[64px] shrink-0, no border-radius (square)
              if avatar prop exists: <Image object-cover />
              else: bg-[var(--fill-3)] placeholder div
  2. Name/Title block:
       <p> name  — font-paragraph-14 text-[var(--text-1)]
       <p> title — font-paragraph-14 text-[var(--text-3)]
```

---

## Data

```ts
interface Testimonial {
  quote: string;
  author: string;
  title: string;
  avatar?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The insights provided by Novita AI have significantly improved our decision-making processes. Their user-friendly interface allows us to visualize data like never before.",
    author: "Mark Thompson",
    title: "Product Manager at Tech Innovations",
  },
  {
    quote:
      "Novita AI's platform has been transformative for our engineering team. The API is rock-solid, latency is excellent, and the pricing is the best we've found at scale.",
    author: "Sarah Chen",
    title: "CTO at BuildFast Labs",
  },
  {
    quote:
      "We integrated Novita AI into our product in under a day. The documentation is clear, the support is responsive, and the results have exceeded our expectations.",
    author: "James Rivera",
    title: "Lead Engineer at DataStream",
  },
  {
    quote:
      "Switching to Novita AI cut our inference costs by 60% without any quality loss. It's the best infrastructure decision we've made this year.",
    author: "Priya Nair",
    title: "VP Engineering at ScaleAI Labs",
  },
];
```

---

## Grid Composition

```tsx
<div className="mt-[48px] grid grid-cols-3 gap-[16px] items-stretch">
  <TestimonialCard testimonial={TESTIMONIALS[0]} /> {/* cell 1 */}
  <div /> {/* cell 2 — empty */}
  <TestimonialCard testimonial={TESTIMONIALS[1]} /> {/* cell 3 */}
  <div /> {/* cell 4 — empty */}
  <TestimonialCard testimonial={TESTIMONIALS[2]} /> {/* cell 5 */}
  <TestimonialCard testimonial={TESTIMONIALS[3]} /> {/* cell 6 */}
</div>
```

---

## Token Compliance

| Usage               | Class / Value                            | Compliant?                                               |
| ------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Quote text          | `font-paragraph-18 text-[var(--text-2)]` | ✅                                                       |
| Author name         | `font-paragraph-14 text-[var(--text-1)]` | ✅                                                       |
| Author title        | `font-paragraph-14 text-[var(--text-3)]` | ✅                                                       |
| Card bg             | `bg-[var(--bg-light)]`                   | ✅                                                       |
| Card border         | `border-[var(--border-default)]`         | ✅                                                       |
| Avatar placeholder  | `bg-[var(--fill-3)]`                     | ✅                                                       |
| Section heading     | `text-[32px]`                            | ⚠️ business exception — no 32px heading token            |
| Section bg gradient | hardcoded hex                            | ⚠️ business exception — no token for warm-beige gradient |

Both business exceptions documented in commit message.

---

## Files Touched

| File                                           | Change       |
| ---------------------------------------------- | ------------ |
| `src/app/homepage/components/Testimonials.tsx` | Full rewrite |

## Files NOT Touched

- `SectionEyebrow` — reused as-is
- Design tokens / globals — no changes
- All other homepage components

---

## Out of Scope

- Section background image (to be implemented later when assets are ready)
- Avatar images (placeholder fills used until real photos supplied)
- Mobile responsive layout (not specified)
