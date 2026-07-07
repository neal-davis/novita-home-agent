# Footer/Banner Combined Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace separate Banner.tsx + WebsiteFooter.tsx with a single FooterSection component (Banner + Footer sub-components) matching the v5 Figma redesign.

**Architecture:** Three new server components under `src/app/components/footer-section/`. The existing components are superseded but not deleted until verification. page.tsx updated to use FooterSection.

**Tech Stack:** Next.js App Router, Tailwind CSS, CSS design tokens, lucide-react, next/image

---

## Task 1: Create footer-section directory and FooterSection.tsx

- [ ] Create the directory `src/app/components/footer-section/`
- [ ] Create `src/app/components/footer-section/FooterSection.tsx` with the following exact content:

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

- [ ] Commit: `git commit -m "feat: add FooterSection skeleton"`

---

## Task 2: Create Banner.tsx

- [ ] Create `src/app/components/footer-section/Banner.tsx` with the following exact content:

```tsx
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";

export default function Banner() {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg-default)] min-h-[608px]">
      {/* Background image */}
      <img
        src="/footer/5/banner.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1360px] px-[32px] py-[80px] flex items-start justify-between">
        {/* Left: heading */}
        <h2 className="font-display-sm text-[var(--text-1)] w-[537px] shrink-0">
          Everything you need to build production AI.
        </h2>

        {/* Right: description + CTA */}
        <div className="flex flex-col gap-space-24 min-w-[480px]">
          <p className="font-paragraph-16 text-[var(--text-3)]">
            200+ models, on-demand GPUs, and secure agent runtimes — unified
            under one API. Free to start, scales as you grow.
          </p>
          <div>
            <Link
              href={NOVITA_URL.USER_REGISTER}
              className="inline-flex items-center gap-space-8 h-[44px] px-space-20 bg-[var(--fill-white)] border border-[var(--border-strong)] rounded-full font-paragraph-15 text-[var(--text-1)] hover:opacity-80 transition-opacity"
            >
              Get started
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Large Novita logotype — bottom of section */}
      <div className="absolute bottom-0 left-[32px] w-[1296px] h-[321px] pointer-events-none">
        <Image
          src="/footer/novita-logotype.png"
          alt="Novita"
          fill
          className="object-contain object-left-bottom"
        />
      </div>
    </section>
  );
}
```

> **Note:** `/footer/novita-logotype.png` does NOT yet exist — the Image component will render a broken image initially. This is expected and will be fixed in Task 4.

- [ ] Type check: `npx tsc --noEmit`
- [ ] Commit: `git commit -m "feat: add Banner component (v5 redesign)"`

---

## Task 3: Create Footer.tsx

- [ ] Create `src/app/components/footer-section/Footer.tsx` with the following exact content:

```tsx
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/app/components/header/partials/Logo";
import {
  NOVITA_URL,
  DOCS_URL,
  X_URL,
  LINKEDIN_URL,
  SUPPLY_GPU_LINK,
  SUPPORT_EMAIL_LINK,
  JOBS_URL,
  TRUST_CENTER_LINK,
} from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

const { FOOTER_LINK_IDs } = CLICK_BTN_IDs;

interface FooterLink {
  label: string;
  href: string;
  target?: "_blank" | "_self";
  elmId?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      {
        label: "Model APIs",
        href: NOVITA_URL.MODEL_LIBRARY_INDEX,
        elmId: FOOTER_LINK_IDs.MODEL_API,
      },
      { label: "Agent Sandbox", href: NOVITA_URL.SANDBOX_INDEX },
      {
        label: "GPU Instance",
        href: NOVITA_URL.GPU_INDEX,
        elmId: FOOTER_LINK_IDs.GPU_INSTANCE,
      },
      { label: "GPU Bare Metal", href: NOVITA_URL.GPU_BAREMETAL_INDEX },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Book a demo",
        href: "/book-demo",
        elmId: FOOTER_LINK_IDs.BOOK_DEMO,
      },
      {
        label: "Contact support",
        href: `mailto:${SUPPORT_EMAIL_LINK}`,
        target: "_blank",
        elmId: FOOTER_LINK_IDs.SUPPORT,
      },
      {
        label: "Supply GPUs",
        href: `mailto:${SUPPLY_GPU_LINK}`,
        target: "_blank",
        elmId: FOOTER_LINK_IDs.SUPPLY_GPU,
      },
      { label: "Pricing", href: NOVITA_URL.PRICING },
      { label: "Doc", href: DOCS_URL.HOME, elmId: FOOTER_LINK_IDs.DOCS },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about", elmId: FOOTER_LINK_IDs.ABOUT },
      {
        label: "Careers",
        href: JOBS_URL,
        target: "_blank",
        elmId: FOOTER_LINK_IDs.CAREERS,
      },
      {
        label: "Blog",
        href: "https://blogs.novita.ai",
        target: "_blank",
        elmId: FOOTER_LINK_IDs.BLOG,
      },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Startup Program", href: "/startup" },
      {
        label: "Become an affiliate",
        href: "/affiliate-new",
        elmId: FOOTER_LINK_IDs.AFFILIATE,
      },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  {
    label: "Security & Trust",
    href: TRUST_CENTER_LINK,
    target: "_blank",
    elmId: FOOTER_LINK_IDs.TRUST_CENTER,
  },
  {
    label: "Terms of service",
    href: NOVITA_URL.TERMS_OF_SERVICE,
    elmId: FOOTER_LINK_IDs.TERMS,
  },
  {
    label: "Privacy Policy",
    href: NOVITA_URL.PRIVACY_POLICY,
    elmId: FOOTER_LINK_IDs.PRIVACY,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-inverse)] flex flex-col items-center w-full">
      <div className="w-full max-w-[1360px] flex flex-col gap-[72px]">
        {/* Main content */}
        <div className="flex items-start justify-between px-[32px] py-[64px]">
          {/* Logo column */}
          <div className="flex flex-col gap-space-32 flex-1">
            <div className="flex flex-col gap-space-16">
              <Logo theme="dark" />
              <p className="font-paragraph-15 text-[var(--text-4)] max-w-[268px]">
                Power your AI applications with Novita AI&apos;s model APIs, GPU
                instances, and agent sandbox.
              </p>
            </div>
            <div className="flex items-center gap-space-16">
              <Image
                src="/footer/aicpa-soc.png"
                alt="AICPA SOC 2 Certified"
                width={64}
                height={64}
                className="opacity-70"
              />
              <Image
                src="/footer/gdrp.png"
                alt="GDPR Compliant"
                width={64}
                height={64}
                className="opacity-70"
              />
              <Image
                src="/footer/iso.png"
                alt="ISO 27001 Certified"
                width={69}
                height={56}
                className="opacity-70"
              />
            </div>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 w-[888px] flex-none">
            {FOOTER_COLUMNS.map((column) => (
              <div
                key={column.title}
                className="border-l border-[var(--alpha-light-7)] pl-5 flex flex-col gap-space-24"
              >
                <span className="font-paragraph-14 text-[var(--text-4)]">
                  {column.title}
                </span>
                <div className="flex flex-col gap-space-12">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      id={link.elmId}
                      target={link.target}
                      rel={
                        link.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--alpha-light-20)] px-[32px] py-[32px] flex items-center justify-between">
          <p className="font-paragraph-14 text-[var(--text-4)] whitespace-nowrap">
            &copy; {new Date().getFullYear()} Novita AI. All rights reserved
          </p>
          <div className="flex items-center gap-space-32">
            <div className="flex items-center gap-space-32">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  id={link.elmId}
                  target={link.target}
                  rel={
                    link.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-space-24">
              <Link
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={FOOTER_LINK_IDs.SOCIAL_X}
                className="text-[var(--text-4)] hover:text-white transition-colors"
                aria-label="X"
              >
                <span className="iconfont icon-x text-[18px]" />
              </Link>
              <Link
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={FOOTER_LINK_IDs.SOCIAL_LINKEDIN}
                className="text-[var(--text-4)] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <span className="iconfont icon-linkedin text-[18px]" />
              </Link>
              <Link
                href="https://discord.gg/novita"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-4)] hover:text-white transition-colors"
                aria-label="Discord"
              >
                <Image
                  src="/footer/discord.png"
                  alt="Discord"
                  width={18}
                  height={18}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] Type check: `npx tsc --noEmit`
- [ ] Commit: `git commit -m "feat: add Footer component (v5 redesign)"`

---

## Task 4: Export logotype image from Figma

The Figma design (node `1:12700` in file `3nHa4z8enopB5YGSneFZlK`) includes a large "Novita" wordmark at the bottom of the Banner section. This needs to be downloaded and saved to `public/footer/novita-logotype.png`.

- [ ] **Option A:** Open the Figma file, select the Logotype layer → Export as PNG 1x → save to `public/footer/novita-logotype.png`
- [ ] **Option B:** Use the Figma MCP asset URL from the design context (the logotype asset was `imgLogotype` in the design context output) and download it directly

Once saved, the Banner's logotype image will render correctly.

- [ ] Verify `public/footer/novita-logotype.png` exists
- [ ] Commit: `git commit -m "assets: add novita-logotype.png for footer banner"`

---

## Task 5: Wire up in page.tsx

Modify `src/app/page.tsx`:

- [ ] Remove import: `import WebsiteFooter from "@/app/components/website-footer/WebsiteFooter";`
- [ ] Remove import: `import Banner from "@/app/components/banner/Banner";`
- [ ] Add import: `import FooterSection from "@/app/components/footer-section/FooterSection";`
- [ ] In JSX, remove `<Banner />` and `<WebsiteFooter />`, replace with `<FooterSection />`

The relevant diff in `src/app/page.tsx`:

```tsx
// Before
import WebsiteFooter from "@/app/components/website-footer/WebsiteFooter";
import Banner from "@/app/components/banner/Banner";
// ...
      <WhatsNew />
      <Banner />
      <WebsiteFooter />

// After
import FooterSection from "@/app/components/footer-section/FooterSection";
// ...
      <WhatsNew />
      <FooterSection />
```

- [ ] Type check: `npx tsc --noEmit`
- [ ] Commit: `git commit -m "feat: wire FooterSection into page.tsx"`

---

## Task 6: Visual verification

- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000 and scroll to the bottom
- [ ] Verify Banner section:
  - Light background (`var(--bg-default)`)
  - Background image `/footer/5/banner.png` covers the section
  - Heading "Everything you need to build production AI." on the left (`w-[537px]`)
  - Subtitle paragraph + "Get started" button on the right
  - "Get started" button is a pill (`rounded-full`), links to `NOVITA_URL.USER_REGISTER`
  - Large Novita logotype image visible at bottom-left of the section
- [ ] Verify Footer section:
  - Dark background (`var(--bg-inverse)`)
  - Novita logo + tagline + compliance badges (AICPA SOC, GDPR, ISO) on the left column
  - 4 nav columns (Product, Resources, Company, Partners) with `border-[var(--alpha-light-7)]` left-border dividers
  - Column headings in `text-[var(--text-4)]`, links in `text-[var(--text-4)]` with `hover:text-white`
  - Bottom bar: copyright text left, legal links + social icons right
  - Social icons: X (iconfont), LinkedIn (iconfont), Discord (image `/footer/discord.png`)
  - Bottom bar separated by `border-[var(--alpha-light-20)]` top border
- [ ] Verify nav links are clickable and hover state turns text white
- [ ] Verify "Get started" button links to the correct signup URL
- [ ] If logotype image is missing: re-check Task 4

---

## Task 7: Cleanup (after verification)

Once FooterSection is verified working in production, delete the superseded files:

- [ ] Delete `src/app/components/banner/Banner.tsx`
- [ ] Delete `src/app/components/website-footer/WebsiteFooter.tsx`
- [ ] Verify no other files import these two paths (search for `website-footer/WebsiteFooter` and `banner/Banner`)
- [ ] Commit: `git commit -m "chore: remove superseded Banner and WebsiteFooter components"`
