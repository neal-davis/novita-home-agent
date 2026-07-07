"use client";
import * as eCharts from "echarts";
import styles from "./style.module.css";
import {
  RefObject,
  createRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { balanceFormat } from "@/lib/utils/money";
import { WindowSizeContext } from "../../../components/ChartContainer/ChartContainer";
import dayjs from "dayjs";
// 获取最佳七天的日期数组
export const getWeekDate = () => {
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    dates.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return dates;
};
export default function ApiCreditUsageChart({
  data = [],
  copy = {},
}: {
  data: Array<{
    taskType: string;
    points: number;
    date: string;
  }>;
  copy: any;
}) {
  const dates = getWeekDate();
  const [chart, setChart] = useState<eCharts.ECharts | null>(null);
  const windowContext = useContext(WindowSizeContext);
  const echartRef: RefObject<any> = createRef();
  const taskTypeMerge = useMemo(() => {
    return data.reduce((acc: string[], curr) => {
      return acc.includes(curr.taskType) ? acc : acc.concat(curr.taskType);
    }, [] as string[]);
  }, [data]);
  const datesReverse = useMemo(() => {
    const d = [...dates];
    d.reverse();
    return d;
  }, [dates]);
  const series = useMemo(() => {
    const seriesData = taskTypeMerge.map((taskType) => {
      return {
        name: taskType,
        type: "bar",
        stack: "taskType",
        data: datesReverse.map((date) => {
          const totalPoints = data
            .filter((item) => item.taskType === taskType && item.date === date)
            .reduce((sum, item) => sum + item.points, 0);
          return balanceFormat(totalPoints);
        }),
      };
    });
    // 添加一个表示所有任务类型合计金额的系列
    const totalSeries = {
      name: "Total",
      type: "bar",
      stack: "total",
      data: datesReverse.map((date) => {
        const totalPoints = data
          .filter((item) => item.date === date)
          .reduce((sum, item) => sum + item.points / 10000, 0);
        return totalPoints === 0 ? 0 : totalPoints.toFixed(4);
      }),
      label: {
        show: true,
        position: "top",
        color: "var(--dark-2)",
      },
      itemStyle: {
        color: "#bbb",
      },
    };
    seriesData.push(totalSeries);
    return seriesData;
  }, [datesReverse, taskTypeMerge, data]);
  useEffect(() => {
    let chart = eCharts.getInstanceByDom(echartRef.current);
    if (!chart) {
      chart = eCharts.init(echartRef.current, "dark");
    }
    setChart(chart);
    // 组合 m*n 的矩阵形式
    const option = {
      legend: {
        selectedMode: false,
        type: "scroll",
      },
      xAxis: {
        type: "category",
        data: datesReverse,
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "var(--gray-3)",
          },
        },
      },
      series: series,
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
  }, [echartRef, data, taskTypeMerge, series, datesReverse]);
  useEffect(() => {
    if (windowContext.width > 0 && chart) {
      chart.resize();
    }
  }, [windowContext.width, chart]);
  return (
    <div className={styles.flex_wrap}>
      <div className={styles.info}>
        <p className={styles.p1}>{"Cost Analysis"}</p>
        <p className={styles.p2}>{"Credit Usage"}</p>
      </div>
      <div className={styles.content} ref={echartRef}></div>
    </div>
  );
}
