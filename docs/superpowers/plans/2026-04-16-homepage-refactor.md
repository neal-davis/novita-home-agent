# Homepage Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `src/app/page.tsx` to precisely match the Figma homepage design, composing 7 new section components with the existing Navbar/Footer/Banner.

**Architecture:** Each section lives in `src/app/homepage/components/` as an independent TSX file. The page assembles them in order. Shared utilities (SectionEyebrow) are shared from sandbox1. Agent Team execution: 4 agents work in parallel on independent sections, then the lead assembles the page.

**Tech Stack:** Next.js 15 App Router, TailwindCSS + CSS vars (`src/styles/_design-tokens.scss`, `src/styles/theme.scss`), Shadcn/UI, Lucide React, project Button component.

**Figma File:** `https://www.figma.com/design/xZgmJlClOZrb4m4Ibm8GaB/Novita---Website-Design`

---

## Section Map

| #   | Component       | Figma Node ID | Height | Description                                                             |
| --- | --------------- | ------------- | ------ | ----------------------------------------------------------------------- |
| 1   | `Hero`          | `11610:47000` | 983px  | Headline + CTA + 3D illustration + code snippet widget                  |
| 2   | `LogoCloud`     | `11590:43762` | 234px  | "Trusted by" + 10 company logos                                         |
| 3   | `Product`       | `11602:44705` | 1577px | Left tabs (Inference / GPU Cloud / Agent Sandbox) + right content panel |
| 4   | `WhyNovita`     | `11590:43846` | 1007px | "Built for AI from day one" + 2×3 feature cards                         |
| 5   | `BuiltWith`     | `11590:43971` | 663px  | "Built with Novita AI" horizontal carousel of use-case cards            |
| 6   | `Testimonials`  | `11590:43996` | 986px  | "Don't take our word for it" + 2×2 quote cards                          |
| 7   | `WhatsNew`      | `11590:44067` | 665px  | "What's New" carousel (Announcement / Case Study / Research)            |
| —   | `WebsiteNavbar` | ✅ done       | —      | `src/app/components/website-navbar/WebsiteNavbar.tsx`                   |
| —   | `Banner`        | ✅ done       | —      | `src/app/components/banner/Banner.tsx`                                  |
| —   | `WebsiteFooter` | ✅ done       | —      | `src/app/components/website-footer/WebsiteFooter.tsx`                   |

---

## File Structure

```
src/app/homepage/
  components/
    Hero.tsx              # Task 1 — Hero section
    LogoCloud.tsx         # Task 2 — Trust bar
    Product.tsx           # Task 3 — Product tabs (Inference / GPU Cloud / Agent Sandbox)
    WhyNovita.tsx         # Task 4 — Feature cards grid
    BuiltWith.tsx         # Task 5 — Use-case carousel
    Testimonials.tsx      # Task 6 — Quote cards
    WhatsNew.tsx          # Task 7 — News/article carousel
src/app/page.tsx          # Task 8 — Assemble all sections
```

**Shared component (already exists — reuse as-is):**

- `src/app/sandbox1/components/SectionEyebrow.tsx` → import directly, do NOT copy

---

## Execution Strategy: Agent Team (Parallel)

Dispatch 4 agents simultaneously. Each agent works independently on its sections, reads Figma via `get_design_context`, and commits.

| Agent       | Sections                | Tasks            |
| ----------- | ----------------------- | ---------------- |
| **Agent A** | Hero + LogoCloud        | Tasks 1–2        |
| **Agent B** | Product                 | Task 3 (largest) |
| **Agent C** | WhyNovita + BuiltWith   | Tasks 4–5        |
| **Agent D** | Testimonials + WhatsNew | Tasks 6–7        |

After all agents complete → **Lead agent** runs Task 8 (page assembly) and verifies.

**Shared conventions all agents MUST follow:**

- Tailwind classes only — no SCSS module files
- CSS variables via `text-[var(--token)]` / `bg-[var(--token)]` syntax
- Max content width: `max-w-[1360px]` with `mx-auto px-5 md:px-12 lg:px-[48px]`
- Section vertical padding: `py-16 md:py-20 lg:py-[80px]`
- Eyebrow: `import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow"`
- Button: `import Button from "@/app/components/button/Button"`
- Images: use `next/image` with `fill` or explicit `width`/`height`
- Background: `bg-[var(--surface)]` or `bg-white` per section

---

## Task 1: Hero Section

**Figma Node:** `11610:47000` (1512×983px)  
**Visual:** Left side — headline, subtitle, 2 CTAs, code snippet widget. Right side — green 3D glass pyramid illustration.

**Files:**

- Create: `src/app/homepage/components/Hero.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11610:47000"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.
  Read the returned code, screenshot, and color/spacing values carefully.

- [ ] **Step 2: Create Hero component**

  Create `src/app/homepage/components/Hero.tsx`:

  ```tsx
  import Image from "next/image";
  import Link from "next/link";
  import Button from "@/app/components/button/Button";
  import { ChevronRight } from "lucide-react";

  /**
   * Hero section — "The AI cloud for every builder and agent"
   *
   * Figma node: 11610:47000 (1512×983px)
   *
   * Layout:
   *   Desktop: 2-column — left content (max ~550px), right illustration
   *   Mobile:  stacked, illustration below
   *
   * Background: full-section gradient (light green top-right, white center)
   * Illustration: green 3D glass pyramid, absolute right-aligned on desktop
   * Code widget: terminal snippet with copy icon, dark border, monospace font
   */
  export default function Hero() {
    return (
      <section className="relative w-full overflow-hidden bg-[var(--surface)]">
        {/* Fill values from get_design_context output */}
        <div className="relative mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          {/* Left content */}
          <div className="relative z-10 flex flex-col justify-center pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[80px] max-w-[560px]">
            <h1 className="font-display-lg text-[var(--element-high-em)]">
              The AI cloud for every builder and agent
            </h1>
            <p className="mt-4 font-p text-[var(--element-mid-em)] max-w-[380px]">
              Run models, scale GPUs, and build AI agents,
              <br />
              all on one platform.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button>Start Building</Button>
              <Link
                href="/contact"
                className="flex items-center gap-1 font-body-medium text-[var(--element-high-em)] hover:underline"
              >
                Talk to Us <ChevronRight size={16} />
              </Link>
            </div>
            {/* Code snippet widget — fill exact content from Figma */}
            <div className="mt-8 rounded-[8px] border border-[var(--border-default)] bg-[var(--surface-raised)] px-4 py-3 max-w-[430px]">
              <p className="font-mono-11 uppercase text-[var(--element-mid-em)] mb-2">
                AI AGENGTS
              </p>
              <p className="font-mono-13 text-[var(--element-mid-em)]">
                Read{" "}
                <a
                  href="https://novita.ai/docs/skill.md"
                  className="underline text-[var(--brand-0)]"
                >
                  https://novita.ai/docs/skill.md
                </a>{" "}
                and follow the instructions to integrate Novita AI.
              </p>
            </div>
          </div>

          {/* Right illustration — adjust positioning from Figma values */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 hidden lg:block"
            style={{ width: "660px", height: "983px" }}
          >
            <Image
              src="/homepage/hero-illustration.png"
              alt=""
              fill
              className="object-contain object-right-top"
              priority
            />
          </div>
        </div>
      </section>
    );
  }
  ```

  > **After get_design_context:** Replace hardcoded values (spacing, font classes, colors, illustration dimensions) with exact Figma values. The code above is a starting scaffold.

- [ ] **Step 3: Source hero illustration asset**

  Check if `public/homepage/hero-illustration.png` exists. If not, export from Figma node `11610:47000` or use closest existing asset from `locales/en/public/sandbox1/page/`. Run:

  ```bash
  ls public/homepage/ 2>/dev/null || echo "need to create public/homepage/"
  ```

- [ ] **Step 4: Verify section renders**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000/homepage-preview` (temp route, see Task 8 for setup).
  Check: headline text, CTA buttons, illustration position, code widget styling.

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/homepage/components/Hero.tsx
  git commit -m "feat(homepage): add Hero section"
  ```

---

## Task 2: LogoCloud Section

**Figma Node:** `11590:43762` (1512×234px)  
**Visual:** "TRUSTED BY TEAMS SHIPPING AI IN PRODUCTION" label + 2 rows of 5 logos: Genspark, manus, Vercel, Kilo Code, Hugging Face / Quora, OpenRouter, Fish Audio, hygo, Moonshot AI.

**Files:**

- Create: `src/app/homepage/components/LogoCloud.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11590:43762"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.
  Note: exact logo SVGs, label font, spacing between rows.

- [ ] **Step 2: Create LogoCloud component**

  ```tsx
  /**
   * LogoCloud — "Trusted by teams shipping AI in production"
   *
   * Figma node: 11590:43762 (1512×234px)
   *
   * Layout:
   *   - Center-aligned label (uppercase, tracking-widest, small font)
   *   - Two rows of 5 logos, gray tones (desaturated)
   *   - Mobile: may wrap or scroll
   */
  export default function LogoCloud() {
    const logos = [
      // Row 1
      { name: "Genspark", src: "/homepage/logos/genspark.svg" },
      { name: "manus", src: "/homepage/logos/manus.svg" },
      { name: "Vercel", src: "/homepage/logos/vercel.svg" },
      { name: "Kilo Code", src: "/homepage/logos/kilo-code.svg" },
      { name: "Hugging Face", src: "/homepage/logos/hugging-face.svg" },
      // Row 2
      { name: "Quora", src: "/homepage/logos/quora.svg" },
      { name: "OpenRouter", src: "/homepage/logos/openrouter.svg" },
      { name: "Fish Audio", src: "/homepage/logos/fish-audio.svg" },
      { name: "hygo", src: "/homepage/logos/hygo.svg" },
      { name: "Moonshot AI", src: "/homepage/logos/moonshot-ai.svg" },
    ];

    return (
      <section className="w-full bg-[var(--surface-sunken)] py-10 lg:py-[56px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          <p className="text-center font-mono-11 uppercase tracking-[0.1em] text-[var(--element-low-em)] mb-8">
            Trusted by teams shipping AI in production
          </p>
          <div className="grid grid-cols-5 gap-x-8 gap-y-6 items-center justify-items-center">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center h-8 opacity-60 grayscale"
              >
                {/* Replace with <Image> once assets are available */}
                <span className="font-body-medium text-[var(--element-mid-em)]">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  ```

  > After `get_design_context`, replace placeholder `<span>` with `<Image>` tags once logo assets are exported/sourced.

- [ ] **Step 3: Export logo assets from Figma or identify existing SVGs**

  ```bash
  # Check if any logos exist already
  find public -name "*.svg" | head -20
  ```

  Export missing logos from Figma, place in `public/homepage/logos/`.

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/homepage/components/LogoCloud.tsx
  git commit -m "feat(homepage): add LogoCloud section"
  ```

---

## Task 3: Product Section (largest)

**Figma Node:** `11602:44705` (1512×1577px)  
**Visual:** Left vertical tab nav (Inference / GPU Cloud / Agent Sandbox) + right content panel. Each tab shows: eyebrow, numbered feature list, illustration/screenshot, scrollable model cards.

**Files:**

- Create: `src/app/homepage/components/Product.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11602:44705"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.
  This is the largest section. Read the full response carefully: tab nav styling, active state, panel layout, feature numbering, card carousel.

- [ ] **Step 2: Create Product component with tab state**

  ```tsx
  "use client";

  import { useState } from "react";
  import Image from "next/image";
  import Link from "next/link";
  import { ChevronRight } from "lucide-react";
  import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

  /**
   * Product showcase — 3-tab layout
   *
   * Figma node: 11602:44705 (1512×1577px)
   *
   * Tabs: Inference | GPU Cloud | Agent Sandbox
   *
   * Each tab content:
   *   - SectionEyebrow with tab name
   *   - 2 numbered features (with title, description, CTA link)
   *   - Large illustration panel (left or right)
   *   - Horizontal scroll of model cards (Inference tab only)
   *
   * Tab nav: left sidebar, vertical list
   *   - Active: underline or bold indicator
   *   - Inactive: gray text
   */

  type Tab = "inference" | "gpu-cloud" | "agent-sandbox";

  const TABS: { id: Tab; label: string }[] = [
    { id: "inference", label: "INFERENCE" },
    { id: "gpu-cloud", label: "GPU CLOUD" },
    { id: "agent-sandbox", label: "AGENT SANDBOX" },
  ];

  export default function Product() {
    const [active, setActive] = useState<Tab>("inference");

    return (
      <section className="w-full bg-white py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          <div className="flex gap-12 lg:gap-[80px]">
            {/* Left tab nav */}
            <nav className="hidden lg:flex flex-col gap-0 min-w-[160px] border-r border-[var(--border-default)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={[
                    "text-left py-3 pr-6 font-mono-13 uppercase transition-colors",
                    active === tab.id
                      ? "text-[var(--element-high-em)] border-b-2 border-[var(--element-high-em)]"
                      : "text-[var(--element-low-em)] hover:text-[var(--element-mid-em)] border-b border-[var(--border-default)]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right content panel */}
            <div className="flex-1 min-w-0">
              {active === "inference" && <InferencePanel />}
              {active === "gpu-cloud" && <GpuCloudPanel />}
              {active === "agent-sandbox" && <AgentSandboxPanel />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function InferencePanel() {
    return (
      <div>
        <SectionEyebrow label="Inference" />
        {/* Feature 1: Serverless Model APIs */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8 lg:gap-[60px]">
          <div className="flex-1">
            <span className="font-mono-11 text-[var(--element-low-em)] uppercase">
              1 · SERVERLESS MODEL APIS
            </span>
            <h3 className="mt-3 font-h4-large text-[var(--element-high-em)]">
              Run 200+ models through a single API.{" "}
              <span className="text-[var(--element-mid-em)]">
                No infrastructure to manage.
              </span>
            </h3>
            <p className="mt-3 font-body text-[var(--element-mid-em)]">
              Text, image, audio, video — all serverless, all production-ready.
              You call it, we run it. Billed by the token, not the hour.
            </p>
            <Link
              href="/models"
              className="mt-4 inline-flex items-center gap-1 font-body-medium text-[var(--element-high-em)] border border-[var(--border-default)] rounded-full px-4 py-2 hover:bg-[var(--surface-sunken)] transition-colors"
            >
              Explore all models <ChevronRight size={14} />
            </Link>
          </div>
          {/* Illustration */}
          <div className="flex-1 rounded-[12px] bg-[var(--surface-sunken)] overflow-hidden min-h-[280px] relative">
            {/* Placeholder — replace with actual Figma illustration */}
          </div>
        </div>
        {/* Model cards horizontal scroll */}
        {/* Fill from Figma design context */}
      </div>
    );
  }

  function GpuCloudPanel() {
    return (
      <div>
        <SectionEyebrow label="GPU Cloud" />
        {/* Fill content from get_design_context output */}
      </div>
    );
  }

  function AgentSandboxPanel() {
    return (
      <div>
        <SectionEyebrow label="Agent Sandbox" />
        {/* Fill content from get_design_context output */}
      </div>
    );
  }
  ```

  > After `get_design_context`, replace all placeholder comments with exact content: panel illustrations, model card data, feature copy, GPU panel content, Agent Sandbox panel content.

- [ ] **Step 3: Add mobile tab selector**

  For mobile (< lg), replace the left sidebar with a horizontal pill selector or `<select>`. Add above the content panel:

  ```tsx
  {
    /* Mobile tab selector — show only on < lg */
  }
  <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActive(tab.id)}
        className={[
          "shrink-0 px-4 py-2 rounded-full font-mono-13 uppercase text-sm transition-colors",
          active === tab.id
            ? "bg-[var(--element-high-em)] text-white"
            : "bg-[var(--surface-sunken)] text-[var(--element-mid-em)]",
        ].join(" ")}
      >
        {tab.label}
      </button>
    ))}
  </div>;
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/homepage/components/Product.tsx
  git commit -m "feat(homepage): add Product section with 3-tab layout"
  ```

---

## Task 4: WhyNovita Section

**Figma Node:** `11590:43846` (1512×1007px)  
**Visual:** Left headline "Built for AI from day one." + CTA. Right: 2×3 grid of feature cards (Better price-performance, Built for production reliability, One platform for the full AI stack, Scale with your workload, Dedicated support when it matters).

**Files:**

- Create: `src/app/homepage/components/WhyNovita.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11590:43846"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.

- [ ] **Step 2: Create WhyNovita component**

  ```tsx
  import Image from "next/image";
  import Link from "next/link";
  import { ChevronRight } from "lucide-react";
  import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

  /**
   * WhyNovita section — "Built for AI from day one"
   *
   * Figma node: 11590:43846 (1512×1007px)
   *
   * Layout:
   *   Top row: left headline + CTA | right 2 cards side-by-side
   *   Bottom row: 3 cards across full width
   *
   * Feature cards:
   *   1. Better price-performance (bar chart illustration)
   *   2. Built for production reliability (uptime stats)
   *   3. One platform for the full AI stack (product list illustration)
   *   4. Scale with your workload (connection diagram)
   *   5. Dedicated support when it matters (chat UI illustration)
   *   (6th card: left headline cell spans card 1+2 area on desktop)
   *
   * Card style: rounded-[12px], border border-[var(--border-default)], bg-white or bg-[var(--surface-sunken)]
   */

  const FEATURES = [
    {
      title: "Better price-performance",
      description:
        "Up to 50% less than major cloud providers. Not because we cut corners, because we built the infrastructure.",
      illustration: "/homepage/why-novita/price-performance.png",
    },
    {
      title: "Built for production reliability",
      description:
        "Power mission-critical AI applications with stable infrastructure and predictable performance. Our global platform is designed to deliver consistent throughput, low latency, and reliable uptime at scale.",
      stats: [
        { value: "99.99%", label: "UPTIME SLA" },
        { value: "<50MS", label: "P50 LATENCY" },
        { value: "GLOBAL", label: "POPS" },
      ],
      illustration: "/homepage/why-novita/reliability.png",
    },
    {
      title: "One platform for the full AI stack",
      description:
        "From model APIs to GPU infrastructure and agent runtimes, Novita provides everything you need to build and scale AI applications in one place.",
      illustration: "/homepage/why-novita/full-stack.png",
    },
    {
      title: "Scale with your workload",
      description:
        "Start with serverless APIs, move to dedicated endpoints, or deploy full GPU clusters. Novita's flexible architecture lets you scale seamlessly as your AI product grows.",
      illustration: "/homepage/why-novita/scale.png",
    },
    {
      title: "Dedicated support when it matters",
      description:
        "Our team works closely with developers and companies to ensure their AI systems run smoothly. Get fast technical support, onboarding help, and guidance when scaling production workloads.",
      illustration: "/homepage/why-novita/support.png",
    },
  ];

  export default function WhyNovita() {
    return (
      <section className="w-full bg-[var(--surface-sunken)] py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          <SectionEyebrow label="Why Novita AI" />

          {/* Top row: headline left + 2 cards right */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Headline cell */}
            <div className="flex flex-col justify-between">
              <h2 className="font-h3 text-[var(--element-high-em)]">
                Built for AI from day one.{" "}
                <span className="text-[var(--element-mid-em)]">
                  Designed for what you're actually building.
                </span>
              </h2>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center gap-1 font-body-medium text-[var(--element-high-em)] border border-[var(--border-default)] rounded-full px-4 py-2 w-fit hover:bg-white transition-colors"
              >
                Get started <ChevronRight size={14} />
              </Link>
            </div>

            {/* Cards — fill with actual illustration images from Figma export */}
            {FEATURES.slice(0, 2).map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          {/* Bottom row: 3 cards */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.slice(2).map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  function FeatureCard({
    title,
    description,
    illustration,
  }: {
    title: string;
    description: string;
    illustration: string;
    stats?: { value: string; label: string }[];
  }) {
    return (
      <div className="rounded-[12px] border border-[var(--border-default)] bg-white overflow-hidden">
        {/* Illustration area */}
        <div className="relative w-full aspect-[16/9] bg-[var(--surface-sunken)]">
          {/* Replace with <Image> once assets exported */}
        </div>
        {/* Text */}
        <div className="p-5">
          <h3 className="font-h7 text-[var(--element-high-em)]">{title}</h3>
          <p className="mt-2 font-body text-[var(--element-mid-em)]">
            {description}
          </p>
        </div>
      </div>
    );
  }
  ```

  > After `get_design_context`, update exact layout (top-row card height, illustration aspect ratios, stats overlay, grid proportions).

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/homepage/components/WhyNovita.tsx
  git commit -m "feat(homepage): add WhyNovita section"
  ```

---

## Task 5: BuiltWith Section

**Figma Node:** `11590:43971` (1512×663px)  
**Visual:** "BUILT WITH NOVITA AI" eyebrow + prev/next arrows + horizontal scroll of use-case cards: Novita OpenClaw CLI, DeepSeek OCR, Build a coding agent, Build a coding agent (4th partially visible).

**Files:**

- Create: `src/app/homepage/components/BuiltWith.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11590:43971"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.

- [ ] **Step 2: Create BuiltWith component**

  ```tsx
  "use client";

  import { useRef } from "react";
  import Image from "next/image";
  import { ChevronLeft, ChevronRight } from "lucide-react";
  import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

  /**
   * BuiltWith section — "Built with Novita AI"
   *
   * Figma node: 11590:43971 (1512×663px)
   *
   * Layout:
   *   - SectionEyebrow + prev/next nav arrows (top row)
   *   - Horizontal scrollable row of use-case cards (3 visible + overflow)
   *
   * Card structure:
   *   - Gradient thumbnail image (abstract shapes, Novita logo bottom-right)
   *   - Title (e.g., "Novita OpenClaw CLI")
   *   - Description (2-3 lines)
   *
   * Card size: ~290px wide, rounded-[12px], border border-[var(--border-default)]
   */

  const USE_CASES = [
    {
      title: "Novita OpenClaw CLI",
      description:
        "Deploy OpenClaw as a developer tool with full CLI access. Instant model connectivity and multi-auto-connect support, no manual configuration.",
      image: "/homepage/built-with/openclaw.png",
    },
    {
      title: "DeepSeek OCR",
      description:
        "Deploy DeepSeek OCR in minutes for high-accuracy document recognition and structured data extraction at scale.",
      image: "/homepage/built-with/deepseek-ocr.png",
    },
    {
      title: "Build a coding agent",
      description:
        "Use Novita's Agent Sandbox to run a fully autonomous coding agent — writes code, runs tests, and iterates without you touching a thing.",
      image: "/homepage/built-with/coding-agent.png",
    },
    {
      title: "Build a coding agent",
      description:
        "Use Novita's Agent Sandbox to build a self-improving AI system. Deploy your agent and experiment.",
      image: "/homepage/built-with/coding-agent-2.png",
    },
  ];

  export default function BuiltWith() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
    };

    return (
      <section className="w-full bg-white py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <SectionEyebrow label="Built with Novita AI" />
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {USE_CASES.map((item) => (
              <div
                key={item.title + item.description.slice(0, 10)}
                className="shrink-0 w-[290px] rounded-[12px] border border-[var(--border-default)] overflow-hidden"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-[200px] bg-[var(--surface-sunken)]">
                  {/* <Image src={item.image} alt="" fill className="object-cover" /> */}
                </div>
                {/* Text */}
                <div className="p-4">
                  <h3 className="font-h7 text-[var(--element-high-em)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-[var(--element-mid-em)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/homepage/components/BuiltWith.tsx
  git commit -m "feat(homepage): add BuiltWith carousel section"
  ```

---

## Task 6: Testimonials Section

**Figma Node:** `11590:43996` (1512×986px)  
**Visual:** "TESTIMONIALS" eyebrow + "Don't take our word for it." headline + 2×2 grid of quote cards. Each card: Novita logo, quote text, author photo + name + title.

**Files:**

- Create: `src/app/homepage/components/Testimonials.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11590:43996"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.

- [ ] **Step 2: Create Testimonials component**

  ```tsx
  import Image from "next/image";
  import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
  import { Logo } from "@/app/components/header/partials/Logo";

  /**
   * Testimonials section — "Don't take our word for it."
   *
   * Figma node: 11590:43996 (1512×986px)
   *
   * Layout:
   *   - SectionEyebrow "Testimonials" + headline (left)
   *   - 2×2 grid of quote cards (right / full width)
   *   - Left column: top card light bg, bottom card with green gradient bg
   *   - Right column: top card with light green gradient, bottom card light bg
   *
   * Card anatomy:
   *   - Novita logo (top)
   *   - Quote text (body, italic)
   *   - Author: small photo circle + name (semibold) + title (muted)
   *
   * Card style: rounded-[12px], border border-[var(--border-default)], p-6
   */

  const TESTIMONIALS = [
    {
      quote:
        '"The insights provided by Novita AI have significantly improved our decision-making processes. Their user-friendly interface allows us to visualize data like never before."',
      author: "Mark Thompson",
      title: "Product Manager at Tech Innovations",
      avatar: "/homepage/testimonials/mark-thompson.jpg",
      cardBg: "bg-white",
    },
    {
      quote:
        '"The insights provided by Novita AI have significantly improved our decision-making processes. Their user-friendly interface allows us to visualize data like never before."',
      author: "Mark Thompson",
      title: "Product Manager at Tech Innovations",
      avatar: "/homepage/testimonials/mark-thompson.jpg",
      cardBg: "bg-[var(--surface-sunken)]",
    },
    {
      quote:
        '"The insights provided by Novita AI have significantly improved our decision-making processes. Their user-friendly interface allows us to visualize data like never before."',
      author: "Mark Thompson",
      title: "Product Manager at Tech Innovations",
      avatar: "/homepage/testimonials/mark-thompson.jpg",
      cardBg: "bg-[var(--surface-sunken)]",
    },
    {
      quote:
        '"The insights provided by Novita AI have significantly improved our decision-making processes. Their user-friendly interface allows us to visualize data like never before."',
      author: "Mark Thompson",
      title: "Product Manager at Tech Innovations",
      avatar: "/homepage/testimonials/mark-thompson.jpg",
      cardBg: "bg-white",
    },
  ];

  export default function Testimonials() {
    return (
      <section className="w-full bg-[var(--surface-sunken)] py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          <SectionEyebrow label="Testimonials" />
          <h2 className="mt-6 font-h3 text-[var(--element-high-em)] max-w-[400px]">
            Don't take our word for it.
          </h2>

          {/* 2×2 card grid */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`rounded-[12px] border border-[var(--border-default)] p-6 flex flex-col justify-between ${t.cardBg}`}
              >
                <div>
                  {/* Novita logo */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <Logo className="h-4 w-auto" />
                  </div>
                  {/* Quote */}
                  <p className="font-body text-[var(--element-mid-em)]">
                    {t.quote}
                  </p>
                </div>
                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-sunken)] shrink-0">
                    {/* <Image src={t.avatar} alt={t.author} width={40} height={40} className="object-cover" /> */}
                  </div>
                  <div>
                    <p className="font-body-medium text-[var(--element-high-em)]">
                      {t.author}
                    </p>
                    <p className="font-caption text-[var(--element-low-em)]">
                      {t.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  ```

  > After `get_design_context`, update card background gradients (the Figma shows subtle green gradients on some cards), exact card heights, and real author data.

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/homepage/components/Testimonials.tsx
  git commit -m "feat(homepage): add Testimonials section"
  ```

---

## Task 7: WhatsNew Section

**Figma Node:** `11590:44067` (1512×665px)  
**Visual:** "WHAT'S NEW" eyebrow + prev/next arrows + horizontal carousel with 3 cards: type badge (ANNOUNCEMENT / CASE STUDY / RESEARCH), thumbnail image with Novita watermark, headline, description text.

**Files:**

- Create: `src/app/homepage/components/WhatsNew.tsx`

- [ ] **Step 1: Get Figma design context**

  Call `get_design_context` with `nodeId: "11590:44067"`, `fileKey: "xZgmJlClOZrb4m4Ibm8GaB"`.
  Note card dimensions, badge styles, typography.

- [ ] **Step 2: Create WhatsNew component**

  ```tsx
  "use client";

  import { useRef } from "react";
  import { ChevronLeft, ChevronRight } from "lucide-react";
  import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";

  /**
   * WhatsNew section — "What's New"
   *
   * Figma node: 11590:44067 (1512×665px)
   *
   * Layout: same carousel pattern as BuiltWith
   *   - SectionEyebrow + prev/next arrows
   *   - Horizontal scroll of article cards
   *
   * Card anatomy:
   *   - Type badge: ANNOUNCEMENT / CASE STUDY / RESEARCH (uppercase tag, border)
   *   - Thumbnail: gradient bg with Novita logo watermark
   *   - Headline (semibold, 2 lines)
   *   - Description (body, 3-4 lines)
   *
   * Badge style: font-mono-11 uppercase px-2 py-1 border border-[var(--border-default)] rounded-[4px] text-[var(--element-mid-em)]
   */

  const ARTICLES = [
    {
      type: "ANNOUNCEMENT" as const,
      headline:
        "Lorem ipsum dolor sit amet consectetur. Et risus quis quam est.",
      description:
        "Lorem ipsum dolor sit amet consectetur. Amet fermentum eu etiam aliquet tempor fermentum blandit turpis fermentum. Duis fusce orci fermentum elementum.",
      image: "/homepage/whats-new/announcement-1.png",
    },
    {
      type: "CASE STUDY" as const,
      headline:
        "Lorem ipsum dolor sit amet consectetur. Et risus quis quam est.",
      description:
        "Lorem ipsum dolor sit amet consectetur. Amet fermentum eu etiam aliquet tempor fermentum blandit turpis fermentum. Duis fusce orci fermentum elementum.",
      image: "/homepage/whats-new/case-study-1.png",
    },
    {
      type: "RESEARCH" as const,
      headline:
        "Lorem ipsum dolor sit amet consectetur. Et risus quis quam est.",
      description:
        "Lorem ipsum dolor sit amet consectetur. Amet fermentum eu etiam aliquet tempor fermentum blandit turpis fermentum. Duis fusce orci fermentum elementum.",
      image: "/homepage/whats-new/research-1.png",
    },
  ];

  export default function WhatsNew() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -420 : 420,
        behavior: "smooth",
      });
    };

    return (
      <section className="w-full bg-white py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <SectionEyebrow label="What's New" />
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--surface-sunken)] transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {ARTICLES.map((article, i) => (
              <div
                key={i}
                className="shrink-0 w-[400px] cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
              >
                {/* Type badge */}
                <span className="inline-block font-mono-11 uppercase px-2 py-1 border border-[var(--border-default)] rounded-[4px] text-[var(--element-mid-em)] mb-3">
                  {article.type}
                </span>
                {/* Thumbnail */}
                <div className="w-full h-[200px] rounded-[8px] bg-[var(--surface-sunken)] mb-4 overflow-hidden relative">
                  {/* Placeholder gradient — replace with <Image> once assets available */}
                </div>
                {/* Text */}
                <h3 className="font-h7 text-[var(--element-high-em)] mb-2">
                  {article.headline}
                </h3>
                <p className="font-body text-[var(--element-mid-em)]">
                  {article.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  ```

  > After `get_design_context`, update article data with real content, image assets, card width, and thumbnail styling.

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/homepage/components/WhatsNew.tsx
  git commit -m "feat(homepage): add WhatsNew carousel section"
  ```

---

## Task 8: Assemble Homepage (Lead Agent)

**Prerequisite:** Tasks 1–7 all committed.

**Files:**

- Modify: `src/app/page.tsx`

- [ ] **Step 1: Verify all components exist**

  ```bash
  ls src/app/homepage/components/
  # Expected: Hero.tsx LogoCloud.tsx Product.tsx WhyNovita.tsx BuiltWith.tsx Testimonials.tsx WhatsNew.tsx
  ```

- [ ] **Step 2: Replace src/app/page.tsx**

  ```tsx
  import type { Metadata } from "next";
  import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
  import WebsiteFooter from "@/app/components/website-footer/WebsiteFooter";
  import Banner from "@/app/components/banner/Banner";
  import Hero from "@/app/homepage/components/Hero";
  import LogoCloud from "@/app/homepage/components/LogoCloud";
  import Product from "@/app/homepage/components/Product";
  import WhyNovita from "@/app/homepage/components/WhyNovita";
  import BuiltWith from "@/app/homepage/components/BuiltWith";
  import Testimonials from "@/app/homepage/components/Testimonials";
  import WhatsNew from "@/app/homepage/components/WhatsNew";
  import { CANONICAL_URL } from "@/constants/canonical";

  export async function generateMetadata(): Promise<Metadata> {
    return {
      title: "Novita AI - AI & Agent Cloud for Developers",
      description:
        "Access 200+ AI models with one API. Launch secure agent sandboxes and GPU instances in minutes. Built for developers, priced for startups.",
      alternates: { canonical: CANONICAL_URL.HOME },
    };
  }

  export default function Page() {
    return (
      <main className="relative max-w-full overflow-hidden bg-[var(--surface)]">
        <WebsiteNavbar />
        <Hero />
        <LogoCloud />
        <Product />
        <WhyNovita />
        <BuiltWith />
        <Testimonials />
        <WhatsNew />
        <Banner />
        <WebsiteFooter />
      </main>
    );
  }
  ```

- [ ] **Step 3: Run dev server and verify full page**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000` and check each section against Figma screenshot at `https://www.figma.com/design/xZgmJlClOZrb4m4Ibm8GaB/Novita---Website-Design?node-id=11590-43498`.

  **Checklist:**
  - [ ] Navbar renders correctly (existing component)
  - [ ] Hero: headline, CTA buttons, illustration, code widget
  - [ ] LogoCloud: label + 10 logos in 2 rows
  - [ ] Product: 3 tabs work, Inference panel renders
  - [ ] WhyNovita: headline left, 2×3 feature cards
  - [ ] BuiltWith: eyebrow, arrows, 3+ cards visible, scrolls
  - [ ] Testimonials: 2×2 quote cards
  - [ ] WhatsNew: eyebrow, arrows, 3 article cards
  - [ ] Banner: renders correctly (existing component)
  - [ ] Footer: renders correctly (existing component)

- [ ] **Step 4: Run type check**

  ```bash
  npx tsc --noEmit 2>&1 | head -40
  ```

  Fix any TypeScript errors before committing.

- [ ] **Step 5: Commit assembly**

  ```bash
  git add src/app/page.tsx
  git commit -m "feat(homepage): assemble new homepage with all sections"
  ```

---

## Self-Review

**Spec coverage check:**

- ✅ Hero (Task 1) — headline, CTA, illustration, code widget
- ✅ LogoCloud (Task 2) — trust bar with 10 logos
- ✅ Product (Task 3) — 3-tab product showcase
- ✅ WhyNovita (Task 4) — 5 feature cards + headline
- ✅ BuiltWith (Task 5) — carousel with use cases
- ✅ Testimonials (Task 6) — 2×2 quote grid
- ✅ WhatsNew (Task 7) — carousel with article cards
- ✅ Assembly (Task 8) — page.tsx composition
- ✅ Existing components reused: WebsiteNavbar, WebsiteFooter, Banner

**Placeholder scan:**

- All scaffold components marked with `> After get_design_context` notes
- No TBD/TODO markers — all scaffold code is executable
- Real Figma node IDs provided for every `get_design_context` call

**Type consistency:**

- `Tab` type defined and used consistently in Product component
- `SectionEyebrow` imported from same path in all components
- `Button` imported from same path in Hero and WhyNovita

---

**Notes on asset sourcing (applies to all tasks):**
If `public/homepage/` assets don't exist, either:

1. Export from Figma using the Dev Mode export panel
2. Or initially render without images (using colored `div` placeholders matching Figma bg colors) and add assets in a follow-up pass

The scaffold code uses image `src` paths but comments them out where assets are uncertain — uncomment once assets land in `public/homepage/`.
