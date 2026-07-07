"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TodayUsage, formatTokens } from "../../types";
import { cn } from "@/lib/utils";

interface TodayUsageCardProps {
  className?: string;
  data: TodayUsage | null;
  isLoading: boolean;
}

export default function TodayUsageCard({
  className,
  data,
  isLoading,
}: TodayUsageCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-[var(--white)] border border-[var(--gray-2)] rounded-lg p-6 flex flex-col justify-between",
          className,
        )}
      >
        <Skeleton className="h-6 w-16" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isPositive = data.changePercent >= 0;

  return (
    <div
      className={cn(
        "bg-[var(--white)] border border-[var(--gray-2)] rounded-lg p-6 flex flex-col justify-between",
        className,
      )}
    >
      <h3 className="font-h6">Today (UTC)</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-h4-large text-[var(--dark-1)]">
            {formatTokens(data.tokens)}
          </span>
          <span className="font-subtle text-[var(--dark-3-1)]">tokens</span>
        </div>
        <div
          className="font-subtle"
          style={{ color: isPositive ? "var(--brand-1)" : "var(--red-1)" }}
        >
          {isPositive ? "+" : ""}
          {data.changePercent.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
