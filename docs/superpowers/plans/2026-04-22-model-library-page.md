# Model Library Page v5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/models` page in-place with a Hero section, a two-column sidebar+content layout, flat card grid with square-variant cards, and a footer.

**Architecture:** Server component `page.tsx` fetches LLM model data and renders `ModelLibraryHero` (static PNG + CSS gradient), a refactored `Content.tsx` (sidebar + flat grid), and `FooterSection`. The `useModelLibrary` hook gains `categoryCounts`, `providerCounts`, and `clearFilter`. `BaseModelCard` gets a `variant="square"` prop to avoid breaking other pages.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, CSS custom properties (design tokens), SCSS modules (only for `BaseModelCard`), `next/image`

---

## File Map

| Action | Path                                                              | Responsibility                                                                  |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Modify | `src/hooks/useModelLibrary.ts`                                    | Add `categoryCounts`, `providerCounts`, `clearFilter`                           |
| Modify | `src/app/components/ModelLibrary/BaseModelCard/index.tsx`         | Add `variant` prop                                                              |
| Modify | `src/app/components/ModelLibrary/BaseModelCard/index.module.scss` | Add `.square` variant styles                                                    |
| Create | `src/app/models/components/ModelLibraryHero.tsx`                  | Hero section                                                                    |
| Create | `src/app/components/ModelLibrary/SidebarFilter/index.tsx`         | Left sidebar                                                                    |
| Modify | `src/app/models/model-library/Content.tsx`                        | Two-column layout, flat grid, no ModelFilter/ModelSectionRenderer               |
| Modify | `src/app/models/page.tsx`                                         | Swap Header→WebsiteNavbar, add Hero, swap Footer→FooterSection, remove DeBanner |

---

## Task 1: Extend `useModelLibrary` hook

**Files:**

- Modify: `src/hooks/useModelLibrary.ts`

- [ ] **Step 1: Add `categoryCounts` useMemo**

  Open `src/hooks/useModelLibrary.ts`. After the existing `allModels` useMemo (around line 475), add:

  ```typescript
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [ModelType.Featured]: 0,
      [ModelType.All]: 0,
      [ModelType.Chat]: 0,
      [ModelType.Serverless]: 0,
      [ModelType.Images]: 0,
      [ModelType.Video]: 0,
      [ModelType.Embedding]: 0,
      [ModelType.Reranker]: 0,
    };
    allModels.forEach((model) => {
      counts[ModelType.All] = (counts[ModelType.All] || 0) + 1;
      if (model.isFeatured) {
        counts[ModelType.Featured] = (counts[ModelType.Featured] || 0) + 1;
      }
      if (model.type) {
        counts[model.type] = (counts[model.type] || 0) + 1;
      }
      if (model.tags?.includes("Serverless")) {
        counts[ModelType.Serverless] = (counts[ModelType.Serverless] || 0) + 1;
      }
    });
    return counts;
  }, [allModels]);
  ```

- [ ] **Step 2: Add `providerCounts` useMemo**

  Immediately after `categoryCounts`, add:

  ```typescript
  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allModels.forEach((model) => {
      if (model.series) {
        counts[model.series] = (counts[model.series] || 0) + 1;
      }
    });
    return counts;
  }, [allModels]);
  ```

- [ ] **Step 3: Add `clearFilter` function**

  After the existing `handleProviderChange` function (around line 473), add:

  ```typescript
  const clearFilter = () => {
    setSelectedCategory(ModelType.All);
    setSelectedProvider("");
  };
  ```

- [ ] **Step 4: Export new values from the hook**

  In the `return` object at the bottom of `useModelLibrary`, add the three new exports:

  ```typescript
  return {
    allModels,
    libraryData,
    selectedCategory,
    selectedProvider,
    categoryCounts,
    providerCounts,
    clearFilter,
    actions,
  };
  ```

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  cd /Users/mac/Desktop/workspace/platform/novita-home
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors related to `useModelLibrary.ts`

- [ ] **Step 6: Commit**

  ```bash
  git add src/hooks/useModelLibrary.ts
  git commit -m "feat(models): add categoryCounts, providerCounts, clearFilter to useModelLibrary"
  ```

---

## Task 2: Add `variant="square"` to `BaseModelCard`

**Files:**

- Modify: `src/app/components/ModelLibrary/BaseModelCard/index.tsx`
- Modify: `src/app/components/ModelLibrary/BaseModelCard/index.module.scss`

- [ ] **Step 1: Add `.square` styles to SCSS**

  Open `src/app/components/ModelLibrary/BaseModelCard/index.module.scss`. Append at the end of the file (after `.highPriority`):

  ```scss
  .square {
    border-radius: 0;
    padding: 0;
    border: 1px solid var(--border-2);

    &:hover {
      border-color: var(--brand-0);
      box-shadow: none;
      background-color: rgba(202, 246, 224, 0.2);
    }

    .logoBox {
      margin-bottom: 0;
    }

    .squareHeader {
      padding: var(--space-16);
    }

    .squareDivider {
      border-bottom: 1px solid var(--border-2);
      margin: 0 var(--space-16);
    }

    .squarePricing {
      padding: var(--space-12) var(--space-16);
    }

    .tags {
      margin-top: 0;
      padding: var(--space-16);
      border-top: none;
      background-color: var(--fill-4);

      span {
        background-color: var(--fill-white);
        border-radius: 0;
        font-family: var(--mono-font-family);
        font-size: var(--mono-12-font-size);
        line-height: var(--mono-12-line-height);
        text-transform: uppercase;
        color: var(--text-1);
        padding: var(--space-4) var(--space-6);
      }
    }

    .llmLibraryInfo {
      padding: var(--space-12) var(--space-16);
      border-top: none;
    }
  }
  ```

- [ ] **Step 2: Add `variant` prop to `BaseModelCardProps` interface**

  Open `src/app/components/ModelLibrary/BaseModelCard/index.tsx`.

  In the `BaseModelCardProps` interface (around line 11), add:

  ```typescript
  variant?: "default" | "square";
  ```

- [ ] **Step 3: Accept and apply `variant` prop in the component**

  In the function signature (line 25), add `variant = "default"` to destructured props:

  ```typescript
  export default function BaseModelCard({
    modelName,
    displayName,
    logo,
    tags,
    infos,
    clickable = true,
    deprecated = false,
    labelDataList,
    onClick,
    className,
    isPartner = false,
    variant = "default",
  }: BaseModelCardProps) {
  ```

- [ ] **Step 4: Apply square variant layout in JSX**

  Replace the entire `return (...)` block with a variant-aware version. The key change is: when `variant === "square"`, render header/divider/pricing/tags as distinct sections instead of a flat card. Existing `variant === "default"` behavior is unchanged.

  ```typescript
  const isSquare = variant === "square";

  if (isSquare) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          styles.container,
          styles.square,
          deprecated ? styles.deprecated : "",
          !clickable ? styles.unclickable : "",
          className,
        )}
      >
        {/* Top-right badge labels */}
        <div className={styles.label_container}>
          {labelDataList?.map(({ text, type }, index) => (
            <span
              key={`${text}-${index}`}
              className={cn(
                styles.model_label,
                type === "deprecated"
                  ? styles.deprecated_label
                  : styles.normal_label,
              )}
            >
              {text}
            </span>
          ))}
        </div>

        {/* Header: logo + name */}
        <div className={cn(styles.squareHeader, "flex items-center gap-[var(--space-8)]")}>
          <span className={cn(styles.logoBox, "!w-[var(--height-36)] !h-[var(--height-36)]")}>
            <ModelLogo logo={logo} modelName={modelName} size={36} />
          </span>
          <span className="font-paragraph-20-medium text-[var(--text-1)]">
            {displayName || modelName}
          </span>
        </div>

        {/* Divider */}
        <div className={styles.squareDivider} />

        {/* Pricing / Info */}
        <div className={cn(styles.squarePricing, isLLMLibraryInfo(infos) ? styles.llmLibraryInfo : styles.mediaModelInfo)}>
          {renderInfoContent()}
        </div>

        {/* Tags footer */}
        <span className={styles.tags}>
          {isPartner && <PartnerTag />}
          {tags.map((tag: string, index: number) => (
            <span data-tag={tag} key={index}>
              {tag}
            </span>
          ))}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        styles.container,
        deprecated ? styles.deprecated : "",
        !clickable ? styles.unclickable : "",
        className,
      )}
    >
      <div className={styles.label_container}>
        {labelDataList?.map(({ text, type }, index) => (
          <span
            key={`${text}-${index}`}
            className={cn(
              styles.model_label,
              type === "deprecated"
                ? styles.deprecated_label
                : styles.normal_label,
            )}
          >
            {text}
          </span>
        ))}
      </div>

      <span className={styles.logoBox}>
        <ModelLogo logo={logo} modelName={modelName} />
      </span>

      <span className={styles.modelName}>{displayName || modelName}</span>

      <span
        className={`${styles.info} ${isLLMLibraryInfo(infos) ? styles.llmLibraryInfo : styles.mediaModelInfo}`}
      >
        {renderInfoContent()}
      </span>

      <span className={styles.tags}>
        {isPartner && <PartnerTag />}
        {tags.map((tag: string, index: number) => (
          <span data-tag={tag} key={index}>
            {tag}
          </span>
        ))}
      </span>
    </div>
  );
  ```

  Place the `isSquare` constant and the new `if (isSquare)` block right before the existing `return (` in the component body.

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors

- [ ] **Step 6: Confirm no existing callers pass `variant`**

  ```bash
  grep -rn "BaseModelCard\|LLMModelCard\|MediaModelCard" src/ --include="*.tsx" | grep "variant" | head -10
  ```

  Expected: no output (no existing caller passes `variant`)

- [ ] **Step 7: Commit**

  ```bash
  git add src/app/components/ModelLibrary/BaseModelCard/index.tsx src/app/components/ModelLibrary/BaseModelCard/index.module.scss
  git commit -m "feat(models): add variant=square to BaseModelCard"
  ```

---

## Task 3: Create `ModelLibraryHero` component

**Files:**

- Create: `src/app/models/components/ModelLibraryHero.tsx`

- [ ] **Step 1: Create the component directory and file**

  ```bash
  mkdir -p /Users/mac/Desktop/workspace/platform/novita-home/src/app/models/components
  ```

- [ ] **Step 2: Write `ModelLibraryHero.tsx`**

  Create `src/app/models/components/ModelLibraryHero.tsx`:

  ```typescript
  import Image from "next/image";
  import Link from "next/link";
  import Button from "@/app/components/button/Button";
  import { NOVITA_URL, CALENDLY_URL } from "@/constants/urls";

  export default function ModelLibraryHero() {
    return (
      <section className="relative w-full min-h-[700px] bg-[var(--gray-50)] overflow-hidden">
        {/* Background image in safe zone */}
        <div className="absolute inset-0 max-w-[1280px] mx-auto pointer-events-none">
          <Image
            src="/models/v5/modelapi-bg.png"
            alt=""
            fill
            className="object-contain object-right-top"
            priority
            aria-hidden="true"
          />
        </div>

        {/* Bottom gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[208px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--gray-50))",
          }}
        />

        {/* Content */}
        <div className="relative z-10 absolute bottom-[131px] left-[124px] max-w-[560px]">
          <div className="flex flex-col gap-[24px] py-[80px]">
            <div className="flex flex-col gap-[16px]">
              <h1 className="font-miletus font-display-md text-[var(--text-1)]">
                Browse our supported open source models
              </h1>
              <p className="font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]">
                Developer-first infrastructure that scales from zero to
                production.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="primary"
                height={40}
                renderTag="link"
                link={NOVITA_URL.USER_REGISTER}
                className="!rounded-[999px] !bg-[var(--gray-950)] !text-[var(--white)] hover:!bg-[var(--gray-800)] !px-5 font-paragraph-14 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.12),inset_0px_2px_0px_0px_var(--alpha-light-20)]"
              >
                Start Building
              </Button>
              <Button
                type="text"
                height={44}
                renderTag="link"
                link={CALENDLY_URL}
                className="!rounded-[999px] !px-5 !no-underline font-paragraph-14 text-[var(--gray-800)] flex items-center gap-1"
              >
                Talk to Us
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors

- [ ] **Step 4: Confirm background image exists**

  ```bash
  ls /Users/mac/Desktop/workspace/platform/novita-home/public/models/v5/modelapi-bg.png
  ```

  Expected: file listed

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/models/components/ModelLibraryHero.tsx
  git commit -m "feat(models): add ModelLibraryHero component"
  ```

---

## Task 4: Create `SidebarFilter` component

**Files:**

- Create: `src/app/components/ModelLibrary/SidebarFilter/index.tsx`

- [ ] **Step 1: Create directory**

  ```bash
  mkdir -p /Users/mac/Desktop/workspace/platform/novita-home/src/app/components/ModelLibrary/SidebarFilter
  ```

- [ ] **Step 2: Write `SidebarFilter/index.tsx`**

  Create `src/app/components/ModelLibrary/SidebarFilter/index.tsx`:

  ```typescript
  "use client";

  import { useMemo } from "react";
  import { ModelType, LLMModelWithStatus, MediaModel } from "@/types/models";
  import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
  import { cn } from "@/lib/utils";

  type AnyModel = LLMModelWithStatus | MediaModel;

  interface SidebarFilterProps {
    allModels: AnyModel[];
    selectedCategory: ModelType | "";
    selectedProvider: string;
    categoryCounts: Record<string, number>;
    providerCounts: Record<string, number>;
    onCategoryChange: (category: ModelType | "") => void;
    onProviderChange: (provider: string) => void;
  }

  const TASK_ITEMS: { label: string; value: ModelType | "" }[] = [
    { label: "Featured", value: ModelType.Featured },
    { label: "All Models", value: ModelType.All },
    { label: "LLM", value: ModelType.Chat },
    { label: "Serverless", value: ModelType.Serverless },
    { label: "Image", value: ModelType.Images },
    { label: "Video", value: ModelType.Video },
    { label: "Embedding", value: ModelType.Embedding },
    { label: "Reranker", value: ModelType.Reranker },
  ];

  export default function SidebarFilter({
    allModels,
    selectedCategory,
    selectedProvider,
    categoryCounts,
    providerCounts,
    onCategoryChange,
    onProviderChange,
  }: SidebarFilterProps) {
    const providers = useMemo(() => {
      return Object.entries(providerCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    }, [providerCounts]);

    const getProviderModelName = (series: string): string => {
      const model = allModels.find((m) => m.series === series);
      return model ? (model.name as string) : series;
    };

    return (
      <aside className="w-[256px] flex-shrink-0">
        {/* TASK section */}
        <div className="mb-[var(--space-16)]">
          <p className="font-mono-13 text-[var(--gray-400)] uppercase tracking-[0.26px] mb-[var(--space-8)]">
            TASK
          </p>
          <div>
            {TASK_ITEMS.map((item) => {
              const isSelected = selectedCategory === item.value;
              const count = categoryCounts[item.value as string] ?? 0;
              return (
                <button
                  key={item.value}
                  onClick={() => onCategoryChange(item.value)}
                  className="w-full h-[46px] border-b border-[var(--border-2)] flex justify-between items-center cursor-pointer hover:bg-[var(--fill-4)]"
                >
                  <span className="flex items-center gap-[var(--space-8)]">
                    {isSelected && (
                      <span className="size-[var(--space-8)] rounded-[var(--radius-2)] bg-[var(--brand-0)] flex-shrink-0" />
                    )}
                    {!isSelected && (
                      <span className="size-[var(--space-8)] flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "font-paragraph-14 uppercase",
                        isSelected
                          ? "text-[var(--text-1)]"
                          : "text-[var(--text-1)]",
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-paragraph-14",
                      isSelected
                        ? "text-[var(--brand-0)]"
                        : "text-[var(--text-3)]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PROVIDER section */}
        <div>
          <p className="font-mono-13 text-[var(--gray-400)] uppercase tracking-[0.26px] mb-[var(--space-8)]">
            PROVIDER
          </p>
          <div className="overflow-y-auto max-h-[480px]">
            {providers.map(([series, count]) => {
              const isSelected = selectedProvider === series;
              const representativeModelName = getProviderModelName(series);
              return (
                <button
                  key={series}
                  onClick={() =>
                    onProviderChange(isSelected ? "" : series)
                  }
                  className="w-full h-[56px] border-b border-[var(--border-2)] flex justify-between items-center cursor-pointer hover:bg-[var(--fill-4)]"
                >
                  <span className="flex items-center gap-[var(--space-8)]">
                    {isSelected && (
                      <span className="size-[var(--space-8)] rounded-[var(--radius-2)] bg-[var(--brand-0)] flex-shrink-0" />
                    )}
                    {!isSelected && (
                      <span className="size-[var(--space-8)] flex-shrink-0" />
                    )}
                    <ModelLogo
                      modelName={representativeModelName}
                      size={24}
                    />
                    <span className="font-paragraph-14 text-[var(--text-1)]">
                      {series}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-paragraph-14",
                      isSelected
                        ? "text-[var(--brand-0)]"
                        : "text-[var(--text-3)]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/components/ModelLibrary/SidebarFilter/index.tsx
  git commit -m "feat(models): add SidebarFilter component"
  ```

---

## Task 5: Refactor `Content.tsx` to new two-column layout

**Files:**

- Modify: `src/app/models/model-library/Content.tsx`

- [ ] **Step 1: Rewrite `Content.tsx` entirely**

  Replace the entire content of `src/app/models/model-library/Content.tsx` with:

  ```typescript
  "use client";

  import { useEffect } from "react";
  import { ModelType, LLMModelWithStatus, MediaModel } from "@/types/models";
  import ModelSearch from "@/app/components/ModelLibrary/Search";
  import { useModelLibrary } from "@/hooks/useModelLibrary";
  import LLMModelCard from "@/app/components/ModelLibrary/LLMModelCard";
  import MediaModelCard from "@/app/components/ModelLibrary/MediaModelCard";
  import SidebarFilter from "@/app/components/ModelLibrary/SidebarFilter";
  import { useAppDispatch } from "@/store";
  import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
  import { ChevronRight, Search } from "lucide-react";

  interface ContentProps {
    llmModelList: LLMModelWithStatus[];
  }

  export default function Content({ llmModelList }: ContentProps) {
    const dispatch = useAppDispatch();
    const {
      allModels,
      filteredModels,
      selectedCategory,
      selectedProvider,
      categoryCounts,
      providerCounts,
      clearFilter,
      actions,
    } = useModelLibrary(llmModelList);

    useEffect(() => {
      dispatch(fetchMultimodalConfigs(false) as any);
    }, [dispatch]);

    const renderCard = (model: LLMModelWithStatus | MediaModel) => {
      if (
        model.type === ModelType.Chat ||
        model.type === ModelType.Embedding ||
        model.type === ModelType.Reranker ||
        model.type === ModelType.Vision
      ) {
        return (
          <LLMModelCard
            key={model.id}
            data={model as LLMModelWithStatus}
            variant="square"
          />
        );
      }
      return (
        <MediaModelCard
          key={model.id}
          data={model as MediaModel}
          variant="square"
        />
      );
    };

    return (
      <div className="max_width_container mt-[60px] mx-web">
        <div className="flex flex-row gap-[66px]">
          {/* Left sidebar */}
          <SidebarFilter
            allModels={allModels}
            selectedCategory={selectedCategory}
            selectedProvider={selectedProvider}
            categoryCounts={categoryCounts}
            providerCounts={providerCounts}
            onCategoryChange={actions.handleCategoryChange}
            onProviderChange={actions.handleProviderChange}
          />

          {/* Right content area */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex justify-between items-start mb-[var(--space-16)]">
              <div>
                <h2 className="font-heading-h2 text-[var(--text-1)]">
                  Explore the library
                </h2>
                <p className="font-paragraph-16 text-[var(--text-3)] mt-[var(--space-4)]">
                  Browse our supported open source models and deploy in
                  dedicated endpoints
                </p>
              </div>
              <button
                onClick={clearFilter}
                className="flex items-center gap-1 text-[var(--brand-0)] uppercase font-mono text-[14px] whitespace-nowrap mt-[var(--space-4)] hover:opacity-80"
              >
                VIEW ALL {allModels.length}+ MODELS
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative w-full mb-[var(--space-16)]">
              <ModelSearch
                models={allModels}
                className="w-full h-[46px] !rounded-none !border !border-[var(--border-2)] !border-2-0"
                placeholder="SEARCH MODELS (e.g. Llama 3)"
              />
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-3 gap-x-[18px] gap-y-[var(--space-12)] mt-4">
              {filteredModels.map((model) => renderCard(model))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-[var(--space-48)] text-[var(--text-3)] font-paragraph-16">
                No models found. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

  Note: `filteredModels` needs to be exported from `useModelLibrary`. Check Step 2.

- [ ] **Step 2: Export `filteredModels` from the hook**

  Open `src/hooks/useModelLibrary.ts`. In the `return` object, add `filteredModels`:

  ```typescript
  return {
    allModels,
    filteredModels,
    libraryData,
    selectedCategory,
    selectedProvider,
    categoryCounts,
    providerCounts,
    clearFilter,
    actions,
  };
  ```

  `filteredModels` is already computed inside the hook (line ~375), just needs to be exposed.

- [ ] **Step 3: Thread `variant` prop through `LLMModelCard` and `MediaModelCard`**

  **`src/app/components/ModelLibrary/LLMModelCard.tsx`:**

  In `LLMModelCardProps` interface (around line 17), add:

  ```typescript
  variant?: "default" | "square";
  ```

  In function signature (around line 23), add `variant = "default"`:

  ```typescript
  export default function LLMModelCard({
    data,
    displayMode = "block",
    className,
    variant = "default",
  }: LLMModelCardProps) {
  ```

  In the `<Component .../>` call (around line 132), add:

  ```typescript
  <Component
    modelName={modelName}
    displayName={displayModelName}
    logo={logo}
    tags={tags || []}
    infos={infos}
    clickable={!!link || !!linkPath}
    deprecated={isDeprecated}
    labelDataList={labelDataList}
    onClick={handleClick}
    className={className}
    isPartner={isPartner}
    variant={variant}
  />
  ```

  **`src/app/components/ModelLibrary/MediaModelCard.tsx`:**

  In `MediaModelCardProps` interface (around line 11), add:

  ```typescript
  variant?: "default" | "square";
  ```

  In function signature (around line 16), add `variant = "default"`:

  ```typescript
  export default function MediaModelCard({
    data,
    displayMode = "block",
    variant = "default",
  }: MediaModelCardProps) {
  ```

  In the `<Component .../>` call (around line 60), add `variant={variant}`:

  ```typescript
  <Component
    modelName={modelName}
    displayName={displayModelName}
    tags={tags}
    infos={infos}
    clickable={!!link}
    labelDataList={labelDataList}
    onClick={handleClick}
    variant={variant}
  />
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: no errors

- [ ] **Step 5: Commit**

  ```bash
  git add src/app/models/model-library/Content.tsx src/hooks/useModelLibrary.ts src/app/components/ModelLibrary/LLMModelCard.tsx src/app/components/ModelLibrary/MediaModelCard.tsx
  git commit -m "feat(models): refactor Content to two-column layout with SidebarFilter and flat card grid"
  ```

---

## Task 6: Update `/models/page.tsx`

**Files:**

- Modify: `src/app/models/page.tsx`
- Modify: `src/app/models/page.module.scss`

- [ ] **Step 1: Rewrite `page.tsx`**

  Replace the entire content of `src/app/models/page.tsx` with:

  ```typescript
  import { Metadata } from "next";
  import { cookies } from "next/headers";
  import { CANONICAL_URL } from "@/constants/canonical";
  import { getFullLLMModels } from "@/api/model";
  import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
  import ModelLibraryHero from "./components/ModelLibraryHero";
  import Content from "./model-library/Content";
  import FooterSection from "@/app/components/footer-section/FooterSection";

  export async function generateMetadata(): Promise<Metadata> {
    return {
      title: "Model Library With 200+ APIs for AI Applications | Novita AI",
      description:
        "Call 200+ AI models with one API: LLMs, image generation, video, TTS, embeddings. Go from prototype to production without managing servers.",
      alternates: {
        canonical: CANONICAL_URL.MODELS,
      },
    };
  }

  export default async function Page() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const llmModelList = await getFullLLMModels(
      ["chat", "embedding", "reranker"],
      token,
    );
    return (
      <div className="flex flex-col min-h-screen bg-[var(--gray-50)]">
        <WebsiteNavbar />
        <ModelLibraryHero />
        <Content llmModelList={llmModelList} />
        <FooterSection />
      </div>
    );
  }
  ```

- [ ] **Step 2: Update `page.module.scss`**

  The old `.container` had `margin-top: var(--header-height)`. Since `WebsiteNavbar` (used on homepage) is absolute/sticky and handles its own spacing, and `ModelLibraryHero` fills from top, replace the file content with:

  ```scss
  // page layout handled entirely by Tailwind classes
  ```

  Or simply leave it empty — the `styles.container` reference is removed from the JSX above.

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit 2>&1 | head -20
  ```

  Expected: no errors

- [ ] **Step 4: Start the dev server and verify the page loads**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000/models` and verify:
  - WebsiteNavbar renders at the top
  - Hero section shows with background image and content text
  - Two-column layout: sidebar on left, content on right
  - Model cards render in grid with square variant
  - Sidebar category filter updates card grid when clicked
  - Sidebar provider filter updates card grid when clicked
  - "VIEW ALL X+ MODELS" button resets filters
  - FooterSection (Banner + Footer) renders at the bottom

- [ ] **Step 5: Verify no regressions on existing pages**

  Check that the following pages still render without errors:
  - `http://localhost:3000/` (homepage — uses WebsiteNavbar + BaseModelCard in default variant)
  - Any page that uses `LLMModelCard` or `MediaModelCard` — confirm they still render correctly

- [ ] **Step 6: Commit**

  ```bash
  git add src/app/models/page.tsx src/app/models/page.module.scss
  git commit -m "feat(models): update page to v5 layout with Hero, SidebarFilter, FooterSection"
  ```

---

## Task 7: Final cleanup and ModelSearch style adjustment

**Files:**

- Modify: `src/app/components/ModelLibrary/Search/index.tsx` (style props only)

- [ ] **Step 1: Verify ModelSearch accepts className and placeholder overrides**

  ```bash
  grep -n "className\|placeholder" src/app/components/ModelLibrary/Search/index.tsx | head -20
  ```

  The `Content.tsx` passes `className` and `placeholder` props. If `ModelSearch` doesn't accept `placeholder`, add it to its props interface and thread it through to the inner `SearchInput`.

- [ ] **Step 2: Confirm the search bar renders with correct styles at `h-[46px]` and `rounded-none`**

  The `className` override in Content.tsx is:

  ```
  "w-full h-[46px] !rounded-none !border !border-[var(--border-2)]"
  ```

  If the existing internal SearchInput element has classes that override these, use `!important` variants (already added above with `!rounded-none`). Test visually.

- [ ] **Step 3: Commit if any changes made**

  ```bash
  git add src/app/components/ModelLibrary/Search/index.tsx
  git commit -m "fix(models): thread placeholder prop through ModelSearch"
  ```

---

## Notes

- `ModelType.Serverless` filter in `categoryCounts`: counts models with `tags?.includes("Serverless")`, matching the existing `filteredModels` logic in the hook.
- `ModelType.Featured` count: counts models with `model.isFeatured === true`.
- `clearFilter` sets category to `ModelType.All` and provider to `""`.
- The hero uses CSS `absolute` positioning for the content area. If `WebsiteNavbar` is sticky/fixed and overlaps the top of the hero, add `pt-[var(--header-height)]` to the hero section.
- `LLMModelCard` and `MediaModelCard` are thin wrappers that call `BaseModelCard`. The `variant` prop must be threaded through them — this is handled in Task 5 Step 3.
