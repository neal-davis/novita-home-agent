# InferenceVizCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `InferenceVizCard` in `Product.tsx` to match the Figma design — absolute-positioned tag pills, SVG connector lines, dynamic MODEL icon, slot-machine model name, background blob, VISION stats swap.

**Architecture:** All state driven by `activeLabel` prop (LLM/IMAGE/AUDIO/VIDEO/VISION). Static SVG line assets in `public/home/product/viz-lines/`. Background blobs in `public/home/product/`. No new files — all changes are inside `Product.tsx`.

**Tech Stack:** Next.js, React, TailwindCSS, Lucide React, `next/image`

**Figma:** `3nHa4z8enopB5YGSneFZlK` node `1:9372`

---

### Task 1: Download Figma Assets

**Files:**

- Create: `public/home/product/viz-bg-llm.png`
- Create: `public/home/product/viz-bg-other.png`
- Create: `public/home/product/viz-lines/line1.svg` through `line10.svg`
- Create: `public/home/product/viz-bracket-left.svg`
- Create: `public/home/product/viz-bracket-right.svg`

- [ ] Download background blobs and connector lines using curl from Figma MCP URLs
- [ ] Verify files exist with correct sizes

---

### Task 2: Rewrite InferenceVizCard

**Files:**

- Modify: `src/app/homepage/components/Product.tsx`

- [ ] Add `VIZ_STATES` constant with per-tag data (bgVariant, modelIcon, modelName, slotWidth, lines, stats, statsOrder)
- [ ] Replace `LabelSwitcherViz` with absolutley-positioned tag pills at Figma offsets
- [ ] Fix MODEL box: center at `left-1/2 -translate-x-1/2`, switch icon per activeLabel using Lucide
- [ ] Remove downward arrow SVG
- [ ] Add bracket connectors (Vector / Vector1) using `next/image`
- [ ] Add slot-machine name animation (3 stacked divs, translate transitions)
- [ ] Add SVG connector lines rendered per active type
- [ ] Add background blob (`next/image`) switching between llm / other variants
- [ ] Fix stats: VISION swaps value/label order and uses different values
- [ ] Commit
