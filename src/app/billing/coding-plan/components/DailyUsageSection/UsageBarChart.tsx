"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { DailyUsage, formatDate, formatTokens } from "../../types";

interface UsageBarChartProps {
  data: DailyUsage[];
}

// Format timestamp to "M/D" for X-axis (UTC)
function formatDateForAxis(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${month}/${day}`;
}

export default function UsageBarChart({ data }: UsageBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    let chartInstance = echarts.getInstanceByDom(chartRef.current);
    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.current);
    }
    setChart(chartInstance);

    const dates = data.map((item) => formatDateForAxis(item.timestamp));
    const tokens = data.map((item) => item.tokens);

    const option: echarts.EChartsOption = {
      animation: false,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "none",
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const item = data[dataIndex];
          const dateStr = formatDate(item.timestamp);
          return `<div style="font-size: 12px; line-height: 1.4;">
            <div style="color: rgba(255,255,255,0.7);">${dateStr}</div>
            <div style="color: #fff;">${formatTokens(item.tokens)} tokens</div>
          </div>`;
        },
        backgroundColor: "#292827",
        borderColor: "#292827",
        padding: [6, 8],
        textStyle: {
          color: "#fff",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#6f6e6b", // dark-3-1
          fontSize: 12,
          interval: Math.floor(data.length / 7),
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          name: "Tokens",
          type: "bar",
          barWidth: 12,
          data: tokens,
          itemStyle: {
            color: "#E8E8E6", // gray-3
            borderRadius: [2, 2, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                { offset: 0, color: "rgba(3, 193, 130, 0.4)" },
                { offset: 1, color: "rgba(3, 193, 130, 1)" },
              ]),
            },
          },
        },
      ],
    };

    chartInstance.setOption(option);

    const handleResize = () => {
      chartInstance?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-full" />;
}
