"use client";

import { useCallback, useMemo } from "react";
import { Check, Info } from "lucide-react";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import Tooltip from "@/app/components/Tooltip";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";

import type { InstanceType } from "../../sub-pages/CreateEndpoint/useCreateEndpointForm";

interface GPUTileSelectorProps {
  selectedInstance: InstanceType | null;
  instanceList: InstanceType[];
  setInstanceList: (value: InstanceType[]) => void;
  onChange: (value: InstanceType) => void;
  isEditing?: boolean;
}

/**
 * GPU Card States:
 *
 * 1. Default (unselected):
 *    - Border: gray-2
 *    - Background: white
 *
 * 2. Hover:
 *    - Border: dark-4 (only border changes, no background change)
 *    - Background: white (unchanged)
 *
 * 3. Selected:
 *    - Border: dark-4
 *    - Background: white
 *    - Shadow: module shadow
 *    - Badge: green checkmark in top-right corner
 */
function GPUTile({
  instance,
  isSelected,
  onSelect,
}: {
  instance: InstanceType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const pricePerHour = useMemo(() => {
    const raw = dealMoneyWithPrecision(
      instance.discount * 3600,
      instance.pricePrecision,
      4,
    );
    if (typeof raw !== "number") return "-";
    return raw.toFixed(3);
  }, [instance]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-4 rounded-[6px] border transition-all text-left bg-white cursor-pointer",
        isSelected
          ? "border-[var(--dark-4)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          : "border-[var(--gray-2)] hover:border-[var(--dark-4)]",
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--brand-0)] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <h4 className="text-[14px] leading-[18px] font-medium text-[var(--dark-1)]">
        {instance.displayName}
      </h4>

      <p className="mt-2 text-[16px] leading-[22px] font-semibold text-[var(--dark-1)]">
        ${pricePerHour}
        <span className="text-[12px] leading-[16px] font-normal text-[var(--dark-3)]">
          /GPU/hr
        </span>
      </p>
    </button>
  );
}

/**
 * GPU Count Selector States:
 *
 * - Default: gray border, white background
 * - Hover: dark-4 border (only border changes)
 * - Selected: dark-4 border + light shadow + brand text color
 *
 * Available counts are determined by selectedInstance.gpuNums from recommended config
 */
function GPUCountSelector({
  counts,
  selectedCount,
  onChange,
}: {
  counts: number[];
  selectedCount: number;
  onChange: (count: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-[13px] leading-[20px] text-[var(--dark-2)]">
        GPU Count:
      </span>
      <div className="flex gap-2">
        {counts.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={cn(
              "w-10 h-8 rounded-[6px] border text-[13px] font-medium transition-all cursor-pointer",
              selectedCount === count
                ? "border-[var(--dark-4)] bg-white text-[var(--brand-0)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                : "border-[var(--gray-2)] bg-white text-[var(--dark-1)] hover:border-[var(--dark-4)]",
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GPUTileSelector({
  selectedInstance,
  instanceList,
  setInstanceList,
  onChange,
  isEditing = false,
}: GPUTileSelectorProps) {
  const handleInstanceChange = useCallback(
    (instance: InstanceType) => {
      analytics.trackClick(
        CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_SELECT_GPU_INSTANCE,
        { gpuName: instance.gpuName },
      );
      onChange(instance);
    },
    [onChange],
  );

  const handleGpuNumChange = useCallback(
    (gpuNum: number) => {
      if (!selectedInstance) return;

      const newInstanceList = instanceList.map((instance) => {
        if (instance.id === selectedInstance.id) {
          return { ...instance, gpuNum };
        }
        return instance;
      });
      setInstanceList(newInstanceList);

      const updatedInstance = newInstanceList.find(
        (i) => i.id === selectedInstance.id,
      );
      if (updatedInstance) {
        onChange(updatedInstance);
      }
    },
    [instanceList, selectedInstance, setInstanceList, onChange],
  );

  const availableCounts = useMemo(() => {
    return selectedInstance?.gpuNums || [];
  }, [selectedInstance]);

  if (instanceList.length === 0) {
    return (
      <div className="mt-4 p-4 rounded-[6px] border border-[var(--gray-2)] bg-[var(--gray-4)]">
        <div className="text-center text-[var(--red-2)]">
          <p className="text-[13px] leading-[20px]">
            {isEditing
              ? "There is currently no recommended GPU configuration."
              : "Insufficient GPU resources. Please retry after some time."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-[14px] leading-[18px] font-medium text-[var(--dark-1)]">
          Select GPU Type
        </h4>
        <Tooltip
          content="The total GPU quota for all card types under each account is 8. If you need more, please contact us."
          contentClassName="w-[246px] whitespace-normal"
          placement="right"
        >
          <Info className="w-3 h-3 text-[var(--dark-2)]" />
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {instanceList.map((instance) => (
          <GPUTile
            key={instance.id}
            instance={instance}
            isSelected={selectedInstance?.id === instance.id}
            onSelect={() => handleInstanceChange(instance)}
          />
        ))}
      </div>

      {selectedInstance && availableCounts.length > 0 && (
        <GPUCountSelector
          counts={availableCounts}
          selectedCount={selectedInstance.gpuNum}
          onChange={handleGpuNumChange}
        />
      )}
    </div>
  );
}
