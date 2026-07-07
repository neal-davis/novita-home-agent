"use client";

import { useEffect, useMemo, useRef } from "react";
import { ModelType, LLMModelWithStatus, MediaModel } from "@/types/models";
import ModelSearch from "@/app/components/ModelLibrary/Search";
import { LLMQuickFilter, useModelLibrary } from "@/hooks/useModelLibrary";
import LLMModelCard from "@/app/components/ModelLibrary/LLMModelCard";
import MediaModelCard from "@/app/components/ModelLibrary/MediaModelCard";
// import SidebarFilter from "@/app/components/ModelLibrary/SidebarFilter";
import getCampaignConfig from "@/config/campaign";
import { useAppDispatch } from "@/store";
import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
import { cn } from "@/lib/utils";
import ModelFilter, {
  createBaseFilterTypes,
} from "@/app/components/ModelLibrary/LabelFilters";
import { X } from "lucide-react";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { useI18n } from "@/i18n/provider";
// import campaign from "@/config/campaign";

interface ContentProps {
  llmModelList: LLMModelWithStatus[];
  defaultType?: string;
  defaultProvider?: string;
}

const MODEL_SEARCH_SCROLL_LESS_DOWN_PX = 40;

function createLlmQuickFilters(): { label: string; value: LLMQuickFilter }[] {
  return [
    { label: "All", value: "all" },
    { label: "Text to Image", value: "text-to-image" },
    { label: "Text to Text", value: "text-to-text" },
    // { label: "Text Embeddings", value: "text-embeddings" },
    { label: "Text to Audio", value: "text-to-audio" },
  ];
}

function LlmQuickFilterTabs({
  value,
  onChange,
}: {
  value: LLMQuickFilter;
  onChange: (value: LLMQuickFilter) => void;
}) {
  const { locale } = useI18n();
  const quickFilters = useMemo(() => {
    void locale;
    return createLlmQuickFilters();
  }, [locale]);

  return (
    <div className="flex w-full items-start gap-[var(--space-24)] overflow-x-auto border-b border-gray-400">
      {quickFilters.map((item) => {
        const isSelected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-[var(--space-12)] font-mono-13 uppercase tracking-[0.26px] text-element-high-em transition-opacity hover:opacity-80",
              item.value === "all" ? "w-[153px]" : "min-w-[128px]",
            )}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "h-[3px] w-full bg-element-high-em transition-opacity",
                isSelected ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function Content({
  llmModelList,
  defaultType,
  defaultProvider,
}: ContentProps) {
  useI18n();
  const campaign = getCampaignConfig();
  const dispatch = useAppDispatch();
  const filterTypes = createBaseFilterTypes();
  const {
    allModels,
    filteredModels,
    selectedCategory,
    selectedProvider,
    selectedLlmQuickFilter,
    actions,
  } = useModelLibrary(llmModelList, defaultType, defaultProvider);

  const modelSearchAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(defaultType || defaultProvider)) return;
    const el = modelSearchAnchorRef.current;
    if (!el) return;
    const scrollMarginTop = Number.parseFloat(
      getComputedStyle(el).scrollMarginTop,
    );
    const marginTop = Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0;
    const top =
      window.scrollY +
      el.getBoundingClientRect().top -
      marginTop -
      MODEL_SEARCH_SCROLL_LESS_DOWN_PX;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [defaultType, defaultProvider]);

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
    <div
      id="models-library"
      className="mx-auto mt-[60px] w-full min-w-0 max-w-layout-safe scroll-mt-[100px] px-[var(--spacing-layout-x)] pb-[var(--space-120)]"
    >
      {/* Row 1: Title — full width */}
      {/* <div className="flex justify-between items-end mb-[var(--space-24)]">
        <div>
          <h2 className="font-heading-h2 text-[var(--text-1)]">
            Explore the library
          </h2>
          <p className="font-paragraph-16 text-[var(--text-3)] mt-[var(--space-4)]">
            Browse our supported open source models and deploy in dedicated
            endpoints
          </p>
        </div>
      </div> */}

      <div
        id="model-search"
        ref={modelSearchAnchorRef}
        className="relative mb-[36px] flex w-full justify-center scroll-mt-[100px]"
      >
        <ModelSearch
          models={allModels}
          className="h-[52px] w-full max-w-[774px]"
        />
      </div>
      {/* Row 2: Sidebar + Content */}
      <div className="flex flex-col gap-[36px]">
        {/* Left sidebar */}
        {/* <SidebarFilter
          allModels={allModels}
          selectedCategory={selectedCategory}
          selectedProvider={selectedProvider}
          categoryCounts={categoryCounts}
          providerCounts={providerCounts}
          onCategoryChange={actions.handleCategoryChange}
          onProviderChange={actions.handleProviderChange}
        /> */}
        <ModelFilter
          models={allModels}
          selectedCategory={selectedCategory}
          selectedProvider={selectedProvider}
          onFilterChange={actions.handleCategoryChange}
          onProviderChange={actions.handleProviderChange}
          campaignConfig={
            campaign?.enabled
              ? {
                  displayName: campaign.modelLibraryDisplayName || "",
                  discountLabel: campaign.modelLibraryDiscountLabel || "",
                  enabled: campaign.enabled,
                }
              : undefined
          }
          className="w-full"
        />

        {/* Right content area */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}

          {selectedCategory === ModelType.Chat ? (
            <div className="mb-[36px]">
              <LlmQuickFilterTabs
                value={selectedLlmQuickFilter}
                onChange={actions.handleLlmQuickFilterChange}
              />
            </div>
          ) : (
            <div className="flex flex-row items-center h-6 gap-6 mb-[36px]">
              <span className="text-text-1 font-paragraph-18">
                Models ({filteredModels.length})
              </span>
              <div className="flex flex-row items-center gap-2">
                {![ModelType.All].includes(selectedCategory as ModelType) && (
                  <div className="flex flex-row items-center h-6 gap-1 p-2 rounded-sm bg-white border border-gray-400">
                    <span className="text-text-1 font-paragraph-13">
                      {
                        filterTypes.find(
                          (item) => item.value === selectedCategory,
                        )?.label
                      }
                    </span>
                    <div
                      className="flex items-center justify-center hover:bg-fill-3 rounded-sm p-1"
                      onClick={() =>
                        actions.handleCategoryChange(ModelType.All)
                      }
                    >
                      <X size={10} className="text-text-1 cursor-pointer" />
                    </div>
                  </div>
                )}
                {selectedProvider && (
                  <div className="flex flex-row items-center h-6 gap-1 px-2 py-1 rounded-sm bg-white border border-gray-400">
                    <ModelLogo modelName={selectedProvider} size={18} />
                    <span className="text-text-1 font-paragraph-13">
                      {selectedProvider}
                    </span>
                    <div
                      className="flex items-center justify-center hover:bg-fill-3 rounded-sm p-1"
                      onClick={() => actions.handleProviderChange("")}
                    >
                      <X size={10} className="text-text-1 cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card grid */}
          <div className="grid grid-cols-1 gap-space-12 mt-[var(--space-16)] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
