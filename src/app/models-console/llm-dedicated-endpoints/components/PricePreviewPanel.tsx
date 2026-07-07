"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { dealMoneyWithPrecision } from "@/lib/utils/money";

interface PricePreviewPanelProps {
  gpuName: string;
  gpuPrice: number; // 单价/秒
  gpuPricePrecision: number;
  gpuCount: number;
  minReplicas: number;
  maxReplicas: number;
  autoscalingEnabled: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onSubmit?: () => void;
  isMobile?: boolean;
}

export default function PricePreviewPanel({
  gpuName,
  gpuPrice,
  gpuPricePrecision,
  gpuCount,
  minReplicas,
  maxReplicas,
  autoscalingEnabled,
  isLoading = false,
  loadingText = "Creating...",
  onSubmit,
  isMobile = false,
}: PricePreviewPanelProps) {
  const hasGpu = !!gpuName && gpuPrice > 0;

  // Format number with fixed decimal places for display
  const formatPrice = (
    value: number | string,
    decimals: number = 2,
  ): string => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "-";
    return num.toFixed(decimals);
  };

  // 单个 GPU 小时价格
  const gpuUnitPrice = useMemo(() => {
    if (!hasGpu) return null;
    const raw = dealMoneyWithPrecision(gpuPrice * 3600, gpuPricePrecision, 4);
    return typeof raw === "number" ? formatPrice(raw, 3) : null;
  }, [gpuPrice, gpuPricePrecision, hasGpu]);

  // 最小副本每小时费用
  const hourlyMinReplicas = useMemo(() => {
    if (!hasGpu) return null;
    const effectiveMin = autoscalingEnabled ? minReplicas : 1;
    const raw = dealMoneyWithPrecision(
      gpuPrice * 3600 * gpuCount * effectiveMin,
      gpuPricePrecision,
      4,
    );
    return typeof raw === "number" ? formatPrice(raw, 3) : null;
  }, [
    gpuPrice,
    gpuPricePrecision,
    gpuCount,
    minReplicas,
    autoscalingEnabled,
    hasGpu,
  ]);

  // 最大副本每小时费用
  const hourlyMaxReplicas = useMemo(() => {
    if (!hasGpu) return null;
    const effectiveMax = autoscalingEnabled ? maxReplicas : 1;
    const raw = dealMoneyWithPrecision(
      gpuPrice * 3600 * gpuCount * effectiveMax,
      gpuPricePrecision,
      4,
    );
    return typeof raw === "number" ? formatPrice(raw, 3) : null;
  }, [
    gpuPrice,
    gpuPricePrecision,
    gpuCount,
    maxReplicas,
    autoscalingEnabled,
    hasGpu,
  ]);

  // 月度估算（假设 1 副本 always-on）
  const monthlyEstimate = useMemo(() => {
    if (!hasGpu) return null;
    // 固定 1 副本 × 24小时 × 30天
    const raw = dealMoneyWithPrecision(
      gpuPrice * 3600 * 24 * 30 * gpuCount * 1,
      gpuPricePrecision,
      4,
    );
    return typeof raw === "number" ? formatPrice(raw, 3) : null;
  }, [gpuPrice, gpuPricePrecision, gpuCount, hasGpu]);

  // Mobile compact layout
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] text-[var(--dark-3)] uppercase tracking-wide">
              EST. MONTHLY (IF 1 REPLICA)
            </p>
            {hasGpu ? (
              <p className="text-[20px] font-semibold text-[var(--dark-1)]">
                ${monthlyEstimate}
              </p>
            ) : (
              <p className="text-[16px] text-[var(--dark-3)]">Select GPU</p>
            )}
          </div>
          <div className="text-right text-[12px] text-[var(--dark-2)]">
            <p>Min: {hourlyMinReplicas ? `$${hourlyMinReplicas}/hr` : "-"}</p>
            <p>Max: {hourlyMaxReplicas ? `$${hourlyMaxReplicas}/hr` : "-"}</p>
          </div>
        </div>
        <Button
          type="button"
          className="w-full h-11"
          variant="secondary"
          disabled={isLoading}
          onClick={onSubmit}
        >
          {isLoading ? loadingText : "Create Endpoint"}
        </Button>
      </div>
    );
  }

  // Desktop full layout
  return (
    <div className="w-[320px] shrink-0 p-5 rounded-[6px] border border-[var(--brand-0)] bg-[var(--white)]">
      {/* Header */}
      <h3 className="text-[16px] font-semibold text-[var(--dark-1)] mb-4">
        Cost Estimation
      </h3>

      {/* Cost Details */}
      <div className="space-y-3">
        {/* GPU Type */}
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[var(--dark-2)]">GPU Type</span>
          <span className="text-[13px] text-[var(--dark-1)]">
            {hasGpu ? `${gpuName} × ${gpuCount}` : "-"}
          </span>
        </div>

        {/* GPU Unit Price */}
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[var(--dark-2)]">
            GPU Unit Price
          </span>
          <span className="text-[13px] text-[var(--dark-1)]">
            {gpuUnitPrice ? `$${gpuUnitPrice}/GPU/hr` : "-"}
          </span>
        </div>

        {/* Replicas (Min) */}
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[var(--dark-2)]">
            Replicas (Min)
          </span>
          <span className="text-[13px] text-[var(--dark-1)]">
            {autoscalingEnabled ? minReplicas : 1} replica
          </span>
        </div>

        <div className="h-[1px] bg-[var(--gray-2)] my-1" />

        {/* Hourly (min replicas) */}
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[var(--dark-2)]">
            Hourly (min replicas)
          </span>
          <span className="text-[13px] text-[var(--dark-1)]">
            {hourlyMinReplicas ? `$${hourlyMinReplicas}` : "-"}
          </span>
        </div>

        {/* Hourly (max replicas) */}
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[var(--dark-2)]">
            Hourly (max replicas)
          </span>
          <span className="text-[13px] text-[var(--dark-1)]">
            {hourlyMaxReplicas ? `$${hourlyMaxReplicas}` : "-"}
          </span>
        </div>

        {/* Monthly Estimate */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-[var(--dark-3)] uppercase tracking-wide mb-1">
            EST. MONTHLY (IF 1 REPLICA ALWAYS-ON)
          </p>
          {hasGpu ? (
            <>
              <p className="text-[24px] font-semibold text-[var(--dark-1)]">
                ${monthlyEstimate}
              </p>
              <p className="text-[11px] text-[var(--brand-0)] mt-1.5">
                Billed per second for running replicas only
              </p>
            </>
          ) : (
            <>
              <p className="text-[20px] font-medium text-[var(--dark-3)]">-</p>
              <p className="text-[12px] text-[var(--dark-3)] mt-1">
                Select a GPU to see cost
              </p>
            </>
          )}
        </div>

        {/* Min / Max Range */}
        <div className="flex justify-between items-center pt-2 border-t border-[var(--gray-2)]">
          <span className="text-[12px] text-[var(--dark-3)]">
            Min: {hourlyMinReplicas ? `$${hourlyMinReplicas}/hr` : "-"}
          </span>
          <span className="text-[12px] text-[var(--dark-3)]">
            Max: {hourlyMaxReplicas ? `$${hourlyMaxReplicas}/hr` : "-"}
          </span>
        </div>
      </div>

      {/* Create Button */}
      <Button
        type="button"
        className="w-full mt-5 h-11"
        variant="secondary"
        disabled={isLoading}
        onClick={onSubmit}
      >
        {isLoading ? loadingText : "Create Endpoint"}
      </Button>
    </div>
  );
}
