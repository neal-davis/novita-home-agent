# Console Library Multimodal LLM Pricing Design

**Date:** 2026-06-03

**Scope:** `/models-console/library` only

**Goal:** Update multimodal LLM pricing presentation in the console model library so default card/list summaries continue to look familiar while expanded pricing reveals per-modality key-value rows derived from `multimodal_pricing`.

## Background

The console model library currently renders LLM pricing from shared `LLMLibraryInfo` fields through `getModelPriceLines(model)` in [src/lib/model-library/pricing.ts](/Users/mac/Desktop/workspace/platform/novita-home/src/lib/model-library/pricing.ts). Both grid cards and row list items consume those shared price lines.

This works for normal LLMs, but multimodal LLMs need different behavior:

- Price data should come from `multimodal_pricing` when it exists.
- The default summary should use the `Text` modality rather than generic `Input` / `Output` labels.
- Expanded content should show additional modality-specific keys such as `Image · Input`.
- Empty modality-price pairs should be omitted.
- List mode needs the same expanded price-detail behavior that card mode already supports conceptually.

Pricing page components under `/pricing` are explicitly out of scope for this work.

## Current State

### Shared pricing source

- `getModelPriceLines(model)` returns shared `PriceLine[]` for console card and list rendering.
- For LLMs it currently reads from `model.infos as LLMLibraryInfo`.
- Labels today are plain `Input`, `Output`, `Cache read`, `Cache write`, `Cache write 1h`.

### Console grid cards

- [src/app/models-console/library/components/ConsoleModelCard.tsx](/Users/mac/Desktop/workspace/platform/novita-home/src/app/models-console/library/components/ConsoleModelCard.tsx) renders `visiblePriceLines` from `getModelPriceLines`.
- Cards already have an expandable area, but expansion is effectively meaningful only for tiered pricing.
- Non-tiered multimodal detail lines are not surfaced.

### Console row list

- [src/app/models-console/library/components/ConsoleModelList.tsx](/Users/mac/Desktop/workspace/platform/novita-home/src/app/models-console/library/components/ConsoleModelList.tsx) renders summary text from `getModelPriceLines`.
- Expansion is currently limited to tiered models.
- Multimodal models do not have an expanded detail state.

### Multimodal source data

- `multimodal_pricing` is passed through from API model data into `LLMModelWithStatus`.
- Types allow both snake_case and camelCase:
  - top-level arrays: `input_price` / `inputPrice`, `output_price` / `outputPrice`
  - item fields: `input_token_discount_price` and `inputTokenDiscountPrice`, etc.
- Existing console library pricing logic does not normalize these fields.

## Requirements

### In scope

1. Use `multimodal_pricing` as the pricing source for multimodal LLMs in `/models-console/library`.
2. Keep default grid and row layouts consistent with today’s console library behavior.
3. Replace generic summary labels for multimodal LLMs with `Text`-prefixed labels from `multimodal_pricing`.
4. Add expanded multimodal pricing details to both grid cards and row list items.
5. Show modality-specific keys independently:
   - `Text · Input`
   - `Text · Output`
   - `Image · Input`
   - `Audio · Input`
   - `Text · Cache Read`
6. Omit empty keys entirely.
7. Preserve existing tiered pricing behavior.

### Out of scope

- `/pricing` route pricing tables
- model detail pricing table redesign
- changing normal LLM / embedding / reranker pricing behavior
- backend API shape changes

## Proposed Approach

### 1. Add a multimodal pricing normalization adapter

Create a shared utility in the model-library pricing layer that converts `multimodal_pricing` into a flat list of normalized price entries.

Each normalized entry should capture:

- `modality`: `text | image | audio | video`
- `kind`: `input | output | cache-read | cache-write | cache-write-1h`
- `label`: display label such as `Text · Input`
- `value`
- `originalValue`
- `discounted`
- `summaryEligible`
- `detailEligible`

This utility must:

- support both snake_case and camelCase source fields
- split combined modality arrays into independent modality buckets
- filter out missing or empty price values
- maintain stable ordering

### 2. Ordering rules

Normalized entries should sort by:

1. modality order: `Text`, `Image`, `Audio`, `Video`
2. price kind order:
   - `Input`
   - `Output`
   - `Cache Read`
   - `Cache Write`
   - `Cache Write 1h`

This keeps summary and detail rendering deterministic across card and list mode.

### 3. Summary rules for default state

When a model has valid `multimodal_pricing`, the summary layer should use only `Text` modality entries.

Examples:

- `Text · Input`
- `Text · Output`
- `Text · Cache Read`
- `Text · Cache Write`
- `Text · Cache Write 1h`

This preserves the existing “few top-level price rows” structure while swapping in modality-aware labels.

If `Text · Output` or any other `Text` entry is absent, it should be omitted rather than replaced with placeholder text.

Non-price metadata such as context, badges, tags, release date, and action buttons remain unchanged.

### 4. Detail rules for expanded state

Expanded multimodal detail should include all normalized entries that are not already shown only as summary context.

Examples:

- `Text · Input`
- `Text · Output`
- `Image · Input`
- `Image · Output`
- `Audio · Input`
- `Text · Cache Read`

No placeholder rows should be rendered for missing entries.

The detail area should use the same normalized data source in both grid card and row list mode.

### 5. Expansion behavior in console library

#### Grid cards

- Keep current card expansion behavior.
- Tiered models continue to use tiered rows.
- Multimodal models gain a non-tiered expanded detail section driven by normalized multimodal entries.
- If a multimodal model has no detail-only entries beyond the summary set, expansion can still reveal the full list including `Text` entries for consistency.

#### Row list

- Extend expansion beyond tiered pricing.
- A row should become expandable when either:
  - tiered pricing rows exist, or
  - multimodal detail entries exist
- Tiered rows keep the current expanded layout.
- Multimodal rows render a compact key-value detail block using the normalized entries.

Expansion should remain keyboard accessible and preserve existing action-button behavior.

## Data Interpretation Rules

### Multimodal source precedence

For multimodal LLM display in console library:

- if `multimodal_pricing` exists and yields normalized entries, use it as the source of truth
- do not synthesize multimodal summary/detail lines from top-level `input_pricing`, `output_pricing`, or cache fields

This includes `Text` modality. `Text` should be read from `multimodal_pricing`, not inferred from legacy top-level LLM pricing fields.

### Combined modality inputs

If a source row contains multiple modalities, such as `["text", "image"]`, the adapter should emit independent entries for each modality.

Example:

- source item with `modals: ["text", "image"]` and input price
- emits:
  - `Text · Input`
  - `Image · Input`

This matches the desired UX of independent keys rather than grouped labels such as `Text, Image · Input`.

### Empty handling

Treat these as empty and omit them:

- `undefined`
- `null`
- empty string
- missing field

Valid zero values should still render if the API intentionally returns zero-priced entries.

## File Impact

### New

- `src/lib/model-library/multimodal-pricing.ts`
  - normalization helpers
  - summary/detail derivation helpers

### Modify

- `src/lib/model-library/pricing.ts`
  - integrate multimodal summary lines into `getModelPriceLines`
- `src/app/models-console/library/components/ConsoleModelCard.tsx`
  - render multimodal expanded details for grid cards
- `src/app/models-console/library/components/ConsoleModelList.tsx`
  - allow multimodal rows to expand
  - render multimodal expanded details in list mode
- `src/types/models.ts`
  - only if needed for stricter shared helper types

### Tests

- new unit tests for multimodal normalization utility
- updated pricing tests for `getModelPriceLines`
- console library component tests covering grid and row multimodal rendering

## Rendering Shape

### Summary

Summary remains compact and familiar.

Grid card example:

- `Text · Input`
- `Text · Output`
- `Text · Cache Read`

Row list example:

- `Text · Input $0.12/Mt · Text · Output $0.48/Mt · 128K Context · 8K Max Output`

### Expanded detail

Expanded detail uses flat key-value rows, not a matrix.

Example:

- `Text · Input` → `$0.12/Mt`
- `Text · Output` → `$0.48/Mt`
- `Image · Input` → `$1.20/Mt`
- `Audio · Input` → `$0.80/Mt`
- `Text · Cache Read` → `$0.03/Mt`

Discount styling should follow existing `PriceLine` conventions using `originalValue` and `discounted`.

## Error Handling

- If `multimodal_pricing` exists but normalizes to no valid entries, fall back to existing `LLMLibraryInfo` pricing lines.
- If only some modality fields are valid, render only those valid entries.
- If card/list expansion has no tiered rows and no multimodal detail rows, preserve non-expandable behavior.

## Testing Plan

### Unit tests

Add focused tests for the normalization utility covering:

- snake_case top-level fields
- camelCase top-level fields
- snake_case item fields
- camelCase item fields
- combined modalities splitting into independent keys
- empty-value filtering
- zero-value retention
- summary ordering
- detail ordering

### Pricing tests

Add or extend tests in the model-library pricing suite to verify:

- normal LLM pricing remains unchanged
- multimodal LLM pricing summary uses `Text · ...` labels
- multimodal summary falls back to legacy pricing when normalization yields no valid entries

### Component tests

Add tests for console library components to verify:

- grid card default state shows `Text · Input` and `Text · Output`
- row list default state shows `Text`-prefixed summary labels
- multimodal grid card expansion renders additional modality keys
- multimodal row expansion renders additional modality keys
- tiered expansion remains unchanged

## Risks

### Shared pricing regression

Because `getModelPriceLines` is shared by both console card and list, careless changes could regress normal LLM rendering. Mitigation: keep multimodal path additive and guard it behind successful normalization.

### Mixed expansion logic

List rows currently expand only for tiered models. Adding multimodal expansion must not interfere with hover actions, keyboard handling, or tiered behavior. Mitigation: treat “expandable” as a derived capability instead of assuming it means tiered.

### Source inconsistency

`multimodal_pricing` may arrive in different naming conventions. Mitigation: normalize both top-level arrays and item-level fields in one shared adapter.

## Acceptance Criteria

1. On `/models-console/library`, multimodal LLM default pricing summaries use `Text · ...` labels sourced from `multimodal_pricing`.
2. Existing default card/list structure for non-price metadata remains unchanged.
3. Grid cards can expand to show modality-specific detail lines for multimodal LLMs.
4. Row list items can expand to show modality-specific detail lines for multimodal LLMs.
5. Empty modality-price pairs are omitted.
6. Combined modality source rows are displayed as independent modality keys.
7. Tiered pricing behavior remains unchanged.
8. Pricing page and model detail pricing components are unaffected.
