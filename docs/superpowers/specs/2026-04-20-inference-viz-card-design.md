# InferenceVizCard Redesign Spec

**Date:** 2026-04-20  
**Figma:** `3nHa4z8enopB5YGSneFZlK` node `1:9372`  
**File:** `src/app/homepage/components/Product.tsx` → `InferenceVizCard`

---

## Overview

The left visualization card in Section 1 (Serverless Model APIs) has three vertical layers.
The active tag in Layer 1 drives what appears in Layers 2 and 3.
Five tag types auto-cycle: **LLM → IMAGE → AUDIO → VIDEO → VISION**.

---

## Card Shell

```
bg: linear-gradient(187.02deg, #FEFCF4 2.49%, #F1F0E9 94.3%)
border-radius: 6px
height: 480px
width: flex-1 (fills available space)
overflow: hidden
position: relative
```

Background blob image: two variants from Figma assets

- Types 1 (LLM): `imgGroup2147236618` — left-aligned blob
- Types 2–5 (IMAGE/AUDIO/VIDEO/VISION): `imgGroup2147236619` — centered blob

> For implementation, download these assets to `public/home/product/viz-bg-llm.png` and `public/home/product/viz-bg-other.png`.

---

## Layer 1 — Tag Row

**Position:** `top: 130px`, centered horizontally (`left: 50%`, translate each pill by its own offset)

**Five tags:** `LLM` | `IMAGE` | `AUDIO` | `VIDEO` | `VISION`

### Tag Pill Styles

**Active tag:**

```
bg: white
border: 1px solid black (#000)
height: 24px
px: 5px, py: 2px
border-radius: 3px
gap: 6px (between dot and text)
font: B612 Mono / font-tt-mono, 12px, tracking-[0.48px], uppercase
text-color: var(--element/highem) = #262626
Left element: green dot — size 8×8px, rounded-[2px], bg: #23D57C
```

**Inactive tag:**

```
bg: white
border: 1px solid rgba(10,10,10,0.3) [var(--element/disabled)]
height: 24px
px: 5px, py: 2px
border-radius: 3px
font: same as active
text-color: rgba(10,10,10,0.3) [var(--element/disabled)]
No dot
```

### Tag Horizontal Offsets (from 50% center of card)

These offsets are measured from `left: 50%` to the center of each pill:

| Tag    | Center offset from 50% | Approx left offset  |
| ------ | ---------------------- | ------------------- |
| LLM    | −118px                 | `calc(50% - 118px)` |
| IMAGE  | −62px                  | `calc(50% - 62px)`  |
| AUDIO  | −5px                   | `calc(50% - 5px)`   |
| VIDEO  | +52px                  | `calc(50% + 52px)`  |
| VISION | +113px                 | `calc(50% + 113px)` |

> Pill widths: LLM ~38px, IMAGE ~50px, AUDIO ~52px, VIDEO ~54px, VISION ~58px.
> Use `-translate-x-1/2` on each pill to center them at these positions.

---

## Layer 2 — SVG Lines + MODEL Icon Box

**Position:** SVG lines span `top: 152.5px`, `height: 67.5px`, connecting tag row to MODEL box.  
MODEL icon box at `top: 228px`.

### Corrections Required in Current Implementation

1. **Remove the downward arrow** (`<svg>` with vertical line + arrowhead) currently between the MODEL box and the model name tag. Not in Figma design.
2. **Center the MODEL box + name group** horizontally at `50%` of the card. Current code uses hardcoded `left-1/2 -translate-x-[calc(50%+61px)]` which is only correct for LLM. The whole row should sit at the horizontal center.

### MODEL Icon Box

Position: `top: 228px`, `left: 50%`, `-translate-x-1/2` (after centering fix)

```
bg: white
border: 1px solid black
pl: 3px, pr: 6px, py: 2px
border-radius: 3px
gap: 6px (between icon and "MODEL" text)
```

**Icon changes per active tag** (20×20px, position: relative):

| Active Tag | Icon description       | Figma name                              | Lucide equivalent |
| ---------- | ---------------------- | --------------------------------------- | ----------------- |
| LLM        | Letter "T" / text icon | "text, t"                               | `Type` or `Text`  |
| IMAGE      | Photo / images icon    | "images 2, photos, pictures, shot"      | `Images`          |
| AUDIO      | Voice / mic icon       | "voice"                                 | `Mic`             |
| VIDEO      | Video camera icon      | "video camera, movie, play"             | `Video`           |
| VISION     | Eye icon               | "show, eye, see, reveal, look, visible" | `Eye`             |

**"MODEL" label:** `font-tt-mono text-[12px] tracking-[0.48px] uppercase text-[#262626]`

### SVG Connector Lines (Layer 1 → Layer 2)

Each type uses a set of SVG line assets to draw the path from the active tag down to the MODEL box. The lines are positioned absolutely within the card, spanning `top: 152.5px` to `top: 220px`.

Lines are named `line1`–`line5` / `line6`–`line10`. Each is a pre-rendered SVG path asset.

| Type | Active Tag | Lines used (from Figma conditionals)                                                 |
| ---- | ---------- | ------------------------------------------------------------------------------------ |
| 1    | LLM        | line1(imgLine1), line2(imgLine2), line3(imgLine3), line4(imgLine4), line5(imgLine5)  |
| 2    | IMAGE      | line1(imgLine7), line2(imgLine6), line3(imgLine3), line4(imgLine4)                   |
| 3    | AUDIO      | line1(imgLine7), line2(imgLine2), line3(imgLine8), line4(imgLine4), line5(imgLine5)  |
| 4    | VIDEO      | line1(imgLine7), line2(imgLine2), line4(imgLine9), line5(imgLine5)                   |
| 5    | VISION     | line1(imgLine7), line2(imgLine2), line3(imgLine3), line4(imgLine4), line5(imgLine10) |

SVG line dimensions and positions (absolute, `-translate-x-1/2` centered):

| Line name | width    | height | left (approx, from 50%) |
| --------- | -------- | ------ | ----------------------- |
| line1     | 155px    | 67.5px | calc(50% - 35px)        |
| line2     | 106px    | 67.5px | calc(50% - 10px)        |
| line3     | 49px     | 67.5px | calc(50% + 18px)        |
| line4     | 11.666px | 67.5px | calc(50% + 49px)        |
| line5     | 64px     | 67.5px | calc(50% + 75px)        |

> **Implementation note:** Download SVG assets from Figma URLs to `public/home/product/viz-lines/` as `line1.svg` through `line10.svg`. Map:
>
> - `line1.svg` = imgLine1 (LLM lines going left-far)
> - `line2.svg` = imgLine2
> - `line3.svg` = imgLine3
> - `line4.svg` = imgLine4
> - `line5.svg` = imgLine5
> - `line6.svg` = imgLine6 (IMAGE variant of line2)
> - `line7.svg` = imgLine7 (shared line1 for types 2–5)
> - `line8.svg` = imgLine8 (AUDIO variant of line3)
> - `line9.svg` = imgLine9 (VIDEO variant of line4)
> - `line10.svg` = imgLine10 (VISION variant of line5)

---

## Layer 3 — Model Name Tag (Slot Machine) + Stats Row

### Model Name Tag (Slot Machine)

Positioned to the right of the MODEL icon box, at `top: 220px`.

**Left connector** (Vector): a small `≈` shaped SVG bracket, `h-[23px] w-[3.6px]`
**Right connector** (Vector mirrored): same asset, `-scale-y-100 rotate-180`

The name slot has `h-[40px] overflow-hidden`. Three name cards stack vertically:

- `top: 50% - 32px` → opacity 0 (next item, slides in from below)
- `top: 50%` → opacity 1 (current visible item)
- `top: 50% + 32px` → opacity 0 (previous item, slides out upward)

**Name tag style:**

```
bg: linear-gradient(90deg, rgba(0,0,0,0.08), rgba(0,0,0,0.08)),
    linear-gradient(90deg, #23D57C, #23D57C)
border: 1px solid #7BE6B0
pl: 8px, pr: 6px, py: 5px
border-radius: 4px
font: B612 Mono, 13px, tracking-[0.52px], uppercase, text-white
```

**Model names per active tag:**

| Active Tag | Model name shown (center position) |
| ---------- | ---------------------------------- |
| LLM        | `"KIMI-K2.5"`                      |
| IMAGE      | `"FLUX/1/SCHNELL"`                 |
| AUDIO      | `"WHISPER-LARGE-V3"`               |
| VIDEO      | `"WAN-2.1-I2V"`                    |
| VISION     | `"QWEN3.5-27B"`                    |

The slot machine width varies per tag (to fit model name):

| Tag    | Slot width |
| ------ | ---------- |
| LLM    | 114px      |
| IMAGE  | 158px      |
| AUDIO  | 176px      |
| VIDEO  | 131px      |
| VISION | 131px      |

### Stats Row (bottom: 40px, centered)

**Position:** `bottom: 40px`, `left: 50%`, `-translate-x-1/2`  
**Layout:** Three stat pairs, separated by `•` dots (`6×6px bg-[#232323] rounded-[1px]`)  
**Font:** B612 Mono, 12px, tracking-[0.48px], uppercase, `gap: 10px` between value and label

Each stat pair = `[value] [label]` where value is high-emphasis (#262626) and label is mid-emphasis (rgba(10,10,10,0.6)).

**Exception — VISION (type 5):** order is reversed to `[label] [value]`, AND different values are shown.

| Active Tag | Stat 1          | Stat 2             | Stat 3           |
| ---------- | --------------- | ------------------ | ---------------- |
| LLM        | 200+ models     | 200ms latency      | 99.5% uptime     |
| IMAGE      | 200+ models     | 200ms latency      | 99.5% uptime     |
| AUDIO      | 200+ models     | 200ms latency      | 99.5% uptime     |
| VIDEO      | 200+ models     | 200ms latency      | 99.5% uptime     |
| VISION     | models **200+** | latency **<100ms** | uptime **99.9%** |

> VISION: label is mid-em, value is high-em (swapped). Also different values: <100ms and 99.9%.

---

## State Data Map (summary for implementation)

```ts
const VIZ_STATES = {
  LLM: {
    bgVariant: "llm", // imgGroup2147236618
    tagDot: true,
    modelIcon: "Type", // Lucide icon
    modelName: '"KIMI-K2.5"',
    slotWidth: 114,
    lines: ["line1", "line2", "line3", "line4", "line5"],
    stats: [
      { value: "200+", label: "models" },
      { value: "200ms", label: "latency" },
      { value: "99.5%", label: "uptime" },
    ],
    statsOrder: "value-first",
  },
  IMAGE: {
    bgVariant: "other", // imgGroup2147236619
    modelIcon: "Images",
    modelName: '"FLUX/1/SCHNELL"',
    slotWidth: 158,
    lines: ["line7", "line6", "line3", "line4"],
    stats: [
      { value: "200+", label: "models" },
      { value: "200ms", label: "latency" },
      { value: "99.5%", label: "uptime" },
    ],
    statsOrder: "value-first",
  },
  AUDIO: {
    bgVariant: "other",
    modelIcon: "Mic",
    modelName: '"WHISPER-LARGE-V3"',
    slotWidth: 176,
    lines: ["line7", "line2", "line8", "line4", "line5"],
    stats: [
      { value: "200+", label: "models" },
      { value: "200ms", label: "latency" },
      { value: "99.5%", label: "uptime" },
    ],
    statsOrder: "value-first",
  },
  VIDEO: {
    bgVariant: "other",
    modelIcon: "Video",
    modelName: '"WAN-2.1-I2V"',
    slotWidth: 131,
    lines: ["line7", "line2", "line9", "line5"],
    stats: [
      { value: "200+", label: "models" },
      { value: "200ms", label: "latency" },
      { value: "99.5%", label: "uptime" },
    ],
    statsOrder: "value-first",
  },
  VISION: {
    bgVariant: "other",
    modelIcon: "Eye",
    modelName: '"QWEN3.5-27B"',
    slotWidth: 131,
    lines: ["line7", "line2", "line3", "line4", "line10"],
    stats: [
      { label: "models", value: "200+" },
      { label: "latency", value: "<100ms" },
      { label: "uptime", value: "99.9%" },
    ],
    statsOrder: "label-first", // label is mid-em, value is high-em
  },
} as const;
```

---

## Key Layout Fixes vs. Current Code

| Issue                                 | Current (`Product.tsx`)                                        | Correct                                        |
| ------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| MODEL box + name row x-position       | `left-1/2 -translate-x-[calc(50%+61px)]` (hardcoded, LLM only) | `left-1/2 -translate-x-1/2` (always centered)  |
| Downward arrow between MODEL and name | Present (SVG with vertical line + arrowhead)                   | **Remove** — not in Figma                      |
| Icon in MODEL box                     | Hardcoded "T" letter div, never changes                        | Switch icon per active tag using Lucide        |
| Model name in slot                    | Static `"KIMI-K2.5"`                                           | Per-tag model name with slot animation         |
| Background blob                       | Not rendered (solid gradient only)                             | Two variants: `viz-bg-llm` / `viz-bg-other`    |
| Stats row                             | Always `200+ MODELS • 200ms LATENCY • 99.5% UPTIME`            | VISION shows different values + swapped order  |
| SVG connector lines                   | Not rendered                                                   | Render per-type line set from local SVG assets |

---

## Assets to Download and Save Locally

| Local path                                 | Figma asset        | Used for                                 |
| ------------------------------------------ | ------------------ | ---------------------------------------- |
| `public/home/product/viz-bg-llm.png`       | imgGroup2147236618 | LLM background blob                      |
| `public/home/product/viz-bg-other.png`     | imgGroup2147236619 | IMAGE/AUDIO/VIDEO/VISION background blob |
| `public/home/product/viz-lines/line1.svg`  | imgLine1           | LLM far-left connector                   |
| `public/home/product/viz-lines/line2.svg`  | imgLine2           | shared center-left connector             |
| `public/home/product/viz-lines/line3.svg`  | imgLine3           | shared center connector                  |
| `public/home/product/viz-lines/line4.svg`  | imgLine4           | shared center-right connector            |
| `public/home/product/viz-lines/line5.svg`  | imgLine5           | LLM/AUDIO/VIDEO far-right connector      |
| `public/home/product/viz-lines/line6.svg`  | imgLine6           | IMAGE variant of center-left             |
| `public/home/product/viz-lines/line7.svg`  | imgLine7           | shared line1 for types 2–5               |
| `public/home/product/viz-lines/line8.svg`  | imgLine8           | AUDIO variant of center                  |
| `public/home/product/viz-lines/line9.svg`  | imgLine9           | VIDEO variant of center-right            |
| `public/home/product/viz-lines/line10.svg` | imgLine10          | VISION variant of far-right              |

> Figma MCP asset URLs expire after 7 days. Download promptly during implementation.

---

## Component Architecture

```
InferenceVizCard
├── CardBackground (bg gradient + blob image variant)
├── Layer1Tags (5 tag pills, centered, active driven by prop)
├── Layer2Lines (SVG line set per active tag)
├── Layer2ModelBox (icon + "MODEL" label, centered, icon per tag)
├── Layer3NameSlot (slot machine animation, model name per tag)
│   ├── VectorBracketLeft
│   ├── NameSlot (h-[40px] overflow-hidden, 3 stacked name tags)
│   └── VectorBracketRight
└── Layer3StatsRow (3 stats, bottom-[40px], content per tag)
```

All state is driven by a single `activeLabel: ModelLabel` prop passed from the parent `Product` component which auto-cycles every 2.5s.
