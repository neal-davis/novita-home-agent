# Novita AI Design Token Reference

> Living reference for colors, typography, spacing, radius, shadows, and layout tokens.
> Source of truth: `src/styles/_design-tokens.scss` — wired into Tailwind via `tailwind.config.ts`.
> Load this file only after [`global-novita.md`](./global-novita.md) when exact token values or class mappings are needed.

---

## How the Token System Works

```
CSS Custom Property   →  Tailwind shorthand (when it exists)
var(--brand-0)        →  bg-brand-0 / text-brand-0 / border-brand-0       ✓ use shorthand
var(--fill-4)         →  bg-fill-4                                         ✓ use shorthand
var(--status-error)   →  text-status-error                                 ✓ use shorthand
var(--element-mid-em) →  text-element-mid-em                              ✓ use shorthand
var(--text-1)         →  text-[var(--text-1)]   (text-text-1 exists but redundant)
var(--border-subtle)  →  border-[var(--border-subtle)]                     use var()
var(--bg-default)     →  bg-[var(--bg-default)] or bg-surface              use var()
```

**Rule:** Prefer Tailwind utilities when they express the design directly. Use project shorthands such as `bg-brand-0`, `bg-fill-4`, `text-status-error`, `text-element-high-em`, `bg-overlay-hover`; use `var()` when the shorthand is redundant or no single utility exists: `text-[var(--text-1)]`, `border-[var(--border-subtle)]`, `bg-[var(--bg-default)]`.

---

## 1. Visual Theme & Atmosphere

Novita AI's homepage is built on **restrained warmth** — a `#fafafa` canvas that sits between pure white and gray, giving sections depth without reaching for dark or colorful surfaces. Against this neutral ground, a single chromatic voice speaks: brand green `#23d57c`, used sparingly as the one accent that signals "alive and ready."

The font pairing defines the personality split. **Miletus** carries all editorial weight — headings, body, UI copy — with clean geometry that works from `text-display-lg` (64px, −2.56px tracking) all the way down to `text-paragraph-12` (12px). **TT Mono** surfaces only where the product voice needs to register: labels, eyebrows, code-adjacent tags. It always runs uppercase, always pairs with positive tracking, creating a deliberate context switch that says "this is infrastructure, not copy."

The **alpha-based border philosophy** is what makes the system adaptive. Rather than static gray borders, every boundary uses dark-on-light alpha values: `rgba(10,10,10,0.07)` for hairlines, `rgba(10,10,10,0.1)` for standard, `rgba(10,10,10,0.6)` for strong. These work on any surface — white sections, `#fafafa` backgrounds, and the dark `#262626` inverse panels — without needing separate dark-mode overrides.

**Key Characteristics:**

- `#fafafa` page default — warmer than white, cooler than gray
- `#23d57c` brand green as the sole chromatic accent; everything else is achromatic
- Miletus for prose and UI; TT Mono for mono labels — never mixed
- Alpha-based borders that self-adapt to any surface
- Display and heading token classes include their own tracking; avoid overriding it unless matching an existing component pattern
- `h-[40px]` + `rounded-full` for homepage pill CTAs; `h-[36px]` + `rounded-4` for console

---

## 2. Color Primitives

Color primitives are the raw values. **Always prefer semantic tokens in components** (§3). Use primitives only when building new semantic tokens or when the direct Tailwind shorthand is the most appropriate expression.

### White / Black

| Token     | Hex       | Tailwind              |
| --------- | --------- | --------------------- |
| `--white` | `#ffffff` | `bg-white text-white` |
| `--black` | `#000000` | `bg-black text-black` |

### Gray Scale

| Token        | Hex       | Tailwind                    |
| ------------ | --------- | --------------------------- |
| `--gray-50`  | `#fafafa` | `bg-gray-50`                |
| `--gray-100` | `#f5f5f5` | `bg-gray-100`               |
| `--gray-200` | `#e5e5e5` | `bg-gray-200`               |
| `--gray-300` | `#d4d4d4` | `bg-gray-300`               |
| `--gray-400` | `#a1a1a1` | `text-gray-400`             |
| `--gray-500` | `#737373` | `text-gray-500`             |
| `--gray-600` | `#525252` | `text-gray-600`             |
| `--gray-700` | `#404040` | `text-gray-700`             |
| `--gray-800` | `#262626` | `bg-gray-800 text-gray-800` |
| `--gray-900` | `#171717` | `text-gray-900`             |
| `--gray-950` | `#0a0a0a` | `bg-gray-950 text-gray-950` |

### Brand (Green)

| Token       | Hex       | Tailwind                                 |
| ----------- | --------- | ---------------------------------------- |
| `--brand-0` | `#23d57c` | `bg-brand-0 text-brand-0 border-brand-0` |
| `--brand-1` | `#16b063` | `bg-brand-1 text-brand-1`                |
| `--brand-2` | `#caf6e0` | `bg-brand-2`                             |
| `--brand-3` | `#effcf5` | `bg-brand-3`                             |

### Blue

| Token        | Hex       | Tailwind        |
| ------------ | --------- | --------------- |
| `--blue-100` | `#d0f0fd` | `bg-blue-100`   |
| `--blue-200` | `#89dfff` | `bg-blue-200`   |
| `--blue-400` | `#18bfff` | `text-blue-400` |
| `--blue-500` | `#01a9db` | `text-blue-500` |
| `--blue-600` | `#0096c7` | `text-blue-600` |
| `--blue-700` | `#007ea4` | `text-blue-700` |

### Status Color Scales (Primitives)

These back the semantic status tokens. Access via `--status-*` in components, not directly.

| Scale  | Range                 | Representative tokens          |
| ------ | --------------------- | ------------------------------ |
| Green  | `#f4fff8` → `#1a8245` | `--green-50` → `--green-700`   |
| Orange | `#fff0e9` → `#e1580e` | `--orange-50` → `--orange-700` |
| Red    | `#fef3f3` → `#e10e0e` | `--red-50` → `--red-700`       |
| Yellow | `#fffbeb` → `#d97706` | `--yellow-50` → `--yellow-600` |
| Purple | `#f4f1ff` → `#5b21b6` | `--purple-50` → `--purple-700` |

### Alpha Scales

The system's adaptive layer. Alpha tokens self-adjust to any surface color.

```
Dark base rgba(10,10,10,N):
  --alpha-dark-5   0.05  →  hover overlay
  --alpha-dark-7   0.07  →  hairline border (--border-subtle)
  --alpha-dark-10  0.1   →  standard border (--border-default)
  --alpha-dark-15  0.15  →  pressed state
  --alpha-dark-20  0.2   →  disabled fill (--element-disabled)
  --alpha-dark-40  0.4   →  tertiary icon (--element-low-em)
  --alpha-dark-60  0.6   →  strong border / mid-em icon
  --alpha-dark-70..90     →  progressively opaque overlays

Light base rgba(255,255,255,N):
  --alpha-light-20  0.2  →  button inset highlight
  --alpha-light-50  0.5  →  hero card background
  --alpha-light-60..90   →  overlays on dark surfaces
```

---

## 3. Semantic Color Tokens

Semantic tokens encode _intent_, not a shade. Always use these in components — never reach for primitives directly.

### Text

`text-text-1` etc. technically exist via `colors.text` in config, but look redundant — prefer `text-[var(--text-1)]` for clarity.

| Token            | Resolves to | Hex       | Usage                  |
| ---------------- | ----------- | --------- | ---------------------- |
| `--text-1`       | gray-950    | `#0a0a0a` | Primary body, headings |
| `--text-2`       | gray-700    | `#404040` | Secondary text         |
| `--text-3`       | gray-500    | `#737373` | Tertiary / placeholder |
| `--text-4`       | gray-400    | `#a1a1a1` | Disabled text          |
| `--text-brand`   | brand-1     | `#16b063` | Brand-colored text     |
| `--text-link`    | blue-700    | `#007ea4` | Hyperlinks             |
| `--text-success` | green-700   | `#1a8245` | Success copy           |
| `--text-warning` | orange-700  | `#e1580e` | Warning copy           |
| `--text-error`   | red-700     | `#e10e0e` | Error copy             |

### Fill (Background Layers)

Tailwind shorthand exists — prefer it over `var()`.

| Token          | Hex       | Tailwind        |
| -------------- | --------- | --------------- |
| `--fill-1`     | `#737373` | `bg-fill-1`     |
| `--fill-2`     | `#d4d4d4` | `bg-fill-2`     |
| `--fill-3`     | `#e5e5e5` | `bg-fill-3`     |
| `--fill-4`     | `#f5f5f5` | `bg-fill-4`     |
| `--fill-5`     | `#fafafa` | `bg-fill-5`     |
| `--fill-white` | `#ffffff` | `bg-fill-white` |

### Background (Page Surfaces)

`bg-bg-default`, `bg-bg-light`, `bg-bg-inverse` exist as shorthands but look redundant — prefer `var()`. `bg-surface` is a clean alias for `--bg-default`.

| Token          | Hex       | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `--bg-default` | `#fafafa` | `bg-[var(--bg-default)]` or `bg-surface` |
| `--bg-light`   | `#ffffff` | `bg-[var(--bg-light)]`                   |
| `--bg-inverse` | `#262626` | `bg-[var(--bg-inverse)]`                 |

### Border

| Token                            | Value                 | Usage                            |
| -------------------------------- | --------------------- | -------------------------------- |
| `--border-1`                     | `#d4d4d4`             | Strongest static border          |
| `--border-2`                     | `#e5e5e5`             | Strong static border             |
| `--border-3`                     | `#f5f5f5`             | Subtle static border             |
| `--border-4`                     | `#fafafa`             | Barely-there border              |
| `--border-brand`                 | `#23d57c`             | Use `border-brand-0` (shorthand) |
| `--border-subtle`                | `rgba(10,10,10,0.07)` | Hairline — adaptive              |
| `--border-default`               | `rgba(10,10,10,0.1)`  | Standard — adaptive              |
| `--border-strong`                | `rgba(10,10,10,0.6)`  | High-contrast — adaptive         |
| `--border-success/warning/error` | green/orange/red -600 | Status borders                   |

### Element (Icons & Controls)

Tailwind shorthands exist via `colors.element` — prefer them.

| Token                | Value                | Tailwind                | Usage                  |
| -------------------- | -------------------- | ----------------------- | ---------------------- |
| `--element-high-em`  | `#262626`            | `text-element-high-em`  | Active / primary icons |
| `--element-mid-em`   | `rgba(10,10,10,0.6)` | `text-element-mid-em`   | Secondary icons        |
| `--element-low-em`   | `rgba(10,10,10,0.4)` | `text-element-low-em`   | Tertiary icons         |
| `--element-disabled` | `rgba(10,10,10,0.2)` | `text-element-disabled` | Disabled state         |
| `--element-inverse`  | `#ffffff`            | `text-element-inverse`  | Icons on dark bg       |

### Overlay

Tailwind shorthands exist via `colors.overlay` — prefer them.

| Token                    | Value                 | Tailwind                  | Usage            |
| ------------------------ | --------------------- | ------------------------- | ---------------- |
| `--overlay-hover`        | `rgba(10,10,10,0.05)` | `bg-overlay-hover`        | Hover state      |
| `--overlay-hover-strong` | `rgba(10,10,10,0.1)`  | `bg-overlay-hover-strong` | Strong hover     |
| `--overlay-pressed`      | `rgba(10,10,10,0.15)` | `bg-overlay-pressed`      | Pressed/active   |
| `--overlay-disabled`     | `rgba(10,10,10,0.07)` | `bg-overlay-disabled`     | Disabled overlay |
| `--overlay-mask-light`   | `rgba(10,10,10,0.2)`  | `bg-overlay-mask-light`   | Backdrop light   |
| `--overlay-mask`         | `rgba(10,10,10,0.4)`  | `bg-overlay-mask`         | Modal backdrop   |
| `--overlay-mask-dark`    | `rgba(10,10,10,0.6)`  | `bg-overlay-mask-dark`    | Heavy overlay    |

### Status

Tailwind shorthands exist via `colors.status` — prefer them.

| Token                 | Hex       | Tailwind               |
| --------------------- | --------- | ---------------------- |
| `--status-success`    | `#22ad5c` | `text-status-success`  |
| `--status-success-bg` | `#e2ffed` | `bg-status-success-bg` |
| `--status-error`      | `#f23030` | `text-status-error`    |
| `--status-error-bg`   | `#feebeb` | `bg-status-error-bg`   |
| `--status-warning`    | `#f27430` | `text-status-warning`  |
| `--status-warning-bg` | `#fde5d8` | `bg-status-warning-bg` |
| `--status-info`       | `#01a9db` | `text-status-info`     |
| `--status-info-bg`    | `#d0f0fd` | `bg-status-info-bg`    |
| `--status-neutral`    | `#737373` | `text-status-neutral`  |
| `--status-neutral-bg` | `#f5f5f5` | `bg-status-neutral-bg` |

---

## 4. Typography

Two font families, one boundary: Miletus for everything human-readable, TT Mono for everything machine-adjacent. Never mix them in a single text node.

| Variable         | Tailwind class | When to use                          |
| ---------------- | -------------- | ------------------------------------ |
| `--font-miletus` | `font-miletus` | All headings, body, UI copy          |
| `--font-tt-mono` | `font-tt-mono` | Labels, eyebrows, code-adjacent tags |

### New System — Homepage & Website

Each `text-*` utility sets `font-size`, `line-height`, `font-weight`, and `letter-spacing` through `tailwind.config.ts`. `globals.scss` also exposes matching `font-*` classes.

#### Display — hero sections only

| Class             | Size / LH / Weight | Tracking |
| ----------------- | ------------------ | -------- |
| `text-display-lg` | 64px / 72px / 500  | −2.56px  |
| `text-display-md` | 56px / 64px / 500  | −1.12px  |
| `text-display-sm` | 48px / 52px / 500  | −0.96px  |

#### Heading

| Class             | Size / LH / Weight | Tracking |
| ----------------- | ------------------ | -------- |
| `text-heading-h1` | 44px / 52px / 400  | −0.88px  |
| `text-heading-h2` | 40px / 48px / 400  | −0.80px  |
| `text-heading-h3` | 36px / 44px / 400  | −0.72px  |
| `text-heading-h4` | 28px / 38px / 400  | −0.56px  |
| `text-heading-h5` | 24px / 32px / 400  | −0.48px  |

#### Paragraph

| Class               | Size / LH   | Class               | Size / LH   |
| ------------------- | ----------- | ------------------- | ----------- |
| `text-paragraph-20` | 20px / 26px | `text-paragraph-14` | 14px / 20px |
| `text-paragraph-18` | 18px / 24px | `text-paragraph-13` | 13px / 18px |
| `text-paragraph-16` | 16px / 22px | `text-paragraph-12` | 12px / 16px |
| `text-paragraph-15` | 15px / 22px |                     |             |

All paragraph `text-*` classes are weight 400. Prefer the matching `font-paragraph-*-medium` class from `globals.scss` when available; otherwise add `font-medium` if it matches the existing component style.

#### Mono — TT Mono, always uppercase

| Class          | Size / LH   | Usage                  |
| -------------- | ----------- | ---------------------- |
| `text-mono-14` | 14px / 14px | Large labels           |
| `text-mono-13` | 13px / 13px | Eyebrows, section tags |
| `text-mono-12` | 12px / 12px | Small badges           |

Always pair mono classes with `uppercase tracking-[0.52px]`.

### Typography Principles

- **Tracking as identity**: Display sizes bake in -2.56px to -0.96px tracking. Treat this as structural; only override when an existing Novita component already does.
- **Weight restraint**: 400 and 500 are the normal range in the new system. Avoid new 600/700 weights unless matching legacy or third-party component styling.
- **Two voices, strict boundary**: Miletus for human-readable copy; TT Mono for product/infrastructure labels. Never mix.
- **Mono always caps**: TT Mono elements require `uppercase` — lowercase TT Mono is never correct.

### Deprecated System — Console / Legacy

Defined in `theme.scss`. Do **not** use for new homepage work.

| Class                        | Size        | Notes                         |
| ---------------------------- | ----------- | ----------------------------- |
| `font-h1`                    | 80px        | Old hero headings             |
| `font-h4` / `font-h5`        | 24px / 20px | Console card / section titles |
| `font-body` / `font-menu`    | 16px / 14px | Legacy body / nav items       |
| `font-subtle` / `font-small` | 14px / 12px | Helper text / annotations     |

---

## 5. Spacing

Token scale maps directly to Tailwind `space-*` and works with all spacing utilities: `gap-`, `p-`, `px-`, `py-`, `m-`, `mt-`, etc. Regular Tailwind spacing like `gap-4` and `p-6` is also allowed when it matches the design and existing code; use `*-space-*` when the design explicitly maps to these tokens.

| Token        | Value |     | Token         | Value |
| ------------ | ----- | --- | ------------- | ----- |
| `--space-2`  | 2px   |     | `--space-24`  | 24px  |
| `--space-4`  | 4px   |     | `--space-32`  | 32px  |
| `--space-6`  | 6px   |     | `--space-48`  | 48px  |
| `--space-8`  | 8px   |     | `--space-80`  | 80px  |
| `--space-12` | 12px  |     | `--space-120` | 120px |
| `--space-16` | 16px  |     | `--space-20`  | 20px  |
| `--space-10` | 10px  |     | `--space-26`  | 26px  |
| `--space-40` | 40px  |     |               |       |

```tsx
<div className="flex flex-col gap-space-24 p-space-24">
```

---

## 6. Border Radius

Prefer the **numeric token classes** — they map directly to `--radius-*` CSS variables. Legacy aliases are also configured for existing UI. Do not rewrite shadcn wrappers just because they use defaults like `rounded-lg`; for new custom UI, prefer project token classes.

| Token           | Value | Tailwind       | Usage                 |
| --------------- | ----- | -------------- | --------------------- |
| `--radius-0`    | 0     | `rounded-0`    | Square                |
| `--radius-2`    | 2px   | `rounded-2`    | Minimal               |
| `--radius-4`    | 4px   | `rounded-4`    | Buttons, tags, inputs |
| `--radius-6`    | 6px   | `rounded-6`    | Forms, dropdowns      |
| `--radius-8`    | 8px   | `rounded-8`    | Cards, dialogs        |
| `--radius-12`   | 12px  | `rounded-12`   | Feature panels        |
| `--radius-full` | 999px | `rounded-full` | Pill buttons, avatars |

Legacy aliases from `tailwind.config.ts`: `rounded-sm`, `rounded-regular`, `rounded-medium`, `rounded-large`, `rounded-round`, `rounded-button`, `rounded-input`, `rounded-form`, `rounded-dialog`. Use them only when matching existing component conventions.

---

## 7. Shadows & Depth

| Token        | Tailwind   | Value                                                               | Usage                      |
| ------------ | ---------- | ------------------------------------------------------------------- | -------------------------- |
| `--shadow-1` | `shadow-1` | `0 1px 2px 0 rgba(0,0,0,0.05)`                                      | Cards — subtle lift        |
| `--shadow-2` | `shadow-2` | `0 2px 4px -2px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.1)`    | Dropdown menus             |
| `--shadow-3` | `shadow-3` | `0 4px 6px -4px rgba(0,0,0,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)`  | Tooltips, popovers         |
| `--shadow-4` | `shadow-4` | `0 8px 10px -6px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.1)` | Elevated cards, sidesheets |
| `--shadow-5` | `shadow-5` | `0 25px 50px -12px rgba(0,0,0,0.25)`                                | Floating actions           |

**Depth philosophy**: Shadows provide elevation; borders provide presence. A card typically needs both: `shadow-1` for lift and `border border-[var(--border-subtle)]` for definition. On dark inverse surfaces (`bg-[var(--bg-inverse)]`), alpha borders are invisible — use `border-[var(--border-2)]` instead.

---

## 8. Layout & Breakpoints

### Breakpoints

| Name     | Constraint        | Usage                              |
| -------- | ----------------- | ---------------------------------- |
| `xs`     | min-width: 390px  | Mobile S breakpoint                |
| `sm`     | min-width: 640px  | Mobile L / small tablet            |
| `md`     | min-width: 768px  | Tablet                             |
| `middle` | max-width: 900px  | Mobile/tablet collapse (max-width) |
| `lg`     | min-width: 1024px | Desktop                            |
| `xl`     | min-width: 1340px | Large desktop                      |
| `2xl`    | min-width: 1700px | Wide desktop                       |

Max content width: `1440px`. Header height: `80px`.

### Standard Section Shell

```tsx
<section className="w-full py-[80px]">
  <div className="max-w-[1440px] mx-auto px-5 md:px-12 lg:px-[48px]">
```

Section padding: `px-5 md:px-12 lg:px-[48px]` horizontal; `py-16 md:py-20 lg:py-[80px]` vertical.

---

## 9. Height Tokens (Interactive Elements)

| Token         | Value | Tailwind               | Usage                |
| ------------- | ----- | ---------------------- | -------------------- |
| `--height-20` | 20px  | `h-[var(--height-20)]` | Micro badges         |
| `--height-24` | 24px  | `h-[var(--height-24)]` | Small chips          |
| `--height-28` | 28px  | `h-[var(--height-28)]` | Small buttons        |
| `--height-32` | 32px  | `h-[var(--height-32)]` | Default input height |
| `--height-36` | 36px  | `h-[var(--height-36)]` | Medium controls      |
| `--height-40` | 40px  | `h-[40px]`             | Primary CTA buttons  |
| `--height-44` | 44px  | `h-[44px]`             | Large / touch-target |

---

## 10. Z-Index Scale

| Value | Tailwind    | Usage                            |
| ----- | ----------- | -------------------------------- |
| 999   | `z-[999]`   | Sticky header                    |
| 1001  | `z-[1001]`  | Dialogs / modals                 |
| 10002 | `z-[10002]` | Select dropdowns (above dialogs) |

---

## 11. Do's and Don'ts

### Color

**Do — shorthand when readable, var() when redundant:**

```tsx
// ✓ Shorthand: brand, fill, gray, blue, status, element, overlay
<div className="bg-brand-0 text-brand-1 border-brand-0">
<div className="bg-fill-4">
<button className="bg-gray-950 text-white hover:bg-gray-800">
<div className="text-status-error bg-status-error-bg">
<span className="text-element-mid-em">
<div className="bg-overlay-hover">

// ✓ var() when shorthand is verbose or redundant
<p   className="text-[var(--text-1)]">
<div className="border border-[var(--border-subtle)]">
<div className="bg-[var(--bg-default)]">
```

**Don't:**

```tsx
// ✗ Hardcoded hex
<p className="text-[#262626]">

// ✗ Undefined --surface variable
<div className="bg-[var(--surface)]">    // → bg-surface or bg-[var(--bg-default)]

// ✗ Generic palette when the design specified semantic token intent
<p className="text-gray-600">            // → text-[var(--text-2)]
<div className="bg-gray-100">            // → bg-fill-4
```

### Typography

**Do:**

```tsx
// ✓ Font family + scale class + color
<h1 className="font-miletus text-display-md text-[var(--text-1)]">
<p  className="font-miletus text-paragraph-16 text-[var(--text-3)]">
<span className="font-tt-mono text-mono-13 uppercase tracking-[0.52px] text-[var(--element-mid-em)]">
```

**Don't:**

```tsx
// Prefer tokenized typography for new business UI when Figma provides an exact text style
<p className="text-sm font-medium">          // acceptable in shadcn/base components
<p className="font-paragraph-14-medium">     // preferred for new mapped business UI

// ✗ TT Mono without uppercase
<span className="font-tt-mono text-mono-13"> // → add uppercase tracking-[0.52px]
```

### Radius

```tsx
// ✓ Numeric token classes (map directly to --radius-* CSS vars)
<button className="rounded-full">    // pill (999px)
<button className="rounded-4">      // input/tag (4px)
<div    className="rounded-8">      // card (8px)
<div    className="rounded-12">     // feature panel (12px)

// Existing shadcn wrappers may use defaults such as rounded-lg; do not churn them unnecessarily.
// New custom UI should prefer numeric token classes or documented legacy aliases.
```

### Z-index

```tsx
// ✓
className = "z-[999]"; // header
className = "z-[1001]"; // dialog
className = "z-[10002]"; // select dropdown

// ✗
className = "z-50 z-[9999]";
```

---

## 12. Quick Reference Cheatsheet

```tsx
// ─── Surfaces ────────────────────────────────────────────────────
<main    className="bg-[var(--bg-default)]">       // #fafafa — page
<section className="bg-[var(--bg-light)]">         // #ffffff — white section
<section className="bg-[var(--bg-inverse)]">       // #262626 — dark section
<div     className="bg-fill-4 rounded-8">          // #f5f5f5 — card bg

// ─── Text ────────────────────────────────────────────────────────
<h1   className="font-miletus text-display-md text-[var(--text-1)]">
<h2   className="font-miletus text-heading-h2 text-[var(--text-1)]">
<p    className="font-miletus text-paragraph-16 text-[var(--text-3)]">
<span className="font-tt-mono text-mono-13 uppercase tracking-[0.52px] text-element-mid-em">

// ─── Buttons ─────────────────────────────────────────────────────
<button className="h-[40px] px-5 rounded-full bg-gray-950 text-white font-miletus text-paragraph-14 hover:bg-gray-800">
<button className="h-[40px] px-5 rounded-full border border-[var(--border-strong)] font-miletus text-paragraph-14">

// ─── Cards ───────────────────────────────────────────────────────
<div className="rounded-8 border border-[var(--border-subtle)] bg-fill-white shadow-1 p-space-24">

// ─── Brand accent ────────────────────────────────────────────────
<span className="text-brand-0">Live</span>
<div  className="bg-brand-3 border border-brand-0 rounded-8">

// ─── Status ──────────────────────────────────────────────────────
<div className="text-status-error   bg-status-error-bg">
<div className="text-status-success bg-status-success-bg">

// ─── Section shell ───────────────────────────────────────────────
<section className="w-full py-[80px]">
  <div className="max-w-[1440px] mx-auto px-5 md:px-12 lg:px-[48px]">
```
