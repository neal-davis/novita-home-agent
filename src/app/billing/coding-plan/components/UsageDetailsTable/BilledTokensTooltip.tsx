"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DiamondPlus } from "lucide-react";
import { divideBy10000 } from "@/api/coding-plan";

interface BilledTokensTooltipProps {
  deductAmount: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheWrite1hourTokens: number;
  inputCoefficient: number;
  outputCoefficient: number;
  cacheReadCoefficient: number;
  cacheWriteCoefficient: number;
  cacheWrite1hourCoefficient: number;
}

export default function BilledTokensTooltip({
  deductAmount,
  inputTokens,
  outputTokens,
  cacheReadTokens,
  cacheWriteTokens,
  cacheWrite1hourTokens,
  inputCoefficient,
  outputCoefficient,
  cacheReadCoefficient,
  cacheWriteCoefficient,
  cacheWrite1hourCoefficient,
}: BilledTokensTooltipProps) {
  const inputDeducted = Math.round(inputTokens * inputCoefficient);
  const outputDeducted = Math.round(outputTokens * outputCoefficient);
  const cacheReadDeducted = Math.round(cacheReadTokens * cacheReadCoefficient);
  const cacheWriteDeducted = Math.round(
    cacheWriteTokens * cacheWriteCoefficient,
  );
  const cacheWrite1hourDeducted = Math.round(
    cacheWrite1hourTokens * cacheWrite1hourCoefficient,
  );

  // deductAmount needs to be divided by 10000 for display
  const displayDeductAmount = deductAmount;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="flex items-center gap-1 cursor-pointer hover:text-[var(--brand-0)]">
          <DiamondPlus size={12} />
          <span>{displayDeductAmount.toLocaleString("en-US")}</span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[200px] px-3 py-2" side="top">
        <div className="flex flex-col gap-1 font-small">
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {inputDeducted.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Uncached input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheReadDeducted.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Cache (read) input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWriteDeducted.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Cache (write:5m) input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWrite1hourDeducted.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">
              Cache (writes:1h) input
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[var(--dark-1)]">
              {outputDeducted.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Output</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
