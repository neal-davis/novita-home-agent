"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DiamondPlus } from "lucide-react";
import { formatCoefficient } from "@/api/coding-plan";

interface BillingMultiplierTooltipProps {
  inputCoefficient: number;
  outputCoefficient: number;
  cacheReadCoefficient: number;
  cacheWriteCoefficient: number;
  cacheWrite1hourCoefficient: number;
}

export default function BillingMultiplierTooltip({
  inputCoefficient,
  outputCoefficient,
  cacheReadCoefficient,
  cacheWriteCoefficient,
  cacheWrite1hourCoefficient,
}: BillingMultiplierTooltipProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="flex items-center gap-1 cursor-pointer hover:text-[var(--brand-0)]">
          <DiamondPlus size={12} /> <span>Details</span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[200px] px-3 py-2" side="top">
        <div className="flex flex-col gap-1 font-small">
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">{inputCoefficient}</span>
            <span className="text-[var(--dark-3)]">Uncached input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">{outputCoefficient}</span>
            <span className="text-[var(--dark-3)]">Output</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">{cacheReadCoefficient}</span>
            <span className="text-[var(--dark-3)]">Cache (read) input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWriteCoefficient}
            </span>
            <span className="text-[var(--dark-3)]">Cache (write:5m) input</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWrite1hourCoefficient}
            </span>
            <span className="text-[var(--dark-3)]">
              Cache (writes:1h) input
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
