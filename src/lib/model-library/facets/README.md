# Model Library Facets

This folder contains the filter system used by the console model library.

The goal is to keep filtering behavior data-driven. In most cases, adding a new
filter group means adding a new `FacetDefinition` in `definitions.ts`, not
rewriting the filtering engine.

## Files

- `definitions.ts` defines which facet groups exist for the model library.
- `engine.ts` builds per-model facet records, derives sidebar options, and
  applies selected filters.
- `types.ts` contains the shared facet types.
- `bitmaskFacet.ts` handles fixed option groups with bit operations.
- `setFacet.ts` handles dynamic string groups with set matching.

## Data Flow

`ConsoleModelLibrary` wires the pieces together:

1. `buildFacetRecords(allModels, consoleModelLibraryFacets)`
   - Runs every facet's `getValues(model)` against every model.
   - Stores raw `values` for all facets.
   - Stores numeric `bitmasks` for facets with `kind: "bitmask"`.

2. `getFacetOptions(facetRecords, consoleModelLibraryFacets)`
   - Counts available values for each facet.
   - Returns sidebar options shaped as `{ label, value, count }`.
   - Uses static labels from `facet.options` when available.
   - Falls back to the value itself for dynamic facets such as `series`.

3. `applyFacetFilters(facetRecords, consoleModelLibraryFacets, filters)`
   - Applies the user's selected filter state.
   - Different facet groups are combined with AND.
   - Empty facet groups are ignored.
   - Matching inside each group follows the facet's `matchMode`.
   - Returns the matching `model` objects, not facet records.

Search and sorting happen after facet filtering in `ConsoleModelLibrary`.

## Facet Definitions

A facet definition looks like this:

```ts
{
  key: "features",
  label: "Features",
  matchMode: "all",
  kind: "bitmask",
  options: [
    { label: "Tool calling", value: "tool-calling", bit: 1 << 0 },
    { label: "JSON schema", value: "json-schema", bit: 1 << 1 },
  ],
  getValues: getModelCapabilities,
}
```

`key`
: The state key used in `FacetFilterState`. It must match the key used by the
sidebar when toggling values.

`label`
: Human-readable group name. It is mostly metadata today because the sidebar
currently renders its sections explicitly.

`kind`
: Use `"bitmask"` for fixed known options. Use `"set"` for dynamic values such
as model series.

`matchMode`
: Controls how selected values match a model.

`options`
: Required for `bitmask` facets. Optional for `set` facets. When provided, it
also supplies display labels for sidebar options.

`getValues`
: Extracts this facet's values from a model.

## Match Modes

The engine supports three match modes:

- `any`: a model matches if it has at least one selected value.
- `all`: a model matches only if it has every selected value.
- `single`: currently behaves like `any`; it is reserved for UI groups that
  allow only one selected value.

Current model library usage:

- `modalities`: `bitmask + any`
- `series`: `set + any`
- `features`: `bitmask + all`

## Bitmask Facets

Bitmask facets are useful for small, fixed option lists.

Each option gets one bit:

```ts
[
  { label: "LLM", value: "llm", bit: 1 << 0 },
  { label: "Vision", value: "vision", bit: 1 << 1 },
];
```

For each model, `buildFacetRecords` converts values to a mask. For selected
filters, `applyFacetFilters` also converts selected values to a mask.

Then `matchesBitmask` checks the model mask against the selected mask:

- `all`: `(modelMask & selectedMask) === selectedMask`
- `any` / `single`: `(modelMask & selectedMask) !== 0`

## Set Facets

Set facets are useful for dynamic values, such as model series.

They do not need static `options`. `getFacetOptions` discovers available values
from model records and counts them.

`matchesSet` checks arrays with normal set membership:

- `all`: every selected value must exist in the model values.
- `any` / `single`: at least one selected value must exist.

## Adding a New Filter Group

1. Add a `FacetDefinition` in `definitions.ts`.
2. Implement or reuse a `getValues(model)` helper.
3. If the group is fixed, use `kind: "bitmask"` and provide `options`.
4. If the group is dynamic, use `kind: "set"`.
5. Add UI rendering in `ConsoleModelSidebar` if this group should be visible.
6. If needed, update `filters.ts` so the new key has an initial empty array.
7. Add or update tests in `src/lib/model-library/__tests__/facets.test.ts`.

The filtering engine should not need changes for normal facet additions.

## Important Notes

- `applyFacetFilters` does not sort models. Sorting is handled separately in
  `sections.ts` and `ConsoleModelLibrary`.
- `applyFacetFilters` does not search text. Search is applied after facet
  filtering in `ConsoleModelLibrary`.
- Sidebar sections are currently explicit. Adding a facet definition makes it
  available to the engine, but it does not automatically render a new UI
  section.
