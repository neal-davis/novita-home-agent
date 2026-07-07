# GPU Bare Metal Page v5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/gpu-baremetal` with v5 shell: `WebsiteNavbar`, Hero (`212-10578`), main body (`214-11372`), `FooterSection`. Inventory list is **not** on this page until product adds it back; list components remain in repo for reuse.

**Implementation status:** v5 顶栏 + Hero（Figma `212-10578`）+ **中间主体** [`GpuBareMetalPageContent`](src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx)（Figma **`214-11372`**）+ `FooterSection`。**已移除**本页的 `BaremetalList` 与旧 `GpuBareMetalWorkloadSolutions` 挂载。

**Architecture:** `WebsiteNavbar` → `GpuBareMetalHero` → **`GpuBareMetalPageContent`** → `FooterSection`。中间区数据为 `SOLUTION_BLOCKS` 常量（可接 CMS）；库存列表代码保留在 `BaremetalList.tsx` 供后续接入。

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, CSS variables from `globals.scss` / design tokens, `next/image`, existing `Button` from `@/app/components/button/Button`.

**Design spec:** [`docs/superpowers/specs/2026-04-22-gpu-bare-metal-v5-design.md`](../specs/2026-04-22-gpu-bare-metal-v5-design.md)  
**Figma:** node `212-10578` — after landing the structure below, match `min-height`, typography classes, CTA labels, `object-position`, and gradient presence to Dev Mode (replace any starter values that differ).

### Design token / FE skill 校对（styling-system）

对照 [`_design-tokens.scss`](../../../src/styles/_design-tokens.scss)、[`tailwind.config.ts`](../../../tailwind.config.ts) 的 `spacing` / `boxShadow` 与 FE skill「语义变量优先」：

| 片段                                                                                                        | 结论                                                            |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `bg-[var(--gray-50)]`、`text-[var(--text-1)]`、`text-[var(--text-3)]`                                       | 符合语义 token                                                  |
| `font-miletus`、`font-display-md`、`font-paragraph-18`、`font-paragraph-14`                                 | 与 Model Library Hero 一致，来自 `globals`/排版类               |
| `gap-[var(--space-12)]` / `space-16` / `space-24`，`!px-[var(--space-20)]`，`!rounded-[var(--radius-full)]` | 与 spacing / radius token 一致                                  |
| `!bg-[var(--gray-950)]`、`hover:!bg-[var(--gray-800)]`、`text-[var(--gray-800)]`                            | 语义灰阶，已 token 化                                           |
| `px-[var(--spacing-layout-x)]`                                                                              | 与 `max_width_container` 同源布局变量，符合安全区               |
| 主按钮 `shadow-[0px_1px_3px_0px_var(--alpha-dark-10),inset_…var(--alpha-light-20)]`                         | 实现中已用 `alpha-dark-10`，避免裸 `rgba(0,0,0,0.12)`           |
| `pb-space-48 md:pb-space-80 lg:pb-[131px]`                                                                  | 底部内边距：`space-*` + Figma 余量任意值                        |
| `lg:pb-[131px]`、`max-w-[1512px]`、`xl:px-[124px]`、`max-w-[560px]`、`min-h-[480px]` 等                     | **Figma 架宽/高度**：无 scale token 时保留任意值，Dev Mode 对齐 |
| 渐变层 `h-32 md:h-40 lg:h-[208px]`                                                                          | Tailwind 默认高度刻度 + Figma 高度；可按需改为 token 组合       |
| 装饰图 `Image` 的 `alt=""`                                                                                  | 与 Model Hero 一致；父级 `aria-hidden`                          |

**Novita UI skill：** 若本地加载了 `novita-ui-skill` 且其 token/类名与上表冲突，以 **UI skill + Figma** 为最高优先级（FE skill `styling-system.md` PRE 节）。

---

## File map

| Action | Path                                                           | Responsibility                                                           |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Done   | `src/app/gpu-baremetal/components/GpuBareMetalHero.tsx`        | Hero: background image, gradient, `h1` + subcopy + CTAs                  |
| Done   | `src/app/gpu-baremetal/page.tsx`                               | `WebsiteNavbar` → Hero → **`GpuBareMetalPageContent`** → `FooterSection` |
| Done   | `src/app/gpu-baremetal/components/BaremetalList.tsx`           | Outer `w-full`; removed inner `max-w-7xl mx-auto p-4`                    |
| Done   | `src/app/gpu-baremetal/index.module.scss`                      | Removed (Tailwind-only page layout)                                      |
| Done   | `src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx` | Figma **`214-11372`**：中间主体（Solutions 双列卡等，见文件头链接）      |

---

## Task 8: Figma `214-11372` — 中间主体（替换 212 子块 + 移除列表）

**Files:**

- Create / 维护: `src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx`（文件头含 Figma `214-11372` 链接）
- Modify: `src/app/gpu-baremetal/page.tsx`（仅 Hero + `GpuBareMetalPageContent` + Footer；**不**挂载 `BaremetalList`）
- Remove: `GpuBareMetalWorkloadSolutions.tsx`（逻辑并入 `GpuBareMetalPageContent` 或删除重复文件）

- [x] **Step 1:** 删除 Hero/Footer 之间旧内容（`GpuBareMetalWorkloadSolutions`、`BaremetalList` 容器）。
- [x] **Step 2:** 按 **214-11372** 还原中间 UI（当前实现为 Solutions 双列卡 + 分段；与 Dev Mode 逐项对齐）。
- [x] **Step 3:** `npx tsc --noEmit`；更新 design spec 节点说明。

---

## Task 1: Add `GpuBareMetalHero` component

**Files:**

- Create: `src/app/gpu-baremetal/components/GpuBareMetalHero.tsx`

- [x] **Step 1: Create the file with the starter implementation**

  Create `src/app/gpu-baremetal/components/GpuBareMetalHero.tsx` with:

  ```tsx
  import Image from "next/image";
  import { ChevronRight } from "lucide-react";
  import Button from "@/app/components/button/Button";
  import { BREVO_BOOK_LINK } from "@/constants/urls";

  const GPU_CONTACT_EMAIL = "mailto:gpu@novita.ai";

  export default function GpuBareMetalHero() {
    return (
      <section className="relative w-full min-h-[480px] md:min-h-[600px] lg:min-h-[700px] bg-[var(--gray-50)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <Image
            src="/gpus/v5/gpu-bare-metal-hero-bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center lg:object-right-top"
            priority
          />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 md:h-40 lg:h-[208px] pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--gray-50))",
          }}
        />

        <div className="relative z-10 flex min-h-[480px] md:min-h-[600px] lg:min-h-[700px] flex-col justify-end">
          <div className="w-full max-w-[1512px] mx-auto px-[var(--spacing-layout-x)] xl:px-[124px] pb-space-48 md:pb-space-80 lg:pb-[131px]">
            <div className="max-w-[560px]">
              <div className="flex flex-col gap-[var(--space-24)]">
                <div className="flex flex-col gap-[var(--space-16)]">
                  <h1 className="font-miletus font-display-md text-[var(--text-1)]">
                    Rent Bare Metal GPU Servers
                  </h1>
                  <p className="font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]">
                    High-performance bare metal GPU servers. Full control and
                    low cost—ideal for AI, ML, and deep learning workloads.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-[var(--space-12)]">
                  <Button
                    type="primary"
                    height={40}
                    renderTag="link"
                    link={BREVO_BOOK_LINK}
                    elAttrs={{
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }}
                    className="!rounded-[var(--radius-full)] !bg-[var(--gray-950)] !text-[var(--white)] hover:!bg-[var(--gray-800)] !px-[var(--space-20)] font-paragraph-14 shadow-[0px_1px_3px_0px_var(--alpha-dark-10),inset_0px_2px_0px_0px_var(--alpha-light-20)]"
                  >
                    Meet with us
                  </Button>
                  <Button
                    type="text"
                    height={44}
                    renderTag="link"
                    link={GPU_CONTACT_EMAIL}
                    className="!rounded-[var(--radius-full)] !px-[var(--space-20)] !no-underline font-paragraph-14 text-[var(--gray-800)] flex items-center gap-[var(--space-4)]"
                  >
                    Contact sales
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  ```

  Then open Figma node `212-10578` and adjust in this file only: `min-h-*`, `font-*` / `text-[var(--text-*)]` classes, `object-*` on `Image`, gradient `h-*` / remove gradient block if the frame has none, CTA labels and links, and vertical alignment (`justify-end` vs `justify-center` + `pt-*`) to match the frame.

- [x] **Step 2: Run TypeScript**

  ```bash
  cd /Users/mac/Desktop/workspace/platform/novita-home
  npx tsc --noEmit 2>&1 | head -40
  ```

  Expected: no errors referencing `GpuBareMetalHero.tsx`.

- [x] **Step 3: Commit**

  ```bash
  git add src/app/gpu-baremetal/components/GpuBareMetalHero.tsx
  git commit -m "feat(gpu-baremetal): add v5 marketing hero component"
  ```

---

## Task 2: Recompose `gpu-baremetal` page (v5 shell)

**Files:**

- Modify: `src/app/gpu-baremetal/page.tsx` (SCSS removal tracked under Task 4)

- [x] **Step 1: Replace `page.tsx` contents**

  Set `src/app/gpu-baremetal/page.tsx` to:

  ```tsx
  import type { Metadata } from "next";
  import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
  import FooterSection from "@/app/components/footer-section/FooterSection";
  import { CANONICAL_URL } from "@/constants/canonical";
  import BaremetalList from "./components/BaremetalList";
  import GpuBareMetalHero from "./components/GpuBareMetalHero";

  export async function generateMetadata(): Promise<Metadata> {
    return {
      title: "Bare Metal GPU Servers | Low Cost, High Performance | Novita AI",
      description:
        "High-performance bare metal GPU servers by Novita AI. Full control and low cost—ideal for AI, ML, and deep learning workloads.",
      alternates: {
        canonical: CANONICAL_URL.GPU_BAREMETAL,
      },
    };
  }

  export default async function Page() {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--gray-50)]">
        <WebsiteNavbar />
        <GpuBareMetalHero />
        <div className="max_width_container mt-[60px] mx-web pb-[120px] w-full">
          <BaremetalList />
        </div>
        <FooterSection />
      </div>
    );
  }
  ```

  Notes:
  - Remove imports of `Header`, `ReadyStart`, `FooterBanner`, `Footer`, and `styles from "./index.module.scss"`.
  - Do not render a second `h1` in the page body (title lives in the Hero only).

- [x] **Step 2: Run TypeScript again**

  ```bash
  npx tsc --noEmit 2>&1 | head -40
  ```

  Expected: clean for `page.tsx`.

- [x] **Step 3: Commit**

  ```bash
  git add src/app/gpu-baremetal/page.tsx
  git commit -m "refactor(gpu-baremetal): adopt v5 shell and hero layout"
  ```

---

## Task 3: Simplify `BaremetalList` outer layout

**Files:**

- Modify: `src/app/gpu-baremetal/components/BaremetalList.tsx`

- [x] **Step 1: Remove the redundant inner max-width wrapper**

  In the `return`, replace the opening structure:

  ```tsx
  <div className={styles.container}>
    <div className="w-full max-w-7xl mx-auto p-4">
  ```

  with:

  ```tsx
  <div className={`${styles.container} w-full`}>
  ```

  and remove the matching extra closing `</div>` that previously closed `max-w-7xl` (keep a single wrapper `div` around the search bar + grid so SCSS selectors like `.container .search_bar` still apply).

- [x] **Step 2: Add light vertical rhythm only if needed**

  If the search row sits flush against the Hero, add a single Tailwind class on the outer `div` (for example `pt-2` or `pt-4`) after checking Figma spacing between Hero bottom and search. Prefer Figma Dev values over guesses.

- [x] **Step 3: Run TypeScript**

  ```bash
  npx tsc --noEmit 2>&1 | head -40
  ```

- [x] **Step 4: Commit**

  ```bash
  git add src/app/gpu-baremetal/components/BaremetalList.tsx
  git commit -m "refactor(gpu-baremetal): align list wrapper with v5 content gutters"
  ```

---

## Task 4: Remove unused SCSS module

**Files:**

- Delete: `src/app/gpu-baremetal/index.module.scss`

- [x] **Step 1: Confirm no imports**

  ```bash
  rg "gpu-baremetal/index\.module" src || true
  ```

  Expected: no matches.

- [x] **Step 2: Delete the file**

  ```bash
  git rm src/app/gpu-baremetal/index.module.scss
  ```

- [x] **Step 3: Commit**

  ```bash
  git commit -m "chore(gpu-baremetal): remove obsolete page scss module"
  ```

---

## Task 5: Static asset sync

**Files:** `locales/en/public/gpus/v5/gpu-bare-metal-hero-bg.png` → `public/gpus/v5/` via `node scripts/watcher/resourceCopy …` / `npm run dev`.

- [x] **Step 1: Image available for `/gpu-baremetal`**

  Owner confirmed asset pipeline / `public` copy is handled; no further agent action.

- [x] **Step 2: Git for PNG**

  Track the binary in git only if it is a deliberate new asset for the repo; otherwise rely on existing `locales/…` workflow.

---

## Task 6: Manual QA (optional before release)

**Not executed** in this session (per team: no test pass required here). When convenient, spot-check in browser:

- Viewports `390` / `768` / `1280` / `1512+`: Hero cover, no stray horizontal scroll, single `h1`, CTAs (`BREVO_BOOK_LINK`, `mailto:gpu@novita.ai`).
- 若恢复 `BaremetalList`：search、drawer、埋点 `id` 回归验证。
- Chrome: nav + footer parity with other v5 marketing pages.

---

## Task 7: Final verification (before merge, optional)

**Not run** in this doc update. Suggested commands:

```bash
npx eslint src/app/gpu-baremetal --max-warnings 0
npx tsc --noEmit
```

---

## Spec coverage (self-review)

| Spec section                        | Plan tasks                                       |
| ----------------------------------- | ------------------------------------------------ |
| WebsiteNavbar + FooterSection       | Task 2                                           |
| Hero image + cover + safe-area copy | Task 1                                           |
| Remove old Header / foot CTAs       | Task 2                                           |
| Single `h1`, no duplicate title     | Task 2 (remove page `h1`), Task 1 (`h1` in Hero) |
| List logic unchanged                | Task 3 (layout only)                             |
| Tailwind + tokens + Button          | Task 1                                           |
| Asset path `/gpus/v5/...`           | Task 1, Task 5                                   |
| Figma numerical polish              | Task 1 + Task 8 + optional Task 6                |
| Solutions 左对齐 + 双列卡           | Task 8                                           |

**Placeholder scan:** Solutions 卡内价格第二段为 `—` 占位，待业务定价或 API 接入后替换。

---

## Task 9: 完整重建 `GpuBareMetalPageContent` — Figma `214-11372` 全部 6 区块

**来源：** Figma `get_metadata` 已提取全部文字节点内容、卡片规格、Why NOVITA 描述。  
**注意：** 各 workload section 的副文案节点 Figma 内名称均为 `"Supporting text"`（通用占位命名），实际文本需在 Figma Dev Mode 中确认；下方使用上下文语境合理推断值，**标有 `// ⚠ verify`**。

**Files:**

- Modify: `src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx`（完整重写）

---

- [ ] **Step 1: 完整重写 `GpuBareMetalPageContent.tsx`**

用以下内容**完整替换**该文件：

```tsx
/**
 * GPU Bare Metal — main page body (between Hero and Footer).
 * Figma: Novita 2026 v5.0 — node 214-11372
 * https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=214-11372&m=dev
 *
 * Structure (6 blocks):
 *   M1  SectionHeader   — centered kicker + H2 + description
 *   M2  WorkloadSection — "The Right GPU for Every Workload" + 2 cards
 *   M3  WorkloadSection — "AI Inference" + 2 cards
 *   M4  WorkloadSection — "Rendering & Simulation" + 2 cards
 *   M5  WorkloadSection — "Scientific Computing" + 2 cards
 *   M6  WhyNovitaSection — kicker + H2 + 4 feature tiles
 *
 * All text from Figma metadata node names (exact). Section descriptions
 * marked ⚠ need verification against Figma Dev Mode "Supporting text" nodes.
 */

import { Check } from "lucide-react";
import Button from "@/app/components/button/Button";
import { BREVO_BOOK_LINK } from "@/constants/urls";

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeTone =
  | "best-value"
  | "performance"
  | "context"
  | "efficient"
  | "next-gen"
  | "battle-tested"
  | "hpc"
  | "max-memory";

type GpuCardData = {
  title: string;
  subtitle: string;
  bullets: string[];
  badge: { label: string; tone: BadgeTone };
  backgroundImage: string;
  /** Show price row (e.g. "$1.70"). Mutually exclusive with ctaLabel. */
  price?: string;
  /** Show CTA button instead of price. */
  ctaLabel?: string;
  ctaHref?: string;
};

type WorkloadSectionData = {
  id: string;
  sectionTitle: string;
  sectionDescription: string;
  cards: [GpuCardData, GpuCardData];
};

type WhyNovitaFeature = {
  title: string;
  description: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_BG = "/gpus/v5/gpu-card-bg.png";
const CONTACT_HREF = BREVO_BOOK_LINK;

// Badge gradient map — verify exact colors in Figma Dev Mode
const BADGE_GRADIENT: Record<BadgeTone, string> = {
  "best-value": "bg-gradient-to-r from-[var(--brand-1)] to-[var(--yellow-300)]",
  performance: "bg-gradient-to-r from-[var(--blue-500)] to-[var(--purple-500)]",
  context: "bg-gradient-to-r from-[var(--blue-500)] to-[var(--purple-500)]",
  efficient: "bg-gradient-to-r from-[var(--green-500)] to-[var(--brand-1)]",
  "next-gen": "bg-gradient-to-r from-[var(--blue-400)] to-[var(--blue-500)]",
  "battle-tested":
    "bg-gradient-to-r from-[var(--gray-600)] to-[var(--gray-800)]",
  hpc: "bg-gradient-to-r from-[var(--brand-1)] to-[var(--yellow-300)]",
  "max-memory":
    "bg-gradient-to-r from-[var(--blue-500)] to-[var(--purple-500)]",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const WORKLOAD_SECTIONS: WorkloadSectionData[] = [
  {
    id: "every-workload",
    sectionTitle: "The Right GPU for Every Workload",
    // ⚠ verify: Figma node 214:11382 "Supporting text"
    sectionDescription:
      "Four core AI scenarios, each matched with purpose-built bare-metal GPU configurations.",
    cards: [
      {
        title: "H100 SXM",
        subtitle: "8x NVIDIA H100 SXM per node",
        bullets: [
          "80 GB HBM3 per GPU · 640 GB total",
          "NVLink 900 GB/s + RDMA",
          "1000+ GPU linear scaling",
        ],
        badge: { label: "BEST VALUE", tone: "best-value" },
        backgroundImage: CARD_BG,
        price: "$1.70",
      },
      {
        title: "B200 SXM",
        subtitle: "8x NVIDIA B200 SXM per node",
        bullets: [
          "192 GB HBM3e per GPU · 1,536 GB total",
          "NVLink 5th Gen 1.8 TB/s + RDMA",
        ],
        badge: { label: "TOP PERFORMANCE", tone: "performance" },
        backgroundImage: CARD_BG,
        price: "$4.77",
      },
    ],
  },
  {
    id: "ai-inference",
    sectionTitle: "AI Inference",
    // ⚠ verify: Figma node 235:13788 "Supporting text"
    sectionDescription:
      "LLM serving, real-time chat, multimodal generation, and agent inference at scale with low latency.",
    cards: [
      {
        // Figma node 235:13982 title="H200 SXM"; subtitle node 235:13983 as-is in Figma
        title: "H200 SXM",
        subtitle: "8× NVIDIA H100 SXM per node",
        bullets: [
          "80 GB HBM3 per GPU · 640 GB total",
          "NVLink 900 GB/s + RDMA",
          "1000+ GPU linear scaling",
          "KV cache-heavy workloads",
        ],
        badge: { label: "LARGE CONTEXT", tone: "context" },
        backgroundImage: CARD_BG,
        ctaLabel: "Contact us",
        ctaHref: CONTACT_HREF,
      },
      {
        // Figma node 235:14067 title="RTX 5090"; subtitle node 235:14068 as-is in Figma
        title: "RTX 5090",
        subtitle: "8x NVIDIA H200 SXM per node",
        bullets: [
          "32 GB GDDR7 per GPU · 256 GB total",
          "PCIe 5.0",
          "AIGC content generation",
          "Cost-efficient inference",
        ],
        badge: { label: "COST EFFICIENT", tone: "efficient" },
        backgroundImage: CARD_BG,
        ctaLabel: "Contact us",
        ctaHref: CONTACT_HREF,
      },
    ],
  },
  {
    id: "rendering-simulation",
    sectionTitle: "Rendering & Simulation",
    // ⚠ verify: Figma node 235:14109 "Supporting text"
    sectionDescription:
      "3D rendering, cloud gaming, autonomous driving simulation, and digital twin environments.",
    cards: [
      {
        // Figma node 235:14117 title="RTX 5090"
        title: "RTX 5090",
        subtitle: "8x NVIDIA RTX 5090 per node",
        bullets: [
          "32 GB GDDR7 per GPU · 256 GB total",
          "PCIe 5.0 · Latest Blackwell architecture",
          "Real-time ray tracing & DLSS 4",
          "Cloud gaming & content creation",
        ],
        badge: { label: "NEXT GEN", tone: "next-gen" },
        backgroundImage: CARD_BG,
        ctaLabel: "Contact us",
        ctaHref: CONTACT_HREF,
      },
      {
        // Figma node 235:14152 title="RTX 4090"
        title: "RTX 4090",
        subtitle: "8x NVIDIA RTX 4090 per node",
        bullets: [
          "24 GB GDDR6X per GPU · 192 GB total",
          "PCIe 4.0 · Proven Ada Lovelace",
          "Broadest software compatibility",
          "Digital twins & simulation",
        ],
        badge: { label: "BATTLE TESTED", tone: "battle-tested" },
        backgroundImage: CARD_BG,
        ctaLabel: "Contact us",
        ctaHref: CONTACT_HREF,
      },
    ],
  },
  {
    id: "scientific-computing",
    sectionTitle: "Scientific Computing",
    // ⚠ verify: Figma node 235:14201 "Supporting text"
    sectionDescription:
      "CPU-reducible dynamics, remote modeling, and molecular science with GPU-accelerated computation.",
    cards: [
      {
        // Figma node 235:14209 title="H100 SXM"
        title: "H100 SXM",
        subtitle: "8x NVIDIA H100 SXM per node",
        bullets: [
          "80 GB HBM3 per GPU · 640 GB total",
          "NVLink 900 GB/s + RDMA",
          "FP64 double-precision for HPC",
          "MPI + NCCL multi-node scaling",
        ],
        badge: { label: "HPC READY", tone: "hpc" },
        backgroundImage: CARD_BG,
        price: "$1.70",
      },
      {
        // Figma node 235:14244 title="H200 SXM"
        title: "H200 SXM",
        subtitle: "8x NVIDIA H200 SXM per node",
        bullets: [
          "141 GB HBM3e per GPU · 1,128 GB total",
          "NVLink 900 GB/s + RDMA",
          "76% more HBM than H100",
          "Large-scale simulation & modeling",
        ],
        badge: { label: "MAX MEMORY", tone: "max-memory" },
        backgroundImage: CARD_BG,
        ctaLabel: "Contact us",
        ctaHref: CONTACT_HREF,
      },
    ],
  },
];

// M6 feature tile descriptions from Figma metadata text nodes 235:14299/14306/14313/14322
const WHY_NOVITA_FEATURES: WhyNovitaFeature[] = [
  {
    title: "Zero Virtualization Overhead",
    description:
      "Direct physical GPU access eliminates hypervisor layers. Get 100% of the silicon performance with bare-metal allocation.",
  },
  {
    title: "Ready-to-Run Environment",
    description:
      "Pre-configured with CUDA drivers, ML frameworks, and networking. Deploy training jobs in minutes, not days.",
  },
  {
    title: "Guaranteed Delivery",
    description:
      "Reserved capacity with contractual SLAs. Your GPUs are physically allocated and always available — no spot interruptions.",
  },
  {
    title: "Physically Isolated Infrastructure",
    description:
      "Dedicated servers with hardware-level isolation. Your data never shares memory, storage, or network paths with other tenants.",
  },
];

// ─── Badge pill ───────────────────────────────────────────────────────────────

function BadgePill({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[var(--space-12)] py-[var(--space-6)] text-[10px] font-bold uppercase tracking-wide text-white ${BADGE_GRADIENT[tone]}`}
    >
      {label}
    </span>
  );
}

// ─── M1 SectionHeader ─────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="text-center mb-space-80">
      <div className="flex items-center justify-center gap-[var(--space-8)] mb-[var(--space-16)]">
        <span
          className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-1)]"
          aria-hidden
        />
        <span className="font-mono-12 font-bold uppercase tracking-[0.6px] text-[var(--text-3)]">
          SOLUTIONS
        </span>
      </div>
      <h2
        id="gpu-page-section-heading"
        className="font-miletus font-heading-h2 text-[var(--text-1)]"
      >
        The Right GPU for Every Workload
      </h2>
      <p className="mt-[var(--space-16)] font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[698px] mx-auto">
        Four core AI scenarios, each matched with purpose-built bare-metal GPU
        configurations.
      </p>
    </div>
  );
}

// ─── GpuCard ─────────────────────────────────────────────────────────────────
// Card dimensions from Figma: 612×389 (M2) or 612×437 (M3–M5); padding 36px.
// Background image applied via CSS (variable height — next/image fill not suitable).

function GpuCard({ card }: { card: GpuCardData }) {
  const showCta = Boolean(card.ctaLabel);
  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-3)] shadow-1"
      style={{
        backgroundImage: `url('${card.backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 flex flex-col h-full p-9">
        <div>
          <h4 className="font-miletus font-heading-h4 text-[var(--text-1)]">
            {card.title}
          </h4>
          <p className="mt-[var(--space-8)] font-miletus font-paragraph-16 text-[var(--text-3)]">
            {card.subtitle}
          </p>
          <ul className="mt-[var(--space-20)] flex flex-col gap-[var(--space-12)]">
            {card.bullets.map((line) => (
              <li key={line} className="flex gap-[var(--space-12)]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-white text-[var(--brand-1)]">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-miletus font-paragraph-16 text-[var(--text-1)]">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-t border-[var(--border-default)] pt-[var(--space-24)] flex flex-wrap items-center justify-between gap-[var(--space-16)]">
          {showCta ? (
            <Button
              type="default"
              height={44}
              renderTag="link"
              link={card.ctaHref ?? "#"}
              elAttrs={{ target: "_blank", rel: "noopener noreferrer" }}
              className="!rounded-[var(--radius-full)] !px-[var(--space-20)] font-paragraph-14"
            >
              {card.ctaLabel}
            </Button>
          ) : (
            <p className="font-miletus text-[var(--text-1)]">
              <span className="text-2xl font-semibold tracking-tight">
                {card.price}
              </span>
              <span className="ml-1 text-base font-normal text-[var(--text-3)]">
                /GPU/hr
              </span>
            </p>
          )}
          <BadgePill label={card.badge.label} tone={card.badge.tone} />
        </div>
      </div>
    </article>
  );
}

// ─── M2–M5 WorkloadSection ────────────────────────────────────────────────────
// Heading text max-w-[430px] matches Figma Frame 2147253398 width=430.
// Card grid gap=40px (Figma: second card at x=652, first card width=612 → gap=40).

function WorkloadSection({ section }: { section: WorkloadSectionData }) {
  return (
    <div>
      <div className="flex items-center gap-[var(--space-8)] mb-[var(--space-12)]">
        <span
          className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-1)]"
          aria-hidden
        />
        <span className="font-mono-12 font-bold uppercase tracking-[0.6px] text-[var(--text-3)]">
          SOLUTIONS
        </span>
      </div>
      <h3 className="font-miletus font-heading-h3 text-[var(--text-1)] max-w-[430px]">
        {section.sectionTitle}
      </h3>
      <p className="mt-[var(--space-16)] font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[430px]">
        {section.sectionDescription}
      </p>
      <div className="mt-space-48 grid grid-cols-1 gap-[40px] lg:grid-cols-2">
        {section.cards.map((card) => (
          <GpuCard key={`${card.title}-${card.subtitle}`} card={card} />
        ))}
      </div>
    </div>
  );
}

// ─── M6 WhyNovitaSection ──────────────────────────────────────────────────────
// Figma frame 235:14287: 4 tiles at width=292, gap=16px → Tailwind gap-4.
// Tile icon: 36×36 outer + 24×24 inner frame → dark rounded square placeholder.

function WhyNovitaSection() {
  return (
    <div className="mt-space-80 pt-space-80 border-t border-[var(--border-2)]">
      <div className="flex items-center gap-[var(--space-8)] mb-[var(--space-16)]">
        <span
          className="size-2 shrink-0 rounded-[2px] bg-[var(--brand-1)]"
          aria-hidden
        />
        <span className="font-mono-12 font-bold uppercase tracking-[0.6px] text-[var(--text-3)]">
          WHY NOVITA
        </span>
      </div>
      <h2 className="font-miletus font-heading-h2 text-[var(--text-1)] max-w-[430px]">
        Purpose-Built for AI Workloads
      </h2>
      {/* ⚠ verify: Figma node 289:15311 "Supporting text" */}
      <p className="mt-[var(--space-16)] font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[430px]">
        Every feature designed to minimize GPU overhead and maximize operational
        efficiency.
      </p>
      <div className="mt-space-48 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WHY_NOVITA_FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="flex flex-col rounded-2xl border border-[var(--border-3)] bg-[var(--fill-4)] p-[var(--space-24)]"
          >
            {/* Icon placeholder — 36×36 outer / 24×24 inner per Figma frame 235:14294 */}
            <div
              className="mb-[var(--space-24)] flex size-9 items-center justify-center rounded-lg bg-[var(--gray-950)]"
              aria-hidden
            >
              <div className="size-6 rounded-sm bg-white/20" />
            </div>
            <h3 className="font-miletus font-heading-h4 text-[var(--text-1)]">
              {feat.title}
            </h3>
            <p className="mt-[var(--space-12)] font-miletus font-paragraph-16 text-[var(--text-3)]">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
// Section gap of 80px between blocks matches Figma spacing:
// M1 end (y=134) → M2 start (y=214) = 80px; same 80px between all subsequent blocks.

export default function GpuBareMetalPageContent() {
  return (
    <section
      className="max_width_container mx-web w-full pb-[120px] pt-space-24"
      aria-labelledby="gpu-page-section-heading"
    >
      <SectionHeader />
      <div className="flex flex-col gap-space-80">
        {WORKLOAD_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="border-t border-[var(--border-2)] pt-space-80"
          >
            <WorkloadSection section={section} />
          </div>
        ))}
      </div>
      <WhyNovitaSection />
    </section>
  );
}
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc --noEmit
```

预期输出：无报错。若报 `Button` type prop 错误，将 `type="default"` 改为 `type="outline"`（查看 `Button.tsx` 的合法 type 枚举）。

- [ ] **Step 3: ESLint 检查**

```bash
npx eslint src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx
```

预期输出：无错误。

- [ ] **Step 4: 验证页面渲染**

启动 dev server 后打开 `http://localhost:3000/gpu-baremetal`，检查：

- [ ] M1 标题居中显示 "The Right GPU for Every Workload"
- [ ] 4 组工作负载卡片各自渲染（H100/B200、H200/RTX5090、RTX5090/RTX4090、H100/H200）
- [ ] 背景图 `gpu-card-bg.png` 在卡片上可见
- [ ] 有价格的卡片（H100 $1.70、H100 Scientific $1.70、B200 $4.77）显示价格行
- [ ] 有 CTA 的卡片显示 "Contact us" 按钮
- [ ] M6 渲染 4 个 Why NOVITA feature 磁贴（含描述文本）
- [ ] 移动端（390px）：卡片单列堆叠，磁贴 2 列

- [ ] **Step 5: 人工 Figma 比对（⚠ 标记项）**

在 Figma Dev Mode 确认以下节点的实际文本内容，若不同则更新 `WORKLOAD_SECTIONS` 数据：

| Figma 节点  | 用于                        | 当前值（推断）              |
| ----------- | --------------------------- | --------------------------- |
| `214:11382` | M2 section description      | 与 M1 相同                  |
| `235:13788` | M3 AI Inference description | "LLM serving..."            |
| `235:14109` | M4 Rendering description    | "3D rendering..."           |
| `235:14201` | M5 Scientific description   | "CPU-reducible dynamics..." |
| `289:15311` | M6 Why NOVITA description   | "Every feature designed..." |

同时确认各 badge 渐变颜色（`BADGE_GRADIENT` 常量），如与 Figma 不符则更新对应 token。

- [ ] **Step 6: Commit**

```bash
git add src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx
git commit -m "feat(gpu-baremetal): implement full Figma 214-11372 page content (6 blocks)"
```

---

## Execution handoff

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent for Task 9, review between steps

**2. Inline Execution** — execute Task 9 in this session using executing-plans

Which approach?
