# Console Model Card Cache Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `models-console/library` LLM cards so the collapsed card shows `Input`, `Output`, `Cache read`, and `Cache write` when available, while expanded cards append remaining pricing such as `Cache write 1h` and keep tiered rows in the expanded gray section.

**Architecture:** Keep the change isolated to `ConsoleModelCard.tsx` by adding card-local ordering and collapsed/expanded price selection. Reuse existing `PriceLine` data from shared pricing helpers so list-mode and shared pricing semantics remain unchanged.

**Tech Stack:** Next.js, React, TypeScript, Jest, Testing Library

---

### Task 1: Lock the new collapsed/expanded card behavior with failing tests

**Files:**

- Modify: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

- [ ] **Step 1: Write the failing test for collapsed legacy card cache lines**

Add assertions to the existing legacy card test so the collapsed card now expects:

```tsx
expect(screen.getByText("Input")).toBeInTheDocument();
expect(screen.getByText("Output")).toBeInTheDocument();
expect(screen.getByText("Cache read")).toBeInTheDocument();
expect(screen.getByText("Cache write")).toBeInTheDocument();
expect(screen.queryByText("Cache write 1h")).not.toBeInTheDocument();
```

- [ ] **Step 2: Write the failing test for the preserved context row**

In the same legacy card test, keep the context row expectation in collapsed state:

```tsx
expect(screen.getByText("128K Context · 8K Max Output")).toBeInTheDocument();
```

- [ ] **Step 3: Write the failing test for expanded remaining pricing**

After expanding the legacy card, assert that the remaining cache line appears:

```tsx
fireEvent.click(screen.getByRole("button", { name: "Expand model details" }));

expect(screen.getByText("Cache write 1h")).toBeInTheDocument();
```

- [ ] **Step 4: Run the card test to verify it fails for the new collapsed expectations**

Run:

```bash
npm run test:unit -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
```

Expected:

- FAIL
- Failure should indicate `Cache read` and/or `Cache write` are missing in collapsed legacy card state

- [ ] **Step 5: Commit the red test state**

```bash
git add src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
git commit -m "test: cover card default cache pricing behavior"
```

### Task 2: Implement card-local pricing selection

**Files:**

- Modify: `src/app/models-console/library/components/ConsoleModelCard.tsx`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

- [ ] **Step 1: Add a card-local collapsed price ordering helper**

Inside `ConsoleModelCard.tsx`, add a helper that prioritizes legacy card default lines:

```tsx
function getCollapsedCardPriceLines(priceLines: PriceLine[]) {
  const order = ["Text · Input", "Text · Output", "Input", "Output"];
  const collapsedLegacyExtras = ["Cache read", "Cache write"];
  const usedLabels = new Set<string>();

  const orderedLines = [...order, ...collapsedLegacyExtras].flatMap((label) => {
    const line = priceLines.find((item) => item.label === label);
    if (!line) return [];
    usedLabels.add(line.label);
    return [line];
  });

  return orderedLines;
}
```

- [ ] **Step 2: Add an expanded card helper that appends remaining lines after the collapsed lines**

Still in `ConsoleModelCard.tsx`, add a helper that preserves collapsed ordering first, then appends every remaining visible line once:

```tsx
function getExpandedCardPriceLines(
  collapsedLines: PriceLine[],
  expandedLines: PriceLine[],
) {
  const usedKeys = new Set(
    collapsedLines.map((line) => `${line.label}-${line.value}`),
  );

  return [
    ...collapsedLines,
    ...expandedLines.filter((line) => {
      const key = `${line.label}-${line.value}`;
      if (usedKeys.has(key)) return false;
      usedKeys.add(key);
      return true;
    }),
  ];
}
```

- [ ] **Step 3: Wire the helpers into the LLM card rendering flow**

Replace the current `visiblePriceLines` selection with card-local collapsed and expanded sets:

```tsx
const collapsedPriceLines = getCollapsedCardPriceLines(priceLines);
const expandedVisiblePriceLines =
  expandedPriceLines.length > 0
    ? getVisiblePriceLines(expandedPriceLines, true, true)
    : getVisiblePriceLines(priceLines, true);
const visiblePriceLines = tieredExpanded
  ? getExpandedCardPriceLines(collapsedPriceLines, expandedVisiblePriceLines)
  : collapsedPriceLines;
```

Keep:

- `contextText` row unchanged
- `tierRows` rendering unchanged
- `ConsoleTieredPricingPopover` behavior unchanged

- [ ] **Step 4: Keep multimodal card behavior from regressing**

While wiring the helpers, ensure that multimodal cards still keep text summary pricing at the top and append remaining detail lines only when expanded. The implementation should continue to rely on the existing `priceLines` and `expandedPriceLines` sources rather than inventing a second multimodal data path.

- [ ] **Step 5: Run the card test to verify it now passes**

Run:

```bash
npm run test:unit -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
```

Expected:

- PASS
- `Cache read` and `Cache write` visible in collapsed legacy card state
- `Cache write 1h` visible only after expand

- [ ] **Step 6: Commit the implementation**

```bash
git add src/app/models-console/library/components/ConsoleModelCard.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
git commit -m "feat: show cache pricing in collapsed model cards"
```

### Task 3: Run targeted regression checks

**Files:**

- Verify: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
- Verify: `src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`
- Verify: `src/lib/model-library/__tests__/pricing.test.ts`

- [ ] **Step 1: Re-run card and list component tests**

Run:

```bash
npm run test:unit -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx
```

Expected:

- PASS
- Card changes should not regress list behavior

- [ ] **Step 2: Re-run pricing unit tests**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/pricing.test.ts
```

Expected:

- PASS
- Shared pricing helper behavior remains unchanged

- [ ] **Step 3: Run TypeScript verification**

Run:

```bash
npx tsc --noEmit
```

Expected:

- Exit code `0`
- No TypeScript errors

- [ ] **Step 4: Commit verification-safe final state**

```bash
git add src/app/models-console/library/components/ConsoleModelCard.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
git commit -m "test: verify model card pricing regressions"
```
