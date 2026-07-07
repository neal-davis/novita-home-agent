"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NoData } from "@/components/ui/standard/no-data";
import { UsageDetail } from "../../types";
import { formatTimestamp } from "@/api/coding-plan";
import RawUsageTooltip from "./RawUsageTooltip";
import BillingMultiplierTooltip from "./BillingMultiplierTooltip";
import BilledTokensTooltip from "./BilledTokensTooltip";

interface UsageDetailsTableProps {
  data: UsageDetail[];
  hasNext: boolean;
  hasPrev: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  isLoading?: boolean;
}

export default function UsageDetailsTable({
  data,
  hasNext,
  hasPrev,
  onNextPage,
  onPrevPage,
  isLoading = false,
}: UsageDetailsTableProps) {
  const isEmpty = data.length === 0 && !isLoading;

  return (
    <div className="pb-12">
      <div className="border border-[var(--gray-2)] rounded-md overflow-hidden">
        <Table className="w-full bg-white">
          <TableHeader className="bg-[var(--gray-3)]">
            <TableRow className="border-b-0 h-[55px]">
              <TableHead className="font-table-head text-[var(--dark-3-1)] bg-[var(--gray-3)] whitespace-nowrap">
                Start time - end time
              </TableHead>
              <TableHead className="font-table-head text-[var(--dark-3-1)] bg-[var(--gray-3)] whitespace-nowrap">
                Model ID
              </TableHead>
              <TableHead className="font-table-head text-[var(--dark-3-1)] bg-[var(--gray-3)] whitespace-nowrap">
                Raw usage (tokens)
              </TableHead>
              <TableHead className="font-table-head text-[var(--dark-3-1)] bg-[var(--gray-3)] whitespace-nowrap">
                Billing multiplier
              </TableHead>
              <TableHead className="font-table-head text-[var(--dark-3-1)] bg-[var(--gray-3)] whitespace-nowrap">
                Billed tokens
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow className="hover:!bg-white">
                <TableCell colSpan={5} className="h-[200px]">
                  <NoData title="No usage data" />
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={`border-b border-[var(--gray-2)] h-[55px]`}
                >
                  <TableCell className="font-table-item text-[var(--black)] whitespace-nowrap">
                    {formatTimestamp(item.startTime)} ~{" "}
                    {formatTimestamp(item.endTime)}
                  </TableCell>
                  <TableCell className="font-table-item text-[var(--black)] whitespace-nowrap">
                    <span className="font-small-console px-2 py-1 bg-[var(--gray-3)] rounded-sm text-[var(--dark-1)]">
                      {item.modelId}
                    </span>
                  </TableCell>
                  <TableCell className="font-table-item text-[var(--black)] whitespace-nowrap">
                    <RawUsageTooltip
                      inputTokens={item.rawUsage.inputTokens}
                      outputTokens={item.rawUsage.outputTokens}
                      cacheReadTokens={item.rawUsage.cacheReadTokens}
                      cacheWriteTokens={item.rawUsage.cacheWriteTokens}
                      cacheWrite1hourTokens={
                        item.rawUsage.cacheWrite1hourTokens
                      }
                    />
                  </TableCell>
                  <TableCell className="font-table-item text-[var(--black)] whitespace-nowrap">
                    <BillingMultiplierTooltip
                      inputCoefficient={item.billingMultiplier.input}
                      outputCoefficient={item.billingMultiplier.output}
                      cacheReadCoefficient={item.billingMultiplier.cacheRead}
                      cacheWriteCoefficient={item.billingMultiplier.cacheWrite}
                      cacheWrite1hourCoefficient={
                        item.billingMultiplier.cacheWrite1hour
                      }
                    />
                  </TableCell>
                  <TableCell className="font-table-item text-[var(--brand-1)] font-medium whitespace-nowrap">
                    <BilledTokensTooltip
                      deductAmount={item.deductAmount}
                      inputTokens={item.rawUsage.inputTokens}
                      outputTokens={item.rawUsage.outputTokens}
                      cacheReadTokens={item.rawUsage.cacheReadTokens}
                      cacheWriteTokens={item.rawUsage.cacheWriteTokens}
                      cacheWrite1hourTokens={
                        item.rawUsage.cacheWrite1hourTokens
                      }
                      inputCoefficient={item.billingMultiplier.input}
                      outputCoefficient={item.billingMultiplier.output}
                      cacheReadCoefficient={item.billingMultiplier.cacheRead}
                      cacheWriteCoefficient={item.billingMultiplier.cacheWrite}
                      cacheWrite1hourCoefficient={
                        item.billingMultiplier.cacheWrite1hour
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(hasPrev || hasNext) && (
        <div className="flex justify-end mt-3">
          <Button
            variant="text"
            size="sl"
            onClick={onPrevPage}
            disabled={!hasPrev || isLoading}
            className="flex items-center gap-1 no-underline px-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <Button
            variant="text"
            size="sl"
            onClick={onNextPage}
            disabled={!hasNext || isLoading}
            className="flex items-center gap-1 no-underline px-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
