"use client";
import * as eCharts from "echarts";
import styles from "./style.module.css";
import { RefObject, createRef, useContext, useEffect, useState } from "react";
import { balanceFormat } from "@/lib/utils/money";
import { WindowSizeContext } from "../../../components/ChartContainer/ChartContainer";
export default function APIUsageChart({
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
      legend: {
        selectedMode: false,
      },
      xAxis: {
        type: "category",
        data: data.map((one) => one.taskType),
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "var(--gray-3)",
          },
        },
      },
      series: [
        {
          data: data.map((one) => balanceFormat(one.points)),
          type: "bar",
          barMaxWidth: 40,
          label: {
            show: true,
            position: "top",
            color: "var(--dark-2)",
          },
          colorBy: "data",
        },
      ],
      backgroundColor: "transparent",
      color: [
        "#A263F2",
        "#6359E9",
        "#63ADF2",
        "#63F2D0",
        "#F29F63",
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
    <div className={styles.flex_wrap}>
      <div className={styles.info}>
        <p className={styles.p1}>{"Recent Outcome Review"}</p>
        <p className={styles.p2}>{"Top 10 AI API Works (Past 7 Days)"}</p>
      </div>
      <div className={styles.content} ref={echartRef}></div>
      <div className={styles.link}>
        <a href="/model-api/playground">
          {"Go to the"} <span>playground</span>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="6"
              height="10"
              viewBox="0 0 6 10"
              fill="none"
            >
              <path
                d="M1 9L5 5L1 1"
                stroke="#A69FFF"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
