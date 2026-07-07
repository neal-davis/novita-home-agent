"use client";

import { useEffect, useRef, useState } from "react";
import { Circle } from "lucide-react";
import {
  UsageCostDataset,
  UsageRequestDataset,
  UsageTooltip,
  UsageTooltipLine,
} from "./types";
import { formatCurrency, formatUsageNumber } from "./usageData";

const MIN_CHART_WIDTH = 560;
const CHART_HEIGHT = 220;
const PADDING = {
  left: 44,
  right: 10,
  top: 10,
  bottom: 30,
};
// i18n-disable-next-line
const SVG_TEXT_ANCHOR_END = "end";
// i18n-disable-next-line
const SVG_TEXT_ANCHOR_MIDDLE = "middle";

type ChartTooltipHandler = (tooltip: UsageTooltip) => void;

function useResponsiveChartWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MIN_CHART_WIDTH);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(Math.max(Math.round(element.clientWidth), MIN_CHART_WIDTH));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

function tooltipFromEvent(
  event: React.MouseEvent<SVGElement>,
  title: string,
  lines: UsageTooltipLine[],
): UsageTooltip {
  return {
    x: event.clientX + 14,
    y: event.clientY - 10,
    title,
    lines,
  };
}

function updateTooltipPosition(
  event: React.MouseEvent<SVGElement>,
  current: UsageTooltip,
): UsageTooltip {
  if (!current) return current;
  return {
    ...current,
    x: event.clientX + 14,
    y: event.clientY - 10,
  };
}

export function UsageTooltipLayer({ tooltip }: { tooltip: UsageTooltip }) {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none fixed z-[10002] min-w-[240px] max-w-[340px] rounded-[6px] bg-[#111928] px-3 py-2 text-xs leading-[1.6] text-white"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      {tooltip.title && (
        <div className="mb-1 font-semibold text-white">{tooltip.title}</div>
      )}
      {tooltip.lines.map((line, index) => (
        <div
          key={typeof line === "string" ? line : `${line.label}-${index}`}
          className={
            typeof line === "string"
              ? undefined
              : "flex items-center justify-between gap-3"
          }
        >
          {typeof line === "string" ? (
            line
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-1.5">
                {line.color && (
                  <Circle
                    size={8}
                    strokeWidth={0}
                    fill={line.color}
                    className="shrink-0"
                  />
                )}
                <span className="truncate">{line.label}</span>
              </span>
              <span
                className={
                  line.emphasized
                    ? "shrink-0 font-semibold"
                    : "shrink-0 text-white/80"
                }
              >
                {line.value}
                {line.detail ? ` · ${line.detail}` : ""}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function getCostTooltipLines({
  datasets,
  labelIndex,
  total,
  currency,
}: {
  datasets: UsageCostDataset[];
  labelIndex: number;
  total: number;
  currency?: string;
}): UsageTooltipLine[] {
  const rows = datasets
    .map((dataset) => ({
      id: dataset.id,
      label: dataset.name,
      value: dataset.data[labelIndex] || 0,
      color: dataset.color,
    }))
    .filter((row) => row.value > 0)
    .sort((first, second) => second.value - first.value);

  return [
    {
      label: "Total",
      value: formatCurrency(total, currency),
      emphasized: true,
    },
    ...rows.map((row) => ({
      label: row.label,
      value: formatCurrency(row.value, currency),
      detail: `${total > 0 ? ((row.value / total) * 100).toFixed(1) : "0.0"}%`,
      color: row.color,
    })),
  ];
}

export function StackedCostChart({
  datasets,
  labels,
  onTooltipChange,
  tooltip,
  currency,
}: {
  datasets: UsageCostDataset[];
  labels: string[];
  onTooltipChange: ChartTooltipHandler;
  tooltip: UsageTooltip;
  currency?: string;
}) {
  const { containerRef, width } = useResponsiveChartWidth();
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const totals = labels.map((_, labelIndex) =>
    datasets.reduce((sum, dataset) => sum + (dataset.data[labelIndex] || 0), 0),
  );
  const maxY = (Math.max(...totals) || 10) * 1.12;
  const barWidth = Math.max(
    4,
    Math.floor((chartWidth / Math.max(labels.length, 1)) * 0.65),
  );
  const gap =
    (chartWidth - barWidth * labels.length) / Math.max(labels.length + 1, 1);

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="block overflow-visible"
        onMouseMove={(event) =>
          onTooltipChange(updateTooltipPosition(event, tooltip))
        }
        onMouseLeave={() => onTooltipChange(null)}
      >
        {Array.from({ length: 5 }, (_, tickIndex) => {
          const tickValue = (maxY * tickIndex) / 4;
          const y =
            PADDING.top + chartHeight - (tickValue / maxY) * chartHeight;

          return (
            <g key={tickIndex}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartWidth}
                y2={y}
                stroke="#F5F5F5"
              />
              <text
                x={PADDING.left - 4}
                y={y + 4}
                textAnchor={SVG_TEXT_ANCHOR_END}
                fontSize="10"
                fill="#9E9C98"
              >
                {formatCurrency(tickValue, currency)}
              </text>
            </g>
          );
        })}

        {labels.map((label, labelIndex) => {
          const x = PADDING.left + gap + labelIndex * (barWidth + gap);
          let stackY = PADDING.top + chartHeight;
          const total = totals[labelIndex] || 0;
          const tooltipLines = getCostTooltipLines({
            datasets,
            labelIndex,
            total,
            currency,
          });

          const bars = datasets.map((dataset) => {
            const value = dataset.data[labelIndex] || 0;
            if (value <= 0) return null;

            const height = (value / maxY) * chartHeight;
            stackY -= height;

            return (
              <rect
                key={dataset.id}
                x={x}
                y={stackY}
                width={barWidth}
                height={height}
                rx="1"
                fill={dataset.color}
                className="cursor-default"
              />
            );
          });

          const shouldShowLabel =
            label &&
            (labels.length <= 10 ||
              labelIndex % Math.ceil(labels.length / 8) === 0);

          return (
            <g key={`${label}-${labelIndex}`}>
              {bars}
              {total > 0 && (
                <rect
                  x={Math.max(PADDING.left, x - gap / 2)}
                  y={PADDING.top}
                  width={barWidth + gap}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-default"
                  style={{ pointerEvents: "all" }}
                  onMouseEnter={(event) => {
                    event.stopPropagation();
                    onTooltipChange(
                      tooltipFromEvent(event, label || "Usage", tooltipLines),
                    );
                  }}
                  onMouseMove={(event) => {
                    event.stopPropagation();
                    onTooltipChange(
                      tooltipFromEvent(event, label || "Usage", tooltipLines),
                    );
                  }}
                />
              )}
              {shouldShowLabel && (
                <text
                  x={x + barWidth / 2}
                  y={PADDING.top + chartHeight + 17}
                  textAnchor={SVG_TEXT_ANCHOR_MIDDLE}
                  fontSize="10"
                  fill="#9E9C98"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function RequestLineChart({
  datasets,
  labels,
  onTooltipChange,
  tooltip,
}: {
  datasets: UsageRequestDataset[];
  labels: string[];
  onTooltipChange: ChartTooltipHandler;
  tooltip: UsageTooltip;
}) {
  const { containerRef, width } = useResponsiveChartWidth();
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const values = datasets.flatMap((dataset) => dataset.data);
  const maxY = (Math.max(...values) || 100) * 1.15;

  return (
    <div ref={containerRef} className="w-full">
      <svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="block overflow-visible"
        onMouseMove={(event) =>
          onTooltipChange(updateTooltipPosition(event, tooltip))
        }
        onMouseLeave={() => onTooltipChange(null)}
      >
        {Array.from({ length: 5 }, (_, tickIndex) => {
          const tickValue = (maxY * tickIndex) / 4;
          const y =
            PADDING.top + chartHeight - (tickValue / maxY) * chartHeight;

          return (
            <g key={tickIndex}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chartWidth}
                y2={y}
                stroke="#F5F5F5"
              />
              <text
                x={PADDING.left - 5}
                y={y + 4}
                textAnchor={SVG_TEXT_ANCHOR_END}
                fontSize="10"
                fill="#9E9C98"
              >
                {formatUsageNumber(Math.round(tickValue))}
              </text>
            </g>
          );
        })}

        {datasets.map((dataset) => {
          const points = dataset.data.map((value, index) => {
            const x =
              PADDING.left +
              (labels.length === 1
                ? chartWidth / 2
                : (index / Math.max(labels.length - 1, 1)) * chartWidth);
            const y = PADDING.top + chartHeight - (value / maxY) * chartHeight;
            return { x, y, value, label: labels[index] };
          });
          const areaPath = [
            `M${points[0]?.x || PADDING.left},${PADDING.top + chartHeight}`,
            ...points.map((point) => `L${point.x},${point.y}`),
            `L${points[points.length - 1]?.x || PADDING.left},${PADDING.top + chartHeight}`,
            "Z",
          ].join(" ");
          const linePath = points
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"}${point.x},${point.y}`,
            )
            .join(" ");

          return (
            <g key={dataset.label}>
              <path d={areaPath} fill={dataset.color} opacity="0.08" />
              <path
                d={linePath}
                fill="none"
                stroke={dataset.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, index) => (
                <circle
                  key={`${dataset.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={dataset.color}
                  className="cursor-default"
                  onMouseEnter={(event) =>
                    onTooltipChange(
                      tooltipFromEvent(event, point.label || "Usage", [
                        `${dataset.label}: ${formatUsageNumber(point.value)}`,
                      ]),
                    )
                  }
                />
              ))}
              {points.map((point, index) => {
                const shouldShowLabel =
                  point.label &&
                  (labels.length <= 8 ||
                    index % Math.ceil(labels.length / 7) === 0);

                return shouldShowLabel ? (
                  <text
                    key={`${dataset.label}-label-${index}`}
                    x={point.x}
                    y={PADDING.top + chartHeight + 17}
                    textAnchor={SVG_TEXT_ANCHOR_MIDDLE}
                    fontSize="10"
                    fill="#9E9C98"
                  >
                    {point.label}
                  </text>
                ) : null;
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
