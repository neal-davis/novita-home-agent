# Testimonials Grid Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `Testimonials.tsx` to render 4 cards in a 3×2 equal-height CSS grid (cells 2 and 4 empty), with gradient placeholder background and token-compliant typography.

**Architecture:** Single file rewrite of `src/app/homepage/components/Testimonials.tsx`. Uses CSS grid `grid-cols-3 items-stretch` for equal-height rows. `TestimonialCard` is an internal sub-component. No external dependencies added.

**Tech Stack:** Next.js App Router, React 18, Tailwind CSS, `next/image`, project design tokens (`font-paragraph-14`, `font-paragraph-18`, `var(--text-*)`, `var(--border-default)`, `var(--bg-light)`, `var(--fill-3)`).

---

## File Map

| Action | Path                                           | Responsibility |
| ------ | ---------------------------------------------- | -------------- |
| Modify | `src/app/homepage/components/Testimonials.tsx` | Full rewrite   |

---

### Task 1: Rewrite Testimonials.tsx

**Files:**

- Modify: `src/app/homepage/components/Testimonials.tsx`

- [ ] **Step 1: Replace the entire file with the new implementation**

```tsx
import Image from "next/image";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-light)] border border-[var(--border-default)]">
      {/* Body */}
      <div className="flex flex-1 flex-col gap-[20px] p-[32px]">
        <div className="h-[24px] flex items-center">
          <Image
            src="/logo/logo.svg"
            alt="Novita AI"
            width={88}
            height={24}
            style={{ width: "auto", height: "100%" }}
          />
        </div>
        <p className="font-paragraph-18 text-[var(--text-2)]">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>
      {/* Footer */}
      <div className="flex items-center gap-[20px] border-t border-[var(--border-default)] px-[32px] py-[20px]">
        <div className="shrink-0 size-[64px] overflow-hidden">
          {testimonial.avatar ? (
            <Image
              src={testimonial.avatar}
              alt={testimonial.author}
              width={64}
              height={64}
              className="object-cover size-full"
            />
          ) : (
            <div className="size-full bg-[var(--fill-3)]" />
          )}
        </div>
        <div className="flex flex-col">
          <p className="font-paragraph-14 text-[var(--text-1)]">
            {testimonial.author}
          </p>
          <p className="font-paragraph-14 text-[var(--text-3)]">
            {testimonial.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    // business exception: warm-beige gradient — no token equivalent, documented here
    <section
      className="py-[80px]"
      style={{
        background:
          "linear-gradient(135deg, #eeebe6 0%, #f0ede7 60%, #e9f4ee 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-[48px]">
        <SectionEyebrow label="Testimonials" />

        {/* business exception: 32px heading — new token system has h3=36px, h4=28px */}
        <h2 className="mt-[48px] text-[32px] leading-[1.2] text-[var(--text-1)] font-normal">
          Don&rsquo;t take our word for it.
        </h2>

        {/*
          3×2 grid — cells 2 and 4 are empty <div>s to maintain the stagger:
          [Card1] [empty] [Card2]
          [empty] [Card3] [Card4]
        */}
        <div className="mt-[48px] grid grid-cols-3 gap-[16px] items-stretch">
          <TestimonialCard testimonial={TESTIMONIALS[0]} />
          <div />
          <TestimonialCard testimonial={TESTIMONIALS[1]} />
          <div />
          <TestimonialCard testimonial={TESTIMONIALS[2]} />
          <TestimonialCard testimonial={TESTIMONIALS[3]} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "Testimonials" | head -20
```

Expected: no output (no errors).

- [ ] **Step 3: Visual verification**

Start dev server (`npm run dev`) and open `http://localhost:3000`. Verify:

| Check       | Expected                                                         |
| ----------- | ---------------------------------------------------------------- |
| Background  | Warm beige-to-green gradient, not flat gray                      |
| Eyebrow     | "TESTIMONIALS" with green dot and underline                      |
| Heading     | "Don't take our word for it." at ~32px                           |
| Grid row 1  | Card + empty gap + Card, both same height                        |
| Grid row 2  | Empty gap + Card + Card, both same height                        |
| Card body   | Novita logo top-left, quote text below                           |
| Card footer | `border-t` separator, 64×64 gray placeholder, name + title right |
| All 4 cards | Equal width (1/3 of container each)                              |
| No offset   | No card is vertically shifted higher or lower than its row peers |

---

## Self-Review

- [x] Spec goal: 3×2 grid, cells 2+4 empty — `grid grid-cols-3`, two `<div />`s at positions 2 and 4 ✅
- [x] Spec goal: equal height — `items-stretch` + `h-full` on card ✅
- [x] Spec goal: gradient bg — inline style on `<section>` ✅
- [x] Spec goal: logo in card body — `<Image src="/logo/logo.svg" />` ✅
- [x] Spec goal: quote font — `font-paragraph-18 text-[var(--text-2)]` ✅
- [x] Spec goal: author name font — `font-paragraph-14 text-[var(--text-1)]` ✅
- [x] Spec goal: author title font — `font-paragraph-14 text-[var(--text-3)]` ✅
- [x] Spec goal: avatar 64×64 square — `size-[64px]`, no `rounded-*` ✅
- [x] Spec goal: footer border-t — `border-t border-[var(--border-default)]` ✅
- [x] Business exceptions documented in inline comments ✅
- [x] No `mt-*` offset hacks — removed entirely ✅
- [x] `SectionEyebrow` interface `{ label: string }` satisfied ✅
- [x] Only one file touched ✅
