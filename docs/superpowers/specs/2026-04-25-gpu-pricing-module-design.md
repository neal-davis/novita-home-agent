# 2026-04-25 /gpus GPU pricing module redesign

## Goal

Rebuild the GPU pricing module on the `/gpus` page to match Figma node `478:26082`, using a table-first layout with the exact four columns required by the updated design:

- `Sample Configuration`
- `Usage Example`
- `On-Demand`
- `SPOT`

The implementation should follow the repository's FE skill and design-token conventions and use the earlier GPU pricing data semantics as the reference source.

## Scope

- Redesign `src/app/gpus/components/GpusSpecsSection.tsx`
- Replace the current four-column table structure with the updated Figma column model
- Remove the rounded card treatment from the table surface
- Rebuild the table rows using data semantics derived from the old `src/app/gpus/components/GPUPricing.tsx`
- Keep the section in the same position inside `GpusPageContent`
- Keep the implementation Tailwind-first and token-driven

## Out of scope

- Restoring the old `GPUPricing` Swiper/card UI
- Reusing the old SCSS module implementation
- Adding live API fetching to the new pricing section in this pass
- Reordering sections in `src/app/gpus/components/GpusPageContent.tsx`
- Adding sorting, filtering, tabs, or any new interaction
- Converting the table into a card list on mobile

## Target file

### `src/app/gpus/components/GpusSpecsSection.tsx`

This file remains the single owner of:

- section label, title, and subtitle
- the local table row shape used by the new pricing table
- the table markup and visual styling
- responsive overflow behavior

No shared pricing abstraction is needed for this pass.

## Data strategy

The new table should not keep the previous placeholder columns (`GPU model`, `Memory`, `Pricing`, `Availability`).

Instead, the section should define rows that reflect the earlier pricing data semantics from `src/app/gpus/components/GPUPricing.tsx`, where products were represented using fields such as:

- `title1`
- `title2`
- `memory`
- `no`
- `price`
- `no8`
- `price8`
- `spotPrice`

The new row shape should be organized around the updated table columns.

## Column mapping

### `Sample Configuration`

This column is the strongest identity column.

Recommended content:

- GPU product name + memory in one concise expression

Examples of the intended structure:

- `RTX 4090 24GB`
- `A100 SXM4 80GB`

This column should visually read as the most important non-price information in the row.

### `Usage Example`

This column should be derived from the earlier quantity/configuration semantics (`no`, `no8`) rather than invented copy.

The purpose is to show a representative deployment/configuration example in short form.

Recommended direction:

- use concise expressions built from the old quantity semantics
- avoid marketing copy paragraphs
- keep this column explanatory but secondary

Examples of acceptable structure:

- `1x GPU / 8x GPU cluster`
- `1x for single-node workloads / 8x for scale-out jobs`

Implementation can choose the shorter form if the Figma cell is visually compact.

### `On-Demand`

This column should use the old on-demand pricing semantics.

Recommended direction:

- use `price` as the primary value
- include `price8` only if the final cell layout still matches the Figma density
- do not inflate the content into a complex pricing widget

This column should remain price-focused and easy to scan.

### `SPOT`

This column should use `spotPrice` when present.

If a spot price is unavailable, the implementation must use a clear, lightweight fallback such as:

- `—`
- or `Not available`

The fallback must be explicit and consistent across rows.

## Visual structure

### Heading block

The heading block remains above the table, but the table below it is now a more literal pricing table rather than a generic spec grid.

The heading still contains:

- top label
- main heading
- supporting description

The heading copy can stay aligned with the existing module unless the user later requests copy changes.

### Table surface

The updated Figma direction removes the rounded card feel.

Requirements:

- no rounded corners on the table surface
- token-driven border and divider treatment
- table remains a clean surface integrated with the page instead of a floating card
- desktop-first table layout with horizontal overflow for narrower widths

### Header row

The header row should reflect the user's latest instruction that the table headers are uppercase.

Requirements:

- all four headers styled as uppercase
- muted but clear hierarchy
- consistent cell padding and alignment
- no decorative treatment that conflicts with the v5 page language

### Body rows

The row hierarchy should follow the new column logic:

- `Sample Configuration` is the strongest informational cell
- `Usage Example` is explanatory and secondary
- `On-Demand` and `SPOT` are price-driven scan columns
- row dividers should be visible but restrained

## Responsive behavior

The responsive strategy remains conservative:

- **Desktop:** all four columns shown in a normal table layout
- **Tablet / mobile:** preserve horizontal scrolling instead of changing the information model
- **Heading block:** stays stacked above the table

The goal is to preserve both the Figma column structure and readability.

## Styling strategy

Follow repository conventions strictly:

- use Tailwind utilities first for spacing, layout, overflow, typography helpers, and alignment
- use project design tokens for semantic colors, borders, backgrounds, and text hierarchy
- avoid hardcoded hex values
- avoid generic Tailwind grayscale classes when a project token applies
- do not introduce a new SCSS module

## Implementation approach

Recommended approach:

- keep the section in `GpusSpecsSection.tsx`
- replace the current local data shape with a new row shape aligned to the four Figma columns
- use the old `GPUPricing.tsx` semantics as the source reference for row composition
- do not import the old SCSS/card/swiper implementation into the new section

Why this approach:

- preserves the v5 page architecture
- keeps the new UI clean and focused
- reuses the useful meaning from the old pricing data without dragging legacy structure back in
- avoids unnecessary abstraction and API coupling in this pass

## Verification

Implementation should be considered correct only after checking:

- the section still renders in the first position inside `GpusPageContent`
- the table has no rounded corners
- the four headers are exactly:
  - `Sample Configuration`
  - `Usage Example`
  - `On-Demand`
  - `SPOT`
- the rendered header styling is uppercase
- the row data reflects the earlier pricing semantics rather than the old placeholder spec columns
- the section remains readable on smaller screens with horizontal overflow
- styling uses Tailwind + project tokens instead of hardcoded colors or legacy SCSS

## Risks / notes

- This pass uses earlier pricing data semantics as a reference source, not the entire old runtime implementation.
- If the user later wants the table to be driven by live market-product API data, that should be handled as a separate scope expansion.
- `Usage Example` is the most interpretation-sensitive column, so the implementation plan should pin one exact formatting rule and use it consistently.

## Recommended next step

After approval, write an updated implementation plan for `GpusSpecsSection.tsx` and replace the current pricing-table implementation with the new Figma-aligned structure.
