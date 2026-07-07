# Console Library List/Card Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `models-console/library` list and card behaviors for multimodal and tiered pricing while fixing the related spacing, expansion, and sidebar scrollbar issues.

**Architecture:** Keep `ConsoleModelCard` and `ConsoleModelList` as separate renderers, but introduce small shared pricing/expansion helpers in the model-library pricing layer so both views use the same decision rules for expand affordances and labels. Apply layout and interaction fixes locally in the library components to avoid broad regressions.

**Tech Stack:** Next.js, React, TypeScript, Testing Library, SCSS modules, Tailwind utility classes

---

### Task 1: Lock the new list/card behavior with tests

**Files:**

- Modify: `src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`
- Modify: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

- [ ] **Step 1: Write the failing list-mode tests**

Add assertions that cover:

```tsx
expect(screen.getByRole("button", { name: "Multimodal" })).toBeInTheDocument();
expect(screen.getByText("Text · Input")).toBeInTheDocument();
expect(screen.getByText("Text · Output")).toBeInTheDocument();
expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();
```

And add a click sequence proving expanded content does not collapse when the expanded details region itself is clicked.

- [ ] **Step 2: Run the list test file to verify the new expectations fail**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`
Expected: FAIL because the current list view still shows the old expand label/behavior.

- [ ] **Step 3: Write the failing card-mode tests**

Add assertions that cover:

```tsx
expect(screen.getByRole("button", { name: "Multimodal" })).toBeInTheDocument();
expect(
  screen.queryByRole("button", { name: "Tiered" }),
).not.toBeInTheDocument();
```

while keeping the existing tiered-row test that still expects `Tiered`.

- [ ] **Step 4: Run the card test file to verify the new expectations fail**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
Expected: FAIL because the current card view still uses the old tiered-only label logic.

### Task 2: Implement shared multimodal/tiered decision helpers

**Files:**

- Modify: `src/lib/model-library/pricing.ts`

- [ ] **Step 1: Add helper tests through the component suites first**

Do not create a new unit test file unless needed. Use the failing component tests from Task 1 as the red step for these helpers.

- [ ] **Step 2: Add minimal helper exports in the pricing layer**

Implement small helpers shaped like:

```ts
export function getModelExpandLabel(
  model: AnyModel,
): "Tiered" | "Multimodal" | null;
export function getListSummaryPriceLines(model: AnyModel): PriceLine[];
export function getListExpandedPriceLines(model: AnyModel): PriceLine[];
```

Rules:

- Tiered LLMs return `Tiered`
- Non-tiered multimodal LLMs return `Multimodal`
- List summary for multimodal LLMs keeps only `Text · Input`, `Text · Output`, `Text · Cache Read`, `Text · Cache Write`, `Text · Cache Write 1h`
- List expanded pricing appends non-text modalities while preserving prefixed labels

- [ ] **Step 3: Re-run the targeted list/card tests**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
Expected: Still FAIL until the components adopt the new helpers.

### Task 3: Wire the new behavior into list and card renderers

**Files:**

- Modify: `src/app/models-console/library/components/ConsoleModelList.tsx`
- Modify: `src/app/models-console/library/components/ConsoleModelCard.tsx`

- [ ] **Step 1: Update the list renderer**

Implement:

- shared expand label logic
- multimodal summary/expanded price split only in list mode
- explicit expand-button-only collapse behavior
- no collapse when clicking inside expanded detail content

- [ ] **Step 2: Update the card renderer**

Implement:

- shared expand label logic
- keep current card pricing layout
- only rename the non-tiered multimodal affordance from `Tiered` to `Multimodal`

- [ ] **Step 3: Run targeted tests**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
Expected: PASS

### Task 4: Apply the layout polish fixes

**Files:**

- Modify: `src/app/models-console/library/components/ConsoleModelSidebar.tsx`
- Modify: `src/app/models-console/library/components/ConsoleModelMain.tsx`
- Modify: `src/app/models-console/library/page.module.scss`

- [ ] **Step 1: Remove excess section-title spacing**

Adjust the section header/container spacing so category titles such as `LLM` and `Video` sit flush with their card grids.

- [ ] **Step 2: Make the Model Series list show a persistent scrollbar region**

Update the sidebar scroll container classes so it uses a stable vertical scrollbar region rather than hover-only visibility.

- [ ] **Step 3: Sanity-check affected component tests**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
Expected: PASS

### Task 5: Final verification

**Files:**

- Verify only

- [ ] **Step 1: Run the targeted library tests**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
Expected: PASS

- [ ] **Step 2: Run type checking**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Review the diff for scope**

Run: `git diff -- src/lib/model-library/pricing.ts src/app/models-console/library/components`
Expected: Only the intended pricing, interaction, and layout files changed.
