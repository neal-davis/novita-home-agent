"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton() {
  return (
    <div>
      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-[120px] rounded" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[300px] rounded" />
          <Skeleton className="h-8 w-[160px] rounded" />
        </div>
      </div>
      {/* Card list skeleton */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start justify-between p-4 rounded-lg border border-[var(--gray-2)] bg-white"
          >
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="w-[10px] h-[10px] rounded-full mt-1.5" />
              <div className="flex-1">
                <Skeleton className="h-[18px] w-[180px] mb-1" />
                <Skeleton className="h-[14px] w-[240px] mb-2.5" />
                <div className="flex gap-2">
                  <Skeleton className="h-[22px] w-[100px] rounded" />
                  <Skeleton className="h-[22px] w-[90px] rounded" />
                  <Skeleton className="h-[22px] w-[60px] rounded" />
                  <Skeleton className="h-[22px] w-[70px] rounded" />
                  <Skeleton className="h-[22px] w-[50px] rounded" />
                </div>
              </div>
            </div>
            <Skeleton className="h-[22px] w-[70px] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
