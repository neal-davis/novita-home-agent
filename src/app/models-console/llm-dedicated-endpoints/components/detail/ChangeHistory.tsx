"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangeHistoryRecord } from "@/api/dedicated-endpoint";

interface ChangeHistoryProps {
  records: ChangeHistoryRecord[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => Promise<void>;
}

// Light color styles for different operation types
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

const PAGE_SIZE = 5;

export default function ChangeHistory({
  records,
  total,
  isLoading,
  isLoadingMore,
  onLoadMore,
}: ChangeHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = async () => {
    if (!isExpanded && records.length < total) {
      await onLoadMore();
    }
    setIsExpanded(!isExpanded);
  };

  const displayedRecords = isExpanded ? records : records.slice(0, PAGE_SIZE);
  const hasMore = total > PAGE_SIZE;

  const formatChanges = (changes: ChangeHistoryRecord["changes"]) => {
    return changes
      .map((c) => `${c.field}: ${c.oldValue} → ${c.newValue}`)
      .join("; ");
  };

  if (isLoading) {
    return (
      <div>
        <h4 className="text-[14px] font-semibold text-[var(--dark-1)] mb-3">
          Change History
        </h4>
        <div className="rounded-[6px] border border-[var(--gray-2)] p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--dark-3)]" />
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div>
        <h4 className="text-[14px] font-semibold text-[var(--dark-1)] mb-3">
          Change History
        </h4>
        <div className="rounded-[6px] border border-[var(--gray-2)] p-6 text-center">
          <p className="text-[13px] text-[var(--dark-3)]">
            No change history yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h4 className="text-[14px] font-semibold text-[var(--dark-1)] mb-3">
        Change History
      </h4>

      {/* Content */}
      <div className="rounded-[6px] border border-[var(--gray-2)] overflow-hidden">
        <div className="divide-y divide-[var(--gray-2)]">
          {displayedRecords.map((item) => {
            const style =
              TYPE_STYLES[item.operationType.toUpperCase()] || DEFAULT_STYLE;
            const timestamp =
              item.createdAt < 1e12 ? item.createdAt * 1000 : item.createdAt;
            const date = new Date(timestamp);
            const utcDate = date.toLocaleDateString("en-US", {
              timeZone: "UTC",
            });
            const utcTime = date.toLocaleTimeString("en-US", {
              timeZone: "UTC",
              hour12: false,
            });
            const details =
              item.changes?.length > 0
                ? formatChanges(item.changes)
                : item.title;

            return (
              <div key={item.id} className="px-4 py-3 flex items-start gap-3">
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
                  <p className="text-[13px] leading-[18px] text-[var(--dark-1)]">
                    {item.title}
                  </p>
                  <p className="text-[12px] leading-[16px] text-[var(--dark-2)]">
                    {details}
                  </p>
                  {item.userName && (
                    <p className="text-[11px] leading-[14px] text-[var(--dark-3)] mt-1">
                      by {item.userName}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] text-[var(--dark-3)]">{utcDate}</p>
                  <p className="text-[11px] text-[var(--dark-3)]">
                    {utcTime} UTC
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={handleToggleExpand}
            disabled={isLoadingMore}
            className="w-full px-4 py-2 flex items-center justify-center gap-1 text-[13px] text-[var(--dark-1)] hover:bg-[var(--gray-4)] transition-colors border-t border-[var(--gray-2)] disabled:opacity-50"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show all ({total} records)</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
