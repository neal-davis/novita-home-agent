"use client";

import { useState } from "react";
import { DailyUsage, formatDate, formatTokens } from "../../types";

interface UsageHeatmapProps {
  data: DailyUsage[];
}

// Color thresholds in millions of tokens
const COLOR_THRESHOLDS = [
  { min: 50_000_000, color: "var(--brand-1)", label: "> 50Mt" },
  { min: 10_000_000, color: "#6DE4A9", label: "10-50Mt" },
  { min: 0, color: "var(--brand-3)", label: "0-10Mt" },
];

function getColorForTokens(tokens: number): string {
  for (const threshold of COLOR_THRESHOLDS) {
    if (tokens >= threshold.min) {
      return threshold.color;
    }
  }
  return COLOR_THRESHOLDS[COLOR_THRESHOLDS.length - 1].color;
}

export default function UsageHeatmap({ data }: UsageHeatmapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (
    index: number,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    setHoveredIndex(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex gap-6 lg:gap-[64px] items-stretch">
      <div className="grid grid-cols-8 gap-2">
        {data.map((item, index) => (
          <div
            key={item.timestamp}
            className="w-8 h-8 rounded-sm cursor-pointer transition-transform duration-100 hover:scale-110"
            style={{ backgroundColor: getColorForTokens(item.tokens) }}
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 justify-between items-start px-6 py-3 border-[var(--gray-2)] border rounded-lg">
        {COLOR_THRESHOLDS.map((threshold) => (
          <div key={threshold.label} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-sm"
              style={{ backgroundColor: threshold.color }}
            />
            <span className="font-small-console text-[var(--dark-3-1)]">
              {threshold.label}
            </span>
          </div>
        ))}
      </div>

      {hoveredData && (
        <div
          className="fixed -translate-x-1/2 -translate-y-full bg-[var(--dark-1)] text-[var(--white)] px-3 py-2 rounded z-[1000] pointer-events-none after:content-[''] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-t-[6px] after:border-t-[var(--dark-1)]"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-small-console text-[var(--gray-1)] mb-1">
            {formatDate(hoveredData.timestamp)}
          </div>
          <div className="font-subtle-medium text-[var(--white)]">
            {formatTokens(hoveredData.tokens)} tokens
          </div>
        </div>
      )}
    </div>
  );
}
