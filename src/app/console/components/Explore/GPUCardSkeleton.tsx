"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function GPUCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-[var(--gray-2)] p-4">
      <div className="flex flex-col gap-3">
        {/* Product name */}
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Billing and price */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>

        {/* VRAM and max */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* CPU/RAM */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-36" />
        </div>

        {/* CUDA and availability */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
