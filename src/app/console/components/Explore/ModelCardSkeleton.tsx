"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ModelCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-[var(--gray-2)] p-4">
      <div className="flex flex-col gap-3">
        {/* Logo and title */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
