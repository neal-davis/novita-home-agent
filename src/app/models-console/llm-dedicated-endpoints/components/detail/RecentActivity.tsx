"use client";

import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { ChangeHistoryRecord } from "@/api/dedicated-endpoint";

interface RecentActivityProps {
  records: ChangeHistoryRecord[];
  isLoading: boolean;
  onViewAll?: () => void;
}

// Type label styles - matching ChangeHistory
const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  CONFIG: {
    bg: "bg-[var(--cyan-5)]",
    text: "text-[var(--cyan-2)]",
  },
  CREATED: {
    bg: "bg-[var(--brand-3)]",
    text: "text-[var(--brand-1)]",
  },
  DELETED: {
    bg: "bg-[var(--red-6)]",
    text: "text-[var(--red-1)]",
  },
  RESTARTED: {
    bg: "bg-[var(--yellow-6)]",
    text: "text-[var(--yellow-1)]",
  },
  SCALED: {
    bg: "bg-[var(--purple-6)]",
    text: "text-[var(--purple-1)]",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-[var(--gray-4)]",
  text: "text-[var(--dark-2)]",
};

export default function RecentActivity({
  records,
  isLoading,
  onViewAll,
}: RecentActivityProps) {
  const formatChanges = (changes: ChangeHistoryRecord["changes"]) => {
    if (!changes?.length) return "";
    return changes
      .map((c) => `${c.field}: ${c.oldValue} → ${c.newValue}`)
      .join("; ");
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3 pl-4">
          <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
            Recent Activity
          </h4>
        </div>
        <div className="p-4 rounded-[6px] border border-[var(--gray-2)] flex items-center justify-center min-h-[100px]">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--dark-3)]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pl-4">
        <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
          Recent Activity
        </h4>
        {onViewAll && records.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[12px] text-[var(--brand-0)] hover:text-[var(--brand-1)] underline transition-colors"
          >
            View all
          </button>
        )}
      </div>
      <div className="p-4 rounded-[6px] border border-[var(--gray-2)]">
        {records.length === 0 ? (
          <p className="font-subtle text-[var(--dark-3)] text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {records.map((item) => {
              const style =
                TYPE_STYLES[item.operationType.toUpperCase()] || DEFAULT_STYLE;
              const detail =
                item.changes?.length > 0
                  ? formatChanges(item.changes)
                  : item.title;

              return (
                <div key={item.id} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-[4px] text-[11px] font-medium uppercase shrink-0",
                      style.bg,
                      style.text,
                    )}
                  >
                    {item.operationType}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-subtle text-[var(--dark-1)] truncate">
                        {item.title}
                      </span>
                      <span className="font-small text-[var(--dark-3)] shrink-0 ml-2">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="font-small text-[var(--dark-2)] truncate">
                      {detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
