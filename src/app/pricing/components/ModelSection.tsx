"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import styles from "./ModelAPIPrice.module.scss";
import Link from "next/link";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { ChevronDown } from "lucide-react";
import Big from "big.js";
import { MultimodalPricing } from "@/types/models";
import { balanceFormatReal } from "@/lib/utils/money";
import MultimodalPricingTable from "@/app/components/ModelDetail/ModelFeatures/MultimodalPricingTable";
import PricingMobileCard from "./PricingMobileCard";

interface PricingObject {
  originPricePerM: number;
  pricePerM: number;
}

interface TieredBillingConfig {
  min_tokens: number;
  max_tokens: number;
  output_min_tokens: number;
  output_max_tokens?: number;
  input_pricing: {
    pricePerM: number;
  };
  output_pricing: {
    pricePerM: number;
  };
  cache_creation_input_pricing?: PricingObject;
  cache_creation_1_hour_input_pricing?: PricingObject;
  cache_read_input_pricing?: PricingObject;
}

interface ModelData {
  originalInput?: string | null;
  originalOutput?: string | null;
  name?: string;
  context: number;
  input: string;
  output: string;
  cacheReadPricing?: PricingObject | null;
  cacheWrite5mPricing?: PricingObject | null;
  cacheWrite1hPricing?: PricingObject | null;
  operation?: string;
  id?: string;
  isTieredBilling?: boolean;
  tierRange?: string;
  tieredBillingConfigs?: TieredBillingConfig[];
  isOmnimodal?: boolean;
  multimodalPricing?: MultimodalPricing | null;
  rowspan?: number;
}

interface ModelSectionProps {
  modelName: string;
  provider?: string;
  sectionId?: string;
  description?: string;
  data: ModelData[];
  className?: string;
  isConsole?: boolean;
}

const ModelSection: React.FC<ModelSectionProps> = ({
  modelName,
  provider,
  sectionId,
  description,
  data,
  className,
  isConsole = false,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const formatIdForUrl = (id: string): string => {
    return id.replace(/\//g, "-");
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const columns = [
    { title: "Model Name", dataIndex: "name" },
    { title: "Context", dataIndex: "context" },
    { title: "Input", dataIndex: "input" },
    { title: "Output", dataIndex: "output" },
    { title: "Actions", dataIndex: "operation" },
  ];

  const renderPriceCell = (
    value: string,
    originalValue?: string | null,
    cacheReadPricing?: PricingObject | null,
    cacheWrite5mPricing?: PricingObject | null,
    cacheWrite1hPricing?: PricingObject | null,
  ) => {
    const fmt = (v: string | number) => `$${v} /Mt`;

    const renderPriceLine = (pricing: PricingObject) => {
      const current = balanceFormatReal(pricing.pricePerM).toString();
      const hasDiscount =
        pricing.originPricePerM > 0 &&
        pricing.pricePerM < pricing.originPricePerM;
      if (!hasDiscount) return <span>{fmt(current)}</span>;
      return (
        <span className="flex flex-wrap gap-space-4">
          <span className="text-[var(--brand-1)]">{fmt(current)}</span>
          <span className="text-[var(--gray-1)] line-through">
            {fmt(balanceFormatReal(pricing.originPricePerM).toString())}
          </span>
        </span>
      );
    };

    if (value === "0" && !cacheReadPricing?.pricePerM) {
      return (
        <span className="w-8 h-5 rounded-[2px] bg-[var(--green-7)] text-[var(--green-2)] font-miletus text-paragraph-12 flex items-center justify-center">
          Free
        </span>
      );
    }

    const cacheReadEmpty = !cacheReadPricing?.pricePerM;
    const originalValueEmpty = !originalValue || originalValue === "0";

    let mainContent: React.ReactNode;
    if (cacheReadEmpty) {
      if (originalValueEmpty || originalValue === value) {
        mainContent = <span>{fmt(value)}</span>;
      } else {
        mainContent = (
          <span className="flex flex-wrap gap-space-4">
            <span className="text-[var(--brand-1)]">{fmt(value)}</span>
            <span className="text-[var(--gray-1)] line-through">
              {fmt(originalValue!)}
            </span>
          </span>
        );
      }
    } else {
      const cacheReadValue = balanceFormatReal(
        cacheReadPricing!.pricePerM,
      ).toString();
      const cacheReadHasDiscount =
        cacheReadPricing!.originPricePerM > 0 &&
        cacheReadPricing!.pricePerM < cacheReadPricing!.originPricePerM;

      if (!cacheReadHasDiscount) {
        mainContent = (
          <span className="flex flex-wrap gap-space-4">
            <span
              className={
                originalValue ? "text-[var(--brand-1)]" : "text-[var(--text-1)]"
              }
            >
              {fmt(value)}
            </span>
            {originalValue && (
              <>
                <span className="text-[var(--gray-1)] line-through">
                  {fmt(originalValue)}
                </span>{" "}
              </>
            )}
            <span className="text-[var(--text-3)]">·</span> Cache Read{" "}
            {fmt(cacheReadValue)}
          </span>
        );
      } else {
        const originalCacheReadValue = balanceFormatReal(
          cacheReadPricing!.originPricePerM,
        ).toString();
        mainContent = (
          <span className="flex flex-wrap flex-col items-start gap-space-4">
            <span className="text-[var(--brand-1)]">
              {fmt(value)} <span className="text-[var(--text-3)]">·</span> Cache
              Read {fmt(cacheReadValue)}
            </span>
            <span className="text-[var(--gray-1)] line-through">
              {fmt(originalValue!)} · Cache Read {fmt(originalCacheReadValue)}
            </span>
          </span>
        );
      }
    }

    if (!cacheWrite5mPricing?.pricePerM && !cacheWrite1hPricing?.pricePerM)
      return mainContent;

    return (
      <div className="flex flex-col gap-space-4">
        {mainContent}
        {cacheWrite5mPricing?.pricePerM ? (
          <span className="flex flex-wrap gap-space-4">
            <span className="text-[var(--text-1)]">· Cache Write(5m)</span>
            {renderPriceLine(cacheWrite5mPricing)}
          </span>
        ) : null}
        {cacheWrite1hPricing?.pricePerM ? (
          <span className="flex flex-wrap gap-space-4">
            <span className="text-[var(--text-1)]">· Cache Write(1h)</span>
            {renderPriceLine(cacheWrite1hPricing)}
          </span>
        ) : null}
      </div>
    );
  };

  const headCellCls =
    "font-miletus text-paragraph-13 text-[var(--text-3)] px-space-12 py-space-8 whitespace-nowrap bg-[var(--fill-4)] border-b border-[var(--border-default)]";
  const bodyCellCls =
    "font-miletus text-paragraph-13 text-[var(--text-1)] px-space-12 py-space-12 whitespace-nowrap";

  return (
    <div id={sectionId} className={cn(className)}>
      <div className="flex flex-col gap-space-12 md:hidden">
        <div className="rounded-8 bg-white p-space-16 [box-shadow:none]">
          <div className="flex items-start gap-space-8">
            {provider && <ModelLogo modelName={provider} size={24} />}
            <span className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
              {modelName}
            </span>
          </div>
          <p className="mt-space-8 font-miletus text-paragraph-12 text-[var(--text-3)]">
            {description || "--"}
          </p>
        </div>

        {data.map((row, index) => {
          const modelUrl = row.id
            ? `/models/model-detail/${formatIdForUrl(row.id)}?from=pricing`
            : "/models";
          const isExpanded = expandedRows.has(index);
          const isTiered = row.isTieredBilling === true;
          const isOmnimodal = row.isOmnimodal === true;
          const outputValue = isTiered ? (
            <button
              className="inline-flex items-center gap-space-4 cursor-pointer text-[var(--brand-0)] hover:opacity-80 transition-opacity"
              onClick={() => toggleRow(index)}
              aria-expanded={isExpanded}
              aria-label="Show tiered pricing"
            >
              <span>{row.output}</span>
              <ChevronDown
                size={12}
                className={cn(
                  "transition-transform text-[var(--brand-0)] flex-shrink-0",
                  isExpanded && "rotate-180",
                )}
              />
            </button>
          ) : isOmnimodal ? (
            <button
              className="inline-flex items-center gap-space-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRow(index)}
              aria-expanded={isExpanded}
              aria-label="Show omnimodal pricing"
            >
              <span
                className={cn(
                  "transition-colors font-miletus text-paragraph-13",
                  isExpanded ? "text-[var(--brand-1)]" : "text-[var(--text-1)]",
                )}
              >
                Omnimodal
              </span>
              <ChevronDown
                size={12}
                className={cn(
                  "transition-all flex-shrink-0",
                  isExpanded
                    ? "text-[var(--brand-1)] rotate-180"
                    : "text-[var(--text-1)]",
                )}
              />
            </button>
          ) : (
            renderPriceCell(row.output, row.originalOutput)
          );

          return (
            <PricingMobileCard
              key={index}
              data-testid="model-section-mobile-card"
              title={
                <Link
                  href={modelUrl}
                  className="hover:text-[var(--brand-0)] transition-colors"
                >
                  {row.name}
                </Link>
              }
              action={
                <a
                  href={modelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-miletus text-paragraph-13 text-[var(--text-1)] hover:opacity-70 transition-opacity"
                >
                  More
                </a>
              }
              fields={[
                {
                  label: "Context",
                  value: row.context?.toLocaleString() || "-",
                },
                {
                  label: "Input",
                  value:
                    isTiered || isOmnimodal
                      ? "-"
                      : renderPriceCell(
                          row.input,
                          row.originalInput,
                          row.cacheReadPricing,
                          row.cacheWrite5mPricing,
                          row.cacheWrite1hPricing,
                        ),
                },
                { label: "Output", value: outputValue },
              ]}
            >
              {isTiered && isExpanded && row.tieredBillingConfigs ? (
                <div className="overflow-x-auto rounded-6 bg-[var(--fill-4)] p-space-8">
                  <Table className={styles.table_wrap}>
                    {(() => {
                      const configs = row.tieredBillingConfigs!;
                      const hasOutputLength = configs.some(
                        (t) => t.output_min_tokens || t.output_max_tokens,
                      );
                      const hasCacheWrite5m = configs.some(
                        (t) => t.cache_creation_input_pricing?.pricePerM,
                      );
                      const hasCacheWrite1h = configs.some(
                        (t) => t.cache_creation_1_hour_input_pricing?.pricePerM,
                      );
                      const hasCacheRead = configs.some(
                        (t) => t.cache_read_input_pricing?.pricePerM,
                      );
                      const innerHeadCls = cn(headCellCls);
                      const innerCellCls = cn(styles.table_cell, bodyCellCls);
                      return (
                        <>
                          <TableHeader>
                            <TableRow>
                              <TableHead className={innerHeadCls}>
                                Input length
                              </TableHead>
                              {hasOutputLength && (
                                <TableHead className={innerHeadCls}>
                                  Output length
                                </TableHead>
                              )}
                              <TableHead className={innerHeadCls}>
                                Input price (Mtokens)
                              </TableHead>
                              <TableHead className={innerHeadCls}>
                                Output Price (Mtokens)
                              </TableHead>
                              {hasCacheWrite5m && (
                                <TableHead className={innerHeadCls}>
                                  Cached writes(5m)
                                </TableHead>
                              )}
                              {hasCacheWrite1h && (
                                <TableHead className={innerHeadCls}>
                                  Cached writes(1h)
                                </TableHead>
                              )}
                              {hasCacheRead && (
                                <TableHead className={innerHeadCls}>
                                  Cached reads
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody className="bg-white">
                            {configs.map((tier, tierIndex) => (
                              <TableRow key={tierIndex}>
                                <TableCell className={innerCellCls}>
                                  {"["}
                                  {tier.min_tokens.toLocaleString()} -{" "}
                                  {tier.max_tokens === -1
                                    ? "∞"
                                    : tier.max_tokens.toLocaleString()}
                                  {")"}
                                </TableCell>
                                {hasOutputLength && (
                                  <TableCell className={innerCellCls}>
                                    {"["}
                                    {tier.output_min_tokens.toLocaleString()} -{" "}
                                    {tier.output_max_tokens === -1 ||
                                    !tier.output_max_tokens
                                      ? "∞"
                                      : (
                                          tier.output_max_tokens || 0
                                        ).toLocaleString()}
                                    {")"}
                                  </TableCell>
                                )}
                                <TableCell className={innerCellCls}>
                                  {renderPriceCell(
                                    Big(tier.input_pricing.pricePerM || 0)
                                      .div(10000)
                                      .toString(),
                                  )}
                                </TableCell>
                                <TableCell className={innerCellCls}>
                                  {renderPriceCell(
                                    Big(tier.output_pricing.pricePerM || 0)
                                      .div(10000)
                                      .toString(),
                                  )}
                                </TableCell>
                                {hasCacheWrite5m && (
                                  <TableCell className={innerCellCls}>
                                    {tier.cache_creation_input_pricing
                                      ?.pricePerM
                                      ? renderPriceCell(
                                          balanceFormatReal(
                                            tier.cache_creation_input_pricing
                                              .pricePerM,
                                          ).toString(),
                                        )
                                      : "-"}
                                  </TableCell>
                                )}
                                {hasCacheWrite1h && (
                                  <TableCell className={innerCellCls}>
                                    {tier.cache_creation_1_hour_input_pricing
                                      ?.pricePerM
                                      ? renderPriceCell(
                                          balanceFormatReal(
                                            tier
                                              .cache_creation_1_hour_input_pricing
                                              .pricePerM,
                                          ).toString(),
                                        )
                                      : "-"}
                                  </TableCell>
                                )}
                                {hasCacheRead && (
                                  <TableCell className={innerCellCls}>
                                    {tier.cache_read_input_pricing?.pricePerM
                                      ? renderPriceCell(
                                          balanceFormatReal(
                                            tier.cache_read_input_pricing
                                              .pricePerM,
                                          ).toString(),
                                        )
                                      : "-"}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </>
                      );
                    })()}
                  </Table>
                </div>
              ) : null}
              {isOmnimodal && isExpanded && row.multimodalPricing ? (
                <div className="rounded-6 bg-[var(--fill-4)] p-space-8">
                  <MultimodalPricingTable
                    pricing={row.multimodalPricing}
                    currencySymbol="$"
                    unit="Mt"
                  />
                </div>
              ) : null}
            </PricingMobileCard>
          );
        })}
      </div>

      <div className="hidden gap-space-16 items-start bg-white rounded-8 p-space-16 [box-shadow:none] md:flex">
        {/* Provider Info Panel */}
        <div className="flex-shrink-0 w-[170px] flex flex-col gap-space-8 p-space-8">
          <div className="flex items-start gap-space-8">
            {provider && <ModelLogo modelName={provider} size={24} />}
            <span className="font-miletus text-paragraph-16 text-[var(--text-1)]">
              {modelName}
            </span>
          </div>
          <p className="font-miletus text-paragraph-12 text-[var(--text-3)]">
            {description || "--"}
          </p>
        </div>

        {/* Pricing Table */}
        <div className="flex-1 overflow-hidden [box-shadow:none]">
          <div className="overflow-x-auto">
            <Table className={styles.table_wrap}>
              <TableHeader>
                <TableRow className="h-[48px]">
                  {columns.map((column) => (
                    <TableHead
                      key={column.dataIndex}
                      className={cn(
                        headCellCls,
                        column.dataIndex === "name" ? "w-[250px]" : "",
                        column.dataIndex === "context" ? "w-[110px]" : "",
                        column.dataIndex === "input" ? "w-[250px]" : "",
                        column.dataIndex === "output" ? "w-[140px]" : "",
                        column.dataIndex === "operation"
                          ? "w-[83px] text-right"
                          : "",
                      )}
                    >
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => {
                  const modelUrl = row.id
                    ? `/models/model-detail/${formatIdForUrl(row.id)}?from=pricing`
                    : "/models";
                  const isExpanded = expandedRows.has(index);
                  const isTiered = row.isTieredBilling === true;
                  const isOmnimodal = row.isOmnimodal === true;
                  const isHighlighted = false;

                  return (
                    <React.Fragment key={index}>
                      <TableRow
                        className={cn(
                          "border-b",
                          isHighlighted
                            ? "bg-[var(--fill-4)] border-[var(--border-default)]"
                            : "bg-white border-[var(--border-subtle)]",
                        )}
                      >
                        <TableCell
                          className={cn(
                            styles.table_cell,
                            bodyCellCls,
                            "w-[250px]",
                          )}
                        >
                          <Link
                            href={modelUrl}
                            className="cursor-pointer hover:text-[var(--brand-0)] transition-colors duration-200"
                          >
                            {row.name}
                          </Link>
                        </TableCell>
                        <TableCell
                          className={cn(styles.table_cell, bodyCellCls)}
                        >
                          {row.context?.toLocaleString() || "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            styles.table_cell,
                            bodyCellCls,
                            "w-[250px]",
                          )}
                        >
                          {isTiered || isOmnimodal
                            ? "-"
                            : renderPriceCell(
                                row.input,
                                row.originalInput,
                                row.cacheReadPricing,
                                row.cacheWrite5mPricing,
                                row.cacheWrite1hPricing,
                              )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            styles.table_cell,
                            bodyCellCls,
                            "w-[140px]",
                          )}
                        >
                          {isTiered ? (
                            <button
                              className="inline-flex items-center gap-space-4 cursor-pointer text-[var(--brand-0)] hover:opacity-80 transition-opacity"
                              onClick={() => toggleRow(index)}
                              aria-expanded={isExpanded}
                              aria-label="Show tiered pricing"
                            >
                              <span>{row.output}</span>
                              <ChevronDown
                                size={12}
                                className={cn(
                                  "transition-transform text-[var(--brand-0)] flex-shrink-0",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                          ) : isOmnimodal ? (
                            <button
                              className="inline-flex items-center gap-space-4 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => toggleRow(index)}
                              aria-expanded={isExpanded}
                              aria-label="Show omnimodal pricing"
                            >
                              <span
                                className={cn(
                                  "transition-colors font-miletus text-paragraph-13",
                                  isExpanded
                                    ? "text-[var(--brand-1)]"
                                    : "text-[var(--text-1)]",
                                )}
                              >
                                Omnimodal
                              </span>
                              <ChevronDown
                                size={12}
                                className={cn(
                                  "transition-all flex-shrink-0",
                                  isExpanded
                                    ? "text-[var(--brand-1)] rotate-180"
                                    : "text-[var(--text-1)]",
                                )}
                              />
                            </button>
                          ) : (
                            renderPriceCell(row.output, row.originalOutput)
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            styles.table_cell,
                            bodyCellCls,
                            "w-[83px] text-right",
                          )}
                        >
                          <a
                            href={modelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-miletus text-paragraph-13 text-[var(--text-1)] hover:opacity-70 transition-opacity"
                          >
                            More
                          </a>
                        </TableCell>
                      </TableRow>

                      {isTiered && isExpanded && row.tieredBillingConfigs && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className={cn(
                              styles.table_cell,
                              "p-0 bg-[var(--fill-4)] border-b border-[var(--border-default)]",
                            )}
                          >
                            <div className="px-space-16 py-0">
                              <Table className={styles.table_wrap}>
                                {(() => {
                                  const configs = row.tieredBillingConfigs!;
                                  const hasOutputLength = configs.some(
                                    (t) =>
                                      t.output_min_tokens ||
                                      t.output_max_tokens,
                                  );
                                  const hasCacheWrite5m = configs.some(
                                    (t) =>
                                      t.cache_creation_input_pricing?.pricePerM,
                                  );
                                  const hasCacheWrite1h = configs.some(
                                    (t) =>
                                      t.cache_creation_1_hour_input_pricing
                                        ?.pricePerM,
                                  );
                                  const hasCacheRead = configs.some(
                                    (t) =>
                                      t.cache_read_input_pricing?.pricePerM,
                                  );
                                  const innerHeadCls = cn(headCellCls);
                                  const innerCellCls = cn(
                                    styles.table_cell,
                                    bodyCellCls,
                                  );
                                  return (
                                    <>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className={innerHeadCls}>
                                            Input length
                                          </TableHead>
                                          {hasOutputLength && (
                                            <TableHead className={innerHeadCls}>
                                              Output length
                                            </TableHead>
                                          )}
                                          <TableHead className={innerHeadCls}>
                                            Input price (Mtokens)
                                          </TableHead>
                                          <TableHead className={innerHeadCls}>
                                            Output Price (Mtokens)
                                          </TableHead>
                                          {hasCacheWrite5m && (
                                            <TableHead className={innerHeadCls}>
                                              Cached writes(5m)
                                            </TableHead>
                                          )}
                                          {hasCacheWrite1h && (
                                            <TableHead className={innerHeadCls}>
                                              Cached writes(1h)
                                            </TableHead>
                                          )}
                                          {hasCacheRead && (
                                            <TableHead className={innerHeadCls}>
                                              Cached reads
                                            </TableHead>
                                          )}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody className="bg-white">
                                        {configs.map((tier, tierIndex) => (
                                          <TableRow key={tierIndex}>
                                            <TableCell className={innerCellCls}>
                                              {"["}
                                              {tier.min_tokens.toLocaleString()}{" "}
                                              -{" "}
                                              {tier.max_tokens === -1
                                                ? "∞"
                                                : tier.max_tokens.toLocaleString()}
                                              {")"}
                                            </TableCell>
                                            {hasOutputLength && (
                                              <TableCell
                                                className={innerCellCls}
                                              >
                                                {"["}
                                                {tier.output_min_tokens.toLocaleString()}{" "}
                                                -{" "}
                                                {tier.output_max_tokens ===
                                                  -1 || !tier.output_max_tokens
                                                  ? "∞"
                                                  : (
                                                      tier.output_max_tokens ||
                                                      0
                                                    ).toLocaleString()}
                                                {")"}
                                              </TableCell>
                                            )}
                                            <TableCell className={innerCellCls}>
                                              {renderPriceCell(
                                                Big(
                                                  tier.input_pricing
                                                    .pricePerM || 0,
                                                )
                                                  .div(10000)
                                                  .toString(),
                                              )}
                                            </TableCell>
                                            <TableCell className={innerCellCls}>
                                              {renderPriceCell(
                                                Big(
                                                  tier.output_pricing
                                                    .pricePerM || 0,
                                                )
                                                  .div(10000)
                                                  .toString(),
                                              )}
                                            </TableCell>
                                            {hasCacheWrite5m && (
                                              <TableCell
                                                className={innerCellCls}
                                              >
                                                {tier
                                                  .cache_creation_input_pricing
                                                  ?.pricePerM
                                                  ? renderPriceCell(
                                                      balanceFormatReal(
                                                        tier
                                                          .cache_creation_input_pricing
                                                          .pricePerM,
                                                      ).toString(),
                                                    )
                                                  : "-"}
                                              </TableCell>
                                            )}
                                            {hasCacheWrite1h && (
                                              <TableCell
                                                className={innerCellCls}
                                              >
                                                {tier
                                                  .cache_creation_1_hour_input_pricing
                                                  ?.pricePerM
                                                  ? renderPriceCell(
                                                      balanceFormatReal(
                                                        tier
                                                          .cache_creation_1_hour_input_pricing
                                                          .pricePerM,
                                                      ).toString(),
                                                    )
                                                  : "-"}
                                              </TableCell>
                                            )}
                                            {hasCacheRead && (
                                              <TableCell
                                                className={innerCellCls}
                                              >
                                                {tier.cache_read_input_pricing
                                                  ?.pricePerM
                                                  ? renderPriceCell(
                                                      balanceFormatReal(
                                                        tier
                                                          .cache_read_input_pricing
                                                          .pricePerM,
                                                      ).toString(),
                                                    )
                                                  : "-"}
                                              </TableCell>
                                            )}
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </>
                                  );
                                })()}
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {isOmnimodal && isExpanded && row.multimodalPricing && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className={cn(
                              styles.table_cell,
                              "p-0 bg-[var(--fill-4)] border-b border-[var(--border-default)]",
                            )}
                          >
                            <div className="px-space-12 py-0">
                              <MultimodalPricingTable
                                pricing={row.multimodalPricing!}
                                currencySymbol="$"
                                unit="Mt"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSection;
