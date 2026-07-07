"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import * as echarts from "echarts";
import { Button } from "@/components/ui/button";
import { LLM_DE_STATUS } from "../DEModelStatus";
import MultiDimensionalTimeRangePicker, {
  TimeRange,
  TIME_RANGE_MS,
} from "./MultiDimensionalTimeRangePicker";
import {
  getLLMDedicatedEndpointMetrics,
  MetricName,
  MetricsDataPoint,
} from "@/api/dedicated-endpoint";

// ============================================================================
// Types
// ============================================================================

interface MetricsTabProps {
  status: string;
  endpointId: string;
}

interface TimeRangeParams {
  startTime: number;
  endTime: number;
  refreshKey: number;
}

type ChartDataPoint = { time: number; value: number };

// ============================================================================
// Constants
// ============================================================================

const CHART_GROUP = "metrics-group";
const SAMPLE_COUNT = 100;

const COLORS = {
  grid: "#F5F5F5",
  axis: "#E7E6E2",
  label: "#9E9C98",
  text: "#292827",
  textMuted: "#6B6966",
  // Series colors
  purple: "#6366F1",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  violet: "#8B5CF6",
} as const;

const METRIC_NAMES = {
  TTFT_P50: "ttft_p50",
  TTFT_P95: "ttft_p95",
  TTFT_P99: "ttft_p99",
  TPOT_P50: "tpot_p50",
  TPOT_P95: "tpot_p95",
  TPOT_P99: "tpot_p99",
  THROUGHPUT_INPUT: "throughput_input",
  THROUGHPUT_OUTPUT: "throughput_output",
  THROUGHPUT_TOTAL: "throughput_total",
  CONCURRENT_REQUESTS: "concurrent_requests",
  REPLICAS_ACTIVE: "replicas_active",
} as const satisfies Record<string, MetricName>;

// ============================================================================
// Chart Configuration Helpers
// ============================================================================

const formatDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
};

const formatAxisLabel = (value: number) => {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
};

const getBaseChartOptions = (
  startTime: number,
  endTime: number,
): echarts.EChartsOption => ({
  grid: { top: 10, right: 16, bottom: 30, left: 50 },
  xAxis: {
    type: "time",
    min: startTime,
    max: endTime,
    z: 1,
    axisLine: { lineStyle: { color: COLORS.axis, width: 1 } },
    axisTick: { show: true, lineStyle: { color: COLORS.axis, width: 1 } },
    axisLabel: {
      color: COLORS.label,
      fontSize: 11,
      formatter: formatAxisLabel,
    },
    splitLine: {
      show: true,
      lineStyle: { color: COLORS.grid, width: 1, type: "solid" },
    },
  },
  yAxis: {
    type: "value",
    z: 1,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: COLORS.label, fontSize: 11 },
    splitLine: { lineStyle: { color: COLORS.grid, width: 1, type: "solid" } },
  },
});

const getTooltipOptions = (
  formatValue: (value: number, seriesName?: string) => string,
): echarts.EChartsOption["tooltip"] => ({
  trigger: "axis",
  axisPointer: {
    type: "line",
    z: 5,
    lineStyle: { color: COLORS.grid, width: 1, type: "solid" },
  },
  formatter: (params: any) => {
    if (!params || params.length === 0) return "";
    const date = new Date(params[0].data[0]);
    let content = `<div style="color: ${COLORS.textMuted}; font-size: 12px; margin-bottom: 4px;">${formatDateTime(date)} (UTC+0)</div>`;
    params.forEach((item: any) => {
      content += `<div style="font-size: 13px;"><span style="color: ${item.color};">${item.seriesName}</span> <span style="color: ${COLORS.text};">${formatValue(item.data[1], item.seriesName)}</span></div>`;
    });
    return content;
  },
  backgroundColor: "white",
  borderColor: COLORS.axis,
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: COLORS.text },
});

const createLineSeries = (
  name: string,
  color: string,
  data: ChartDataPoint[],
  options?: { areaStyle?: boolean },
): echarts.SeriesOption => ({
  name,
  type: "line",
  smooth: true,
  showSymbol: false,
  z: 10,
  lineStyle: { color, width: 1 },
  emphasis: { disabled: true },
  ...(options?.areaStyle && {
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: `${color}20` },
        { offset: 1, color: `${color}00` },
      ]),
    },
  }),
  data: data.map((d) => [d.time, d.value]),
});

// ============================================================================
// Data Processing Utilities
// ============================================================================

const convertToChartData = (
  dataPoints: MetricsDataPoint[],
): ChartDataPoint[] => {
  return dataPoints.map((d) => ({
    time: d.timestamp * 1000,
    value: d.value,
  }));
};

const findNearestDataPoint = (
  sortedData: ChartDataPoint[],
  targetTime: number,
  threshold: number,
): ChartDataPoint | null => {
  if (sortedData.length === 0) return null;

  let left = 0;
  let right = sortedData.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedData[mid].time < targetTime) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  const candidates = [sortedData[left]];
  if (left > 0) candidates.push(sortedData[left - 1]);

  let nearest: ChartDataPoint | null = null;
  let minDiff = Infinity;

  for (const point of candidates) {
    const diff = Math.abs(point.time - targetTime);
    if (diff < minDiff && diff <= threshold) {
      minDiff = diff;
      nearest = point;
    }
  }

  return nearest;
};

const resampleData = (
  data: ChartDataPoint[],
  startTime: number,
  endTime: number,
): ChartDataPoint[] => {
  const interval = (endTime - startTime) / (SAMPLE_COUNT - 1);

  if (data.length === 0) {
    return Array.from({ length: SAMPLE_COUNT }, (_, i) => ({
      time: startTime + interval * i,
      value: 0,
    }));
  }

  const sortedData = [...data].sort((a, b) => a.time - b.time);
  const result: ChartDataPoint[] = new Array(SAMPLE_COUNT);

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const targetTime = startTime + interval * i;
    const nearestPoint = findNearestDataPoint(sortedData, targetTime, interval);
    result[i] = { time: targetTime, value: nearestPoint?.value ?? 0 };
  }

  return result;
};

// ============================================================================
// Hooks
// ============================================================================

function useMetricsData(
  endpointId: string,
  metricName: MetricName,
  { startTime, endTime, refreshKey }: TimeRangeParams,
  isRunning: boolean,
) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    getLLMDedicatedEndpointMetrics({
      endpointId,
      metricName,
      startTime: Math.floor(startTime / 1000).toString(),
      endTime: Math.floor(endTime / 1000).toString(),
      signal: controller.signal,
    })
      .then((response) => {
        const rawData = convertToChartData(response.dataPoints || []);
        setData(resampleData(rawData, startTime, endTime));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(`Failed to fetch ${metricName} metrics:`, error);
          setData(resampleData([], startTime, endTime));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [endpointId, metricName, startTime, endTime, refreshKey, isRunning]);

  return { data, isLoading };
}

function useEchartsInstance(
  chartRef: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList,
  buildOptions: (base: echarts.EChartsOption) => echarts.EChartsOption,
  startTime: number,
  endTime: number,
) {
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
      chartInstance.current.group = CHART_GROUP;
    }

    const baseOptions = getBaseChartOptions(startTime, endTime);
    chartInstance.current.setOption(buildOptions(baseOptions));

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ============================================================================
// UI Components
// ============================================================================

function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-4">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1">
          <span className="w-3 h-[2px]" style={{ backgroundColor: color }} />
          <span className="font-small text-[var(--dark-2)]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
      <span className="iconfont icon-rotate text-[16px] animate-spin text-[var(--dark-3)]" />
    </div>
  );
}

function ChartContainer({
  title,
  unit,
  legend,
  isLoading,
  streamingOnly,
  children,
}: {
  title: string;
  unit: string;
  legend?: { color: string; label: string }[];
  isLoading: boolean;
  streamingOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-[6px] border border-[var(--gray-2)] relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-subtle font-medium text-[var(--dark-1)]">
            {title}
            <span className="font-small text-[var(--dark-3)] ml-1">
              ({unit})
            </span>
          </h4>
          {streamingOnly && (
            <span className="text-[11px] text-[var(--dark-3)] bg-[var(--gray-3)] px-1.5 py-0.5 rounded">
              streaming only
            </span>
          )}
        </div>
        {legend && <ChartLegend items={legend} />}
      </div>
      {children}
      <ChartLoadingOverlay isLoading={isLoading} />
    </div>
  );
}

// ============================================================================
// Chart Components
// ============================================================================

function SingleMetricChart({
  title,
  unit,
  data,
  color,
  isLoading,
  startTime,
  endTime,
  isInteger,
}: {
  title: string;
  unit: string;
  data: ChartDataPoint[];
  color: string;
  isLoading: boolean;
  startTime: number;
  endTime: number;
  isInteger?: boolean;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEchartsInstance(
    chartRef,
    [data, title, unit, color, startTime, endTime, isInteger],
    (base) => ({
      ...base,
      ...(isInteger && {
        yAxis: {
          ...(base.yAxis as object),
          minInterval: 1,
        },
      }),
      tooltip: getTooltipOptions((v) =>
        isInteger ? `${Math.round(v)} ${unit}` : `${v.toFixed(2)} ${unit}`,
      ),
      series: [createLineSeries(title, color, data, { areaStyle: true })],
    }),
    startTime,
    endTime,
  );

  return (
    <ChartContainer title={title} unit={unit} isLoading={isLoading}>
      <div ref={chartRef} className="h-[200px]" />
    </ChartContainer>
  );
}

function PercentileChart({
  title,
  unit,
  endpointId,
  isRunning,
  timeRange,
  metricP50,
  metricP95,
  metricP99,
  streamingOnly,
}: {
  title: string;
  unit: string;
  endpointId: string;
  isRunning: boolean;
  timeRange: TimeRangeParams;
  metricP50: MetricName;
  metricP95: MetricName;
  metricP99: MetricName;
  streamingOnly?: boolean;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: p50Data, isLoading: p50Loading } = useMetricsData(
    endpointId,
    metricP50,
    timeRange,
    isRunning,
  );
  const { data: p95Data, isLoading: p95Loading } = useMetricsData(
    endpointId,
    metricP95,
    timeRange,
    isRunning,
  );
  const { data: p99Data, isLoading: p99Loading } = useMetricsData(
    endpointId,
    metricP99,
    timeRange,
    isRunning,
  );

  const isLoading = p50Loading || p95Loading || p99Loading;

  useEchartsInstance(
    chartRef,
    [p50Data, p95Data, p99Data, unit, timeRange.startTime, timeRange.endTime],
    (base) => ({
      ...base,
      tooltip: getTooltipOptions((v) => `${v.toFixed(2)} ${unit}`),
      series: [
        createLineSeries("P50", COLORS.purple, p50Data),
        createLineSeries("P95", COLORS.amber, p95Data),
        createLineSeries("P99", COLORS.red, p99Data),
      ],
    }),
    timeRange.startTime,
    timeRange.endTime,
  );

  return (
    <ChartContainer
      title={title}
      unit={unit}
      isLoading={isLoading}
      streamingOnly={streamingOnly}
      legend={[
        { color: COLORS.purple, label: "P50" },
        { color: COLORS.amber, label: "P95" },
        { color: COLORS.red, label: "P99" },
      ]}
    >
      <div ref={chartRef} className="h-[200px]" />
    </ChartContainer>
  );
}

function ProcessedTokensChart({
  endpointId,
  isRunning,
  timeRange,
}: {
  endpointId: string;
  isRunning: boolean;
  timeRange: TimeRangeParams;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: inputData, isLoading: inputLoading } = useMetricsData(
    endpointId,
    METRIC_NAMES.THROUGHPUT_INPUT,
    timeRange,
    isRunning,
  );
  const { data: outputData, isLoading: outputLoading } = useMetricsData(
    endpointId,
    METRIC_NAMES.THROUGHPUT_OUTPUT,
    timeRange,
    isRunning,
  );
  const { data: totalData, isLoading: totalLoading } = useMetricsData(
    endpointId,
    METRIC_NAMES.THROUGHPUT_TOTAL,
    timeRange,
    isRunning,
  );

  const isLoading = inputLoading || outputLoading || totalLoading;

  useEchartsInstance(
    chartRef,
    [inputData, outputData, totalData, timeRange.startTime, timeRange.endTime],
    (base) => ({
      ...base,
      grid: { top: 10, right: 16, bottom: 30, left: 60 },
      tooltip: getTooltipOptions((v) => `${v.toFixed(2)} tokens/s`),
      series: [
        createLineSeries("Input", COLORS.purple, inputData),
        createLineSeries("Output", COLORS.green, outputData),
        createLineSeries("Total", COLORS.amber, totalData),
      ],
    }),
    timeRange.startTime,
    timeRange.endTime,
  );

  return (
    <ChartContainer
      title="Processed Tokens"
      unit="tokens/s"
      isLoading={isLoading}
      legend={[
        { color: COLORS.purple, label: "Input" },
        { color: COLORS.green, label: "Output" },
        { color: COLORS.amber, label: "Total" },
      ]}
    >
      <div ref={chartRef} className="h-[200px]" />
    </ChartContainer>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MetricsTab({ status, endpointId }: MetricsTabProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    type: "preset",
    value: "5m",
    label: "Last 5 minutes",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRunning = status === LLM_DE_STATUS.RUNNING;

  useEffect(() => {
    echarts.connect(CHART_GROUP);
  }, []);

  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const timeRangeParams = useMemo((): TimeRangeParams => {
    const now = Date.now();
    if (timeRange.type === "preset") {
      const duration = TIME_RANGE_MS[timeRange.value] || TIME_RANGE_MS["24h"];
      return { startTime: now - duration, endTime: now, refreshKey };
    }
    if (timeRange.startTime && timeRange.endTime) {
      return {
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
        refreshKey,
      };
    }
    return { startTime: now - TIME_RANGE_MS["24h"], endTime: now, refreshKey };
  }, [timeRange, refreshKey]);

  const { data: concurrentData, isLoading: concurrentLoading } = useMetricsData(
    endpointId,
    METRIC_NAMES.CONCURRENT_REQUESTS,
    timeRangeParams,
    isRunning,
  );

  const { data: replicasData, isLoading: replicasLoading } = useMetricsData(
    endpointId,
    METRIC_NAMES.REPLICAS_ACTIVE,
    timeRangeParams,
    isRunning,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MultiDimensionalTimeRangePicker
          value={timeRange}
          onChange={handleTimeRangeChange}
        />
        <span className="text-[11px] text-[var(--dark-3)]">UTC+0</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-[var(--gray-3)] text-[var(--dark-3)] hover:text-[var(--dark-1)]"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <span
            className={`iconfont icon-rotate text-[16px] ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <PercentileChart
        title="TTFT (Time to First Token)"
        unit="ms"
        endpointId={endpointId}
        isRunning={isRunning}
        timeRange={timeRangeParams}
        metricP50={METRIC_NAMES.TTFT_P50}
        metricP95={METRIC_NAMES.TTFT_P95}
        metricP99={METRIC_NAMES.TTFT_P99}
        streamingOnly
      />

      <PercentileChart
        title="TPOT (Time Per Output Token)"
        unit="ms"
        endpointId={endpointId}
        isRunning={isRunning}
        timeRange={timeRangeParams}
        metricP50={METRIC_NAMES.TPOT_P50}
        metricP95={METRIC_NAMES.TPOT_P95}
        metricP99={METRIC_NAMES.TPOT_P99}
        streamingOnly
      />

      <ProcessedTokensChart
        endpointId={endpointId}
        isRunning={isRunning}
        timeRange={timeRangeParams}
      />

      <SingleMetricChart
        title="Concurrent Requests"
        unit="requests"
        data={concurrentData}
        color={COLORS.amber}
        isLoading={concurrentLoading}
        startTime={timeRangeParams.startTime}
        endTime={timeRangeParams.endTime}
        isInteger
      />

      <SingleMetricChart
        title="Replicas (Active)"
        unit="replicas"
        data={replicasData}
        color={COLORS.violet}
        isLoading={replicasLoading}
        startTime={timeRangeParams.startTime}
        endTime={timeRangeParams.endTime}
        isInteger
      />
    </div>
  );
}
