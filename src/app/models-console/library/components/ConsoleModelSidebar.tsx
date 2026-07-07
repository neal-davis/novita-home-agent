import {
  AudioLines,
  Bot,
  Check,
  Eye,
  FileImage,
  Film,
  ListFilter,
  MessageCircleCode,
  Search,
  SquareM,
  type LucideIcon,
} from "lucide-react";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { cn } from "@/lib/utils";
import type { AnyModel } from "@/lib/model-library/capabilities";
import type {
  FacetFilterState,
  FacetOption,
} from "@/lib/model-library/facets/types";
import { ConsoleModelSearchCombobox } from "./ConsoleModelSearchCombobox";

interface ConsoleModelSidebarProps {
  filters: FacetFilterState;
  models: AnyModel[];
  options: Record<string, FacetOption[]>;
  onToggle: (key: string, value: string) => void;
}

const modalityIconMap: Record<
  string,
  {
    icon: LucideIcon;
    className?: string;
  }
> = {
  llm: { icon: MessageCircleCode },
  image: { icon: FileImage },
  audio: { icon: AudioLines },
  video: { icon: Film },
  "ai-search": { icon: Search },
  embedding: { icon: SquareM, className: "rotate-90" },
  reranker: { icon: ListFilter },
  vision: { icon: Eye },
} as const;

const modalityOrder = [
  "llm",
  "image",
  "audio",
  "video",
  "ai-search",
  "embedding",
  "reranker",
  "vision",
];

const featureDisplayLabelByValue: Record<string, string> = {
  "long-context": "Long Context (>128K)",
  "json-schema": "JSON Schema",
  "tool-calling": "Tool Calling",
  reasoning: "Reasoning",
};

const MODALITIES_FACET_KEY = "modalities";
const SERIES_FACET_KEY = "series";

interface FilterRowProps {
  facetKey: string;
  option: FacetOption;
  selected: boolean;
  icon?: LucideIcon;
  iconClassName?: string;
  useModelLogo?: boolean;
  showCount?: boolean;
  onToggle: (key: string, value: string) => void;
}

function FilterRow({
  facetKey,
  option,
  selected,
  icon: Icon,
  iconClassName,
  useModelLogo,
  showCount = true,
  onToggle,
}: FilterRowProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(facetKey, option.value)}
      className="flex min-h-[var(--height-20)] w-full cursor-pointer items-center justify-between text-left font-miletus text-paragraph-14 text-[var(--text-1)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
    >
      <span
        className={cn(
          "grid min-w-0 flex-1 items-center gap-space-6",
          "grid-cols-[auto_minmax(0,1fr)]",
        )}
      >
        {useModelLogo ? (
          <ModelLogo
            className="h-space-16 w-space-16 shrink-0"
            modelName={option.label}
            size={16}
          />
        ) : Icon ? (
          <Icon
            className={cn(
              "h-space-16 w-space-16 shrink-0 text-element-mid-em",
              iconClassName,
            )}
            aria-hidden="true"
          />
        ) : (
          <span className="flex h-space-16 w-space-16 shrink-0 items-center justify-center font-tt-mono text-mono-12 uppercase text-brand-1">
            {option.label.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="flex min-w-0 items-center gap-space-4">
          <span className="truncate text-left">{option.label}</span>
          {showCount ? (
            <span className="shrink-0 font-tt-mono text-mono-12 uppercase text-[var(--text-4)]">
              {option.count}
            </span>
          ) : null}
        </span>
      </span>
      <span
        className={cn(
          "flex h-space-16 w-space-16 shrink-0 items-center justify-center rounded-2 border border-[var(--border-2)] bg-fill-white",
          selected && "border-brand-0 bg-brand-0 text-element-inverse",
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="h-space-12 w-space-12" /> : null}
      </span>
    </button>
  );
}

export function ConsoleModelSidebar({
  filters,
  models,
  options,
  onToggle,
}: ConsoleModelSidebarProps) {
  const modalityOptions = (options.modalities ?? []).sort((a, b) => {
    const aIndex = modalityOrder.indexOf(a.value);
    const bIndex = modalityOrder.indexOf(b.value);
    return (
      (aIndex === -1 ? modalityOrder.length : aIndex) -
      (bIndex === -1 ? modalityOrder.length : bIndex)
    );
  });
  const featureOptions = options.features ?? [];

  return (
    <aside className="hidden min-h-0 w-[200px] shrink-0 flex-col gap-space-16 self-stretch overflow-hidden border-r border-[var(--border-1)] bg-fill-white p-space-16 lg:flex">
      <ConsoleModelSearchCombobox models={models} />

      <section className="flex shrink-0 flex-col gap-space-12">
        <h2 className="font-miletus text-paragraph-12 text-[var(--text-3)]">
          Modality
        </h2>
        <div className="flex flex-col gap-space-8">
          {modalityOptions.map((option) => {
            const selected = (filters.modalities ?? []).includes(option.value);
            const iconConfig = modalityIconMap[option.value] ?? { icon: Bot };

            return (
              <FilterRow
                key={option.value}
                facetKey={MODALITIES_FACET_KEY}
                option={option}
                selected={selected}
                icon={iconConfig.icon}
                iconClassName={iconConfig.className}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      </section>

      <div className="h-px w-full border-t border-dashed border-[var(--border-2)]" />

      <section className="flex min-h-0 flex-1 flex-col gap-space-12">
        <h2 className="font-miletus text-paragraph-12 text-[var(--text-3)]">
          Model Series
        </h2>
        <div className="-mr-space-16 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-space-16 scrollBar_container [scrollbar-gutter:stable]">
          <div className="flex w-[calc(200px-2*var(--space-16)-1px)] flex-col gap-space-8">
            {(options.series ?? []).map((option) => {
              const selected = (filters.series ?? []).includes(option.value);
              return (
                <FilterRow
                  key={option.value}
                  facetKey={SERIES_FACET_KEY}
                  option={option}
                  selected={selected}
                  useModelLogo
                  showCount={false}
                  onToggle={onToggle}
                />
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px w-full border-t border-dashed border-[var(--border-2)]" />

      <section className="flex shrink-0 flex-col gap-space-12">
        <h2 className="font-miletus text-paragraph-12 text-[var(--text-3)]">
          Features
        </h2>
        <div className="flex flex-col items-start gap-space-8">
          {featureOptions.map((option) => {
            const selected = (filters.features ?? []).includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggle("features", option.value)}
                className={cn(
                  "font-mono-12 flex h-[var(--height-20)] cursor-pointer items-center justify-center whitespace-nowrap rounded-4 border border-[var(--border-2)] bg-fill-4 px-space-6 font-normal uppercase tracking-normal text-[var(--text-1)] transition-colors duration-200 hover:bg-overlay-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
                  selected && "border-brand-0 bg-brand-3 text-brand-1",
                )}
              >
                {featureDisplayLabelByValue[option.value] ?? option.label}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
