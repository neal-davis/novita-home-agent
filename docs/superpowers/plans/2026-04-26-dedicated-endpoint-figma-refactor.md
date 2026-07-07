# Dedicated Endpoint Figma Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `src/app/dedicated-endpoint` to match the new Figma marketing layout while keeping the existing dynamic data requests and content semantics.

**Architecture:** Keep `src/app/dedicated-endpoint/page.tsx` as the server entry that fetches `enterpriseProductList()` and passes the result into a new section-based page composition. Replace the old page skeleton with dedicated Figma-aligned sections, reuse global site chrome (`WebsiteNavbar`, `FooterSection`), and isolate dynamic rendering to focused dedicated-endpoint components. Keep existing old components untouched unless a task explicitly replaces them.

**Tech Stack:** Next.js App Router, React Server/Client Components, TypeScript, Tailwind CSS, project design tokens, Next/Image, existing Novita UI components

---

## File Structure

- **Modify:** `src/app/dedicated-endpoint/page.tsx`
  - Replace old `Header` / `Footer` / `Home` / `Client` composition with homepage-aligned chrome and a new page content composition.
  - Keep `enterpriseProductList()` fetching here.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx`
  - Top-level section composition for the Figma-aligned content regions.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointHero.tsx`
  - Hero section using `/public/dedicated-endpoint/hero-bg.png` and Figma headline/CTA layout.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointBenefits.tsx`
  - Static feature/benefit section matching the Figma value-prop block.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointModelCatalog.tsx`
  - Open-source model catalog section, likely reusing the existing `getLLMOnDemandModels()` behavior in a cleaned-up component shape.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointPricing.tsx`
  - Dynamic pricing/products section receiving `DEProduct[]` from the page.
- **Create:** `src/app/dedicated-endpoint/components/DedicatedEndpointFaq.tsx`
  - Figma-aligned FAQ and contact section.
- **Create or Modify (if needed):** `src/app/dedicated-endpoint/components/types.ts`
  - Shared view-model types only if the new components need local mapping helpers.
- **Test:** `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`
  - Regression tests for data mapping / rendering decisions that can be tested without browser automation.

### Task 1: Add a regression test for page chrome and data-driven pricing rendering

**Files:**

- Create: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`
- Modify: `src/app/dedicated-endpoint/page.tsx`
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import Page from "../page";
import { enterpriseProductList } from "@/api/enterprise";

jest.mock("@/api/enterprise", () => ({
  enterpriseProductList: jest.fn(),
}));

jest.mock("@/app/components/website-navbar/WebsiteNavbar", () => () => (
  <div data-testid="website-navbar" />
));

jest.mock("@/app/components/footer-section/FooterSection", () => () => (
  <div data-testid="footer-section" />
));

jest.mock("../components/DedicatedEndpointPageContent", () => ({
  __esModule: true,
  default: ({ products }: { products: { id: string; name: string }[] }) => (
    <div>
      <div data-testid="pricing-product-count">{products.length}</div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  ),
}));

describe("dedicated endpoint page", () => {
  it("renders homepage chrome and passes enterprise products into the new page content", async () => {
    (enterpriseProductList as jest.Mock).mockResolvedValue({
      productList: [
        { id: "basic", name: "Basic" },
        { id: "pro", name: "Pro" },
      ],
    });

    const ui = await Page();
    render(ui as ReactNode);

    expect(screen.getByTestId("website-navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer-section")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-product-count")).toHaveTextContent("2");
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because `DedicatedEndpointPageContent` does not exist and `page.tsx` still renders the old layout.

- [ ] **Step 3: Write minimal implementation**

```tsx
import type { Metadata } from "next";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import { enterpriseProductList } from "@/api/enterprise";
import DedicatedEndpointPageContent from "./components/DedicatedEndpointPageContent";

export default async function DedicatedEndpointPage() {
  let products = [];

  try {
    const response = await enterpriseProductList();
    products = response?.productList ?? [];
  } catch (error) {
    console.error("Failed to fetch enterprise products:", error);
  }

  return (
    <main className="relative max-w-full overflow-x-clip bg-[var(--surface)]">
      <WebsiteNavbar />
      <DedicatedEndpointPageContent products={products} />
      <FooterSection />
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/page.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx
git commit -m "refactor: move dedicated endpoint page to new section layout"
```

### Task 2: Add the new page composition shell

**Files:**

- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx`
- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointHero.tsx`
- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointBenefits.tsx`
- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointPricing.tsx`
- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointFaq.tsx`
- Modify: `src/app/dedicated-endpoint/components/imgDeComponent.tsx`
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders the new section shell around pricing data", async () => {
  (enterpriseProductList as jest.Mock).mockResolvedValue({
    productList: [{ id: "basic", name: "Basic" }],
  });

  const ui = await Page();
  render(ui as ReactNode);

  expect(
    screen.getByRole("heading", { name: /dedicated endpoints/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /deploy popular open-source models/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /pricing & faq/i }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because the new section headings are not rendered yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
import DedicatedEndpointHero from "./DedicatedEndpointHero";
import DedicatedEndpointBenefits from "./DedicatedEndpointBenefits";
import DedicatedEndpointPricing from "./DedicatedEndpointPricing";
import DedicatedEndpointFaq from "./DedicatedEndpointFaq";
import type { DEProduct } from "./imgDeComponent";

export default function DedicatedEndpointPageContent({
  products,
}: {
  products: DEProduct[];
}) {
  return (
    <>
      <DedicatedEndpointHero />
      <DedicatedEndpointBenefits />
      <DedicatedEndpointPricing products={products} />
      <DedicatedEndpointFaq />
    </>
  );
}
```

```tsx
export default function DedicatedEndpointHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface)]">
      <div className="mx-auto flex min-h-[700px] max-w-[1512px] items-center px-[32px]">
        <div>
          <p className="font-mono-12 uppercase text-[var(--brand-1)]">
            Pricing
          </p>
          <h1 className="font-display-lg text-[var(--text-1)]">
            Dedicated Endpoints
          </h1>
        </div>
      </div>
    </section>
  );
}
```

```tsx
export default function DedicatedEndpointBenefits() {
  return (
    <section className="bg-[var(--surface)] px-[32px] py-[120px]">
      <div className="mx-auto max-w-[1248px]">
        <h2 className="font-display-sm text-[var(--text-1)]">
          Deploy Popular Open-Source Models
        </h2>
      </div>
    </section>
  );
}
```

```tsx
import type { DEProduct } from "./imgDeComponent";

export default function DedicatedEndpointPricing({
  products,
}: {
  products: DEProduct[];
}) {
  return (
    <section className="bg-[var(--surface)] px-[32px] py-[120px]">
      <div className="mx-auto max-w-[1248px]">
        <h2 className="font-display-sm text-[var(--text-1)]">Pricing & FAQ</h2>
        <div>{products.map((product) => product.name).join(", ")}</div>
      </div>
    </section>
  );
}
```

```tsx
export default function DedicatedEndpointFaq() {
  return (
    <section className="bg-[var(--surface)] px-[32px] pb-[120px]">
      <div className="mx-auto max-w-[1248px]" />
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx src/app/dedicated-endpoint/components/DedicatedEndpointHero.tsx src/app/dedicated-endpoint/components/DedicatedEndpointBenefits.tsx src/app/dedicated-endpoint/components/DedicatedEndpointPricing.tsx src/app/dedicated-endpoint/components/DedicatedEndpointFaq.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "feat: add dedicated endpoint figma section shell"
```

### Task 3: Implement the hero section to match the Figma layout

**Files:**

- Modify: `src/app/dedicated-endpoint/components/DedicatedEndpointHero.tsx`
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders the hero with figma headline, description, and CTA", async () => {
  (enterpriseProductList as jest.Mock).mockResolvedValue({ productList: [] });

  const ui = await Page();
  render(ui as ReactNode);

  expect(
    screen.getByRole("heading", { name: /dedicated endpoints/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/fully managed deployment/i)).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /contact us|get started|book a demo/i }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because the hero body copy and CTA are incomplete.

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BREVO_BOOK_LINK } from "@/constants/urls";

export default function DedicatedEndpointHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface)]">
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/dedicated-endpoint/hero-bg.png')" }}
      />
      <div className="relative mx-auto flex min-h-[700px] max-w-[1512px] items-center px-[32px] py-[96px]">
        <div className="max-w-[720px]">
          <p className="mb-space-16 font-mono-12 uppercase tracking-[0.6px] text-[var(--brand-1)]">
            Pricing
          </p>
          <h1 className="font-display-lg text-[var(--text-1)]">
            Dedicated Endpoints
          </h1>
          <p className="mt-space-24 font-paragraph-18 text-[var(--text-2)]">
            Fully managed deployment for your custom AI models with predictable
            performance and dedicated capacity.
          </p>
          <Link
            href={BREVO_BOOK_LINK}
            className="mt-space-32 inline-flex h-[44px] items-center gap-space-8 rounded-full border border-[var(--border-strong)] bg-[var(--fill-white)] px-space-20 font-paragraph-15 text-[var(--text-1)]"
          >
            Contact us
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/components/DedicatedEndpointHero.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "feat: rebuild dedicated endpoint hero from figma"
```

### Task 4: Implement the benefits and open-source catalog section

**Files:**

- Modify: `src/app/dedicated-endpoint/components/DedicatedEndpointBenefits.tsx`
- Create: `src/app/dedicated-endpoint/components/DedicatedEndpointModelCatalog.tsx`
- Modify: `src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx`
- Modify: `src/app/dedicated-endpoint/components/supportOpenSourceModels.tsx` (only if reusing internals is cleaner than duplicating)
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders figma benefits copy and the open-source catalog section", async () => {
  (enterpriseProductList as jest.Mock).mockResolvedValue({ productList: [] });

  const ui = await Page();
  render(ui as ReactNode);

  expect(screen.getByText(/guaranteed latency sla/i)).toBeInTheDocument();
  expect(
    screen.getByText(/custom models & lora adapters/i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /deploy popular open-source models/i }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because the feature bullets and catalog section are not implemented.

- [ ] **Step 3: Write minimal implementation**

```tsx
const BENEFITS = [
  "Guaranteed latency SLA",
  "Custom models & LoRA adapters",
  "Scale-to-zero support",
  "Best for predictable, high-throughput workloads",
];

export default function DedicatedEndpointBenefits() {
  return (
    <section className="bg-[var(--surface)] px-[32px] py-[120px]">
      <div className="mx-auto grid max-w-[1248px] gap-[48px] lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono-12 uppercase tracking-[0.6px] text-[var(--brand-1)]">
            01 — Benefits
          </p>
          <h2 className="mt-space-16 font-display-sm text-[var(--text-1)]">
            Dedicated performance for production inference
          </h2>
        </div>
        <ul className="space-y-space-24">
          {BENEFITS.map((item) => (
            <li key={item} className="font-paragraph-18 text-[var(--text-1)]">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

```tsx
"use client";

import { useEffect, useState } from "react";
import { getLLMOnDemandModels } from "@/api/model";

export default function DedicatedEndpointModelCatalog() {
  const [models, setModels] = useState<
    { id: string; displayName: string; title: string }[]
  >([]);

  useEffect(() => {
    getLLMOnDemandModels().then((res) => setModels(res ?? []));
  }, []);

  return (
    <section className="bg-[var(--surface)] px-[32px] py-[120px]">
      <div className="mx-auto max-w-[1248px]">
        <h2 className="font-display-sm text-[var(--text-1)]">
          Deploy Popular Open-Source Models
        </h2>
        <div className="mt-space-40 grid gap-space-16 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <article
              key={model.id}
              className="rounded-[24px] border border-[var(--border-default)] bg-[var(--fill-white)] p-space-24"
            >
              <h3 className="font-paragraph-18 text-[var(--text-1)]">
                {model.displayName}
              </h3>
              <p className="mt-space-8 font-paragraph-14 text-[var(--text-3)]">
                {model.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```tsx
import DedicatedEndpointModelCatalog from "./DedicatedEndpointModelCatalog";

export default function DedicatedEndpointPageContent({
  products,
}: {
  products: DEProduct[];
}) {
  return (
    <>
      <DedicatedEndpointHero />
      <DedicatedEndpointBenefits />
      <DedicatedEndpointModelCatalog />
      <DedicatedEndpointPricing products={products} />
      <DedicatedEndpointFaq />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/components/DedicatedEndpointBenefits.tsx src/app/dedicated-endpoint/components/DedicatedEndpointModelCatalog.tsx src/app/dedicated-endpoint/components/DedicatedEndpointPageContent.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "feat: add dedicated endpoint benefits and model catalog"
```

### Task 5: Rebuild the pricing section around enterprise product data

**Files:**

- Modify: `src/app/dedicated-endpoint/components/DedicatedEndpointPricing.tsx`
- Modify: `src/app/dedicated-endpoint/components/imgDeComponent.tsx`
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders enterprise products inside the figma pricing section", async () => {
  (enterpriseProductList as jest.Mock).mockResolvedValue({
    productList: [
      {
        id: "basic",
        name: "Basic",
        price: 1,
        currency: "USD",
        period: 1,
        unit: "day",
        detail: ["Guaranteed latency SLA"],
        origin_price: 2,
        discount_price: 1,
      },
    ],
  });

  const ui = await Page();
  render(ui as ReactNode);

  expect(
    screen.getByRole("heading", { name: /pricing & faq/i }),
  ).toBeInTheDocument();
  expect(screen.getByText("Basic")).toBeInTheDocument();
  expect(screen.getByText(/guaranteed latency sla/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because the pricing section is still placeholder-level.

- [ ] **Step 3: Write minimal implementation**

```tsx
import type { DEProduct } from "./imgDeComponent";
import ImgDeComponent from "./imgDeComponent";

export default function DedicatedEndpointPricing({
  products,
}: {
  products: DEProduct[];
}) {
  return (
    <section className="bg-[var(--surface)] px-[32px] py-[120px]">
      <div className="mx-auto max-w-[1248px]">
        <div className="grid gap-[40px] lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-[96px]">
          <div>
            <p className="font-mono-12 uppercase tracking-[0.6px] text-[var(--brand-1)]">
              04 — Pricing
            </p>
            <h2 className="mt-space-16 font-display-sm text-[var(--text-1)]">
              Pricing & FAQ
            </h2>
            <p className="mt-space-16 font-paragraph-16 text-[var(--text-3)]">
              Pay only for the performance you need with dedicated GPU-backed
              inference plans.
            </p>
          </div>
          <ImgDeComponent
            products={products}
            wrapperClassName="grid gap-space-24 xl:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}
```

```tsx
export default function ImgDeComponent({
  products,
}: {
  products: DEProduct[];
}) {
  return (
    <div className="grid gap-space-24 xl:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="rounded-[24px] border border-[var(--border-default)] bg-[var(--fill-white)] p-space-24"
        >
          <div className="rounded-full border border-[var(--border-strong)] px-space-12 py-space-6 font-paragraph-13 text-[var(--text-1)] inline-flex">
            {product.name}
          </div>
          <ul className="mt-space-24 space-y-space-12">
            {product.detail.map((item) => (
              <li key={item} className="font-paragraph-15 text-[var(--text-2)]">
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/components/DedicatedEndpointPricing.tsx src/app/dedicated-endpoint/components/imgDeComponent.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "refactor: rebuild dedicated endpoint pricing section"
```

### Task 6: Rebuild the FAQ/contact area to match the Figma footer-side layout

**Files:**

- Modify: `src/app/dedicated-endpoint/components/DedicatedEndpointFaq.tsx`
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders the faq section with pricing statement and top faqs", async () => {
  (enterpriseProductList as jest.Mock).mockResolvedValue({ productList: [] });

  const ui = await Page();
  render(ui as ReactNode);

  expect(screen.getByText(/pricing statement/i)).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /pricing & faq/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/top faqs/i)).toBeInTheDocument();
  expect(
    screen.getByText(/how does scaling work during traffic spikes/i),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: FAIL because the FAQ section has not been rebuilt.

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from "next/link";
import { BREVO_BOOK_LINK } from "@/constants/urls";

const FAQ_ITEMS = [
  {
    question: "How does scaling work during traffic spikes?",
    answer:
      "Resources auto-scale based on real-time demand. You're billed only for actual API calls, not reserved capacity.",
  },
  {
    question:
      "Can we migrate from shared API to Dedicated API without code changes?",
    answer:
      "Yes. Update the endpoint URL and keep the existing integration flow intact.",
  },
];

export default function DedicatedEndpointFaq() {
  return (
    <section className="bg-[var(--surface)] px-[32px] pb-[120px]">
      <div className="mx-auto grid max-w-[1248px] gap-[48px] border-t border-[var(--border-default)] pt-[64px] lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-[96px]">
        <div>
          <p className="font-mono-12 uppercase tracking-[0.6px] text-[var(--text-3)]">
            Pricing Statement
          </p>
          <h2 className="mt-space-16 font-display-sm text-[var(--text-1)]">
            Pricing & FAQ
          </h2>
          <p className="mt-space-16 font-paragraph-16 text-[var(--text-3)]">
            Pay only for the performance you need. Share your target throughput
            and latency requirements for a tailored quote.
          </p>
          <Link
            href={BREVO_BOOK_LINK}
            className="mt-space-24 inline-flex h-[44px] items-center rounded-full border border-[var(--border-strong)] bg-[var(--fill-white)] px-space-20 font-paragraph-15 text-[var(--text-1)]"
          >
            Contact Us
          </Link>
        </div>
        <div>
          <h3 className="font-paragraph-18 text-[var(--text-1)]">Top FAQs</h3>
          <div className="mt-space-32 space-y-space-32">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="border-b border-[var(--border-default)] pb-space-24"
              >
                <h4 className="font-paragraph-16 text-[var(--text-1)]">
                  {item.question}
                </h4>
                <p className="mt-space-12 font-paragraph-15 text-[var(--text-3)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dedicated-endpoint/components/DedicatedEndpointFaq.tsx src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "feat: rebuild dedicated endpoint faq section"
```

### Task 7: Verify the full page and do a browser pass

**Files:**

- Modify: `src/app/dedicated-endpoint/page.tsx` (only if verification finds issues)
- Modify: `src/app/dedicated-endpoint/components/*.tsx` (only if verification finds issues)
- Test: `src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx`

- [ ] **Step 1: Run the focused automated test suite**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand`
Expected: PASS

- [ ] **Step 2: Run lint/type verification for touched files**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Start the app and visually inspect `/dedicated-endpoint`**

Run: `pnpm dev`
Expected: Next.js dev server starts successfully and `/dedicated-endpoint` loads with homepage nav/footer, the new hero background, benefits/catalog/pricing/faq sections, and enterprise product cards.

- [ ] **Step 4: Fix any visual or token mismatches found during inspection**

```tsx
// Apply only the minimal className/token adjustments discovered during the browser pass.
// Example shape:
<section className="bg-[var(--surface)] px-[32px] py-[120px] md:py-[160px]">
```

- [ ] **Step 5: Re-run verification after fixes**

Run: `pnpm test src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx --runInBand && pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/dedicated-endpoint/page.tsx src/app/dedicated-endpoint/components src/app/dedicated-endpoint/__tests__/page-mapping.test.tsx
git commit -m "refactor: align dedicated endpoint page with latest figma"
```
