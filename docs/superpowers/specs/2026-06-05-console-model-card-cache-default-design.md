# Console Model Card Cache Default Design

## Summary

Adjust the `models-console/library` card view pricing presentation for LLM cards only.

The card should expose more cache pricing information in the default collapsed state while preserving the existing context row and existing list behavior.

## Scope

In scope:

- `ConsoleModelCard` default collapsed pricing layout
- `ConsoleModelCard` expanded pricing layout
- Tiered pricing placement inside the expanded gray section
- Card-focused unit test updates

Out of scope:

- `ConsoleModelList` behavior
- Shared list pricing rules
- Badge logic
- Filtering, tabs, or routing behavior

## Current Behavior

For LLM cards:

- The collapsed card shows summary price lines derived from `Input` / `Output` or `Text · Input` / `Text · Output`
- The context row remains visible below the price area
- Expanded cards append additional pricing items such as cache lines
- Tiered rows render in the expanded gray area

This means cache pricing is mostly hidden until expansion.

## Desired Behavior

### Collapsed Card

For non-tiered legacy LLM pricing, the collapsed card should display these price lines when available, in this priority order:

1. `Input`
2. `Output`
3. `Cache read`
4. `Cache write`

The existing context row should remain unchanged:

- Keep `Context · Max Output` visible below the price lines
- Do not move it into the expanded state

If some of the above fields are missing, render only the available ones in the same priority order.

### Expanded Card

When the card expands:

- Keep the collapsed/default lines visible in the same price area
- Insert the remaining available pricing lines after the default lines
- This includes items such as `Cache write 1h` and any other existing unrendered price lines

Expanded behavior should preserve the current multimodal expansion pattern unless a line-ordering adjustment is needed to keep default text pricing first.

### Tiered Pricing

Tiered pricing should not be promoted into the collapsed default price area.

For tiered cards:

- Tiered details remain in the expanded gray section
- Existing tiered visual treatment stays intact

## Implementation Approach

Use card-local display composition inside `ConsoleModelCard.tsx`.

Recommended approach:

- Keep `getModelPriceLines` and other shared pricing helpers unchanged unless a tiny helper extraction becomes necessary
- Add card-local ordering/filtering for collapsed vs expanded card lines
- Reuse existing `PriceLine` data rather than reshaping upstream pricing data

This keeps the change isolated and avoids altering list-mode behavior that has recently been stabilized.

## Rendering Rules

### Legacy LLM

Collapsed:

- Show `Input`, `Output`, `Cache read`, `Cache write` when present

Expanded:

- Show collapsed lines first
- Then append remaining lines such as `Cache write 1h`

### Multimodal LLM

Collapsed:

- Keep current card multimodal summary behavior unless cache exposure is already available through text summary lines

Expanded:

- Preserve current multimodal expansion behavior
- Do not regress `Multimodal` affordance behavior

Note:

- This change is primarily targeted at legacy LLM card presentation
- Multimodal card behavior should only change if required by shared card-local ordering code

## Testing

Update card tests to cover:

- Collapsed legacy LLM card shows `Cache read`
- Collapsed legacy LLM card shows `Cache write`
- Collapsed legacy LLM card still shows `Input` and `Output`
- Expanded legacy LLM card additionally shows `Cache write 1h`
- Context row remains visible in collapsed state
- Tiered card still keeps tiered content in the expanded gray area

## Risks

- Over-generalizing card display logic could unintentionally affect multimodal cards
- Moving rules into shared helpers could accidentally alter list behavior

## Decision

Implement the change in `ConsoleModelCard.tsx` only, with test-first coverage in `ConsoleModelCard.test.tsx`.
