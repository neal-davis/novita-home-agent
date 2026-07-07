"use client";

import Tooltip from "@/app/components/Tooltip";
import { Pencil } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface InstanceConfigProps {
  baseModel: LLMDedicatedEndpointModel;
  resources: LLMDedicatedEndpointResources;
  engine: LLMDedicatedEndpointEngine;
  loras?: LLMDedicatedEndpointLora[];
  onEditLora?: () => void;
  isLocked?: boolean;
}

export default function InstanceConfig({
  baseModel,
  resources,
  engine,
  loras,
  onEditLora,
  isLocked = false,
}: InstanceConfigProps) {
  // Format engine display: "vLLM 0.4.2" or "sglang 0.1.0"
  const engineDisplay = engine?.version
    ? `${engine?.type || "vLLM"} ${engine.version}`
    : engine?.type || "vLLM";

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
            Instance Configuration
          </h4>
        </div>
        {onEditLora && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditLora}
            disabled={isLocked}
            className={`h-7 px-3 text-[12px] gap-1.5 ${isLocked ? "cursor-not-allowed" : ""}`}
          >
            <Pencil className="w-3 h-3" />
            Edit LoRA
          </Button>
        )}
      </div>

      {/* Content - 3 columns layout */}
      <div className="p-4 grid grid-cols-3 gap-4 bg-[var(--gray-4)] rounded-[6px] border border-[var(--gray-2)]">
        {/* MODEL */}
        <div>
          <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
            MODEL
          </p>
          <div className="flex items-center gap-2">
            <p className="font-subtle font-medium text-[var(--dark-1)] break-all">
              {baseModel?.modelId || "-"}
            </p>
            {loras && loras.length > 0 && (
              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 px-1.5 py-0.5 rounded-sm bg-[var(--brand-3)] text-[var(--brand-0)] font-small hover:bg-[var(--brand-2)] transition-colors cursor-pointer"
                  >
                    +{loras.length} LoRA
                  </button>
                </HoverCardTrigger>
                <HoverCardContent
                  side="bottom"
                  align="start"
                  className="w-auto max-w-[480px] p-3"
                >
                  <p className="font-small font-medium text-[var(--dark-3)] mb-2">
                    LoRA Adapters
                  </p>
                  <div className="space-y-1.5">
                    {loras.map((lora, index) => (
                      <div
                        key={index}
                        className="font-small text-[var(--dark-1)] break-all"
                      >
                        {lora.name
                          ? `${lora.name} (${lora.modelId})`
                          : lora.modelId}
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>

        {/* GPU */}
        <div>
          <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
            GPU
          </p>
          <p className="font-subtle font-medium text-[var(--dark-1)]">
            {resources?.gpu?.name} ×{resources?.gpu?.count}
          </p>
        </div>

        {/* ENGINE */}
        <div>
          <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
            ENGINE
          </p>
          <p className="font-subtle font-medium text-[var(--dark-1)]">
            {engineDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}
