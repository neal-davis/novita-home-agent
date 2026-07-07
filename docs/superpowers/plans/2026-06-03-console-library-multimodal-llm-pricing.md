# Console Library Multimodal LLM Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/models-console/library` render multimodal LLM pricing from `multimodal_pricing`, keep default summaries aligned with today’s card/list layout, and add expandable modality-specific pricing details to both grid cards and row list items.

**Architecture:** Introduce a shared multimodal pricing adapter in the model-library layer, then route console library summary and detail rendering through that adapter instead of parsing `multimodal_pricing` inside UI components. Preserve existing tiered pricing behavior, and keep non-console pricing surfaces untouched.

**Tech Stack:** Next.js 14, React 18, TypeScript, Jest, Testing Library, existing model-library pricing helpers

---

### Task 1: Build the multimodal pricing adapter and type coverage

**Files:**

- Create: `src/lib/model-library/multimodal-pricing.ts`
- Modify: `src/types/models.ts:84-115`
- Test: `src/lib/model-library/__tests__/multimodal-pricing.test.ts`

- [ ] **Step 1: Write the failing adapter tests**

```typescript
import {
  getMultimodalDetailEntries,
  getMultimodalSummaryEntries,
} from "../multimodal-pricing";
import type { MultimodalPricing } from "@/types/models";

describe("multimodal pricing adapter", () => {
  it("builds Text-only summary entries and keeps cache ordering", () => {
    const pricing: MultimodalPricing = {
      input_price: [
        {
          modals: ["text"],
          input_token_discount_price: 1200,
          input_token_base_price: 2400,
          cache_read_input_discount_price: 300,
          cache_read_input_base_price: 600,
          cache_creation_1_hour_input_discount_price: 500,
          cache_creation_1_hour_input_base_price: 1000,
        },
      ],
      output_price: [
        {
          modals: ["text"],
          output_token_discount_price: 4800,
          output_token_base_price: 4800,
        },
      ],
    };

    expect(getMultimodalSummaryEntries(pricing)).toEqual([
      expect.objectContaining({
        label: "Text · Input",
        modality: "text",
        kind: "input",
        pricePerM: 1200,
      }),
      expect.objectContaining({
        label: "Text · Output",
        modality: "text",
        kind: "output",
        pricePerM: 4800,
      }),
      expect.objectContaining({
        label: "Text · Cache Read",
        modality: "text",
        kind: "cache-read",
        pricePerM: 300,
      }),
      expect.objectContaining({
        label: "Text · Cache Write 1h",
        modality: "text",
        kind: "cache-write-1h",
        pricePerM: 500,
      }),
    ]);
  });

  it("splits combined modality rows into independent detail keys and filters empty values", () => {
    const pricing: MultimodalPricing = {
      inputPrice: [
        {
          modals: ["text", "image"],
          inputTokenDiscountPrice: 1000,
          inputTokenBasePrice: 1500,
          cacheCreationInputDiscountPrice: "",
          cacheCreationInputBasePrice: null,
        },
        {
          modals: ["audio"],
          inputTokenDiscountPrice: 8000,
          inputTokenBasePrice: 9000,
        },
      ],
      outputPrice: [
        {
          modals: ["image"],
          outputTokenDiscountPrice: 30000,
          outputTokenBasePrice: 45000,
        },
      ],
    };

    expect(
      getMultimodalDetailEntries(pricing).map((entry) => entry.label),
    ).toEqual(["Image · Input", "Image · Output", "Audio · Input"]);
  });

  it("keeps zero-valued prices when the API returns free multimodal pricing", () => {
    const pricing: MultimodalPricing = {
      input_price: [
        {
          modals: ["text"],
          input_token_discount_price: 0,
          input_token_base_price: 0,
        },
      ],
    };

    expect(getMultimodalSummaryEntries(pricing)).toEqual([
      expect.objectContaining({ label: "Text · Input", pricePerM: 0 }),
    ]);
  });
});
```

- [ ] **Step 2: Run the adapter tests to verify they fail**

Run: `npm test -- src/lib/model-library/__tests__/multimodal-pricing.test.ts`

Expected: FAIL with `Cannot find module '../multimodal-pricing'` or missing `cache_creation_1_hour_input_*` type fields in `MultimodalPricingInputItem`

- [ ] **Step 3: Implement the adapter and extend multimodal item typing**

```typescript
// src/types/models.ts
export type MultimodalPricingInputItem = {
  modals: string[];
  input_token_base_price?: string | number;
  cache_read_input_base_price?: string | number;
  cache_creation_input_base_price?: string | number;
  cache_creation_1_hour_input_base_price?: string | number;
  input_token_discount_price?: string | number;
  cache_read_input_discount_price?: string | number;
  cache_creation_input_discount_price?: string | number;
  cache_creation_1_hour_input_discount_price?: string | number;
  inputTokenBasePrice?: string | number;
  cacheReadInputBasePrice?: string | number;
  cacheCreationInputBasePrice?: string | number;
  cacheCreation1HourInputBasePrice?: string | number;
  inputTokenDiscountPrice?: string | number;
  cacheReadInputDiscountPrice?: string | number;
  cacheCreationInputDiscountPrice?: string | number;
  cacheCreation1HourInputDiscountPrice?: string | number;
};

// src/lib/model-library/multimodal-pricing.ts
import type {
  MultimodalPricing,
  MultimodalPricingInputItem,
  MultimodalPricingOutputItem,
} from "@/types/models";

export type MultimodalPriceKind =
  | "input"
  | "output"
  | "cache-read"
  | "cache-write"
  | "cache-write-1h";

export type MultimodalPriceEntry = {
  modality: "text" | "image" | "audio" | "video";
  kind: MultimodalPriceKind;
  label: string;
  pricePerM: number;
  originPricePerM: number;
  discounted: boolean;
};

const modalityOrder = ["text", "image", "audio", "video"] as const;
const kindOrder: MultimodalPriceKind[] = [
  "input",
  "output",
  "cache-read",
  "cache-write",
  "cache-write-1h",
];

function readNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getModalities(
  modals: unknown,
): Array<MultimodalPriceEntry["modality"]> {
  if (!Array.isArray(modals)) return [];
  return modals
    .map((item) => String(item).toLowerCase())
    .filter((item): item is MultimodalPriceEntry["modality"] =>
      modalityOrder.includes(item as MultimodalPriceEntry["modality"]),
    )
    .filter((item, index, values) => values.indexOf(item) === index);
}

function toLabel(
  modality: MultimodalPriceEntry["modality"],
  kind: MultimodalPriceKind,
) {
  const modalityName = modality.charAt(0).toUpperCase() + modality.slice(1);
  const kindName =
    kind === "input"
      ? "Input"
      : kind === "output"
        ? "Output"
        : kind === "cache-read"
          ? "Cache Read"
          : kind === "cache-write"
            ? "Cache Write"
            : "Cache Write 1h";
  return `${modalityName} · ${kindName}`;
}

function collectInputEntries(
  item: MultimodalPricingInputItem,
): MultimodalPriceEntry[] {
  const modalities = getModalities(item.modals);
  const candidates = [
    [
      "input",
      item.input_token_discount_price ?? item.inputTokenDiscountPrice,
      item.input_token_base_price ?? item.inputTokenBasePrice,
    ],
    [
      "cache-read",
      item.cache_read_input_discount_price ?? item.cacheReadInputDiscountPrice,
      item.cache_read_input_base_price ?? item.cacheReadInputBasePrice,
    ],
    [
      "cache-write",
      item.cache_creation_input_discount_price ??
        item.cacheCreationInputDiscountPrice,
      item.cache_creation_input_base_price ?? item.cacheCreationInputBasePrice,
    ],
    [
      "cache-write-1h",
      item.cache_creation_1_hour_input_discount_price ??
        item.cacheCreation1HourInputDiscountPrice,
      item.cache_creation_1_hour_input_base_price ??
        item.cacheCreation1HourInputBasePrice,
    ],
  ] as const;

  return modalities.flatMap((modality) =>
    candidates.flatMap(([kind, priceValue, originValue]) => {
      const pricePerM = readNumber(priceValue);
      if (pricePerM === null) return [];
      const originPricePerM = readNumber(originValue) ?? pricePerM;
      return [
        {
          modality,
          kind,
          label: toLabel(modality, kind),
          pricePerM,
          originPricePerM,
          discounted: originPricePerM > pricePerM,
        },
      ];
    }),
  );
}

function collectOutputEntries(
  item: MultimodalPricingOutputItem,
): MultimodalPriceEntry[] {
  const modalities = getModalities(item.modals);
  const pricePerM = readNumber(
    item.output_token_discount_price ?? item.outputTokenDiscountPrice,
  );
  if (pricePerM === null) return [];
  const originPricePerM =
    readNumber(item.output_token_base_price ?? item.outputTokenBasePrice) ??
    pricePerM;

  return modalities.map((modality) => ({
    modality,
    kind: "output",
    label: toLabel(modality, "output"),
    pricePerM,
    originPricePerM,
    discounted: originPricePerM > pricePerM,
  }));
}

export function getMultimodalPriceEntries(
  pricing: MultimodalPricing | null | undefined,
): MultimodalPriceEntry[] {
  const inputItems = pricing?.input_price ?? pricing?.inputPrice ?? [];
  const outputItems = pricing?.output_price ?? pricing?.outputPrice ?? [];

  return [
    ...inputItems.flatMap(collectInputEntries),
    ...outputItems.flatMap(collectOutputEntries),
  ].sort(
    (left, right) =>
      modalityOrder.indexOf(left.modality) -
        modalityOrder.indexOf(right.modality) ||
      kindOrder.indexOf(left.kind) - kindOrder.indexOf(right.kind),
  );
}

export function getMultimodalSummaryEntries(
  pricing: MultimodalPricing | null | undefined,
) {
  return getMultimodalPriceEntries(pricing).filter(
    (entry) => entry.modality === "text",
  );
}

export function getMultimodalDetailEntries(
  pricing: MultimodalPricing | null | undefined,
) {
  return getMultimodalPriceEntries(pricing).filter(
    (entry) => entry.modality !== "text",
  );
}
```

- [ ] **Step 4: Run the adapter tests to verify they pass**

Run: `npm test -- src/lib/model-library/__tests__/multimodal-pricing.test.ts`

Expected: PASS with 3 passing tests in `multimodal-pricing.test.ts`

- [ ] **Step 5: Commit the adapter work**

```bash
git add src/types/models.ts src/lib/model-library/multimodal-pricing.ts src/lib/model-library/__tests__/multimodal-pricing.test.ts
git commit -m "feat: normalize multimodal model pricing"
```

### Task 2: Route console summary pricing through the adapter

**Files:**

- Modify: `src/lib/model-library/pricing.ts:1-146`
- Modify: `src/lib/model-library/__tests__/pricing.test.ts:1-115`
- Test: `src/lib/model-library/__tests__/pricing.test.ts`

- [ ] **Step 1: Add failing pricing tests for multimodal summary behavior and fallback**

```typescript
it("uses Text-prefixed multimodal summary lines for console library LLM pricing", () => {
  const model = {
    type: ModelType.Chat,
    input_token_price_per_m_toString: "1",
    infos: {
      inputPricing: "$9/Mt",
      outputPricing: "$9/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    multimodal_pricing: {
      input_price: [
        {
          modals: ["text"],
          input_token_discount_price: 1200,
          input_token_base_price: 2400,
          cache_read_input_discount_price: 300,
          cache_read_input_base_price: 600,
        },
        {
          modals: ["image"],
          input_token_discount_price: 22000,
          input_token_base_price: 26000,
        },
      ],
      output_price: [
        {
          modals: ["text"],
          output_token_discount_price: 4800,
          output_token_base_price: 4800,
        },
      ],
    },
  } as LLMModelWithStatus;

  expect(getModelPriceLines(model)).toEqual([
    expect.objectContaining({
      label: "Text · Input",
      value: "$0.12/Mt",
      originalValue: "$0.24/Mt",
      discounted: true,
    }),
    expect.objectContaining({
      label: "Text · Output",
      value: "$0.48/Mt",
      discounted: false,
    }),
    expect.objectContaining({
      label: "Text · Cache Read",
      value: "$0.03/Mt",
      originalValue: "$0.06/Mt",
      discounted: true,
    }),
  ]);
});

it("falls back to legacy infos when multimodal_pricing normalizes to no usable entries", () => {
  const model = {
    type: ModelType.Chat,
    input_token_price_per_m_toString: "1",
    infos: {
      inputPricing: "$1/Mt",
      outputPricing: "$2/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    multimodal_pricing: {
      input_price: [{ modals: ["text"], input_token_discount_price: "" }],
    },
  } as LLMModelWithStatus;

  expect(getModelPriceLines(model)).toEqual([
    expect.objectContaining({ label: "Input", value: "$1/Mt" }),
    expect.objectContaining({ label: "Output", value: "$2/Mt" }),
  ]);
});
```

- [ ] **Step 2: Run the pricing tests to verify they fail**

Run: `npm test -- src/lib/model-library/__tests__/pricing.test.ts`

Expected: FAIL because `getModelPriceLines` still returns legacy `Input` / `Output` lines only

- [ ] **Step 3: Implement shared summary/detail helpers in pricing.ts**

```typescript
import {
  getMultimodalDetailEntries,
  getMultimodalSummaryEntries,
  type MultimodalPriceEntry,
} from "./multimodal-pricing";

export type PriceLine = {
  label: string;
  value: string;
  originalValue?: string;
  discounted?: boolean;
  modality?: "text" | "image" | "audio" | "video";
  kind?: "input" | "output" | "cache-read" | "cache-write" | "cache-write-1h";
};

function formatPricePerM(value?: number): string {
  return `$${(Number(value ?? 0) / 10_000).toString()}/Mt`;
}

function toPriceLine(entry: MultimodalPriceEntry): PriceLine {
  const value = formatPricePerM(entry.pricePerM);
  const originalValue =
    entry.originPricePerM !== entry.pricePerM
      ? formatPricePerM(entry.originPricePerM)
      : undefined;

  return {
    label: entry.label,
    value,
    originalValue,
    discounted: entry.discounted,
    modality: entry.modality,
    kind: entry.kind,
  };
}

export function getExpandedModelPriceLines(model: AnyModel): PriceLine[] {
  if (!isLLMModel(model)) return [];
  return getMultimodalPriceEntries(model.multimodal_pricing).map(toPriceLine);
}

export function getModelPriceLines(model: AnyModel): PriceLine[] {
  if (isLLMModel(model)) {
    const multimodalSummary = getMultimodalSummaryEntries(
      model.multimodal_pricing,
    ).map(toPriceLine);
    if (multimodalSummary.length > 0) {
      return multimodalSummary;
    }

    const infos = model.infos as LLMLibraryInfo | undefined;
    return [
      getPriceLine("Input", infos?.inputPricing, infos?.originInputPricing),
      getPriceLine("Output", infos?.outputPricing, infos?.originOutputPricing),
      getPriceLine(
        "Cache read",
        infos?.cacheReadPricing,
        infos?.originCacheReadPricing,
      ),
      getPriceLine(
        "Cache write",
        infos?.cacheWrite5mPricing,
        infos?.originCacheWrite5mPricing,
      ),
      getPriceLine(
        "Cache write 1h",
        infos?.cacheWrite1hPricing,
        infos?.originCacheWrite1hPricing,
      ),
    ].filter((line): line is PriceLine => Boolean(line));
  }

  // keep existing media logic unchanged
}
```

- [ ] **Step 4: Run the pricing tests to verify they pass**

Run: `npm test -- src/lib/model-library/__tests__/pricing.test.ts`

Expected: PASS with the existing tiered/reranker assertions plus the new multimodal summary/fallback coverage

- [ ] **Step 5: Commit the shared pricing integration**

```bash
git add src/lib/model-library/pricing.ts src/lib/model-library/__tests__/pricing.test.ts
git commit -m "feat: use multimodal pricing in console summaries"
```

### Task 3: Add multimodal expansion to console grid cards

**Files:**

- Create: `src/app/models-console/library/components/ConsoleExpandedPriceDetails.tsx`
- Create: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
- Modify: `src/app/models-console/library/components/ConsoleModelCard.tsx:33-520`
- Modify: `src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx:1-18`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

- [ ] **Step 1: Add a failing card integration test**

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { ConsoleModelCard } from "../ConsoleModelCard";
import { ModelType, type LLMModelWithStatus } from "@/types/models";

describe("ConsoleModelCard", () => {
  it("shows Text-prefixed summary lines and expands multimodal detail lines", () => {
    const model = {
      id: "multimodal-card",
      name: "multimodal-card",
      displayName: "Multimodal Card",
      type: ModelType.Chat,
      series: "OpenAI",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
      multimodal_pricing: {
        input_price: [
          { modals: ["text"], input_token_discount_price: 1200, input_token_base_price: 2400 },
          { modals: ["image"], input_token_discount_price: 22000, input_token_base_price: 26000 },
        ],
        output_price: [
          { modals: ["text"], output_token_discount_price: 4800, output_token_base_price: 4800 },
          { modals: ["image"], output_token_discount_price: 32000, output_token_base_price: 40000 },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelCard model={model} />);

    expect(screen.getByText("Text · Input")).toBeInTheDocument();
    expect(screen.getByText("Text · Output")).toBeInTheDocument();
    expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("Image · Input")).toBeInTheDocument();
    expect(screen.getByText("Image · Output")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the card test to verify it fails**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

Expected: FAIL because the card still renders only summary lines and has no multimodal detail section

- [ ] **Step 3: Implement a shared expanded-price renderer and card expansion logic**

```typescript
// src/app/models-console/library/components/ConsoleExpandedPriceDetails.tsx
import { cn } from "@/lib/utils";
import type { PriceLine } from "@/lib/model-library/pricing";

function PriceLineValue({ line, forceDiscountColor }: { line: PriceLine; forceDiscountColor?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-space-6">
      <span className={cn("whitespace-nowrap text-[var(--text-1)]", (line.discounted || forceDiscountColor) && "text-brand-1")}>
        {line.value}
      </span>
      {line.originalValue ? (
        <span className="whitespace-nowrap text-[var(--text-3)] line-through">
          {line.originalValue}
        </span>
      ) : null}
    </div>
  );
}

export function ConsoleExpandedPriceDetails({
  lines,
  forceDiscountColor = false,
}: {
  lines: PriceLine[];
  forceDiscountColor?: boolean;
}) {
  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-space-4 font-miletus text-paragraph-12">
      {lines.map((line) => (
        <div key={`${line.label}-${line.value}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-space-8 rounded-2 bg-fill-4 p-space-8">
          <span className="text-[var(--text-3)]">{line.label}</span>
          <PriceLineValue line={line} forceDiscountColor={forceDiscountColor} />
        </div>
      ))}
    </div>
  );
}

// src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx
export function ConsoleTieredPricingPopover({
  expanded,
  label = "Tiered",
}: {
  expanded: boolean;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center justify-center rounded-8 border border-brand-1 py-0 pl-space-8 pr-space-2 font-miletus text-paragraph-12 text-brand-1">
      {label}
      <ChevronDown className={cn("h-space-12 w-space-12 transition-transform duration-200", expanded && "rotate-180")} aria-hidden="true" />
    </span>
  );
}

// inside ConsoleModelCard.tsx
import { ConsoleExpandedPriceDetails } from "./ConsoleExpandedPriceDetails";
import { getExpandedModelPriceLines } from "@/lib/model-library/pricing";

export function ConsoleModelCard({ model }: ConsoleModelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priceLines = getModelPriceLines(model);
  const expandedPriceLines = getExpandedModelPriceLines(model);
  const tierRows = isLLM ? getTieredPricingRows(model) : [];
  const showTiered = tierRows.length > 0;
  const showMultimodalDetails = expandedPriceLines.length > 0;
  const expandable = showTiered || showMultimodalDetails;

  const toggleExpanded = () => {
    if (!expandable) return;
    setExpanded((current) => !current);
  };

  const visiblePriceLines = getVisiblePriceLines(priceLines, expanded);

  return (
    <article /* keep existing shell */>
      <button type="button" onClick={toggleExpanded} aria-expanded={expanded} /* keep existing classes */>
        {/* existing header + summary */}
        <div className="flex items-center gap-space-8">
          <p className="min-w-0 flex-1 truncate font-miletus text-paragraph-12 text-[var(--text-3)]">
            {contextText ?? model.type}
          </p>
          {expandable ? (
            <ConsoleTieredPricingPopover expanded={expanded} label={showTiered ? "Tiered" : "Details"} />
          ) : null}
        </div>
      </button>

      {expanded ? (
        <>
          {showTiered ? <TieredRows rows={tierRows} hasDiscount={hasDiscount} /> : null}
          {!showTiered && showMultimodalDetails ? (
            <ConsoleExpandedPriceDetails lines={expandedPriceLines} forceDiscountColor={hasDiscount} />
          ) : null}
          {/* keep feature tags + modality flow */}
        </>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 4: Run the card test to verify it passes**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`

Expected: PASS with the multimodal card showing `Text · ...` in summary and `Image · ...` after expansion

- [ ] **Step 5: Commit the grid-card work**

```bash
git add src/app/models-console/library/components/ConsoleExpandedPriceDetails.tsx src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx src/app/models-console/library/components/ConsoleModelCard.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx
git commit -m "feat: add multimodal expansion to console model cards"
```

### Task 4: Add multimodal expansion to console row list

**Files:**

- Create: `src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`
- Modify: `src/app/models-console/library/components/ConsoleModelList.tsx:32-525`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`

- [ ] **Step 1: Add a failing row-list integration test**

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { ConsoleModelList } from "../ConsoleModelList";
import { ModelType, type LLMModelWithStatus } from "@/types/models";

describe("ConsoleModelList", () => {
  it("renders Text-prefixed summary labels and expands multimodal details in row mode", () => {
    const model = {
      id: "multimodal-list",
      name: "multimodal-list",
      displayName: "Multimodal List",
      type: ModelType.Chat,
      series: "OpenAI",
      context_size: 131072,
      max_output_tokens: 8192,
      input_token_price_per_m_toString: "0.12",
      output_token_price_per_m_toString: "0.48",
      input_token_price_per_m: 1200,
      output_token_price_per_m: 4800,
      status: 1,
      tags: ["LLM"],
      labels: [],
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "8192",
      },
      multimodal_pricing: {
        input_price: [
          { modals: ["text"], input_token_discount_price: 1200, input_token_base_price: 2400 },
          { modals: ["image"], input_token_discount_price: 22000, input_token_base_price: 26000 },
        ],
        output_price: [
          { modals: ["text"], output_token_discount_price: 4800, output_token_base_price: 4800 },
          { modals: ["image"], output_token_discount_price: 32000, output_token_base_price: 40000 },
        ],
      },
    } as LLMModelWithStatus;

    render(<ConsoleModelList models={[model]} />);

    expect(screen.getByText(/Text · Input/)).toBeInTheDocument();
    expect(screen.queryByText("Image · Input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /details/i }));

    expect(screen.getByText("Image · Input")).toBeInTheDocument();
    expect(screen.getByText("Image · Output")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the row-list test to verify it fails**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`

Expected: FAIL because list rows only expand for tiered models and do not render a multimodal detail toggle

- [ ] **Step 3: Implement expandable multimodal row behavior**

```typescript
// inside ConsoleModelList.tsx
import { ConsoleExpandedPriceDetails } from "./ConsoleExpandedPriceDetails";
import { ConsoleTieredPricingPopover } from "./ConsoleTieredPricingPopover";
import { getExpandedModelPriceLines } from "@/lib/model-library/pricing";

function getVisiblePriceLines(priceLines: PriceLine[]) {
  const order = ["Text · Input", "Text · Output", "Text · Cache Read", "Text · Cache Write", "Text · Cache Write 1h", "Input", "Output", "Cache read", "Cache write"];
  return order.flatMap((label) => {
    const line = priceLines.find((item) => item.label.toLowerCase() === label.toLowerCase());
    return line ? [line] : [];
  });
}

export function ConsoleModelList({ models }: ConsoleModelListProps) {
  const [expandedModelId, setExpandedModelId] = useState<string | number | null>(null);

  return (
    <div className="flex flex-col gap-space-8">
      {models.map((model) => {
        const priceLines = getModelPriceLines(model);
        const summaryPriceLines = getSummaryPriceLines(model, priceLines);
        const detailPriceLines = getExpandedModelPriceLines(model);
        const tierRows = isLLMModel(model) ? getTieredPricingRows(model) : [];
        const showTiered = tierRows.length > 0;
        const showMultimodalDetails = detailPriceLines.length > 0;
        const expandable = showTiered || showMultimodalDetails;
        const expanded = expandedModelId === model.id && expandable;

        const toggleExpanded = () => {
          if (!expandable) return;
          setExpandedModelId((current) => (current === model.id ? null : model.id));
        };

        return (
          <article
            onClick={toggleExpanded}
            onKeyDown={(event) => {
              if (!expandable) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleExpanded();
              }
            }}
            className={cn("group relative flex w-full flex-col gap-space-8 rounded-4 border border-[var(--border-2)] bg-fill-white px-space-16 py-space-12 transition-colors duration-200 hover:border-[var(--border-1)]", expandable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0")}
            role={expandable ? "button" : undefined}
            tabIndex={expandable ? 0 : undefined}
            aria-expanded={expandable ? expanded : undefined}
          >
            <div className="flex min-w-0 flex-1 items-center gap-space-4">
              <SummaryText priceLines={summaryPriceLines} supportText={supportText} highlighted={hasDiscount || summaryPriceLines.some((line) => line.discounted)} />
              {expandable ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpanded();
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-8 border border-brand-1 pl-space-8 pr-space-2 font-miletus text-paragraph-12 text-brand-1 transition-colors duration-200 hover:bg-brand-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
                  aria-expanded={expanded}
                  aria-label={showTiered ? "Tiered pricing details" : "Details"}
                >
                  {showTiered ? "Tiered" : "Details"}
                  <ChevronDown className={cn("h-space-12 w-space-12 transition-transform duration-200", expanded && "rotate-180")} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {expanded ? (
              <>
                <div className="h-px border-t border-dashed border-[var(--border-2)]" />
                {showTiered ? <TieredRows rows={tierRows} hasDiscount={hasDiscount} /> : null}
                {!showTiered && showMultimodalDetails ? (
                  <ConsoleExpandedPriceDetails lines={detailPriceLines} forceDiscountColor={hasDiscount} />
                ) : null}
                <div className="flex items-center gap-space-8">
                  <div className="flex min-w-0 flex-1 flex-wrap gap-space-4">
                    {featureTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center justify-center rounded-4 border border-[var(--border-2)] bg-fill-4 px-space-6 py-space-4 font-tt-mono text-mono-12 uppercase text-[var(--text-1)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ModalityFlow flow={modalityFlow} />
                </div>
              </>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run the row-list test to verify it passes**

Run: `npm test -- src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`

Expected: PASS with summary rows showing `Text · ...` and expansion revealing `Image · ...` detail rows

- [ ] **Step 5: Commit the row-list work**

```bash
git add src/app/models-console/library/components/ConsoleModelList.tsx src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx
git commit -m "feat: add multimodal expansion to console model list"
```

### Task 5: Run full verification and prepare the branch for review

**Files:**

- Modify: working tree only if test failures require small fixes
- Test: `src/lib/model-library/__tests__/multimodal-pricing.test.ts`
- Test: `src/lib/model-library/__tests__/pricing.test.ts`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx`
- Test: `src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx`

- [ ] **Step 1: Run the targeted Jest suite**

Run:

```bash
npm test -- src/lib/model-library/__tests__/multimodal-pricing.test.ts src/lib/model-library/__tests__/pricing.test.ts src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx
```

Expected: PASS with all multimodal adapter, pricing, grid-card, and row-list tests green

- [ ] **Step 2: Run TypeScript verification**

Run:

```bash
./node_modules/.bin/tsc --noEmit --pretty false
```

Expected: exit code `0` with no TypeScript errors

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff -- src/types/models.ts src/lib/model-library/multimodal-pricing.ts src/lib/model-library/pricing.ts src/lib/model-library/__tests__/multimodal-pricing.test.ts src/lib/model-library/__tests__/pricing.test.ts src/app/models-console/library/components/ConsoleExpandedPriceDetails.tsx src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx src/app/models-console/library/components/ConsoleModelCard.tsx src/app/models-console/library/components/ConsoleModelList.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx
```

Expected: diff limited to console library multimodal pricing work with no `/pricing` route changes

- [ ] **Step 4: Create the final integration commit**

```bash
git add src/types/models.ts src/lib/model-library/multimodal-pricing.ts src/lib/model-library/pricing.ts src/lib/model-library/__tests__/multimodal-pricing.test.ts src/lib/model-library/__tests__/pricing.test.ts src/app/models-console/library/components/ConsoleExpandedPriceDetails.tsx src/app/models-console/library/components/ConsoleTieredPricingPopover.tsx src/app/models-console/library/components/ConsoleModelCard.tsx src/app/models-console/library/components/ConsoleModelList.tsx src/app/models-console/library/components/__tests__/ConsoleModelCard.test.tsx src/app/models-console/library/components/__tests__/ConsoleModelList.test.tsx
git commit -m "feat: add multimodal pricing details to console model library"
```
