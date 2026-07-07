"use client";

import { useEffect, useMemo, useState } from "react";
import { getFullLLMModelsWithCache } from "@/api/model";
import EmptyPageLoading from "@/components/ui/standard/empty-page-loading";
import { useModelLibrary } from "@/hooks/useModelLibrary";
import { useI18n } from "@/i18n/provider";
import { useAppDispatch } from "@/store";
import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
import type { LLMModelWithStatus } from "@/types/models";
import {
  applyFacetFilters,
  buildFacetRecords,
  getFacetOptions,
} from "@/lib/model-library/facets/engine";
import { getConsoleModelLibraryFacets } from "@/lib/model-library/facets/definitions";
import {
  clearFacetValue,
  createEmptyFacetFilterState,
  toggleFacetValue,
} from "@/lib/model-library/filters";
import {
  hasActiveFacetFilters,
  shouldShowFeaturedSection,
  shouldUseFlatModelResults,
  sortModelsByNewest,
} from "@/lib/model-library/sections";
import { ConsoleModelMain } from "./ConsoleModelMain";
import { ConsoleModelSidebar } from "./ConsoleModelSidebar";
import {
  ConsoleModelToolbar,
  type ConsoleModelSortMode,
  type ConsoleModelViewMode,
} from "./ConsoleModelToolbar";
import { ConsoleSelectedFilters } from "./ConsoleSelectedFilters";

export function ConsoleModelLibrary() {
  const { locale } = useI18n();
  const dispatch = useAppDispatch();
  const [llmModelList, setLlmModelList] = useState<LLMModelWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ConsoleModelViewMode>("grid");
  const [sortMode, setSortMode] = useState<ConsoleModelSortMode>(null);
  const [filters, setFilters] = useState(createEmptyFacetFilterState);

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
  const facets = useMemo(() => getConsoleModelLibraryFacets(locale), [locale]);

  const facetRecords = useMemo(
    () => buildFacetRecords(allModels, facets),
    [allModels, facets],
  );

  const facetOptions = useMemo(
    () => getFacetOptions(facetRecords, facets),
    [facetRecords, facets],
  );

  const facetModels = useMemo(
    () => applyFacetFilters(facetRecords, facets, filters),
    [facetRecords, facets, filters],
  );

  const filteredModels = useMemo(() => {
    if (sortMode === "newest") {
      return sortModelsByNewest(facetModels);
    }

    return facetModels;
  }, [facetModels, sortMode]);

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <EmptyPageLoading />
      </div>
    );
  }

  const hasFilters = hasActiveFacetFilters(filters);
  const showFeatured = shouldShowFeaturedSection(filters);
  const showFlatResults = shouldUseFlatModelResults(filters);

  return (
    <div className="h-full min-h-0 overflow-hidden bg-surface">
      <div className="flex h-full min-h-0 w-full">
        <ConsoleModelSidebar
          filters={filters}
          models={allModels}
          options={facetOptions}
          onToggle={(key, value) =>
            setFilters((current) => toggleFacetValue(current, key, value))
          }
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-space-16 scrollbar-overlay">
          <div className="flex flex-col gap-space-16">
            {showFlatResults ? (
              <ConsoleModelToolbar
                viewMode={viewMode}
                sortMode={sortMode}
                resultCount={filteredModels.length}
                onViewModeChange={setViewMode}
                onSortModeChange={setSortMode}
              />
            ) : null}
            {hasFilters ? (
              <ConsoleSelectedFilters
                filters={filters}
                options={facetOptions}
                onClear={(key, value) =>
                  setFilters((current) => clearFacetValue(current, key, value))
                }
                onClearAll={() => setFilters(createEmptyFacetFilterState())}
              />
            ) : null}
            <ConsoleModelMain
              models={filteredModels}
              allModels={allModels}
              viewMode={viewMode}
              showFeatured={showFeatured}
              showFlatResults={showFlatResults}
              onViewAllSection={(value) =>
                setFilters((current) => ({
                  ...current,
                  modalities: [value],
                }))
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}
