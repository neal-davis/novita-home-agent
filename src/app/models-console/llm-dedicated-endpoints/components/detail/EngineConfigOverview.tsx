"use client";

import { useMemo } from "react";
import { Pencil } from "lucide-react";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isEndpointEditLocked, isEndpointLoraEditLocked } from "./editLock";

interface EngineConfigOverviewProps {
  endpointData: LLMDedicatedEndpoint;
  onEditAutoscaling?: () => void;
  onEditLora?: () => void;
}

// Value box component - gray background container like input field
function ValueBox({
  children,
  className,
  actionIcon,
  onAction,
  actionDisabled,
  rightSlot,
}: {
  children: React.ReactNode;
  className?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionDisabled?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-[4px] bg-[var(--gray-3)] border border-[var(--gray-2)]",
        className,
      )}
    >
      <span className="font-small text-[var(--dark-1)] truncate">
        {children}
      </span>
      {rightSlot}
      {actionIcon && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className={cn(
            "shrink-0 ml-2 transition-colors",
            actionDisabled
              ? "text-[var(--dark-4)] cursor-not-allowed"
              : "text-[var(--dark-3)] hover:text-[var(--dark-1)] cursor-pointer",
          )}
        >
          {actionIcon}
        </button>
      )}
    </div>
  );
}

export default function EngineConfigOverview({
  endpointData,
  onEditAutoscaling,
  onEditLora,
}: EngineConfigOverviewProps) {
  const { id, baseModel, engine, scalingPolicy, resources, status, loras } =
    endpointData;

  const isLocked = useMemo(() => isEndpointEditLocked(status), [status]);
  const isLoraLocked = useMemo(
    () => isEndpointLoraEditLocked(status),
    [status],
  );

  // Format model ID
  const modelId = useMemo(() => {
    if (baseModel?.modelAlias) return baseModel.modelAlias;
    if (baseModel?.modelId) return baseModel.modelId;
    return "-";
  }, [baseModel]);

  // Format GPU info
  const gpuInfo = useMemo(() => {
    if (!resources?.gpu) return "-";
    const { name, count } = resources.gpu;
    return `${name} ×${count}`;
  }, [resources]);

  // Format engine info
  const engineInfo = useMemo(() => {
    if (!engine?.type) return "-";
    return `${engine.type} ${engine.version || ""}`.trim();
  }, [engine]);

  // Format autoscaling info - show enable status, min-max replicas, and cooldown period
  const autoscalingInfo = useMemo(() => {
    if (!scalingPolicy?.enable) return "Disabled";
    const cooldownMin = Math.round((scalingPolicy.coolDownPeriod || 0) / 60);
    return `Enabled · ${scalingPolicy.minReplicas}-${scalingPolicy.maxReplicas} replicas · ${cooldownMin}min cooldown`;
  }, [scalingPolicy]);

  return (
    <div>
      <h4 className="text-[14px] font-semibold text-[var(--dark-1)] mb-3 pl-4">
        Engine Configuration
      </h4>

      <div className="p-4 rounded-[6px] border border-[var(--gray-2)]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Row 1: Model ID (left) - GPU (right) */}
          <div>
            <p className="font-small text-[var(--dark-3)] mb-1.5">Model ID</p>
            <div className="flex items-center gap-2">
              <ValueBox
                className="flex-1 min-w-0"
                rightSlot={
                  <CopyBtn content={modelId} className="shrink-0 ml-2" />
                }
              >
                <span className="truncate">{modelId}</span>
              </ValueBox>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[12px] shrink-0 whitespace-nowrap"
                onClick={onEditLora}
                disabled={isLoraLocked}
              >
                LoRA
                <span className="text-[var(--dark-3)] ml-1">
                  ({loras?.length ?? 0})
                </span>
              </Button>
            </div>
          </div>
          <div>
            <p className="font-small text-[var(--dark-3)] mb-1.5 flex items-center gap-1.5">
              GPU
              <span className="px-2 py-0.5 rounded-[4px] bg-[var(--gray-3)] font-small text-[var(--dark-3)]">
                Read-only
              </span>
            </p>
            <ValueBox>{gpuInfo}</ValueBox>
          </div>

          {/* Row 2: Autoscaling (left) - Engine (right) */}
          <div>
            <p className="font-small text-[var(--dark-3)] mb-1.5">
              Autoscaling
            </p>
            <ValueBox
              actionIcon={<Pencil className="w-3.5 h-3.5" />}
              onAction={onEditAutoscaling}
              actionDisabled={isLocked}
            >
              {autoscalingInfo}
            </ValueBox>
          </div>
          <div>
            <p className="font-small text-[var(--dark-3)] mb-1.5">Engine</p>
            <ValueBox>{engineInfo}</ValueBox>
          </div>

          {/* Row 3: Endpoint ID (full width) - with copy */}
          <div className="col-span-2">
            <p className="font-small text-[var(--dark-3)] mb-1.5">
              Endpoint ID
            </p>
            <ValueBox
              rightSlot={<CopyBtn content={id} className="shrink-0 ml-2" />}
              className="font-mono"
            >
              {id}
            </ValueBox>
          </div>
        </div>
      </div>
    </div>
  );
}
