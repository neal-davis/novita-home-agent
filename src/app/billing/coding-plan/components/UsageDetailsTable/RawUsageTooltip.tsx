"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { DiamondPlus } from "lucide-react";

interface RawUsageTooltipProps {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheWrite1hourTokens: number;
}

export default function RawUsageTooltip({
  inputTokens,
  outputTokens,
  cacheReadTokens,
  cacheWriteTokens,
  cacheWrite1hourTokens,
}: RawUsageTooltipProps) {
  const totalUsage =
    inputTokens +
    outputTokens +
    cacheReadTokens +
    cacheWriteTokens +
    cacheWrite1hourTokens;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="flex items-center gap-1 cursor-pointer hover:text-[var(--brand-0)]">
          <DiamondPlus size={12} />
          <span>{totalUsage.toLocaleString("en-US")}</span>
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[200px] px-3 py-2" side="top">
        <div className="flex flex-col gap-1 font-small">
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {inputTokens.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Uncached input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheReadTokens.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Cache (read) input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWriteTokens.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Cache (write:5m) input</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-[var(--dark-1)]">
              {cacheWrite1hourTokens.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">
              Cache (writes:1h) input
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-[var(--dark-1)]">
              {outputTokens.toLocaleString("en-US")}
            </span>
            <span className="text-[var(--dark-3)]">Output</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
