"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";

export default function MonthlyPrice({
  monthlyPriceInfo,
}: {
  monthlyPriceInfo: any;
}) {
  const tableClassName =
    "min-h-0 min-w-[200px] border border-solid border-[var(--border)]]";
  const headerCellClassName =
    "bg-[var(--gray-2)] p-2 font-small-medium text-[var(--dark-3)]";
  const labelCellClassName = "p-2 font-small text-[var(--dark-3)]";
  const valueCellClassName = "p-2 font-small text-[var(--dark-1)]";

  const details = (
    <Table className={tableClassName}>
      <TableHeader>
        <TableRow>
          <TableCell className={headerCellClassName}>
            {"Billing items"}
          </TableCell>
          <TableCell className={headerCellClassName}>{"Unit price"}</TableCell>
          <TableCell className={headerCellClassName}>{"Usage"}</TableCell>
          <TableCell className={headerCellClassName}>{"Total"}</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className={labelCellClassName}>{"GPU fee"}</TableCell>
          <TableCell className={valueCellClassName}>
            {`$ ${(
              Number(monthlyPriceInfo?.instanceMonthPrice || 0) /
              Number(monthlyPriceInfo?.instanceMonthPricePrecision || 1) /
              10000
            ).toFixed(2)} /GPU/month`}
          </TableCell>
          <TableCell className={valueCellClassName}>
            {`${monthlyPriceInfo?.gpuNum} ${Number(monthlyPriceInfo?.gpuNum || 0) > 1 ? "GPUs" : "GPU"}
          *${monthlyPriceInfo?.month} ${Number(monthlyPriceInfo?.month || 0) > 1 ? "months" : "month"}`}
          </TableCell>
          <TableCell className={valueCellClassName}>
            {`$ ${(Number(monthlyPriceInfo?.instanceAmount || 0) / 10000).toFixed(2)}`}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={labelCellClassName}>
            {"Storage fee (beyond free quota)"}
          </TableCell>
          <TableCell className={valueCellClassName}>
            {`$ ${(
              Number(monthlyPriceInfo?.storageMonthPrice || 0) /
              Number(monthlyPriceInfo?.storageMonthPricePrecision || 1) /
              10000
            ).toFixed(3)}/GB/day`}
          </TableCell>
          <TableCell className={valueCellClassName}>
            {`${monthlyPriceInfo?.storageSize || "0"}GB*${monthlyPriceInfo?.month || "-"}
          ${Number(monthlyPriceInfo?.month || 0) > 1 ? "months" : "month"}(${monthlyPriceInfo?.day || ""} ${Number(monthlyPriceInfo?.day || 0) > 1 ? "days" : "day"})`}
          </TableCell>
          <TableCell className={valueCellClassName}>
            {`$ ${(Number(monthlyPriceInfo?.storageAmount || 0) / 10000).toFixed(3)}`}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  return details;
}
