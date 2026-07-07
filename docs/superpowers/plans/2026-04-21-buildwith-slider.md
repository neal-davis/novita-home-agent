# Build With Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `BuiltWith.tsx` to render 6 real cards with background images, gradient overlays, a centered "novita ai" logo placeholder, and arrow navigation that advances/rewinds by one card with accurate disabled states.

**Architecture:** Single `"use client"` component at `src/app/homepage/components/BuiltWith.tsx`. Uses `useState(currentIndex)` + `scrollRef.scrollTo()` for controlled navigation. Card data is a static array typed as `UseCase[]`. Two internal subcomponents: `CardImage` and `NavButton`.

**Tech Stack:** Next.js App Router, React 18, Tailwind CSS, Lucide React icons, `@testing-library/react` for tests.

---

## File Map

| Action | Path                                                      | Responsibility              |
| ------ | --------------------------------------------------------- | --------------------------- |
| Modify | `src/app/homepage/components/BuiltWith.tsx`               | Full component rewrite      |
| Create | `src/app/homepage/components/__test__/BuiltWith.test.tsx` | Render + nav-disabled tests |

---

### Task 1: Write the failing tests

**Files:**

- Create: `src/app/homepage/components/__test__/BuiltWith.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// src/app/homepage/components/__test__/BuiltWith.test.tsx
import { render, screen } from "@testing-library/react";
import BuiltWith from "../BuiltWith";

describe("BuiltWith carousel", () => {
  it("renders 6 cards", () => {
    render(<BuiltWith />);
    const cards = screen.getAllByTestId("builtwith-card");
    expect(cards).toHaveLength(6);
  });

  it("prev button is disabled at start", () => {
    render(<BuiltWith />);
    const prevBtn = screen.getByLabelText("Previous");
    expect(prevBtn).toBeDisabled();
  });

  it("next button is enabled at start", () => {
    render(<BuiltWith />);
    const nextBtn = screen.getByLabelText("Next");
    expect(nextBtn).not.toBeDisabled();
  });

  it("renders novita ai logo text in each card image area", () => {
    render(<BuiltWith />);
    const logos = screen.getAllByText("novita ai");
    expect(logos).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest src/app/homepage/components/__test__/BuiltWith.test.tsx --no-coverage
```

Expected: 4 failures (component does not yet match new interface)

---

### Task 2: Rewrite BuiltWith.tsx — types and data

**Files:**

- Modify: `src/app/homepage/components/BuiltWith.tsx`

- [ ] **Step 1: Replace the file with the new types and card data (full file)**

```tsx
"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

// ── Types ───────────────────────────────────────────────────────────────────

interface UseCase {
  title: string;
  description: string;
  bgImage: string;
  // design-only gradient values (no token equivalent) — documented as business exception
  gradientStyle: string;
}

// ── Card data ────────────────────────────────────────────────────────────────

const USE_CASES: UseCase[] = [
  {
    title: "Novita OpenClaw CLI",
    description:
      "Deploy OpenClaw as a developer tool with full CLI access. Instant model connectivity and auto-connect support, no manual configuration.",
    bgImage: "/home/build-with/build-with1.png",
    gradientStyle: "linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)",
  },
  {
    title: "DeepSeek OCR",
    description:
      "Deploy DeepSeek OCR in minutes for high-accuracy document recognition and structured data extraction at scale.",
    bgImage: "/home/build-with/build-with2.png",
    gradientStyle: "linear-gradient(100deg, #e3dfde 22%, #fffbf7 79%)",
  },
  {
    title: "Build a coding agent",
    description:
      "Use Novita's Agent Sandbox to run a fully autonomous coding agent — writes code, runs tests, and iterates without you touching a thing.",
    bgImage: "/home/build-with/build-with3.png",
    gradientStyle: "linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)",
  },
  {
    title: "Build a coding agent",
    description:
      "Use Novita's LLMs and Agent Sandbox to build a secure environment where your agent can code, build, and experiment without breaking anything.",
    bgImage: "/home/build-with/build-with1.png",
    gradientStyle: "linear-gradient(100deg, #d8d2d1 22%, #fffbf7 79%)",
  },
  {
    title: "Coming Soon",
    description:
      "More powerful integrations and tooling are on the way — stay tuned.",
    bgImage: "/home/build-with/build-with2.png",
    gradientStyle: "linear-gradient(187deg, #fefcf4 2%, #f1f0e9 94%)",
  },
  {
    title: "Coming Soon",
    description:
      "Explore the full potential of Novita AI with upcoming features designed for scale.",
    bgImage: "/home/build-with/build-with3.png",
    gradientStyle: "linear-gradient(100deg, #e3dfde 22%, #fffbf7 79%)",
  },
];

// ── CardImage ────────────────────────────────────────────────────────────────

function CardImage({
  bgImage,
  gradientStyle,
}: Pick<UseCase, "bgImage" | "gradientStyle">) {
  return (
    <div className="relative h-[308px] w-[322px] border border-[var(--border-subtle)] overflow-hidden shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: gradientStyle, opacity: 0.65 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-13 uppercase tracking-[0.52px] text-element-high-em opacity-50">
          novita ai
        </span>
      </div>
    </div>
  );
}

// ── NavButton ────────────────────────────────────────────────────────────────

interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}

function NavButton({ onClick, disabled, label, children }: NavButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="size-8 flex items-center justify-center border border-element-high-em rounded-[2px] disabled:opacity-30 transition-opacity cursor-pointer disabled:cursor-default"
    >
      {children}
    </button>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

const CARD_WIDTH = 418; // Figma card w-[418px], px-[48px] both sides
const VISIBLE_COUNT = 3;
const MAX_INDEX = USE_CASES.length - VISIBLE_COUNT; // 3

export default function BuiltWith() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  function scrollPrev() {
    const next = Math.max(0, currentIndex - 1);
    setCurrentIndex(next);
    scrollRef.current?.scrollTo({
      left: next * CARD_WIDTH,
      behavior: "smooth",
    });
  }

  function scrollNext() {
    const next = Math.min(MAX_INDEX, currentIndex + 1);
    setCurrentIndex(next);
    scrollRef.current?.scrollTo({
      left: next * CARD_WIDTH,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full overflow-hidden bg-[var(--bg-light)] py-[80px]">
      <div className="mx-auto max-w-[1440px] px-[48px]">
        <div className="flex flex-col gap-[24px]">
          <SectionEyebrow label="Built with Novita AI" />
          <div className="flex items-center justify-between">
            <NavButton
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              label="Previous"
            >
              <ChevronLeft className="size-4" />
            </NavButton>
            <NavButton
              onClick={scrollNext}
              disabled={currentIndex >= MAX_INDEX}
              label="Next"
            >
              <ChevronRight className="size-4" />
            </NavButton>
          </div>
        </div>
      </div>

      <div
        className="mt-[24px] overflow-hidden"
        style={{
          marginLeft:
            "calc((100vw - min(1440px, 100vw)) / 2 + clamp(20px, 3.5vw, 48px))",
        }}
      >
        <div
          ref={scrollRef}
          className="flex overflow-x-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {USE_CASES.map((item, i) => (
            <div
              key={i}
              data-testid="builtwith-card"
              className="flex-none w-[418px] border-l border-[var(--border-2)] flex flex-col gap-[24px] px-[48px] py-[16px]"
            >
              <CardImage
                bgImage={item.bgImage}
                gradientStyle={item.gradientStyle}
              />
              <p className="font-heading-h5 text-[var(--text-1)] whitespace-nowrap">
                {item.title}
              </p>
              <p className="font-paragraph-18 text-[var(--text-3)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run the tests — expect PASS**

```bash
npx jest src/app/homepage/components/__test__/BuiltWith.test.tsx --no-coverage
```

Expected: 4 tests pass.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "BuiltWith" | head -20
```

Expected: no errors for BuiltWith files.

- [ ] **Step 4: Commit**

```bash
git add src/app/homepage/components/BuiltWith.tsx \
        src/app/homepage/components/__test__/BuiltWith.test.tsx
git commit -m "$(cat <<'EOF'
feat(homepage): rewrite BuiltWith carousel with real bg images and index-based nav

- 6 cards with /home/build-with/build-with{1,2,3}.png backgrounds
- gradient overlay per card (design-only values: #fefcf4, #f1f0e9, #e3dfde,
  #fffbf7, #d8d2d1 — no token equivalent, business exception)
- centered "novita ai" mono-13 logo placeholder (slot ready for SVG swap)
- currentIndex state drives scrollTo(index * 418px) and disabled states
- cards 5-6 use placeholder copy pending real content

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Visual verification

**Files:**

- No code changes — verify in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to homepage and verify**

Open `http://localhost:3000` and check:

| Check                | Expected                                                                |
| -------------------- | ----------------------------------------------------------------------- |
| Section eyebrow      | "BUILT WITH NOVITA AI" with green dot and underline                     |
| Prev arrow           | Visible at left, grayed out (opacity-30) on initial load                |
| Next arrow           | Visible at right, fully opaque                                          |
| 3 cards visible      | Cards show background images with gradient overlay                      |
| Logo text            | "novita ai" in mono style centered on each card image                   |
| Card title           | 24px, dark, `whitespace-nowrap` (no wrapping)                           |
| Card description     | 18px, gray                                                              |
| Click Next once      | Cards slide left by one card width (418px), prev button becomes enabled |
| Click Next until MAX | Next button becomes grayed out at index 3                               |
| Click Prev           | Cards slide right, prev grays out at index 0                            |

- [ ] **Step 3: If visual issues are found, fix and re-run tests before committing**

---

## Self-Review Checklist

- [x] Spec goal: 6 cards with bg images — Task 2 implements this ✅
- [x] Spec goal: centered logo placeholder — `CardImage` has it ✅
- [x] Spec goal: nav advances by 1 card — `scrollPrev`/`scrollNext` ± 1 ✅
- [x] Spec goal: disabled at boundaries — `disabled={currentIndex === 0}` / `>= MAX_INDEX` ✅
- [x] CHK-001 compliance: no bare hex — gradient values documented as business exception ✅
- [x] CHK: `font-mono-13 uppercase tracking-[0.52px]` for logo text ✅
- [x] `border-[var(--border-2)]` for card separator ✅
- [x] `data-testid="builtwith-card"` on every card for test targeting ✅
- [x] Tests cover: card count, prev disabled at 0, next enabled at 0, logo text count ✅
- [x] `SectionEyebrow` receives `label` prop — matches its interface `{ label: string }` ✅
- [x] `USE_CASES.length - VISIBLE_COUNT = 6 - 3 = 3 = MAX_INDEX` — math correct ✅
- [x] No files other than BuiltWith.tsx and its test touched ✅
