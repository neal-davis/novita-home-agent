import { cn } from "@/lib/utils";
import type { PriceLine } from "@/lib/model-library/pricing";

function PriceValue({
  line,
  forceDiscountColor,
}: {
  line: PriceLine;
  forceDiscountColor?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-space-6">
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

export function ConsoleLegacyExpandedPriceBlock({
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
    <div
      data-testid="legacy-expanded-price-block"
      className="flex flex-wrap items-start gap-space-8 bg-fill-4 p-space-8 font-miletus text-paragraph-12"
    >
      {lines.map((line) => (
        <div
          key={`${line.label}-${line.value}`}
          className="flex min-w-0 flex-1 flex-col gap-space-4 whitespace-nowrap"
        >
          <span className="text-[var(--text-3)]">{line.label}</span>
          <PriceValue line={line} forceDiscountColor={forceDiscountColor} />
        </div>
      ))}
    </div>
  );
}
