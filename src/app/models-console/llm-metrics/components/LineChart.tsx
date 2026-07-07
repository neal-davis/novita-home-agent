import { AreaChart, LineChart } from "@tremor/react";
import { Ref } from "react";

export default function MetricsLineChart({
  data,
  categories,
  valueFormatter,
  area = true,
  color = ["violet", "cyan", "amber"],
  yAxisWidth = 80,
  chartRef,
  minValue = 0,
  maxValue = undefined,
}: {
  data: any[];
  categories: string[];
  valueFormatter?: (value: number) => string;
  area?: boolean;
  color?: string[];
  yAxisWidth?: number;
  chartRef?: Ref<HTMLDivElement> | undefined;
  minValue?: number;
  maxValue?: number | undefined;
}) {
  return area ? (
    <AreaChart
      ref={chartRef}
      className="h-[300px]"
      data={data}
      index="date"
      categories={categories}
      colors={color}
      valueFormatter={valueFormatter}
      yAxisWidth={yAxisWidth}
      tickGap={12}
      minValue={minValue}
      maxValue={maxValue}
    />
  ) : (
    <LineChart
      ref={chartRef}
      className="h-[300px]"
      data={data}
      index="date"
      categories={categories}
      colors={color}
      valueFormatter={valueFormatter}
      yAxisWidth={yAxisWidth}
      tickGap={12}
      minValue={minValue}
      maxValue={maxValue}
    />
  );
}
