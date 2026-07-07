# ppinfra Design Token Reference

> Source of truth: `src/styles/_design-tokens.scss` + `tailwind.config.ts`
> Load this file only after [`global-ppio.md`](./global-ppio.md) when exact token values or class mappings are needed.

**Color availability summary:**

| Color group                                                                                                                                                                                          | Available?             | Notes                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `brand-*`, `neutral-*`, `fill-*`, `border-*`, `success-*`, `warning-*`, `error-*`                                                                                                                    | ✅ Project tokens      | Use these for UI — defined in design-tokens.scss                               |
| `gray-*`, `red-*`                                                                                                                                                                                    | ⚠️ Partial (custom)    | Overridden with project values, scale 50–400 only; `gray-600` etc. don't exist |
| `blue-*`, `purple-*`, `pink-*`, `orange-*`, `slate-*`, `zinc-*`, `sky-*`, `teal-*`, `cyan-*`, `indigo-*`, `violet-*`, `fuchsia-*`, `rose-*`, `amber-*`, `yellow-*`, `lime-*`, `emerald-*`, `stone-*` | ✅ Full Tailwind scale | Re-added via `theme.extend.colors` for Tremor                                  |
| `green-*`                                                                                                                                                                                            | ❌                     | Not in config — use `success-*` instead                                        |

**For UI work, prefer project tokens** (`brand-1`, `neutral-400`, `fill-3`, etc.) over raw Tailwind colors (`blue-500`) — they respond to theme changes and semantic variables.

---

## Colors

### Neutral (achromatic scale)

| Token       | CSS Var         | Hex       | Tailwind Class                        | Usage                                       |
| ----------- | --------------- | --------- | ------------------------------------- | ------------------------------------------- |
| neutral-50  | `--neutral-50`  | `#ffffff` | `bg-neutral-50` / `text-neutral-50`   | White, page background, button text on dark |
| neutral-100 | `--neutral-100` | `#ebecef` | `bg-neutral-100`                      | Subtle borders                              |
| neutral-200 | `--neutral-200` | `#d3d4d5` | `text-neutral-200`                    | Disabled text                               |
| neutral-300 | `--neutral-300` | `#9e9e9e` | `text-neutral-300`                    | Tertiary/muted text                         |
| neutral-400 | `--neutral-400` | `#616161` | `text-neutral-400`                    | Secondary text                              |
| neutral-500 | `--neutral-500` | `#181818` | `bg-neutral-500` / `text-neutral-500` | Primary text, dark surfaces                 |

> `white` = `neutral-50`, `black` = `neutral-500`. Both support `/opacity` modifier.

### Brand (blue)

| Token   | CSS Var                    | Hex       | Tailwind Class                | Usage                                  |
| ------- | -------------------------- | --------- | ----------------------------- | -------------------------------------- |
| brand-0 | `--brand-0` (`--blue-500`) | `#0e58ea` | `bg-brand-0`                  | Pressed state, darkest brand           |
| brand-1 | `--brand-1` (`--blue-400`) | `#1161fe` | `bg-brand-1` / `text-brand-1` | **Primary brand**, CTA bg, active link |
| brand-2 | `--brand-2` (`--blue-300`) | `#4080ff` | `bg-brand-2`                  | Hover state                            |
| brand-3 | `--brand-3` (`--blue-200`) | `#bed4ff` | `bg-brand-3`                  | Light brand tint                       |
| brand-4 | `--brand-4` (`--blue-100`) | `#e6edfa` | `bg-brand-4`                  | Very light brand bg                    |
| brand-5 | `--brand-5` (`--blue-50`)  | `#f4f7ff` | `bg-brand-5`                  | Faintest brand bg, badge bg            |

### Gray (surface/border)

| Token    | CSS Var      | Hex       | Tailwind Class  | Usage                        |
| -------- | ------------ | --------- | --------------- | ---------------------------- |
| gray-50  | `--gray-50`  | `#f7f8fa` | `bg-gray-50`    | Subtle surface, table header |
| gray-100 | `--gray-100` | `#f2f3f5` | `bg-gray-100`   | Light fill                   |
| gray-200 | `--gray-200` | `#c9cdd4` | `bg-gray-200`   | Borders, dividers            |
| gray-300 | `--gray-300` | `#86909c` | `text-gray-300` | Muted secondary text         |
| gray-400 | `--gray-400` | `#5c6168` | `text-gray-400` | Strong secondary text        |

### Semantic Fill (backgrounds)

| Token  | CSS Var    | Resolved             | Tailwind Class | Usage                          |
| ------ | ---------- | -------------------- | -------------- | ------------------------------ |
| fill-1 | `--fill-1` | gray-400 `#5c6168`   | `bg-fill-1`    | Darkest fill                   |
| fill-2 | `--fill-2` | gray-200 `#c9cdd4`   | `bg-fill-2`    | Medium fill                    |
| fill-3 | `--fill-3` | gray-100 `#f2f3f5`   | `bg-fill-3`    | Light fill, table header bg    |
| fill-4 | `--fill-4` | gray-50 `#f7f8fa`    | `bg-fill-4`    | Subtle tint bg                 |
| fill-5 | `--fill-5` | neutral-50 `#ffffff` | `bg-fill-5`    | White surface (card, input bg) |

### Semantic Border

| Token    | CSS Var      | Resolved              | Tailwind Class    | Usage                                 |
| -------- | ------------ | --------------------- | ----------------- | ------------------------------------- |
| border-1 | `--border-1` | gray-400 `#5c6168`    | `border-border-1` | Strong border                         |
| border-2 | `--border-2` | gray-200 `#c9cdd4`    | `border-border-2` | Standard border                       |
| border-3 | `--border-3` | neutral-100 `#ebecef` | `border-border-3` | **Default border** (Tailwind default) |
| border-4 | `--border-4` | gray-100 `#f2f3f5`    | `border-border-4` | Faint border                          |

### Status Colors

#### Success (green)

| Token       | Hex       | Tailwind Class     | Usage            |
| ----------- | --------- | ------------------ | ---------------- |
| success-50  | `#e8ffea` | `bg-success-50`    | Success bg tint  |
| success-100 | `#aff0b5` | `bg-success-100`   | Light success    |
| success-200 | `#23c343` | `text-success-200` | Medium success   |
| success-300 | `#00b42a` | `text-success-300` | Standard success |
| success-400 | `#009a29` | `text-success-400` | Dark success     |

#### Warning (orange)

| Token       | Hex       | Tailwind Class     | Usage            |
| ----------- | --------- | ------------------ | ---------------- |
| warning-50  | `#fff7e8` | `bg-warning-50`    | Warning bg tint  |
| warning-100 | `#ffe4ba` | `bg-warning-100`   | Light warning    |
| warning-200 | `#ff9a2e` | `text-warning-200` | Medium warning   |
| warning-300 | `#ff7d00` | `text-warning-300` | Standard warning |
| warning-400 | `#d25f00` | `text-warning-400` | Dark warning     |

#### Error / Red

| Token               | Hex       | Tailwind Class              | Usage                        |
| ------------------- | --------- | --------------------------- | ---------------------------- |
| error-50 / red-50   | `#ffece8` | `bg-error-50` / `bg-red-50` | Error bg tint                |
| error-100 / red-100 | `#fdcdc5` | `bg-error-100`              | Light error                  |
| error-200 / red-200 | `#f76560` | `text-error-200`            | Medium error                 |
| error-300 / red-300 | `#f53f3f` | `text-error-300`            | Standard error (destructive) |
| error-400 / red-400 | `#cb2634` | `text-error-400`            | Dark error                   |

### Semantic Text (aliases)

Use `--text-*` CSS vars in inline styles, or `text-neutral-*` Tailwind classes:

| Semantic                | Resolves to | Hex       | Tailwind Class     | Usage            |
| ----------------------- | ----------- | --------- | ------------------ | ---------------- |
| `--text-1` / `--dark-1` | neutral-500 | `#181818` | `text-neutral-500` | Primary text     |
| `--text-2` / `--dark-2` | neutral-400 | `#616161` | `text-neutral-400` | Secondary text   |
| `--text-3` / `--dark-3` | neutral-300 | `#9e9e9e` | `text-neutral-300` | Tertiary / muted |
| `--text-4` / `--dark-4` | neutral-200 | `#d3d4d5` | `text-neutral-200` | Disabled         |

### Transparent / Mask

| Token                | Value       | Tailwind Class  | Usage               |
| -------------------- | ----------- | --------------- | ------------------- |
| `--transparent-blue` | `#bed4ff33` | —               | Blue hover overlay  |
| `--transparent-red`  | `#f7656033` | —               | Red hover overlay   |
| `--mask-light`       | `#18181833` | `bg-mask-light` | Light modal overlay |
| `--mask-dark`        | `#18181866` | `bg-mask-dark`  | Dark modal overlay  |

---

## Typography

### Font Classes (composite — use directly in className)

Defined in `_design-tokens.scss` `@layer components`:

| Class                  | Size | Line Height | Weight | Usage                |
| ---------------------- | ---- | ----------- | ------ | -------------------- |
| `font-h0`              | 56px | 72px        | 600    | Hero display         |
| `font-h1`              | 44px | 56px        | 600    | Page title           |
| `font-h2`              | 36px | 48px        | 600    | Section heading      |
| `font-h3`              | 28px | 40px        | 600    | Sub-section heading  |
| `font-h4`              | 24px | 32px        | 600    | Card title           |
| `font-h5`              | 20px | 28px        | 600    | Widget title         |
| `font-h6`              | 18px | 26px        | 600    | Small heading        |
| `font-body-heavy`      | 16px | 24px        | 500    | Emphasized body      |
| `font-body-regular`    | 16px | 24px        | 400    | Body text            |
| `font-primary-heavy`   | 14px | 22px        | 500    | UI label emphasized  |
| `font-primary-regular` | 14px | 22px        | 400    | **Standard UI text** |
| `font-subtle-heavy`    | 13px | 20px        | 500    | Small emphasized     |
| `font-subtle-regular`  | 13px | 20px        | 400    | Small text           |
| `font-small-heavy`     | 12px | 18px        | 500    | Caption emphasized   |
| `font-small-regular`   | 12px | 18px        | 400    | Caption              |

> Also available from `globals.scss`: `font-small`, `font-p`, `font-table-head`, `font-table-item`

### Tailwind Font Size (text-\* classes)

Overrides default Tailwind scale — all map to design tokens:

| Class       | Size | Line Height |
| ----------- | ---- | ----------- |
| `text-xs`   | 12px | 18px        |
| `text-sm`   | 13px | 20px        |
| `text-base` | 14px | 22px        |
| `text-lg`   | 16px | 24px        |
| `text-xl`   | 18px | 26px        |
| `text-2xl`  | 20px | 28px        |
| `text-3xl`  | 24px | 32px        |
| `text-4xl`  | 28px | 40px        |
| `text-5xl`  | 36px | 48px        |
| `text-6xl`  | 44px | 56px        |
| `text-7xl`  | 56px | 72px        |

> **Mobile** (≤768px): font sizes 16px+ are automatically scaled down via `@media` overrides in `_design-tokens.scss`.

### Font Weight

| Class           | Value | Usage                  |
| --------------- | ----- | ---------------------- |
| `font-light`    | 300   | Light text             |
| `font-normal`   | 400   | Body / reading         |
| `font-medium`   | 500   | UI / interactive       |
| `font-semibold` | 600   | Headings / emphasis    |
| `font-bold`     | 700   | Strong emphasis (rare) |

### Letter Spacing

| Class              | Value  | Usage             |
| ------------------ | ------ | ----------------- |
| `tracking-tighter` | `-2px` | Display headlines |
| `tracking-normal`  | `0px`  | All body text     |
| `tracking-wide`    | `1px`  | Special labels    |
| `tracking-wider`   | `2px`  | Spaced-out labels |

---

## Spacing

Tailwind default numeric spacing (p-4, m-2, gap-6, etc.) is still available. Semantic aliases added:

| Class                 | Value | CSS Var             |
| --------------------- | ----- | ------------------- |
| `p-tiny` / `gap-tiny` | 2px   | `--space-tiny`      |
| `p-minismall`         | 4px   | `--space-minismall` |
| `p-small`             | 8px   | `--space-small`     |
| `p-regular`           | 12px  | `--space-regular`   |
| `p-medium`            | 16px  | `--space-medium`    |
| `p-large`             | 24px  | `--space-large`     |
| `p-xlarge`            | 48px  | `--space-xlarge`    |
| `p-2xlarge`           | 80px  | `--space-2xlarge`   |
| `p-3xlarge`           | 120px | `--space-3xlarge`   |

---

## Border Radius

| Class               | Value | CSS Var              | Usage                       |
| ------------------- | ----- | -------------------- | --------------------------- |
| `rounded-none`      | 0px   | `--radius-none`      | Sharp corners               |
| `rounded-minismall` | 2px   | `--radius-minismall` | Micro elements, inline code |
| `rounded-small`     | 4px   | `--radius-small`     | Buttons, inputs             |
| `rounded-regular`   | 6px   | `--radius-regular`   | Cards, dropdowns            |
| `rounded-medium`    | 8px   | `--radius-medium`    | Panels, modals              |
| `rounded-large`     | 12px  | `--radius-large`     | Feature cards, images       |
| `rounded-round`     | 999px | `--radius-round`     | Pills, badges               |

---

## Shadows

| Class           | Value                                 | Usage              |
| --------------- | ------------------------------------- | ------------------ |
| `shadow-1`      | `0 2px 5px 0 rgba(0,0,0,0.05)`        | Subtle lift        |
| `shadow-2`      | `0 2px 8px 0 rgba(0,0,0,0.08)`        | Standard card      |
| `shadow-3`      | `0 -1px 6px + 0 4px 10px -1px …`      | Card with top edge |
| `shadow-4`      | `0 -1px 4px + 0 4px 10px …`           | Elevated panel     |
| `shadow-5`      | `0 -2px 8px + 0 10px 15px …`          | Prominent modal    |
| `shadow-drop`   | `-1px 0 5px rgba(213,217,223,0.5)`    | Sidebar shadow     |
| `shadow-module` | `0 1px 16px #dae4f0`                  | Module card        |
| `shadow-home`   | `0 3.6px 54px rgba(218,228,240,0.08)` | Hero section       |

---

## Heights (component sizing)

| Class          | Value | CSS Var               | Usage                    |
| -------------- | ----- | --------------------- | ------------------------ |
| `h-supersmall` | 20px  | `--height-supersmall` | Tiny tags                |
| `h-minismall`  | 24px  | `--height-minismall`  | Small badges             |
| `h-small`      | 28px  | `--height-small`      | Compact inputs           |
| `h-medium`     | 32px  | `--height-medium`     | **Default input/button** |
| `h-large`      | 36px  | `--height-large`      | Standard button          |
| `h-xlarge`     | 40px  | `--height-xlarge`     | Large button             |
| `h-superlarge` | 44px  | `--height-superlarge` | Touch-target minimum     |

---

## Screens (breakpoints)

| Name   | Width  | Usage         |
| ------ | ------ | ------------- |
| `xs`   | 390px  | Small mobile  |
| `sm`   | 640px  | Mobile        |
| `md`   | 768px  | Tablet        |
| `lg`   | 1024px | Desktop small |
| `xl`   | 1310px | Desktop       |
| `xxl`  | 1500px | Wide desktop  |
| `xxxl` | 1800px | Ultra-wide    |

---

## Component Classes (pre-built)

### Buttons

```tsx
<button className="btn-primary">Submit</button>     // brand-1 bg, white text, h-medium
<button className="btn-secondary">Cancel</button>   // white bg, border-3, brand hover
<button className="btn-danger">Delete</button>      // red-300 bg, white text
<button className="btn-success">Confirm</button>    // success-1 bg, white text
```

### Tags / Badges

```tsx
<span className="tag tag-primary">Active</span>    // brand-5 bg, brand-1 text
<span className="tag tag-success">Online</span>    // success-4 bg, success-0 text
<span className="tag tag-warning">Pending</span>   // warning-4 bg, warning-0 text
<span className="tag tag-danger">Error</span>      // red-50 bg, red-400 text
<span className="tag tag-neutral">Inactive</span>  // fill-3 bg, text-2 color
```

### Card

```tsx
<div className="card">...</div> // fill-5 bg, border-3, radius-regular, p-medium
```

### Input

```tsx
<input className="input" /> // fill-5 bg, border-3, h-medium, brand focus
```

---

## Quick Decision Guide

| Need                  | Use                                                   |
| --------------------- | ----------------------------------------------------- |
| Primary text          | `text-neutral-500` or `font-primary-regular`          |
| Secondary/description | `text-neutral-400`                                    |
| Muted/placeholder     | `text-neutral-300`                                    |
| Disabled              | `text-neutral-200`                                    |
| White surface (card)  | `bg-fill-5` or `bg-white`                             |
| Table row bg          | `bg-fill-3`                                           |
| Subtle bg tint        | `bg-fill-4`                                           |
| Default border        | `border-border-3` (or just `border`)                  |
| Brand CTA button      | `bg-brand-1 text-neutral-50`                          |
| Standard card         | `bg-fill-5 border border-border-3 rounded-regular`    |
| Pill badge            | `bg-brand-5 text-brand-1 rounded-round px-2 text-xs`  |
| Error state           | `text-error-300` / `border-error-200` / `bg-error-50` |
| Success state         | `text-success-300` / `bg-success-50`                  |

---

## Rules

1. **No hardcoded colors** — `bg-[#1161fe]` is forbidden; use `bg-brand-1`
2. **Prefer project tokens over raw Tailwind colors** — `bg-brand-1` beats `bg-blue-500`; `text-neutral-400` beats `text-slate-500`
3. **`green-*` is not available** — use `success-*` instead
4. **`gray-*` / `red-*` / `neutral-*` are truncated** — 50–400 only (project custom values); `gray-600`, `red-500` etc. don't exist
5. **Use CSS var arbitrary values** when no Tailwind class exists: `text-[var(--dark-2)]`
6. **Prefer composite font classes** (`font-h4`, `font-primary-regular`) over manual `text-*`/`font-*` combinations
7. **Borders via class**, not inline style: `border border-border-3` not `style={{ border: '1px solid #ebecef' }}`
