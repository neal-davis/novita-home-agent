import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FacetFilterState,
  FacetOption,
} from "@/lib/model-library/facets/types";

interface ConsoleSelectedFiltersProps {
  filters: FacetFilterState;
  options: Record<string, FacetOption[]>;
  onClear: (key: string, value: string) => void;
  onClearAll: () => void;
}

export function ConsoleSelectedFilters({
  filters,
  options,
  onClear,
  onClearAll,
}: ConsoleSelectedFiltersProps) {
  const selectedFilters = Object.entries(filters).flatMap(([key, values]) =>
    values.map((value) => ({
      key,
      value,
      label:
        options[key]?.find((option) => option.value === value)?.label ?? value,
    })),
  );

  if (selectedFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-space-8">
      {selectedFilters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          type="button"
          onClick={() => onClear(filter.key, filter.value)}
          className={cn(
            "inline-flex h-[var(--height-20)] cursor-pointer items-center gap-space-4 rounded-12 border px-space-8 py-space-2 font-miletus text-[12px] font-normal leading-[16px] tracking-normal transition-colors duration-200 hover:bg-overlay-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
            filter.key === "features"
              ? "border-[var(--border-1)] bg-fill-4 text-[var(--text-3)]"
              : "border-brand-2 bg-brand-3 text-brand-1",
          )}
        >
          <span>{filter.label}</span>
          <X
            className={cn(
              "h-space-12 w-space-12",
              filter.key === "features"
                ? "text-element-low-em"
                : "text-brand-1",
            )}
            aria-hidden="true"
          />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex h-[var(--height-20)] cursor-pointer items-center gap-space-4 px-space-4 font-miletus text-[12px] font-normal leading-[16px] tracking-normal text-[var(--text-3)] transition-colors duration-200 hover:text-[var(--text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
      >
        Clear All
        <X className="h-space-12 w-space-12" aria-hidden="true" />
      </button>
    </div>
  );
}
