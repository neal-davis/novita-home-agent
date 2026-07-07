"use client";

import { useMemo, useState, useEffect } from "react";
import { LLM_DE_STATUS } from "../DEModelStatus";
import { getLLMDedicatedEndpointMetrics24h } from "@/api/dedicated-endpoint";

interface KeyMetricsProps {
  status: string;
  endpointId: string;
  onViewAll?: () => void;
}

export default function KeyMetrics({
  status,
  endpointId,
  onViewAll,
}: KeyMetricsProps) {
  const isRunning = status === LLM_DE_STATUS.RUNNING;
  const [isLoading, setIsLoading] = useState(false);
  const [metricsData, setMetricsData] = useState<{
    totalRequests: number;
    avgTtft: number;
  } | null>(null);

  // Fetch 24H metrics data
  useEffect(() => {
    if (!isRunning || !endpointId) {
      setMetricsData(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    getLLMDedicatedEndpointMetrics24h({
      endpointId,
      signal: controller.signal,
    })
      .then((res) => {
        setMetricsData({
          totalRequests: res.totalRequests24h ?? 0,
          avgTtft: res.avgTtft24h ?? 0,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch key metrics:", error);
          setMetricsData(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [isRunning, endpointId]);

  const metrics = useMemo(() => {
    if (!isRunning || !metricsData) {
      return [
        {
          label: "TOTAL REQUESTS",
          value: "--",
          unit: "",
          colorClass: "",
        },
        { label: "AVG TTFT", value: "--", unit: "", colorClass: "" },
      ];
    }
    return [
      {
        label: "TOTAL REQUESTS",
        value: Math.round(metricsData.totalRequests).toLocaleString(),
        unit: "",
        colorClass: "text-[var(--dark-1)]",
      },
      {
        label: "AVG TTFT",
        value: Math.round(metricsData.avgTtft).toString(),
        unit: "ms",
        colorClass: "text-[var(--dark-1)]",
      },
    ];
  }, [isRunning, metricsData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pl-4">
        <div className="flex items-center gap-2">
          <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
            Key Metrics
          </h4>
          <span className="text-[11px] text-[var(--dark-3)]">(24H)</span>
        </div>
        {onViewAll && isRunning && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[12px] text-[var(--brand-0)] hover:text-[var(--brand-1)] underline transition-colors"
          >
            View all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-[6px] border border-[var(--gray-2)] ${!isRunning ? "bg-[var(--gray-4)]" : ""}`}
          >
            <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-2">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-[22px] font-extrabold ${metric.colorClass || "text-[var(--dark-3)]"}`}
              >
                {metric.value}
              </span>
              {metric.unit && (
                <span className="font-subtle text-[var(--dark-3)]">
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
