import { cn } from "@/lib/utils";
import type { PriceLine } from "@/lib/model-library/pricing";

function PriceLineValue({
  line,
  forceDiscountColor,
}: {
  line: PriceLine;
  forceDiscountColor?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-space-6">
      <span
        className={cn(
          "whitespace-nowrap text-[var(--text-1)]",
          (line.discounted || forceDiscountColor) && "text-brand-1",
        )}
      >
        {line.value}
      </span>
      {line.originalValue ? (
        <span className="whitespace-nowrap text-[var(--text-3)] line-through">
          {line.originalValue}
        </span>
      ) : null}
    </div>
  );
}

export function ConsoleExpandedPriceDetails({
  lines,
  forceDiscountColor = false,
}: {
  lines: PriceLine[];
  forceDiscountColor?: boolean;
}) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-space-4 font-miletus text-paragraph-12">
      {lines.map((line) => (
        <div
          key={`${line.label}-${line.value}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-space-8 rounded-2 bg-fill-4 p-space-8"
        >
          <span className="text-[var(--text-3)]">{line.label}</span>
          <PriceLineValue line={line} forceDiscountColor={forceDiscountColor} />
        </div>
      ))}
    </div>
  );
}
