"use client";
import * as eCharts from "echarts";
import styles from "./style.module.css";
import { RefObject, createRef, useContext, useEffect, useState } from "react";
import { balanceFormat } from "@/lib/utils/money";
import { WindowSizeContext } from "../../../components/ChartContainer/ChartContainer";
export default function APIUsagePieChart({
  data = [],
  copy = {},
}: {
  data: Array<{
    taskType: string;
    points: number;
  }>;
  copy: any;
}) {
  const [chart, setChart] = useState<eCharts.ECharts | null>(null);
  const windowContext = useContext(WindowSizeContext);
  const echartRef: RefObject<any> = createRef();
  useEffect(() => {
    let chart = eCharts.getInstanceByDom(echartRef.current);
    if (!chart) {
      chart = eCharts.init(echartRef.current, "dark");
    }
    setChart(chart);
    const option = {
      series: [
        {
          type: "pie",
          radius: ["35%", "55%"],
          avoidLabelOverlap: false,
          label: {
            color: "var(--dark-2)",
          },
          itemStyle: {
            borderRadius: 8,
            borderWidth: 2,
          },
          align: "left",
          data: data.map((one) => ({
            value: balanceFormat(one.points),
            name: one.taskType,
          })),
        },
      ],
      backgroundColor: "transparent",
      color: [
        "rgb(173,89,96)",
        "rgb(57,104,172)",
        "rgb(98,179,139)",
        "rgb(179,159,102)",
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
        "#3ba272",
        "#fc8452",
        "#9a60b4",
        "#ea7ccc",
      ],
    };
    chart.setOption(option);
  }, [echartRef, data]);
  useEffect(() => {
    if (windowContext.width > 0 && chart) {
      chart.resize();
    }
  }, [windowContext.width, chart]);
  return (
    <div
      className={styles.flex_wrap}
      style={{
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div
        className={styles.info}
        style={{
          width: "100%",
        }}
      >
        <p className={styles.p1}>{"Usage Proportion"}</p>
        <p className={styles.p2}>{"API Works (Past 7 Days)"}</p>
      </div>
      <div
        className={styles.content}
        ref={echartRef}
        style={{
          height: "240px",
        }}
      ></div>
    </div>
  );
}
