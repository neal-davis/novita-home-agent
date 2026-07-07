import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { PriceLine } from "@/lib/model-library/pricing";

const modalityOrder = ["text", "audio", "image", "video"] as const;
const rowOrder = ["input", "output"] as const;

type ModalityKey = (typeof modalityOrder)[number];
type RowKey = (typeof rowOrder)[number];

type TableCell = {
  value: string;
  originalValue?: string;
  discounted?: boolean;
};

function getModalityLabel(modality: ModalityKey) {
  return modality.charAt(0).toUpperCase() + modality.slice(1);
}

function getRowLabel(row: RowKey) {
  return row.charAt(0).toUpperCase() + row.slice(1);
}

function buildTableMap(lines: PriceLine[]) {
  return lines.reduce<
    Partial<Record<RowKey, Partial<Record<ModalityKey, TableCell>>>>
  >((accumulator, line) => {
    if (
      !line.modality ||
      !line.kind ||
      (line.kind !== "input" && line.kind !== "output")
    ) {
      return accumulator;
    }

    const row = line.kind;
    const modality = line.modality;
    const currentRow = accumulator[row] ?? {};
    currentRow[modality] = {
      value: line.value,
      originalValue: line.originalValue,
      discounted: line.discounted,
    };
    accumulator[row] = currentRow;
    return accumulator;
  }, {});
}

function PriceCell({
  cell,
  forceDiscountColor,
}: {
  cell?: TableCell;
  forceDiscountColor?: boolean;
}) {
  if (!cell) {
    return <span className="text-[var(--text-3)]">-</span>;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-space-6">
      <span
        className={cn(
          "whitespace-nowrap text-[var(--text-1)]",
          (cell.discounted || forceDiscountColor) && "text-brand-1",
        )}
      >
        {cell.value}
      </span>
      {cell.originalValue ? (
        <span className="whitespace-nowrap text-[var(--text-3)] line-through">
          {cell.originalValue}
        </span>
      ) : null}
    </div>
  );
}

export function ConsoleMultimodalExpandedTable({
  lines,
  cacheLines,
  forceDiscountColor = false,
}: {
  lines: PriceLine[];
  cacheLines: PriceLine[];
  forceDiscountColor?: boolean;
}) {
  const tableMap = buildTableMap(lines);

  return (
    <div className="flex flex-col gap-space-8 font-miletus text-paragraph-12">
      <div className="overflow-hidden rounded-2 bg-fill-4 p-space-12">
        <div className="grid grid-cols-[minmax(96px,auto)_repeat(4,minmax(0,1fr))] gap-x-space-16 gap-y-space-8">
          <span />
          {modalityOrder.map((modality) => (
            <span key={modality} className="text-[var(--text-3)]">
              {getModalityLabel(modality)}
            </span>
          ))}

          {rowOrder.map((row) => (
            <Fragment key={row}>
              <span key={`${row}-label`} className="text-[var(--text-1)]">
                {getRowLabel(row)}
              </span>
              {modalityOrder.map((modality) => (
                <PriceCell
                  key={`${row}-${modality}`}
                  cell={tableMap[row]?.[modality]}
                  forceDiscountColor={forceDiscountColor}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {cacheLines.length > 0 ? (
        <div className="flex flex-col gap-space-4">
          {cacheLines.map((line) => (
            <div
              key={`${line.label}-${line.value}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-space-8 rounded-2 bg-fill-4 p-space-8"
            >
              <span className="text-[var(--text-3)]">{line.label}</span>
              <PriceCell
                cell={{
                  value: line.value,
                  originalValue: line.originalValue,
                  discounted: line.discounted,
                }}
                forceDiscountColor={forceDiscountColor}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
