# GPU Pricing Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `/gpus` GPU pricing module into the updated Figma table with the four required columns: `Sample Configuration`, `Usage Example`, `On-Demand`, and `SPOT`.

**Architecture:** Keep the implementation inside `src/app/gpus/components/GpusSpecsSection.tsx` and replace the current placeholder spec-row model with a new local row shape aligned to the updated table columns. Use the earlier semantics from `src/app/gpus/components/GPUPricing.tsx` as the data reference only, without restoring the old Swiper/card/SCSS implementation or introducing live API fetching in this pass.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, project design tokens

---

## File map

### Files to modify

- `src/app/gpus/components/GpusSpecsSection.tsx` — replace the current placeholder table with the updated Figma-aligned pricing table, including new columns, new row shape, no-radius surface, and uppercase headers.

### Files to reference only

- `src/app/gpus/components/GPUPricing.tsx` — reference the old pricing data semantics (`title1`, `title2`, `memory`, `no`, `price`, `no8`, `price8`, `spotPrice`) when composing the new local row shape.
- `src/app/gpus/components/GpusPageContent.tsx` — verify the section remains first in order; do not modify.

## Recommended implementation order

1. Confirm the old pricing semantics to reuse
2. Replace the current placeholder row shape with a new Figma-aligned row shape
3. Rebuild the table markup and styling
4. Verify typecheck and final rendered behavior

---

### Task 1: Confirm source semantics and guardrails

**Files:**

- Verify: `src/app/gpus/components/GpusSpecsSection.tsx`
- Verify: `src/app/gpus/components/GPUPricing.tsx`
- Verify: `src/app/gpus/components/GpusPageContent.tsx`

- [ ] **Step 1: Read the current pricing section file**

Read:

- `src/app/gpus/components/GpusSpecsSection.tsx`

Expected finding:

- the file still contains the interim placeholder table with columns unrelated to the new Figma requirement

- [ ] **Step 2: Read the old pricing source file**

Read:

- `src/app/gpus/components/GPUPricing.tsx`

Expected finding:

- old pricing semantics include `title1`, `title2`, `memory`, `no`, `price`, `no8`, `price8`, and `spotPrice`

- [ ] **Step 3: Read the page-content composition file**

Read:

- `src/app/gpus/components/GpusPageContent.tsx`

Expected finding:

- `GpusSpecsSection` is still the first section inside `GpusPageContent`

- [ ] **Step 4: Lock the implementation guardrails before editing**

Guardrail:

- keep all work inside `GpusSpecsSection.tsx`
- do not import old SCSS or old card/swiper components
- do not add live data fetching
- do not modify `GpusPageContent.tsx`

- [ ] **Step 5: Run a baseline typecheck before changes**

Run: `npm run pre-build-check`
Expected: PASS

---

### Task 2: Replace the local row shape with Figma-aligned table rows

**Files:**

- Modify: `src/app/gpus/components/GpusSpecsSection.tsx`

- [ ] **Step 1: Replace the current `GPU_SPEC_ROWS` structure with a new local row shape**

Update the top of the file so the local data becomes:

```tsx
const GPU_PRICING_ROWS = [
  {
    sampleConfiguration: "RTX 4090 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "A100 SXM4 80GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$1.60/hr · 8x $12.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "RTX 3090 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "RTX 6000 Ada 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
] as const;
```

Notes:

- This row shape intentionally reflects the old pricing semantics in a local, table-friendly form.
- Use the older pricing values shown in the commented examples from `GPUPricing.tsx` as the reference source for this pass.
- Keep `spot` explicitly set to `"—"` until the user requests live spot data integration.

- [ ] **Step 2: Run typecheck after the row-shape replacement**

Run: `npm run pre-build-check`
Expected: PASS

- [ ] **Step 3: Verify the row shape matches the updated spec exactly**

Checklist:

- no `model`, `memory`, `pricing`, or `availability` fields remain
- every row uses only:
  - `sampleConfiguration`
  - `usageExample`
  - `onDemand`
  - `spot`
- `spot` fallback is explicit and consistent across all rows

---

### Task 3: Rebuild the heading block and no-radius table shell

**Files:**

- Modify: `src/app/gpus/components/GpusSpecsSection.tsx`

- [ ] **Step 1: Replace the entire component with the new Figma-aligned structure**

Update the full file to this implementation:

```tsx
const GPU_PRICING_ROWS = [
  {
    sampleConfiguration: "RTX 4090 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "A100 SXM4 80GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$1.60/hr · 8x $12.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "RTX 3090 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
  {
    sampleConfiguration: "RTX 6000 Ada 24GB",
    usageExample: "1x GPU / 8x GPU cluster",
    onDemand: "$0.35/hr · 8x $2.80/hr",
    spot: "—",
  },
] as const;

export default function GpusSpecsSection() {
  return (
    <section className="pt-space-24">
      <div className="max-w-[780px]">
        <div className="border-b border-[var(--border-strong)] pb-[var(--space-8)]">
          <span className="font-mono-14 text-[var(--text-2)]">GPU pricing</span>
        </div>
        <div className="mt-space-24 flex flex-col gap-[var(--space-16)]">
          <h2 className="font-miletus font-heading-h2 text-[var(--text-1)]">
            Find the right GPU for every stage of your workload
          </h2>
          <p className="max-w-[720px] font-miletus font-paragraph-18 text-[var(--text-3)]">
            Compare high-performance GPU options across memory, pricing, and
            availability to choose the best fit for training, fine-tuning, and
            inference.
          </p>
        </div>
      </div>

      <div className="mt-space-48 overflow-x-auto border border-[var(--border-2)] bg-[var(--white)]">
        <table className="w-full min-w-[980px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-[var(--border-2)] bg-[var(--gray-50)] px-[var(--space-24)] py-[var(--space-16)] text-left font-mono-14 uppercase tracking-[0.56px] text-[var(--text-2)]">
                Sample Configuration
              </th>
              <th className="border-b border-[var(--border-2)] bg-[var(--gray-50)] px-[var(--space-24)] py-[var(--space-16)] text-left font-mono-14 uppercase tracking-[0.56px] text-[var(--text-2)]">
                Usage Example
              </th>
              <th className="border-b border-[var(--border-2)] bg-[var(--gray-50)] px-[var(--space-24)] py-[var(--space-16)] text-left font-mono-14 uppercase tracking-[0.56px] text-[var(--text-2)]">
                On-Demand
              </th>
              <th className="border-b border-[var(--border-2)] bg-[var(--gray-50)] px-[var(--space-24)] py-[var(--space-16)] text-left font-mono-14 uppercase tracking-[0.56px] text-[var(--text-2)]">
                SPOT
              </th>
            </tr>
          </thead>
          <tbody>
            {GPU_PRICING_ROWS.map((row, index) => {
              const isLastRow = index === GPU_PRICING_ROWS.length - 1;
              const rowBorderClass = isLastRow
                ? ""
                : "border-b border-[var(--border-2)]";

              return (
                <tr key={row.sampleConfiguration}>
                  <td
                    className={`px-[var(--space-24)] py-[var(--space-20)] font-paragraph-16 text-[var(--text-1)] ${rowBorderClass}`}
                  >
                    {row.sampleConfiguration}
                  </td>
                  <td
                    className={`px-[var(--space-24)] py-[var(--space-20)] font-paragraph-16 text-[var(--text-3)] ${rowBorderClass}`}
                  >
                    {row.usageExample}
                  </td>
                  <td
                    className={`px-[var(--space-24)] py-[var(--space-20)] font-paragraph-16 text-[var(--text-1)] ${rowBorderClass}`}
                  >
                    {row.onDemand}
                  </td>
                  <td
                    className={`px-[var(--space-24)] py-[var(--space-20)] font-paragraph-16 text-[var(--text-1)] ${rowBorderClass}`}
                  >
                    {row.spot}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

This step intentionally does all of the following in one place:

- removes rounded corners from the table surface
- uses uppercase table headers
- replaces placeholder spec columns with the updated pricing columns
- preserves horizontal scrolling using `overflow-x-auto`
- keeps the heading block structure consistent with the existing page

- [ ] **Step 2: Run typecheck after the table rebuild**

Run: `npm run pre-build-check`
Expected: PASS

- [ ] **Step 3: Verify the new column structure manually in code**

Checklist:

- headers are exactly:
  - `Sample Configuration`
  - `Usage Example`
  - `On-Demand`
  - `SPOT`
- all headers are styled uppercase
- table wrapper has no `rounded-*` class
- no old placeholder columns remain anywhere in the file

---

### Task 4: Final verification of scope and rendering intent

**Files:**

- Verify: `src/app/gpus/components/GpusSpecsSection.tsx`
- Verify: `src/app/gpus/components/GpusPageContent.tsx`

- [ ] **Step 1: Verify the section still renders first in page content**

Read:

- `src/app/gpus/components/GpusPageContent.tsx`

Expected:

- `GpusSpecsSection` remains the first rendered middle section

- [ ] **Step 2: Verify responsive behavior in a browser**

Open `/gpus` and confirm:

- the pricing table is shown with no rounded corners
- the heading is still above the table
- desktop shows all 4 columns clearly
- narrow widths use horizontal scrolling instead of collapsing the layout
- `Sample Configuration` reads as the strongest non-price column
- `On-Demand` and `SPOT` read as scan-friendly price columns

- [ ] **Step 3: Run the final typecheck**

Run: `npm run pre-build-check`
Expected: PASS

- [ ] **Step 4: Explicitly confirm what was not changed**

Report:

- `GpusPageContent.tsx` section order unchanged
- no old `GPUPricing` component restored
- no SCSS module reintroduced
- no live API fetch added
- no new interactions added

---

## Spec coverage check

- **Use exact four columns from updated Figma** — covered in Tasks 2 and 3
- **Use old pricing data semantics as the reference source** — covered in Tasks 1 and 2
- **Remove rounded corners** — covered in Task 3 and verified in Task 4
- **Keep table-first layout** — covered in Task 3
- **Keep section in the same page position** — verified in Task 4
- **Tailwind-first + project tokens** — enforced in Task 3 and checked in Task 4
- **Keep horizontal overflow for smaller screens** — implemented in Task 3 and verified in Task 4
- **Avoid old Swiper/card/SCSS/live-fetch implementation** — guarded in Tasks 1 and 4

## Self-review

- No placeholders remain.
- All changed code is shown inline.
- The plan stays within the updated approved scope.
- The row shape and rendered headers match the revised spec terminology exactly.
