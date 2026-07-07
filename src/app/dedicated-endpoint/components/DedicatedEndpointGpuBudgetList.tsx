"use client";

import {
  DEDICATED_GPU_PRESETS,
  useDedicatedGpuPricing,
} from "@/hooks/useDedicatedGpuPricing";

function BudgetRowSkeleton({ keyName }: { keyName: string }) {
  return (
    <div
      key={keyName}
      className="flex h-[40px] items-center justify-between bg-[var(--fill-white)] px-[14px] py-[10px]"
    >
      <div className="flex min-w-0 items-center gap-[8px]">
        <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[var(--brand-1)]" />
        <div className="flex items-center gap-[8px]">
          <div className="h-[16px] w-[72px] animate-pulse rounded-2 bg-fill-4" />
          <div className="h-[14px] w-[40px] animate-pulse rounded-2 bg-fill-4" />
        </div>
      </div>
      <div className="h-[16px] w-[74px] animate-pulse rounded-2 bg-fill-4" />
    </div>
  );
}

export default function DedicatedEndpointGpuBudgetList() {
  const { rows, loading } = useDedicatedGpuPricing();

  if (!loading && rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--border-default)] bg-[var(--fill-white)]">
      <div className="divide-y divide-[var(--border-2,#e5e5e5)]">
        {loading
          ? DEDICATED_GPU_PRESETS.map((preset) => (
              <BudgetRowSkeleton key={preset.key} keyName={preset.key} />
            ))
          : rows.map((row) => (
              <div
                key={row.key}
                className="flex h-[40px] items-center justify-between bg-[var(--fill-white)] px-[14px] py-[10px]"
              >
                <div className="flex min-w-0 items-center gap-[8px]">
                  <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[var(--brand-1)]" />
                  <div className="flex items-center gap-[8px]">
                    <p className="font-mono-14 uppercase text-[var(--text-1)]">
                      {row.shortName}
                    </p>
                    <p className="font-mono-12 uppercase text-[var(--text-3)]">
                      {row.vram}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-mono-14 uppercase text-[var(--text-2)]">
                  from{" "}
                  <span className="text-[var(--text-1)]">
                    {row.pricePerHour}
                  </span>
                  /hr
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}
