"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styles from "./ModelAPIPrice.module.scss";
import { computeRowSpanMaps } from "./tableRowSpan";
import PricingMobileCard from "./PricingMobileCard";

const aiSearchPriceRows = [
  { apiName: "EXA", mode: "neuralSearch", pricing: "$0.007/request" },
  { apiName: "EXA", mode: "deepSearch", pricing: "$0.012/request" },
  { apiName: "EXA", mode: "deepReasoningSearch", pricing: "$0.015/request" },
  {
    apiName: "EXA",
    mode: "additional_result",
    pricing: "$0.001/result (beyond 10 results)",
  },
  { apiName: "EXA", mode: "answer", pricing: "$0.005/request" },
  { apiName: "EXA", mode: "contentText", pricing: "$0.001/item" },
  { apiName: "EXA", mode: "contentHighlight", pricing: "$0.001/item" },
  { apiName: "EXA", mode: "contentSummary", pricing: "$0.001/item" },

  { apiName: "Tavily", mode: "basicSearch", pricing: "$0.008/request" },
  { apiName: "Tavily", mode: "advancedSearch", pricing: "$0.016/request" },
  { apiName: "Tavily", mode: "basicExtract", pricing: "$0.0016/url" },
  { apiName: "Tavily", mode: "advancedExtract", pricing: "$0.0032/url" },
  { apiName: "Tavily", mode: "regularMapping", pricing: "$0.0008/page" },
  { apiName: "Tavily", mode: "instructedMapping", pricing: "$0.0016/page" },
  { apiName: "Tavily", mode: "Crawl", pricing: "Extract + Mapping Cost" },
];

const AISearchPrice: React.FC<{
  isConsole?: boolean;
  searchValue?: string;
}> = ({ isConsole = false, searchValue = "" }) => {
  const query = searchValue.trim().toLowerCase();
  const filteredRows = query
    ? aiSearchPriceRows.filter((row) =>
        row.apiName.toLowerCase().includes(query),
      )
    : aiSearchPriceRows;
  const { rowSpanMap, skipRows } = computeRowSpanMaps(
    filteredRows,
    (row) => row.apiName,
  );
  const headCellCls = `font-semibold text-[var(--dark-4)] bg-[var(--gray-3)] ${isConsole ? "text-xs" : "text-xs md:text-sm"}`;
  const bodyCellCls = `${styles.table_cell} ${isConsole ? "text-xs" : "text-xs md:text-sm"}`;

  if (filteredRows.length === 0) return null;

  return (
    <div className={styles.price_card}>
      <div className="-m-6">
        <div className="rounded-[6px] border border-[var(--gray-2)] bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full flex-shrink-0 px-2 md:w-[224px] md:pt-4">
              <h3
                className={`${isConsole ? "text-sm md:text-base" : "text-base md:text-xl"} mb-2 font-semibold text-foreground`}
              >
                AI Search
              </h3>
            </div>

            <div className="flex flex-col gap-space-12 md:hidden">
              {aiSearchPriceRows.map((row) => (
                <PricingMobileCard
                  key={row.mode}
                  title={row.mode}
                  fields={[
                    { label: "API Name", value: row.apiName },
                    { label: "Pricing", value: row.pricing },
                  ]}
                />
              ))}
            </div>

            <div className="hidden flex-1 overflow-x-auto md:block">
              <Table className={styles.table_wrap}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={`${headCellCls} min-w-[160px]`}>
                      API Name
                    </TableHead>
                    <TableHead className={`${headCellCls} min-w-[220px]`}>
                      Mode
                    </TableHead>
                    <TableHead className={`${headCellCls} min-w-[160px]`}>
                      Pricing
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="overflow-hidden rounded-lg bg-white">
                  {filteredRows.map((row, rowIndex) => (
                    <TableRow
                      key={`${row.apiName}-${row.mode}`}
                      className={styles.table_row_hover}
                    >
                      {skipRows.has(rowIndex) ? null : (
                        <TableCell
                          className={`${bodyCellCls} ${styles.table_cell_no_hover}`}
                          rowSpan={rowSpanMap[rowIndex]}
                        >
                          {row.apiName}
                        </TableCell>
                      )}
                      <TableCell className={bodyCellCls}>{row.mode}</TableCell>
                      <TableCell className={bodyCellCls}>
                        {row.pricing}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchPrice;
