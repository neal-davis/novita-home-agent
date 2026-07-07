import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export interface SlaMetricsProps {
  ttft_ms?: number;
  tps?: number;
  className?: string;
}

const formatTtft = (ttft_ms: number): string => {
  if (ttft_ms < 1000) {
    return `${ttft_ms}ms`;
  }
  return `${(ttft_ms / 1000).toFixed(2)}s`;
};

export const SlaMetrics = ({ tps, ttft_ms, className }: SlaMetricsProps) => {
  if (!ttft_ms || ttft_ms <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs text-common-dark-2 h-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <span>TTFT: {formatTtft(ttft_ms)}</span>
            </TooltipTrigger>
            <TooltipContent className="bg-foreground text-white">
              Time to First Token
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {tps && tps > 0 && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <span>SPEED: {tps.toFixed(2)} tokens/s</span>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-white">
                Tokens Per Second
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
