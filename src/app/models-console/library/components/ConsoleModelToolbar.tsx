import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConsoleModelViewMode = "grid" | "list";
export type ConsoleModelSortMode = "newest" | null;

interface ConsoleModelToolbarProps {
  viewMode: ConsoleModelViewMode;
  sortMode: ConsoleModelSortMode;
  resultCount: number;
  onViewModeChange: (viewMode: ConsoleModelViewMode) => void;
  onSortModeChange: (sortMode: ConsoleModelSortMode) => void;
}

export function ConsoleModelToolbar({
  viewMode,
  sortMode,
  resultCount,
  onViewModeChange,
  onSortModeChange,
}: ConsoleModelToolbarProps) {
  const newestSelected = sortMode === "newest";

  return (
    <div className="flex items-center gap-space-24">
      <div className="flex min-w-0 flex-1 items-center">
        <p className="font-miletus text-paragraph-12 text-[var(--text-3)]">
          {resultCount} Models
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-space-8">
        <button
          type="button"
          onClick={() => onSortModeChange(newestSelected ? null : "newest")}
          className={cn(
            "flex h-[var(--height-20)] cursor-pointer items-center justify-center rounded-12 px-space-8 py-space-2 font-miletus text-paragraph-12 text-[var(--text-4)] transition-colors duration-200 hover:bg-overlay-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
            newestSelected && "bg-fill-4 text-[var(--text-2)]",
          )}
          aria-pressed={newestSelected}
        >
          Newest
        </button>

        <div className="inline-flex items-center justify-center gap-space-4 rounded-20 bg-fill-white p-space-2">
          {[
            { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
            { value: "list" as const, label: "List view", icon: List },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onViewModeChange(item.value)}
                className={cn(
                  "flex h-[var(--height-20)] w-[var(--height-20)] cursor-pointer items-center justify-center rounded-12 text-element-low-em transition-colors duration-200 hover:bg-overlay-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
                  viewMode === item.value && "bg-fill-4 text-element-high-em",
                )}
                aria-label={item.label}
                aria-pressed={viewMode === item.value}
              >
                <Icon className="h-space-12 w-space-12" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
