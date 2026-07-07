"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ConsumeMonthlyChartSkeleton() {
  return (
    <div className="w-full h-[200px] flex flex-col gap-3">
      {/* Legend area */}
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-sm" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="flex-1 flex items-end gap-3 px-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full rounded-sm"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
