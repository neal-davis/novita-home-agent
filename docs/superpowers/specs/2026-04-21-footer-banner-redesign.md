# Footer Banner Redesign Spec

**Date:** 2026-04-21  
**New files:** `src/app/components/footer-section/FooterSection.tsx`, `Banner.tsx`, `Footer.tsx`  
**Files superseded:** `src/app/components/banner/Banner.tsx`, `src/app/components/website-footer/WebsiteFooter.tsx`  
**Page updated:** `src/app/page.tsx` (or `src/app/mainpage/index.tsx`)

---

## Goal

Replace the existing `<Banner />` + `<WebsiteFooter />` pair with a single composed `<FooterSection />` component that contains:

1. **Banner** — a light CTA section with a decorative full-bleed background and logotype image.
2. **Footer** — a dark navigation + legal section.

Both sub-components are server components (no client interactivity required).

---

## New File Structure

```
src/app/components/footer-section/
  FooterSection.tsx   ← server component, composes Banner + Footer
  Banner.tsx          ← light CTA section
  Footer.tsx          ← dark nav/legal section
```

---

## FooterSection.tsx

Simple pass-through composition — no props, no logic.

```tsx
import Banner from "./Banner";
import Footer from "./Footer";

export default function FooterSection() {
  return (
    <>
      <Banner />
      <Footer />
    </>
  );
}
```

---

## Banner Section (light)

### Section shell

| Property         | Value                                            |
| ---------------- | ------------------------------------------------ |
| Background color | `bg-[var(--bg-default)]`                         |
| Height           | approx `h-[608px]`                               |
| Positioning      | `relative` (needed to anchor the logotype image) |
| Overflow         | `overflow-hidden`                                |

### Background image

A decorative full-bleed image rendered as an absolutely-positioned layer that covers the entire section. Asset URL is TBD at implementation — export from Figma or use an existing project asset.

```tsx
<img
  src="<asset-path-tbd>"
  alt=""
  aria-hidden="true"
  className="absolute inset-0 w-full h-full object-cover"
/>
```

### Content container

```
max-w-[1360px] mx-auto px-[32px] py-[80px] flex items-start justify-between relative z-10
```

The `relative z-10` ensures the content renders above the background image layer.

### Left side

Width: `w-[537px]`

| Element      | Class / Value                                 |
| ------------ | --------------------------------------------- |
| Heading      | `font-display-sm text-[var(--text-1)]`        |
| Heading text | "Everything you need to build production AI." |

### Right side

```
min-w-[480px] flex flex-col gap-[var(--space-24)]
```

| Element       | Class / Value                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Subtitle      | `font-paragraph-16 text-[var(--text-3)]`                                                                             |
| Subtitle text | "200+ models, on-demand GPUs, and secure agent runtimes — unified under one API. Free to start, scales as you grow." |

**"Get started" button** — rendered as a `<Link>` pointing to `NOVITA_URL.USER_REGISTER` (same href as the current `Banner.tsx`):

```
rounded-[var(--radius-full)]
border border-[var(--border-strong)]
bg-[var(--fill-white)]
h-[44px] px-[var(--space-20)]
inline-flex items-center gap-[var(--space-8)]
hover:opacity-80 transition-opacity
```

- Label: `font-paragraph-15 text-[var(--text-1)]` — "Get started"
- Icon: `<ChevronRight size={16} />` from `lucide-react`

### Logotype image

Large "Novita" wordmark anchored to the bottom of the section. Asset URL is TBD at implementation.

```tsx
<img
  src="<logotype-asset-tbd>"
  alt="Novita"
  className="absolute bottom-0 left-[32px] w-[1296px] h-[321px] object-contain object-left-bottom pointer-events-none"
/>
```

---

## Footer Section (dark)

### Section shell

| Property         | Value                                            |
| ---------------- | ------------------------------------------------ |
| Background color | `bg-[var(--bg-inverse)]` (resolves to `#262626`) |

### Inner container

```
max-w-[1360px] mx-auto flex flex-col gap-[72px]
```

---

### Main row

```
px-[32px] py-[64px] flex items-start justify-between
```

#### Logo column

```
flex-1 flex flex-col gap-[var(--space-32)]
```

| Element           | Detail                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo              | Novita symbol + logotype SVG assets (reuse from existing footer)                                                                               |
| Tagline           | `font-paragraph-15 text-[var(--text-4)] w-[268px]` — copy TBD (reuse from existing `WebsiteFooter.tsx`)                                        |
| Compliance badges | `flex items-center gap-[var(--space-16)]` row containing 3 image assets: AICPA/SOC, GDPR, ISO. Asset paths TBD — reuse existing footer assets. |

#### Nav columns

Container:

```
w-[888px] flex items-center
```

Four columns — **Product**, **Resources**, **Company**, **Partners**.

Each column shell:

```
flex-1 flex flex-col gap-[var(--space-24)] pl-[20px] border-l border-[var(--alpha-light-7)]
```

Column header:

```
font-paragraph-14 text-[var(--text-4)]
```

Links:

```
font-paragraph-14 text-[var(--text-4)] hover:text-[var(--text-1)] transition-colors
```

Each link is a plain `<a>` tag. `href` values should match those in the current `WebsiteFooter.tsx`.

**Column content:**

| Column    | Links                                                   |
| --------- | ------------------------------------------------------- |
| Product   | Model APIs, Agent sandbox, GPU instance, GPU bare metal |
| Resources | Book a demo, Contact support, Supply GPUs, Pricing, Doc |
| Company   | About, Careers, Blog                                    |
| Partners  | Startup Program, Become an affiliate                    |

---

### Bottom bar

```
border-t border-[var(--alpha-light-20)] px-[32px] py-[32px] flex items-center justify-between
```

**Left:**

```
font-paragraph-14 text-[var(--text-4)]
```

Text: "© 2026 Novita AI. All rights reserved"

**Right:**

```
flex items-center gap-[var(--space-32)]
```

Legal links (inner `flex gap-[var(--space-32)]`):

| Link text        | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Security & Trust | `font-paragraph-14 text-[var(--text-4)] hover:text-[var(--text-1)] transition-colors` |
| Terms of service | same                                                                                  |
| Privacy Policy   | same                                                                                  |

`href` values should match those in the current `WebsiteFooter.tsx`.

Social icons (inner `flex gap-[var(--space-24)]`):

| Platform    | Icon                                      |
| ----------- | ----------------------------------------- |
| X (Twitter) | SVG asset from `@/lib/icons/` or iconfont |
| LinkedIn    | SVG asset from `@/lib/icons/` or iconfont |
| Discord     | SVG asset from `@/lib/icons/` or iconfont |

Each icon: `size-[18px]` with `text-[var(--text-4)] hover:text-[var(--text-1)] transition-colors`.

`href` values should match those in the current `WebsiteFooter.tsx`.

---

## page.tsx Changes

| Action        | Detail                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Remove import | `import Banner from "@/app/components/banner/Banner"`                             |
| Remove import | `import WebsiteFooter from "@/app/components/website-footer/WebsiteFooter"`       |
| Add import    | `import FooterSection from "@/app/components/footer-section/FooterSection"`       |
| Replace JSX   | Remove `<Banner />` + `<WebsiteFooter />`, add `<FooterSection />` in their place |

---

## Implementation Notes

### Asset paths (TBD at implementation)

| Asset                               | Notes                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------ |
| Banner background image             | Export from Figma or check `/public/footer/` for an existing file        |
| Logotype wordmark image             | Export from Figma; approx dimensions 1296 × 321 px                       |
| AICPA/SOC, GDPR, ISO badges         | Reuse from existing `WebsiteFooter.tsx` — check current `src` attributes |
| Social icons (X, LinkedIn, Discord) | Reuse from existing `WebsiteFooter.tsx` or `@/lib/icons/`                |
| Novita symbol + logotype            | Reuse from existing `WebsiteFooter.tsx`                                  |

### href values (TBD at implementation)

- "Get started" button: `NOVITA_URL.USER_REGISTER` (imported from `@/constants/urls`) — already confirmed in existing `Banner.tsx`.
- Nav links and legal links: copy `href` values from `WebsiteFooter.tsx`.
- Social icon links: copy `href` values from `WebsiteFooter.tsx`.

### Token compliance

All colors must use `var(--*)` CSS variables. No hardcoded hex values, no Tailwind palette colors (e.g. `text-gray-*`).

### No SCSS modules

Both `Banner.tsx` and `Footer.tsx` must use Tailwind utility classes only. Do not create `.module.scss` files.

### Server components

Neither sub-component requires `"use client"`. Keep them as server components unless interactivity is added later.

### Existing files

The files `src/app/components/banner/Banner.tsx` and `src/app/components/website-footer/WebsiteFooter.tsx` are **superseded** but should not be deleted until `<FooterSection />` is wired up in `page.tsx` and verified in the browser. Delete them in the same PR or as a follow-up cleanup commit.
