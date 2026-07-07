# Console Model Library Redesign

Date: 2026-05-22
Status: Draft for review

## Goal

Build a new console-only model library experience for `/models-console` and
`/models-console/library`.

The website model library at `/models` keeps its current visual implementation.
The console page gets new UI components and a new filtering model, while shared
model logic is extracted into reusable pure functions.

## Inputs

- Feishu PRD: "编号003-模型广场改版PRD-20260513"
- Figma:
  - Card states: `1511:23589`
  - List state: `1480:9988`
  - Sidebar: `1511:26408`
  - Main content area: `1486:19036`
  - Selected filters and empty state: `1511:26034`
  - Recommend placeholder card: `1486:19191`
- Existing route:
  - `src/app/models-console/page.tsx`
  - `src/app/models-console/library/page.tsx`
- Existing shared data hook:
  - `src/hooks/useModelLibrary.ts`

## Scope

In scope:

- Replace the current console model library UI with a new console-specific layout.
- Support both grid/card view and list view with a toggle.
- Add a dynamic facet filtering engine for modality, model series, and features.
- Add Featured section behavior for the default All state.
- Add new console card/list hover states and action buttons.
- Extract reusable model logic into `src/lib/model-library/`.

Out of scope:

- Redesigning the website `/models` page.
- Changing backend ownership of labels, Featured, or New expiration behavior.
- Implementing new backend configuration screens.
- Adding new model data that is not available from the current APIs.

## Route And Data Flow

The route remains:

```text
/models-console
/models-console/library
```

`/models-console/page.tsx` continues to render the library page.

The console page may continue using `getFullLLMModelsWithCache`, which is a
client-friendly wrapper around the local Next API route:

```text
getFullLLMModelsWithCache()
  -> /api/llm-models?filter=chat,embedding,reranker
  -> src/app/api/llm-models/route.ts
  -> getFullLLMModels()
  -> backend model list APIs
```

`getFullLLMModelsWithCache` is used from client components. The real cached
server route is `src/app/api/llm-models/route.ts`.

The existing `useModelLibrary` hook can continue to aggregate LLM and
multimodal data. The new console UI should not reuse its old single-category
filter state as the primary filtering model. It should consume the aggregated
model list and apply the new facet filter engine.

## New File Structure

Console UI components:

```text
src/app/models-console/library/
  page.tsx
  components/
    ConsoleModelLibrary.tsx
    ConsoleModelSidebar.tsx
    ConsoleModelMain.tsx
    ConsoleModelToolbar.tsx
    ConsoleSelectedFilters.tsx
    ConsoleModelCard.tsx
    ConsoleModelList.tsx
    ConsoleModelEmptyState.tsx
    ConsoleRecommendModelCard.tsx
    ConsoleTieredPricingPopover.tsx
  utils/
    consoleModelSections.ts
```

Shared pure model-library logic:

```text
src/lib/model-library/
  facets/
    types.ts
    engine.ts
    bitmaskFacet.ts
    setFacet.ts
    definitions.ts
  capabilities.ts
  badges.ts
  display-format.ts
  pricing.ts
  actions.ts
  sections.ts
```

The `src/lib/model-library/` modules must stay framework-free:

- No React.
- No styling.
- No router hooks.
- No component imports.

They should be easy to test with plain model objects.

## Styling Rules

Follow the project `frontend-engineering` skill and `novita-ui-skill`.

This is a console scene, so:

- Do not use website hero typography or large website title classes.
- Use console-appropriate typography and compact controls.
- Use Novita design tokens for color, spacing, radius, and typography.

Implementation style:

- Prefer Tailwind classes first, as long as they map to the Novita token system.
- Use `.module.scss` only for complex styles or states that are hard to read in
  Tailwind.

Allowed examples:

```tsx
className =
  "bg-[var(--bg-default)] text-[var(--text-1)] border-[var(--border-2)] rounded-4";
```

Avoid:

- Hardcoded hex colors.
- Tailwind default colors outside the Novita token system.
- Bare spacing utilities like `gap-4`, `p-6`, `m-2`.
- Tailwind default radius like `rounded-md` and `rounded-lg`.
- Bare font utilities like `text-sm`, `font-semibold`.
- Direct hand-written SVG paths when a Lucide icon exists.

If `.module.scss` is needed, it should still use tokens:

```scss
.cardFooter {
  background: var(--bg-light);
  border-top: 1px dashed var(--border-2);
  border-radius: var(--space-4);
}
```

## Console Page Layout

The new page is a two-column console layout:

```text
ConsoleModelLibrary
  ├─ ConsoleModelSidebar
  │   ├─ Modality
  │   ├─ Features
  │   └─ Model Series
  └─ ConsoleModelMain
      ├─ ConsoleModelToolbar
      ├─ ConsoleSelectedFilters
      ├─ Featured section
      ├─ Grouped model sections
      └─ Empty state
```

The sidebar is the primary filtering surface. The toolbar owns result count,
sort display, and grid/list toggle.

## Filter State

The console page owns a new filter state:

```ts
type ConsoleModelViewMode = "grid" | "list";

type ConsoleModelFilterState = {
  modalities: string[];
  series: string[];
  features: string[];
};

type ConsoleModelSort = "newest";
```

Default state:

```ts
{
  modalities: [],
  series: [],
  features: []
}
```

An empty filter state represents the All state.

## Dynamic Facet Filtering

Filtering should be configurable and composable, not hardcoded into one large
`switch` statement.

Each filter group is a facet definition. A facet definition describes:

- The facet key.
- The UI label.
- How to read values from a model.
- How multiple selected options match.
- Whether the facet can use bitmask acceleration.

Example:

```ts
type FacetDefinition<TValue> = {
  key: string;
  label: string;
  matchMode: "any" | "all" | "single";
  getValues: (model: AnyModel) => TValue[];
};
```

Console configuration:

```ts
const consoleModelLibraryFacets = [modalityFacet, seriesFacet, featureFacet];
```

Future scenes can reuse the same engine with a different facet list:

```ts
const futurePricingFacets = [
  modalityFacet,
  seriesFacet,
  featureFacet,
  priceRangeFacet,
];
```

## Low-Cost Filtering Algorithm

The filter engine should avoid rebuilding `Set` objects or repeatedly parsing
model fields during every render.

On model-list changes, build lightweight records once:

```ts
type ModelFacetRecord = {
  model: AnyModel;
  modalityMask: number;
  featureMask: number;
  seriesKey: string;
  sortTime: number;
};
```

Think of `modalityMask` and `featureMask` as a compact checklist:

```text
LLM      = 000001
Vision   = 000010
Image    = 000100

Tool Calling = 000001
JSON Schema  = 000010
Reasoning    = 000100
Long Context = 001000
```

If a model is both LLM and Vision, its modality mask is:

```text
000001 | 000010 = 000011
```

At filtering time, compare the precomputed checklist:

```ts
function applyFacetFilters(records, filter) {
  const modalityMask = buildMask(filter.modalities);
  const featureMask = buildMask(filter.features);
  const seriesSet = filter.seriesSet;

  return records.filter((record) => {
    if (modalityMask && (record.modalityMask & modalityMask) === 0) {
      return false;
    }

    if (featureMask && (record.featureMask & featureMask) !== featureMask) {
      return false;
    }

    if (seriesSet.size > 0 && !seriesSet.has(record.seriesKey)) {
      return false;
    }

    return true;
  });
}
```

Matching rules:

- Modality selections use OR within the group.
- Series selections use OR within the group.
- Feature selections use AND within the group.
- Different groups use AND.
- Empty groups do not constrain results.

Example:

```text
User selects:
- Modality: LLM, Vision
- Feature: Tool Calling, Reasoning
- Series: Anthropic, DeepSeek

Show models that:
- are LLM or Vision,
- and support both Tool Calling and Reasoning,
- and belong to Anthropic or DeepSeek.
```

Complexity:

- Build records: `O(n * k)` when models change, where `k` is a small fixed set
  of fields.
- Filter: `O(n)` with a few bit operations and one series lookup per model.
- Memory: `O(n)` for compact records.

This keeps the implementation fast without making UI components understand the
bitmask details.

## Facet Definitions

### Modality

Options include:

- LLM
- Image
- Audio
- Video
- Embedding
- Reranker
- Vision

Values come from:

- `model.type`
- `inputModalities`
- `outputModalities`
- shared helper logic such as `isVisionChatModel`

### Features

Initial options:

- Tool Calling
- JSON Schema
- Reasoning
- Long Context

Values come from:

- `features`
- `context_size`
- modality fields where relevant

Long Context means context size greater than 128K tokens.

### Model Series

Options come from normalized `series`.

Use shared provider normalization so aliases such as `z.ai`, `zai`, and
`zai-org` resolve consistently.

## Field Mapping

Model card/list fields:

- `model_released_at` -> `Model released`
- `platform_release_at` -> `On Novita`
- `labels`, `isNew`, `isHot`, `isFeatured`, `isDiscount` -> badges and Featured
- `features` -> feature facet and capability display
- `context_size` -> Context display
- `max_output_tokens` -> Max Output display
- `is_tiered_billing`, `tiered_billing_configs` -> Tiered pill and popover
- `series` -> Model Series facet and provider display
- `inputModalities`, `outputModalities`, `type` -> Modality facet

`model_released_at` and `platform_release_at` should be added to the model type
and preserved in the raw model transform. If either field is absent, hide that
row rather than rendering placeholder noise.

## Display Formatting

`formatTokenWindow(value)`:

- `value >= 1,048,576`: show M.
- `value >= 1,024`: show K.
- `value < 1,024`: show raw number.
- M keeps one decimal only when needed.
- K rounds to a whole number.

Examples:

- `1024` -> `1K`
- `131072` -> `128K`
- `1048576` -> `1M`
- `1572864` -> `1.5M`

Date display:

- Use concise English month format, such as `Mar 15, 2025`.
- Hide missing date rows.

## Badges

Badge values come from backend data after transformation. The frontend should
not calculate the 14-day New behavior.

The primary card badge shows one item. Priority:

1. Deprecated
2. Discount
3. Hot
4. New

Featured is not a visual badge by default. It controls Featured section
membership.

## Featured Section

Featured appears only in the default All state:

- No modality selected.
- No series selected.
- No feature selected.

Rules:

- Use backend labels/transformed `isFeatured`.
- Show at most five real Featured model cards.
- If there are no Featured models, hide the entire Featured section.
- If there is at least one Featured model, append one
  `ConsoleRecommendModelCard` after the real Featured cards.
- Therefore the section contains at most five model cards plus one recommend
  placeholder card.
- Hide Featured whenever any active filter is present.

The recommend placeholder card follows Figma node `1486:19191`:

- Three mono stats:
  - `200+ Models`
  - `200ms Latency`
  - `99.5% Uptime`
- CTA:
  - `Recommend me a model ->`
- Click target:
  - Existing `DOCS_URL.LLM_RECOMMENDED`

## Main Sections

After Featured, the main content is grouped by model type:

- LLM
- Image
- Audio
- Video
- Embedding
- Reranker
- Vision, if distinct from LLM in the normalized result model

Each section shows count and a `View all` action where appropriate.

When filters are active, render the filtered result set without Featured. The
grouping may still be used if it improves scanning.

## Grid Card

`ConsoleModelCard` is a new component.

Default state:

- Provider/series line.
- Model name.
- Primary badge if available.
- Pricing rows.
- Context and Max Output line.
- Tiered pill if applicable.
- Date footer with `Model released` and `On Novita`.

Hover state:

- The bottom footer switches from date rows to action buttons.
- Buttons:
  - `More`
  - `Playground`
- Card height must not change.
- Hover must not cause layout shift.
- Deprecated or unavailable models may disable or hide `Playground`, based on
  generated action availability.

## List Row

`ConsoleModelList` is a new component.

Default state:

- Compact model identity.
- Capability/modality badges.
- Pricing summary.
- Context and Max Output.
- Release dates.
- Reserved action column.

Hover state:

- Row background uses hover overlay.
- Right action column shows buttons.
- Buttons:
  - `View details`
  - `Playground`
- Row height must not change.
- The action column must not squeeze main text on hover.

Grid and list share action helpers, but not label presentation:

```ts
type ActionPresentation = {
  grid: {
    detailLabel: "More";
    playgroundLabel: "Playground";
  };
  list: {
    detailLabel: "View details";
    playgroundLabel: "Playground";
  };
};
```

## Actions

Use shared helpers:

```ts
getModelDetailHref(model, "console");
getModelPlaygroundHref(model);
getModelActions(model);
```

Expected routing:

- Detail uses the existing console detail route.
- Chat/LLM Playground uses the existing LLM playground route.
- Image/Audio/Video use the existing multimodal playground link when available.
- Embedding/Reranker disable `Playground` unless an existing route supports
  them.

Exact query parameters should be confirmed during implementation by reading the
existing playground routes.

## Toolbar

`ConsoleModelToolbar` includes:

- Result count.
- Sort display/control.
- Grid/List toggle.

Initial sort:

- `Newest`
- Sort by `platform_release_at` descending.
- Missing dates sort after dated models.
- Original rank/order is used as a stable fallback.

Grid/list toggle:

- Current mode has selected background.
- Unselected hover uses overlay hover.
- Use Lucide `LayoutGrid` and `List`.
- Icon buttons need accessible labels and visible focus states.

## Selected Filter Pills

`ConsoleSelectedFilters` renders active filters as pills:

- Brand light background.
- `X` remove affordance.
- `Clear All` text action.

Pills are generated from facet definitions, not hardcoded UI strings, so future
facets can join the same display.

## Empty State

If filtering returns zero models:

- Show `No models match your filters`.
- Show `Recommend me a model` CTA.
- Keep selected pills visible so users can remove filters.
- Include `Clear All`.

## Hover And Interaction Rules

- Hover states must not change card height, row height, or grid track size.
- Interactive elements need pointer cursor and visible focus styles.
- Desktop can use hover. Mobile must still expose actions by tap or visible
  controls.
- Tiered pricing popover can open on click; hover may provide highlight only.
- Prefer stable opacity/background/border transitions over transforms that shift
  layout.

## Tiered Pricing

`ConsoleTieredPricingPopover` receives normalized pricing tiers from
`src/lib/model-library/pricing.ts`.

Card display:

- Show the lowest applicable price in the normal pricing row.
- Show `Tiered` pill when `is_tiered_billing` is true and tier configs exist.

Popover:

- Shows complete tier rows.
- Does not expand the card.
- Handles missing or partial tier data gracefully.

## Error And Loading States

Loading:

- Keep existing loading behavior where possible.
- Use skeletons sized to the final grid/list layout to avoid content jump.

Fetch errors:

- Show a quiet error state with retry if the model list fails.
- Do not crash the page if multimodal config fails; show LLM data if available.

Missing fields:

- Hide optional rows rather than displaying broken placeholders.
- Keep model name, provider, and navigation actions robust.

## Testing And Verification

Unit-level checks for `src/lib/model-library/`:

- Facet mask creation.
- Any/all matching.
- Series normalization.
- Long Context threshold.
- K/M formatting.
- Date formatting.
- Featured section visibility.
- Badge priority.

Manual/browser checks:

- `/models-console/library` renders with grid view.
- Toggle to list view works.
- Sidebar filters combine correctly.
- Selected pills remove individual filters.
- Clear All returns to default All state.
- Featured only appears in default All state.
- Featured hides when no Featured models exist.
- Card hover swaps date footer for `More` and `Playground` without layout shift.
- List row hover shows `View details` and `Playground` without layout shift.
- Empty state appears for no matches.
- Mobile width does not introduce horizontal page scroll.

Build verification:

- Type check.
- Lint for touched files.
- Run Novita UI self-check if available for touched UI files.

## Open Implementation Checks

These are implementation-time checks, not design blockers:

- Confirm exact LLM playground query parameter format.
- Confirm multimodal playground route and model query format.
- Confirm whether Embedding/Reranker should show disabled Playground or hide it.
- Confirm raw API date field shapes for `model_released_at` and
  `platform_release_at`.
