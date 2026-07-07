# Console Model Library Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new console-only model library with dynamic facet filtering, grid/list views, Featured behavior, and new console card/list components.

**Architecture:** Keep `/models-console` and `/models-console/library` as the entry points. Extract reusable model-library logic into `src/lib/model-library/` as pure functions, then build new console UI components under `src/app/models-console/library/components/` that consume normalized view models. Existing website `/models` UI remains visually unchanged.

**Tech Stack:** Next.js App Router, React 18, TypeScript, Tailwind CSS with Novita design tokens, Jest, lucide-react, existing shadcn/project UI primitives.

---

## File Structure

Create pure model-library logic:

```text
src/lib/model-library/
  actions.ts
  badges.ts
  capabilities.ts
  display-format.ts
  pricing.ts
  sections.ts
  facets/
    bitmaskFacet.ts
    definitions.ts
    engine.ts
    setFacet.ts
    types.ts
  __tests__/
    actions.test.ts
    badges.test.ts
    display-format.test.ts
    facets.test.ts
    pricing.test.ts
    sections.test.ts
```

Modify types and transform:

```text
src/types/models.ts
src/lib/utils/models.ts
```

Create console UI:

```text
src/app/models-console/library/
  page.tsx
  components/
    ConsoleModelCard.tsx
    ConsoleModelEmptyState.tsx
    ConsoleModelLibrary.tsx
    ConsoleModelList.tsx
    ConsoleModelMain.tsx
    ConsoleModelSidebar.tsx
    ConsoleModelToolbar.tsx
    ConsoleRecommendModelCard.tsx
    ConsoleSelectedFilters.tsx
    ConsoleTieredPricingPopover.tsx
  utils/
    consoleModelSections.ts
```

Use Tailwind token classes first. Add `.module.scss` only if a complex hover
or background state becomes unreadable in Tailwind.

Do not commit any implementation changes. The user wants to inspect diff.

---

### Task 1: Add Date Fields To Model Type And Transform

**Files:**

- Modify: `src/types/models.ts`
- Modify: `src/lib/utils/models.ts`
- Test: `src/lib/model-library/__tests__/display-format.test.ts`

- [ ] **Step 1: Write a failing date-format test**

Create `src/lib/model-library/__tests__/display-format.test.ts`:

```ts
import { formatModelDate, formatTokenWindow } from "../display-format";

describe("model-library display formatting", () => {
  it("formats token windows with K and M units", () => {
    expect(formatTokenWindow(512)).toBe("512");
    expect(formatTokenWindow(1024)).toBe("1K");
    expect(formatTokenWindow(131072)).toBe("128K");
    expect(formatTokenWindow(1048576)).toBe("1M");
    expect(formatTokenWindow(1572864)).toBe("1.5M");
  });

  it("formats model release dates for display", () => {
    expect(formatModelDate("2026-05-13T00:00:00Z")).toBe("May 13, 2026");
    expect(formatModelDate(1779418569)).toBe("May 22, 2026");
    expect(formatModelDate(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/display-format.test.ts
```

Expected: FAIL because `src/lib/model-library/display-format.ts` does not exist.

- [ ] **Step 3: Add display-format implementation**

Create `src/lib/model-library/display-format.ts`:

```ts
const TOKENS_PER_K = 1024;
const TOKENS_PER_M = TOKENS_PER_K * TOKENS_PER_K;

export function formatTokenWindow(value?: number | string | null): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return "-";
  }

  if (numericValue >= TOKENS_PER_M) {
    const millions = numericValue / TOKENS_PER_M;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toFixed(1).replace(/\.0$/, "");
    return `${formatted}M`;
  }

  if (numericValue >= TOKENS_PER_K) {
    return `${Math.round(numericValue / TOKENS_PER_K)}K`;
  }

  return String(Math.round(numericValue));
}

export function formatModelDate(value?: string | number | null): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date =
    typeof value === "number"
      ? new Date(value < 10_000_000_000 ? value * 1000 : value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
```

- [ ] **Step 4: Add model date fields to types and transform**

Modify `src/types/models.ts` `LLMModel`:

```ts
  model_released_at?: string | number | null | undefined;
  platform_release_at?: string | number | null | undefined;
```

Add these fields in `src/lib/utils/models.ts` inside the `model` object:

```ts
    model_released_at: rawModel.model_released_at,
    platform_release_at: rawModel.platform_release_at,
```

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/display-format.test.ts
```

Expected: PASS.

---

### Task 2: Extract Badges And Capability Logic

**Files:**

- Create: `src/lib/model-library/badges.ts`
- Create: `src/lib/model-library/capabilities.ts`
- Test: `src/lib/model-library/__tests__/badges.test.ts`

- [ ] **Step 1: Write failing badge and capability tests**

Create `src/lib/model-library/__tests__/badges.test.ts`:

```ts
import {
  ModelLabelMap,
  ModelType,
  type LLMModelWithStatus,
} from "@/types/models";
import { getModelCapabilities } from "../capabilities";
import { getPrimaryModelBadge, isModelFeatured } from "../badges";

function createModel(
  overrides: Partial<LLMModelWithStatus>,
): LLMModelWithStatus {
  return {
    id: "model-1",
    name: "model-1",
    displayName: "Model 1",
    type: ModelType.Chat,
    context_size: 131072,
    description: "",
    input_token_price_per_m: 0,
    input_token_price_per_m_toString: "0",
    output_token_price_per_m: 0,
    output_token_price_per_m_toString: "0",
    features: [],
    tags: [],
    infos: {
      inputPricing: "$0/Mt",
      outputPricing: "$0/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    ...overrides,
  };
}

describe("model-library badges and capabilities", () => {
  it("uses backend-derived badge priority", () => {
    expect(getPrimaryModelBadge(createModel({ isNew: true }))).toEqual({
      label: "New",
      kind: "new",
    });
    expect(
      getPrimaryModelBadge(
        createModel({
          isNew: true,
          isHot: true,
          isDiscount: true,
          discount: 0.9,
        }),
      ),
    ).toEqual({ label: "10%", kind: "discount" });
  });

  it("detects featured from transformed field or labels", () => {
    expect(isModelFeatured(createModel({ isFeatured: true }))).toBe(true);
    expect(
      isModelFeatured(
        createModel({
          labels: [
            { key: ModelLabelMap.Filter, value: ModelLabelMap.Featured },
          ],
        }),
      ),
    ).toBe(true);
  });

  it("detects console feature facets", () => {
    const capabilities = getModelCapabilities(
      createModel({
        context_size: 262144,
        features: ["function-calling", "structured-outputs", "reasoning"],
      }),
    );

    expect(capabilities).toEqual(
      expect.arrayContaining([
        "tool-calling",
        "json-schema",
        "reasoning",
        "long-context",
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/badges.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Add capability helpers**

Create `src/lib/model-library/capabilities.ts`:

```ts
import {
  LLMModelFeatures,
  LLMModelModality,
  ModelType,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

export type AnyModel = LLMModelWithStatus | MediaModel;

export type ConsoleModelFeature =
  | "tool-calling"
  | "json-schema"
  | "reasoning"
  | "long-context"
  | "serverless";

export type ConsoleModelModality =
  | "llm"
  | "image"
  | "audio"
  | "video"
  | "embedding"
  | "reranker"
  | "vision";

function asLowerArray(values?: string[] | null): string[] {
  return Array.isArray(values)
    ? values.map((item) => String(item).toLowerCase())
    : [];
}

function hasModality(
  model: LLMModelWithStatus,
  field: "inputModalities" | "outputModalities",
  modality: LLMModelModality,
) {
  return model[field]?.some((item) => String(item).toLowerCase() === modality);
}

export function isVisionModel(model: AnyModel): boolean {
  if (model.type !== ModelType.Chat) {
    return model.type === ModelType.Vision;
  }

  return (
    hasModality(model, "inputModalities", LLMModelModality.Image) ||
    hasModality(model, "inputModalities", LLMModelModality.Video) ||
    hasModality(model, "outputModalities", LLMModelModality.Image) ||
    hasModality(model, "outputModalities", LLMModelModality.Video)
  );
}

export function getModelModalities(model: AnyModel): ConsoleModelModality[] {
  const modalities: ConsoleModelModality[] = [];

  if (model.type === ModelType.Chat) modalities.push("llm");
  if (model.type === ModelType.Images) modalities.push("image");
  if (model.type === ModelType.Audio) modalities.push("audio");
  if (model.type === ModelType.Video) modalities.push("video");
  if (model.type === ModelType.Embedding) modalities.push("embedding");
  if (model.type === ModelType.Reranker) modalities.push("reranker");
  if (isVisionModel(model)) modalities.push("vision");

  return modalities;
}

export function getModelCapabilities(model: AnyModel): ConsoleModelFeature[] {
  if (!("features" in model)) {
    return [];
  }

  const features = asLowerArray(model.features);
  const result: ConsoleModelFeature[] = [];

  if (features.includes(LLMModelFeatures.FunctionCalling)) {
    result.push("tool-calling");
  }
  if (features.includes(LLMModelFeatures.StructuredOutputs)) {
    result.push("json-schema");
  }
  if (features.includes(LLMModelFeatures.Reasoning)) {
    result.push("reasoning");
  }
  if (features.includes("serverless")) {
    result.push("serverless");
  }
  if (Number(model.context_size) > 128 * 1024) {
    result.push("long-context");
  }

  return result;
}
```

- [ ] **Step 4: Add badge helpers**

Create `src/lib/model-library/badges.ts`:

```ts
import {
  LLMModelStatus,
  ModelLabelMap,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

type AnyModel = LLMModelWithStatus | MediaModel;

export type ModelBadge =
  | { label: "Deprecated"; kind: "deprecated" }
  | { label: string; kind: "discount" }
  | { label: "Hot"; kind: "hot" }
  | { label: "New"; kind: "new" };

export function getPrimaryModelBadge(model: AnyModel): ModelBadge | null {
  if ("status" in model && model.status === LLMModelStatus.Deprecated) {
    return { label: "Deprecated", kind: "deprecated" };
  }

  if ("isDiscount" in model && model.isDiscount) {
    const discount = model.discount;
    if (discount && discount > 0 && discount < 1) {
      return {
        label: `${Math.round((1 - discount) * 100)}%`,
        kind: "discount",
      };
    }
    return { label: "Discount", kind: "discount" };
  }

  if ("isHot" in model && model.isHot) {
    return { label: "Hot", kind: "hot" };
  }

  if ("isNew" in model && model.isNew) {
    return { label: "New", kind: "new" };
  }

  return null;
}

export function isModelFeatured(model: AnyModel): boolean {
  if ("isFeatured" in model && model.isFeatured) {
    return true;
  }

  return (
    model.labels?.some(
      (label) =>
        label.key === ModelLabelMap.Filter &&
        label.value === ModelLabelMap.Featured,
    ) ?? false
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/badges.test.ts
```

Expected: PASS.

---

### Task 3: Implement Dynamic Facet Engine

**Files:**

- Create: `src/lib/model-library/facets/types.ts`
- Create: `src/lib/model-library/facets/bitmaskFacet.ts`
- Create: `src/lib/model-library/facets/setFacet.ts`
- Create: `src/lib/model-library/facets/definitions.ts`
- Create: `src/lib/model-library/facets/engine.ts`
- Test: `src/lib/model-library/__tests__/facets.test.ts`

- [ ] **Step 1: Write failing facet tests**

Create `src/lib/model-library/__tests__/facets.test.ts`:

```ts
import { ModelType, type LLMModelWithStatus } from "@/types/models";
import {
  buildFacetRecords,
  applyFacetFilters,
  getFacetOptions,
} from "../facets/engine";
import { consoleModelLibraryFacets } from "../facets/definitions";

function model(
  id: string,
  overrides: Partial<LLMModelWithStatus>,
): LLMModelWithStatus {
  return {
    id,
    name: id,
    displayName: id,
    type: ModelType.Chat,
    context_size: 131072,
    description: "",
    input_token_price_per_m: 0,
    input_token_price_per_m_toString: "0",
    output_token_price_per_m: 0,
    output_token_price_per_m_toString: "0",
    series: "DeepSeek",
    features: [],
    tags: [],
    infos: {
      inputPricing: "$0/Mt",
      outputPricing: "$0/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    ...overrides,
  };
}

describe("model-library facet engine", () => {
  const models = [
    model("deepseek-reasoning", {
      series: "DeepSeek",
      features: ["reasoning", "function-calling"],
      context_size: 262144,
    }),
    model("anthropic-json", {
      series: "Anthropic",
      features: ["structured-outputs"],
      context_size: 131072,
    }),
    model("image-model", {
      type: ModelType.Images as never,
      series: "Seedream",
      features: [] as never,
    }),
  ];

  it("matches OR inside modality and series but AND inside features", () => {
    const records = buildFacetRecords(models, consoleModelLibraryFacets);
    const result = applyFacetFilters(records, consoleModelLibraryFacets, {
      modalities: ["llm", "vision"],
      series: ["DeepSeek", "Anthropic"],
      features: ["tool-calling", "reasoning"],
    });

    expect(result.map((item) => item.id)).toEqual(["deepseek-reasoning"]);
  });

  it("does not constrain empty facet groups", () => {
    const records = buildFacetRecords(models, consoleModelLibraryFacets);
    const result = applyFacetFilters(records, consoleModelLibraryFacets, {
      modalities: [],
      series: [],
      features: [],
    });

    expect(result).toHaveLength(3);
  });

  it("derives facet options with counts", () => {
    const records = buildFacetRecords(models, consoleModelLibraryFacets);
    const options = getFacetOptions(records, consoleModelLibraryFacets);

    expect(options.series.some((item) => item.value === "DeepSeek")).toBe(true);
    expect(options.features.some((item) => item.value === "reasoning")).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/facets.test.ts
```

Expected: FAIL because facet modules do not exist.

- [ ] **Step 3: Add facet types**

Create `src/lib/model-library/facets/types.ts`:

```ts
import type { AnyModel } from "../capabilities";

export type FacetMatchMode = "any" | "all" | "single";

export type FacetOption = {
  label: string;
  value: string;
  count: number;
};

export type FacetDefinition = {
  key: string;
  label: string;
  matchMode: FacetMatchMode;
  kind: "bitmask" | "set";
  options?: Array<{ label: string; value: string; bit: number }>;
  getValues: (model: AnyModel) => string[];
};

export type FacetFilterState = Record<string, string[]>;

export type ModelFacetRecord = {
  model: AnyModel;
  bitmasks: Record<string, number>;
  values: Record<string, string[]>;
  sortTime: number;
};
```

- [ ] **Step 4: Add bitmask and set helpers**

Create `src/lib/model-library/facets/bitmaskFacet.ts`:

```ts
export function valuesToMask(
  values: string[],
  bitByValue: Map<string, number>,
): number {
  return values.reduce((mask, value) => mask | (bitByValue.get(value) ?? 0), 0);
}

export function matchesBitmask(
  recordMask: number,
  selectedMask: number,
  mode: "any" | "all" | "single",
): boolean {
  if (selectedMask === 0) return true;
  if (mode === "all") return (recordMask & selectedMask) === selectedMask;
  return (recordMask & selectedMask) !== 0;
}
```

Create `src/lib/model-library/facets/setFacet.ts`:

```ts
export function matchesSetValues(
  recordValues: string[],
  selectedValues: string[],
  mode: "any" | "all" | "single",
): boolean {
  if (selectedValues.length === 0) return true;

  const selected = new Set(selectedValues);

  if (mode === "all") {
    return selectedValues.every((value) => recordValues.includes(value));
  }

  return recordValues.some((value) => selected.has(value));
}
```

- [ ] **Step 5: Add console facet definitions**

Create `src/lib/model-library/facets/definitions.ts`:

```ts
import { getModelCapabilities, getModelModalities } from "../capabilities";
import type { FacetDefinition } from "./types";

export const modalityFacet: FacetDefinition = {
  key: "modalities",
  label: "Modality",
  kind: "bitmask",
  matchMode: "any",
  options: [
    { label: "LLM", value: "llm", bit: 1 << 0 },
    { label: "Image", value: "image", bit: 1 << 1 },
    { label: "Audio", value: "audio", bit: 1 << 2 },
    { label: "Video", value: "video", bit: 1 << 3 },
    { label: "Embedding", value: "embedding", bit: 1 << 4 },
    { label: "Reranker", value: "reranker", bit: 1 << 5 },
    { label: "Vision", value: "vision", bit: 1 << 6 },
  ],
  getValues: (model) => getModelModalities(model),
};

export const featureFacet: FacetDefinition = {
  key: "features",
  label: "Features",
  kind: "bitmask",
  matchMode: "all",
  options: [
    { label: "Tool Calling", value: "tool-calling", bit: 1 << 0 },
    { label: "JSON Schema", value: "json-schema", bit: 1 << 1 },
    { label: "Reasoning", value: "reasoning", bit: 1 << 2 },
    { label: "Long Context (>128K)", value: "long-context", bit: 1 << 3 },
  ],
  getValues: (model) => getModelCapabilities(model),
};

export const seriesFacet: FacetDefinition = {
  key: "series",
  label: "Model Series",
  kind: "set",
  matchMode: "any",
  getValues: (model) => (model.series ? [model.series] : []),
};

export const consoleModelLibraryFacets = [
  modalityFacet,
  featureFacet,
  seriesFacet,
] satisfies FacetDefinition[];
```

- [ ] **Step 6: Add facet engine**

Create `src/lib/model-library/facets/engine.ts`:

```ts
import type { AnyModel } from "../capabilities";
import { valuesToMask, matchesBitmask } from "./bitmaskFacet";
import { matchesSetValues } from "./setFacet";
import type {
  FacetDefinition,
  FacetFilterState,
  FacetOption,
  ModelFacetRecord,
} from "./types";

function getBitMap(facet: FacetDefinition): Map<string, number> {
  return new Map((facet.options ?? []).map((item) => [item.value, item.bit]));
}

function getSortTime(model: AnyModel): number {
  const value =
    "platform_release_at" in model ? model.platform_release_at : undefined;
  if (!value) return 0;
  const date =
    typeof value === "number" ? new Date(value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function buildFacetRecords(
  models: AnyModel[],
  facets: FacetDefinition[],
): ModelFacetRecord[] {
  return models.map((model) => {
    const bitmasks: Record<string, number> = {};
    const values: Record<string, string[]> = {};

    for (const facet of facets) {
      const facetValues = facet.getValues(model).filter(Boolean);
      values[facet.key] = facetValues;

      if (facet.kind === "bitmask") {
        bitmasks[facet.key] = valuesToMask(facetValues, getBitMap(facet));
      }
    }

    return { model, bitmasks, values, sortTime: getSortTime(model) };
  });
}

export function applyFacetFilters(
  records: ModelFacetRecord[],
  facets: FacetDefinition[],
  filterState: FacetFilterState,
): AnyModel[] {
  return records
    .filter((record) =>
      facets.every((facet) => {
        const selectedValues = filterState[facet.key] ?? [];
        if (selectedValues.length === 0) return true;

        if (facet.kind === "bitmask") {
          const selectedMask = valuesToMask(selectedValues, getBitMap(facet));
          return matchesBitmask(
            record.bitmasks[facet.key] ?? 0,
            selectedMask,
            facet.matchMode,
          );
        }

        return matchesSetValues(
          record.values[facet.key] ?? [],
          selectedValues,
          facet.matchMode,
        );
      }),
    )
    .map((record) => record.model);
}

export function getFacetOptions(
  records: ModelFacetRecord[],
  facets: FacetDefinition[],
): Record<string, FacetOption[]> {
  return facets.reduce<Record<string, FacetOption[]>>((acc, facet) => {
    const counts = new Map<string, number>();
    for (const record of records) {
      for (const value of record.values[facet.key] ?? []) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }

    const labels = new Map(
      (facet.options ?? []).map((item) => [item.value, item.label]),
    );

    acc[facet.key] = [...counts.entries()]
      .map(([value, count]) => ({
        value,
        count,
        label: labels.get(value) ?? value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return acc;
  }, {});
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/facets.test.ts
```

Expected: PASS.

---

### Task 4: Implement Pricing, Actions, And Sections Helpers

**Files:**

- Create: `src/lib/model-library/pricing.ts`
- Create: `src/lib/model-library/actions.ts`
- Create: `src/lib/model-library/sections.ts`
- Test: `src/lib/model-library/__tests__/pricing.test.ts`
- Test: `src/lib/model-library/__tests__/actions.test.ts`
- Test: `src/lib/model-library/__tests__/sections.test.ts`

- [ ] **Step 1: Write failing pricing test**

Create `src/lib/model-library/__tests__/pricing.test.ts`:

```ts
import { getTieredPricingRows } from "../pricing";

describe("model-library pricing", () => {
  it("returns no tier rows when tiered billing is not configured", () => {
    expect(getTieredPricingRows({ is_tiered_billing: false })).toEqual([]);
  });

  it("normalizes tiered pricing rows", () => {
    const rows = getTieredPricingRows({
      is_tiered_billing: true,
      tiered_billing_configs: [
        {
          min_tokens: 0,
          max_tokens: 1000,
          output_min_tokens: 0,
          output_max_tokens: 1000,
          input_pricing: { pricePerM: 10000, originPricePerM: 20000 },
          output_pricing: { pricePerM: 30000, originPricePerM: 40000 },
        },
      ],
    });

    expect(rows).toEqual([
      {
        inputRange: "0-1000",
        outputRange: "0-1000",
        inputPrice: "$1/Mt",
        outputPrice: "$3/Mt",
      },
    ]);
  });
});
```

- [ ] **Step 2: Write failing actions test**

Create `src/lib/model-library/__tests__/actions.test.ts`:

```ts
import { ModelType } from "@/types/models";
import { getActionLabels, getModelActions } from "../actions";

describe("model-library actions", () => {
  it("uses different detail labels for grid and list", () => {
    expect(getActionLabels("grid").detailLabel).toBe("More");
    expect(getActionLabels("list").detailLabel).toBe("View details");
  });

  it("builds console detail and playground actions for chat models", () => {
    const actions = getModelActions({
      id: "deepseek-r1",
      name: "deepseek-r1",
      type: ModelType.Chat,
      linkPath: "deepseek-r1",
    } as never);

    expect(actions.detailHref).toBe("/models-console/model-detail/deepseek-r1");
    expect(actions.playgroundHref).toContain("/models-console/llm-playground");
  });
});
```

- [ ] **Step 3: Write failing sections test**

Create `src/lib/model-library/__tests__/sections.test.ts`:

```ts
import { ModelType } from "@/types/models";
import { getFeaturedModels, shouldShowFeaturedSection } from "../sections";

const createModel = (id: string, isFeatured = false) =>
  ({
    id,
    name: id,
    type: ModelType.Chat,
    isFeatured,
  }) as never;

describe("model-library sections", () => {
  it("shows Featured only for default all filter state", () => {
    expect(
      shouldShowFeaturedSection({ modalities: [], series: [], features: [] }),
    ).toBe(true);
    expect(
      shouldShowFeaturedSection({
        modalities: ["llm"],
        series: [],
        features: [],
      }),
    ).toBe(false);
  });

  it("caps Featured models at five and hides empty Featured", () => {
    expect(getFeaturedModels([createModel("a")])).toEqual([]);
    expect(
      getFeaturedModels([
        createModel("a", true),
        createModel("b", true),
        createModel("c", true),
        createModel("d", true),
        createModel("e", true),
        createModel("f", true),
      ]).map((item) => item.id),
    ).toEqual(["a", "b", "c", "d", "e"]);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/pricing.test.ts src/lib/model-library/__tests__/actions.test.ts src/lib/model-library/__tests__/sections.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 5: Add pricing helper**

Create `src/lib/model-library/pricing.ts`:

```ts
import Big from "big.js";
import type { TieredBillingConfig } from "@/types/models";

type TieredModelLike = {
  is_tiered_billing?: boolean;
  tiered_billing_configs?: TieredBillingConfig[];
};

export type TieredPricingRow = {
  inputRange: string;
  outputRange: string;
  inputPrice: string;
  outputPrice: string;
};

function formatPricePerM(value?: number): string {
  return `$${Big(value || 0)
    .div(10_000)
    .toString()}/Mt`;
}

function formatRange(min?: number, max?: number): string {
  if (max === undefined || max === null) return `${min ?? 0}+`;
  return `${min ?? 0}-${max}`;
}

export function getTieredPricingRows(
  model: TieredModelLike,
): TieredPricingRow[] {
  if (
    !model.is_tiered_billing ||
    !Array.isArray(model.tiered_billing_configs)
  ) {
    return [];
  }

  return model.tiered_billing_configs.map((tier) => ({
    inputRange: formatRange(tier.min_tokens, tier.max_tokens),
    outputRange: formatRange(tier.output_min_tokens, tier.output_max_tokens),
    inputPrice: formatPricePerM(tier.input_pricing?.pricePerM),
    outputPrice: formatPricePerM(tier.output_pricing?.pricePerM),
  }));
}
```

- [ ] **Step 6: Add actions helper**

Create `src/lib/model-library/actions.ts`:

```ts
import { NOVITA_URL } from "@/constants/urls";
import {
  ModelType,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

type AnyModel = LLMModelWithStatus | MediaModel;
export type ConsoleModelViewMode = "grid" | "list";

export function getActionLabels(viewMode: ConsoleModelViewMode) {
  return {
    detailLabel: viewMode === "grid" ? "More" : "View details",
    playgroundLabel: "Playground",
  };
}

export function getModelDetailHref(model: AnyModel): string | null {
  if ("linkPath" in model && model.linkPath) {
    return `${NOVITA_URL.MODEL_API_CONSOLE_MODEL_DETAIL}/${model.linkPath}`;
  }
  return null;
}

export function getModelPlaygroundHref(model: AnyModel): string | null {
  if (model.type === ModelType.Chat) {
    const modelName = encodeURIComponent(model.name);
    return `${NOVITA_URL.LLM_CONSOLE_PLAYGROUND}?model=${modelName}`;
  }

  if ("link" in model && model.link) {
    return model.link;
  }

  return null;
}

export function getModelActions(model: AnyModel) {
  return {
    detailHref: getModelDetailHref(model),
    playgroundHref: getModelPlaygroundHref(model),
  };
}
```

- [ ] **Step 7: Add sections helper**

Create `src/lib/model-library/sections.ts`:

```ts
import type { AnyModel } from "./capabilities";
import { isModelFeatured } from "./badges";

type FilterStateLike = {
  modalities: string[];
  series: string[];
  features: string[];
};

export function shouldShowFeaturedSection(
  filterState: FilterStateLike,
): boolean {
  return (
    filterState.modalities.length === 0 &&
    filterState.series.length === 0 &&
    filterState.features.length === 0
  );
}

export function getFeaturedModels(models: AnyModel[], limit = 5): AnyModel[] {
  return models.filter(isModelFeatured).slice(0, limit);
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__/pricing.test.ts src/lib/model-library/__tests__/actions.test.ts src/lib/model-library/__tests__/sections.test.ts
```

Expected: PASS.

---

### Task 5: Build Console Library State Container

**Files:**

- Modify: `src/app/models-console/library/page.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelLibrary.tsx`
- Create: `src/app/models-console/library/utils/consoleModelSections.ts`

- [ ] **Step 1: Create section helper for UI**

Create `src/app/models-console/library/utils/consoleModelSections.ts`:

```ts
import { ModelType } from "@/types/models";
import type { AnyModel } from "@/lib/model-library/capabilities";

export type ConsoleModelSection = {
  key: string;
  title: string;
  models: AnyModel[];
};

export function buildConsoleModelSections(
  models: AnyModel[],
): ConsoleModelSection[] {
  const sections = [
    {
      key: "llm",
      title: "LLM",
      models: models.filter((model) => model.type === ModelType.Chat),
    },
    {
      key: "image",
      title: "Image",
      models: models.filter((model) => model.type === ModelType.Images),
    },
    {
      key: "audio",
      title: "Audio",
      models: models.filter((model) => model.type === ModelType.Audio),
    },
    {
      key: "video",
      title: "Video",
      models: models.filter((model) => model.type === ModelType.Video),
    },
    {
      key: "embedding",
      title: "Embedding",
      models: models.filter((model) => model.type === ModelType.Embedding),
    },
    {
      key: "reranker",
      title: "Reranker",
      models: models.filter((model) => model.type === ModelType.Reranker),
    },
  ];

  return sections.filter((section) => section.models.length > 0);
}
```

- [ ] **Step 2: Create ConsoleModelLibrary state shell**

Create `src/app/models-console/library/components/ConsoleModelLibrary.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { getFullLLMModelsWithCache } from "@/api/model";
import { useEffect } from "react";
import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
import { useAppDispatch } from "@/store";
import { useModelLibrary } from "@/hooks/useModelLibrary";
import type { LLMModelWithStatus } from "@/types/models";
import {
  buildFacetRecords,
  applyFacetFilters,
  getFacetOptions,
} from "@/lib/model-library/facets/engine";
import { consoleModelLibraryFacets } from "@/lib/model-library/facets/definitions";
import {
  getFeaturedModels,
  shouldShowFeaturedSection,
} from "@/lib/model-library/sections";
import type { ConsoleModelViewMode } from "@/lib/model-library/actions";
import { buildConsoleModelSections } from "../utils/consoleModelSections";

type FilterState = {
  modalities: string[];
  series: string[];
  features: string[];
};

const DEFAULT_FILTER_STATE: FilterState = {
  modalities: [],
  series: [],
  features: [],
};

export default function ConsoleModelLibrary() {
  const dispatch = useAppDispatch();
  const [llmModelList, setLlmModelList] = useState<LLMModelWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ConsoleModelViewMode>("grid");
  const [filterState, setFilterState] =
    useState<FilterState>(DEFAULT_FILTER_STATE);

  useEffect(() => {
    setLoading(true);
    getFullLLMModelsWithCache(["chat", "embedding", "reranker"])
      .then(setLlmModelList)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    dispatch(fetchMultimodalConfigs(false) as never);
  }, [dispatch]);

  const { allModels } = useModelLibrary(llmModelList);

  const records = useMemo(
    () => buildFacetRecords(allModels, consoleModelLibraryFacets),
    [allModels],
  );

  const facetOptions = useMemo(
    () => getFacetOptions(records, consoleModelLibraryFacets),
    [records],
  );

  const filteredModels = useMemo(
    () => applyFacetFilters(records, consoleModelLibraryFacets, filterState),
    [records, filterState],
  );

  const featuredModels = useMemo(
    () =>
      shouldShowFeaturedSection(filterState)
        ? getFeaturedModels(allModels)
        : [],
    [allModels, filterState],
  );

  const sections = useMemo(
    () => buildConsoleModelSections(filteredModels),
    [filteredModels],
  );

  return (
    <div className="min-h-full bg-[var(--bg-default)]">
      {/* Subsequent tasks replace this temporary scaffold with full UI. */}
      <pre data-testid="console-model-library-debug">
        {JSON.stringify(
          {
            loading,
            viewMode,
            total: filteredModels.length,
            featured: featuredModels.length,
            sections: sections.map((section) => [
              section.title,
              section.models.length,
            ]),
            facetKeys: Object.keys(facetOptions),
          },
          null,
          2,
        )}
      </pre>
      <button
        type="button"
        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      >
        Toggle view
      </button>
      <button
        type="button"
        onClick={() => setFilterState(DEFAULT_FILTER_STATE)}
      >
        Clear
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Replace page with new shell**

Modify `src/app/models-console/library/page.tsx` to:

```tsx
"use client";

import ConsoleModelLibrary from "./components/ConsoleModelLibrary";

export default function Page() {
  return <ConsoleModelLibrary />;
}
```

- [ ] **Step 4: Run type check for touched flow**

Run:

```bash
npm run pre-build-check
```

Expected: Type check may take time but should not fail from the new files. If unrelated i18n checks fail, record the exact failure and continue to targeted `npx tsc --noEmit`.

---

### Task 6: Build Sidebar, Toolbar, And Selected Filters

**Files:**

- Modify: `src/app/models-console/library/components/ConsoleModelLibrary.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelSidebar.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelToolbar.tsx`
- Create: `src/app/models-console/library/components/ConsoleSelectedFilters.tsx`

- [ ] **Step 1: Create sidebar component**

Create `ConsoleModelSidebar.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { FacetOption } from "@/lib/model-library/facets/types";

type Props = {
  options: Record<string, FacetOption[]>;
  value: Record<string, string[]>;
  onToggle: (facetKey: string, optionValue: string) => void;
};

const FACET_LABELS: Record<string, string> = {
  modalities: "Modality",
  features: "Features",
  series: "Model Series",
};

export default function ConsoleModelSidebar({
  options,
  value,
  onToggle,
}: Props) {
  return (
    <aside className="w-[200px] shrink-0 border-r border-[var(--border-2)] bg-[var(--bg-light)] px-space-16 py-space-16">
      {Object.entries(options).map(([facetKey, facetOptions]) => (
        <section key={facetKey} className="mb-space-24">
          <h2 className="font-paragraph-12 text-[var(--text-3)]">
            {FACET_LABELS[facetKey] ?? facetKey}
          </h2>
          <div className="mt-space-8 flex flex-col gap-space-4">
            {facetOptions.map((option) => {
              const selected = value[facetKey]?.includes(option.value) ?? false;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(facetKey, option.value)}
                  className={cn(
                    "flex h-[28px] items-center justify-between rounded-4 px-space-8 font-paragraph-12 transition-colors",
                    selected
                      ? "bg-brand-3 text-brand-1"
                      : "text-[var(--text-2)] hover:bg-overlay-hover",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="text-[var(--text-4)]">{option.count}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );
}
```

- [ ] **Step 2: Create toolbar component**

Create `ConsoleModelToolbar.tsx`:

```tsx
"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConsoleModelViewMode } from "@/lib/model-library/actions";

type Props = {
  total: number;
  viewMode: ConsoleModelViewMode;
  onViewModeChange: (mode: ConsoleModelViewMode) => void;
};

export default function ConsoleModelToolbar({
  total,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div className="flex items-center gap-space-24">
      <div className="flex-1 font-paragraph-12 text-[var(--text-3)]">
        {total} Models
      </div>
      <span className="rounded-12 px-space-8 py-space-2 font-paragraph-12 text-[var(--text-4)]">
        Newest
      </span>
      <div className="flex items-center gap-space-4 rounded-20 bg-[var(--bg-light)] p-space-2">
        <button
          type="button"
          aria-label="Grid view"
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "rounded-12 p-space-4 text-element-mid-em hover:bg-overlay-hover",
            viewMode === "grid" && "bg-fill-4 text-element-high-em",
          )}
        >
          <LayoutGrid size={12} />
        </button>
        <button
          type="button"
          aria-label="List view"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "rounded-12 p-space-4 text-element-mid-em hover:bg-overlay-hover",
            viewMode === "list" && "bg-fill-4 text-element-high-em",
          )}
        >
          <List size={12} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create selected filters component**

Create `ConsoleSelectedFilters.tsx`:

```tsx
"use client";

import { X } from "lucide-react";
import type { FacetOption } from "@/lib/model-library/facets/types";

type Props = {
  options: Record<string, FacetOption[]>;
  value: Record<string, string[]>;
  onRemove: (facetKey: string, optionValue: string) => void;
  onClear: () => void;
};

export default function ConsoleSelectedFilters({
  options,
  value,
  onRemove,
  onClear,
}: Props) {
  const selected = Object.entries(value).flatMap(([facetKey, values]) =>
    values.map((optionValue) => {
      const option = options[facetKey]?.find(
        (item) => item.value === optionValue,
      );
      return { facetKey, optionValue, label: option?.label ?? optionValue };
    }),
  );

  if (selected.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-space-8">
      {selected.map((item) => (
        <button
          key={`${item.facetKey}-${item.optionValue}`}
          type="button"
          onClick={() => onRemove(item.facetKey, item.optionValue)}
          className="flex items-center gap-space-4 rounded-12 border border-brand-2 bg-brand-3 px-space-8 py-space-2 font-paragraph-12 text-brand-1"
        >
          <span>{item.label}</span>
          <X size={12} />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-space-4 font-paragraph-12 text-[var(--text-3)] hover:text-[var(--text-1)]"
      >
        Clear All
        <X size={12} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Wire sidebar and toolbar into ConsoleModelLibrary**

Replace the temporary JSX in `ConsoleModelLibrary.tsx` with:

```tsx
<div className="flex min-h-full bg-[var(--bg-default)]">
  <ConsoleModelSidebar
    options={facetOptions}
    value={filterState}
    onToggle={handleToggleFilter}
  />
  <main className="min-w-0 flex-1 px-space-32 py-space-16">
    <ConsoleModelToolbar
      total={filteredModels.length}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
    <div className="mt-space-12">
      <ConsoleSelectedFilters
        options={facetOptions}
        value={filterState}
        onRemove={handleToggleFilter}
        onClear={handleClearFilters}
      />
    </div>
    <ConsoleModelMain
      loading={loading}
      viewMode={viewMode}
      featuredModels={featuredModels}
      sections={sections}
      filterState={filterState}
    />
  </main>
</div>
```

Add handlers in the component:

```tsx
const handleToggleFilter = (facetKey: string, optionValue: string) => {
  setFilterState((current) => {
    const values = current[facetKey as keyof FilterState] ?? [];
    const nextValues = values.includes(optionValue)
      ? values.filter((item) => item !== optionValue)
      : [...values, optionValue];
    return { ...current, [facetKey]: nextValues };
  });
};

const handleClearFilters = () => setFilterState(DEFAULT_FILTER_STATE);
```

Also import the new components and create a temporary `ConsoleModelMain` stub in
Task 7 before running the app.

---

### Task 7: Build Main Area, Cards, List, Empty State, Recommend Card

**Files:**

- Create: `src/app/models-console/library/components/ConsoleModelMain.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelCard.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelList.tsx`
- Create: `src/app/models-console/library/components/ConsoleModelEmptyState.tsx`
- Create: `src/app/models-console/library/components/ConsoleRecommendModelCard.tsx`
- Create: `src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx`

- [ ] **Step 1: Create empty state**

Create `ConsoleModelEmptyState.tsx`:

```tsx
"use client";

import Link from "next/link";
import { DOCS_URL } from "@/constants/urls";

export default function ConsoleModelEmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-space-12">
      <div className="h-[96px] w-[120px] rounded-8 bg-brand-3" aria-hidden />
      <p className="font-paragraph-12 text-[var(--text-3)]">
        No models match your filters
      </p>
      <Link
        href={DOCS_URL.LLM_RECOMMENDED}
        className="inline-flex h-[36px] items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-light)] px-space-20 font-paragraph-15 text-[var(--text-1)]"
      >
        ·Recommend me a model -&gt;
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create recommend card**

Create `ConsoleRecommendModelCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { DOCS_URL } from "@/constants/urls";

export default function ConsoleRecommendModelCard() {
  return (
    <div className="relative flex h-[270px] min-w-[300px] overflow-hidden rounded-4 border border-[var(--border-2)] bg-[var(--bg-light)]">
      <div className="absolute inset-0 bg-brand-3 opacity-50" aria-hidden />
      <div className="relative flex w-full flex-col items-center justify-center gap-space-20">
        <div className="flex flex-col gap-space-20 font-tt-mono text-[12px] uppercase tracking-[0.48px]">
          {[
            ["200+", "Models"],
            ["200ms", "Latency"],
            ["99.5%", "Uptime"],
          ].map(([value, label]) => (
            <div key={label} className="flex items-center gap-space-4">
              <span className="h-[6px] w-[6px] rounded-[1px] bg-[var(--element-high-em)]" />
              <span className="text-[var(--element-high-em)]">{value}</span>
              <span className="text-element-mid-em">{label}</span>
            </div>
          ))}
        </div>
        <Link
          href={DOCS_URL.LLM_RECOMMENDED}
          className="inline-flex h-[36px] items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-light)] px-space-20 font-paragraph-15 text-[var(--text-1)]"
        >
          Recommend me a model -&gt;
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create tiered popover shell**

Create `ConsoleTieredPricingPopover.tsx`:

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TieredPricingRow } from "@/lib/model-library/pricing";

type Props = {
  rows: TieredPricingRow[];
};

export default function ConsoleTieredPricingPopover({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-8 border border-brand-1 px-space-8 py-space-2 font-paragraph-12 text-brand-1"
        >
          Tiered
          <ChevronDown size={12} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] rounded-8 border border-[var(--border-2)] bg-[var(--bg-light)] p-space-12">
        <div className="flex flex-col gap-space-8">
          {rows.map((row) => (
            <div
              key={`${row.inputRange}-${row.outputRange}`}
              className="grid grid-cols-2 gap-space-8 font-paragraph-12 text-[var(--text-2)]"
            >
              <span>Input {row.inputRange}</span>
              <span className="text-right text-[var(--text-1)]">
                {row.inputPrice}
              </span>
              <span>Output {row.outputRange}</span>
              <span className="text-right text-[var(--text-1)]">
                {row.outputPrice}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 4: Create grid card**

Create `ConsoleModelCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { AnyModel } from "@/lib/model-library/capabilities";
import { getPrimaryModelBadge } from "@/lib/model-library/badges";
import {
  formatModelDate,
  formatTokenWindow,
} from "@/lib/model-library/display-format";
import { getActionLabels, getModelActions } from "@/lib/model-library/actions";
import { getTieredPricingRows } from "@/lib/model-library/pricing";
import ConsoleTieredPricingPopover from "./ConsoleTieredPricingPopover";

type Props = {
  model: AnyModel;
};

export default function ConsoleModelCard({ model }: Props) {
  const badge = getPrimaryModelBadge(model);
  const actions = getModelActions(model);
  const labels = getActionLabels("grid");
  const tierRows = getTieredPricingRows(model);
  const modelReleased =
    "model_released_at" in model
      ? formatModelDate(model.model_released_at)
      : null;
  const platformReleased =
    "platform_release_at" in model
      ? formatModelDate(model.platform_release_at)
      : null;

  const inputPrice =
    "infos" in model && model.infos && !Array.isArray(model.infos)
      ? model.infos.inputPricing
      : "-";
  const outputPrice =
    "infos" in model && model.infos && !Array.isArray(model.infos)
      ? model.infos.outputPricing
      : undefined;
  const context =
    "context_size" in model ? formatTokenWindow(model.context_size) : null;
  const maxOutput =
    "max_output_tokens" in model
      ? formatTokenWindow(model.max_output_tokens)
      : null;

  return (
    <article className="group flex h-[270px] min-w-[300px] flex-col rounded-4 border border-[var(--border-2)] bg-[var(--bg-light)] transition-colors hover:border-[var(--border-default)]">
      <div className="relative flex flex-1 flex-col gap-space-16 p-space-16">
        {badge && (
          <span className="absolute right-space-16 top-space-16 rounded-4 bg-brand-1 px-space-4 py-space-2 font-paragraph-11 text-white">
            {badge.label}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-paragraph-12 text-[var(--text-4)]">
            {model.series || "Model"}
          </p>
          <h3 className="truncate font-paragraph-18 text-[var(--text-1)]">
            {model.displayName || model.name}
          </h3>
        </div>
        <div className="border-t border-dashed border-[var(--border-2)]" />
        <div className="flex flex-col gap-space-4 font-paragraph-12">
          <div className="flex justify-between gap-space-8">
            <span className="text-[var(--text-3)]">Input</span>
            <span className="text-[var(--text-1)]">{inputPrice}</span>
          </div>
          {outputPrice && (
            <div className="flex justify-between gap-space-8">
              <span className="text-[var(--text-3)]">Output</span>
              <span className="text-[var(--text-1)]">{outputPrice}</span>
            </div>
          )}
          {(context || maxOutput) && (
            <div className="flex items-center gap-space-8">
              <span className="min-w-0 flex-1 truncate text-[var(--text-3)]">
                {[
                  context && `${context} Context`,
                  maxOutput && `${maxOutput} Max Output`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <ConsoleTieredPricingPopover rows={tierRows} />
            </div>
          )}
        </div>
      </div>
      <div className="relative h-[68px] border-t border-dashed border-[var(--border-2)] p-space-16">
        <div className="absolute inset-space-16 flex flex-col gap-space-4 font-paragraph-12 transition-opacity group-hover:opacity-0">
          {modelReleased && (
            <div className="flex justify-between text-[var(--text-3)]">
              <span>Model released</span>
              <span>{modelReleased}</span>
            </div>
          )}
          {platformReleased && (
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">On Novita</span>
              <span className="text-[var(--text-1)]">{platformReleased}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-space-16 flex gap-space-12 opacity-0 transition-opacity group-hover:opacity-100">
          {actions.detailHref && (
            <Link
              className="flex h-[36px] flex-1 items-center justify-center rounded-4 border border-[var(--border-strong)] font-paragraph-15 text-[var(--text-1)]"
              href={actions.detailHref}
            >
              {labels.detailLabel}
            </Link>
          )}
          {actions.playgroundHref && (
            <Link
              className="flex h-[36px] flex-1 items-center justify-center rounded-4 bg-brand-0 font-paragraph-15 text-black"
              href={actions.playgroundHref}
            >
              {labels.playgroundLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create list component**

Create `ConsoleModelList.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { AnyModel } from "@/lib/model-library/capabilities";
import {
  formatModelDate,
  formatTokenWindow,
} from "@/lib/model-library/display-format";
import { getActionLabels, getModelActions } from "@/lib/model-library/actions";

type Props = {
  models: AnyModel[];
};

export default function ConsoleModelList({ models }: Props) {
  const labels = getActionLabels("list");

  return (
    <div className="flex flex-col rounded-4 border border-[var(--border-2)] bg-[var(--bg-light)]">
      {models.map((model) => {
        const actions = getModelActions(model);
        const platformReleased =
          "platform_release_at" in model
            ? formatModelDate(model.platform_release_at)
            : null;
        const context =
          "context_size" in model
            ? formatTokenWindow(model.context_size)
            : null;

        return (
          <div
            key={model.id}
            className="group grid min-h-[72px] grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(120px,0.7fr)_220px] items-center gap-space-16 border-b border-[var(--border-2)] px-space-16 py-space-12 last:border-b-0 hover:bg-overlay-hover"
          >
            <div className="min-w-0">
              <p className="font-paragraph-12 text-[var(--text-4)]">
                {model.series || "Model"}
              </p>
              <p className="truncate font-paragraph-15 text-[var(--text-1)]">
                {model.displayName || model.name}
              </p>
            </div>
            <div className="font-paragraph-12 text-[var(--text-3)]">
              {context ? `${context} Context` : "-"}
            </div>
            <div className="font-paragraph-12 text-[var(--text-3)]">
              {platformReleased || "-"}
            </div>
            <div className="flex justify-end gap-space-8 opacity-0 transition-opacity group-hover:opacity-100">
              {actions.detailHref && (
                <Link
                  className="flex h-[32px] items-center rounded-4 border border-[var(--border-strong)] px-space-12 font-paragraph-12 text-[var(--text-1)]"
                  href={actions.detailHref}
                >
                  {labels.detailLabel}
                </Link>
              )}
              {actions.playgroundHref && (
                <Link
                  className="flex h-[32px] items-center rounded-4 bg-brand-0 px-space-12 font-paragraph-12 text-black"
                  href={actions.playgroundHref}
                >
                  {labels.playgroundLabel}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Create main component**

Create `ConsoleModelMain.tsx`:

```tsx
"use client";

import type { ConsoleModelViewMode } from "@/lib/model-library/actions";
import type { AnyModel } from "@/lib/model-library/capabilities";
import type { ConsoleModelSection } from "../utils/consoleModelSections";
import ConsoleModelCard from "./ConsoleModelCard";
import ConsoleModelEmptyState from "./ConsoleModelEmptyState";
import ConsoleModelList from "./ConsoleModelList";
import ConsoleRecommendModelCard from "./ConsoleRecommendModelCard";

type Props = {
  loading: boolean;
  viewMode: ConsoleModelViewMode;
  featuredModels: AnyModel[];
  sections: ConsoleModelSection[];
};

export default function ConsoleModelMain({
  loading,
  viewMode,
  featuredModels,
  sections,
}: Props) {
  if (loading) {
    return (
      <div className="py-space-64 font-paragraph-12 text-[var(--text-3)]">
        Loading models...
      </div>
    );
  }

  const total = sections.reduce(
    (count, section) => count + section.models.length,
    0,
  );
  if (total === 0) {
    return <ConsoleModelEmptyState />;
  }

  return (
    <div className="mt-space-24 flex flex-col gap-space-32">
      {featuredModels.length > 0 && (
        <section>
          <h2 className="mb-space-16 font-paragraph-24 text-brand-1">
            Featured Models
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-space-12">
            {featuredModels.map((model) => (
              <ConsoleModelCard key={model.id} model={model} />
            ))}
            <ConsoleRecommendModelCard />
          </div>
        </section>
      )}
      {sections.map((section) => (
        <section key={section.key}>
          <div className="mb-space-12 flex items-center justify-between px-space-16">
            <div className="flex items-center gap-space-8">
              <h2 className="font-paragraph-16 text-[var(--text-1)]">
                {section.title}
              </h2>
              <span className="font-paragraph-12 text-[var(--text-4)]">
                {section.models.length}
              </span>
            </div>
            <button
              type="button"
              className="font-paragraph-14 text-[var(--text-3)] underline"
            >
              View all
            </button>
          </div>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-space-12">
              {section.models.map((model) => (
                <ConsoleModelCard key={model.id} model={model} />
              ))}
            </div>
          ) : (
            <ConsoleModelList models={section.models} />
          )}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Update ConsoleModelLibrary import and props**

Import `ConsoleModelMain` in `ConsoleModelLibrary.tsx` and pass only:

```tsx
<ConsoleModelMain
  loading={loading}
  viewMode={viewMode}
  featuredModels={featuredModels}
  sections={sections}
/>
```

- [ ] **Step 8: Run targeted type check**

Run:

```bash
npx tsc --noEmit
```

Expected: no type errors from new model-library files and console components.

---

### Task 8: Verify Design Token Compliance And Browser Behavior

**Files:**

- Review all files created in Tasks 5-7.
- Modify only files needed to address verification failures.

- [ ] **Step 1: Run Jest for model-library tests**

Run:

```bash
npm run test:unit -- src/lib/model-library/__tests__
```

Expected: PASS.

- [ ] **Step 2: Run lint on touched files**

Run:

```bash
npm run lint -- src/lib/model-library src/app/models-console/library
```

Expected: PASS or only unrelated lint runner limitations. Fix any touched-file lint errors.

- [ ] **Step 3: Run type check**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Run Novita UI self-check if available**

Run:

```bash
python3 /Users/mac/.codex/.tmp/marketplaces/ppio-ui-skills/core/scripts/selfcheck.py src/app/models-console/library --product novita --format json
```

Expected: no ERROR-level violations for touched files. Fix token, font, color,
radius, and direct SVG issues reported for touched files.

- [ ] **Step 5: Start local dev server**

Run:

```bash
npm run en
```

Expected: Next dev server starts, usually on `http://localhost:3000`.

- [ ] **Step 6: Inspect `/models-console/library` in browser**

Use Browser MCP:

- Open `http://localhost:3000/models-console/library`.
- Verify the page renders.
- Verify sidebar options appear.
- Verify grid/list toggle changes rendering.
- Verify card hover reveals `More` and `Playground`.
- Verify list row hover reveals `View details` and `Playground`.
- Verify selected filter pills appear and can be removed.
- Verify Clear All returns to All state.
- Verify Featured section appears only when default All has Featured models.
- Verify no horizontal overflow at desktop and mobile widths.

- [ ] **Step 7: Leave diff for user review**

Run:

```bash
git status --short
git diff --stat
```

Expected: implementation files are modified/untracked. Do not commit.
