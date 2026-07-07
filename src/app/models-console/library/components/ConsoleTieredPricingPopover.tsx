import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleTieredPricingToggleProps {
  expanded: boolean;
  label?: string;
}

export function ConsoleTieredPricingPopover({
  expanded,
  label = "Tiered",
}: ConsoleTieredPricingToggleProps) {
  return (
    <span className="inline-flex items-center justify-center rounded-8 border border-brand-1 py-0 pl-space-8 pr-space-2 font-miletus text-paragraph-12 text-brand-1">
      {label}
      <ChevronDown
        className={cn(
          "h-space-12 w-space-12 transition-transform duration-200",
          expanded && "rotate-180",
        )}
        aria-hidden="true"
      />
    </span>
  );
}
