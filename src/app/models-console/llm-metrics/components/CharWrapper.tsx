"use client";

import { MetricsType } from "./types";
import MetricsLineChart from "./LineChart";
// import { Skeleton } from "@/components/ui/skeleton";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Chat.module.scss";
import dayjs from "dayjs";
import EventEmitter from "../EventEmitter";
import { Metrics_Event } from "./types";
import { DateRange } from "react-day-picker";
type MetricsSingleResponse = {
  metricsType: MetricsType;
  data: {
    date: number; // unix timestamp
    value: number;
  }[];
  model?: string;
};

type Color =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export default function MetricsChartWrapper({
  fetchMetrics,
  title,
  color,
  range,
  valueFormatter,
  minValue,
  maxValue,
}: {
  refresh?: number;
  fetchMetrics: ({
    signal,
    model,
  }: {
    signal?: AbortSignal;
    model?: string;
  }) => Promise<MetricsSingleResponse | Array<MetricsSingleResponse>>;
  title: string | ReactNode;
  color?: Color[];
  model?: string;
  range?: DateRange;
  valueFormatter?: (value: number) => string;
  minValue?: (data: any[]) => number;
  maxValue?: (data: any[]) => number;
}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [yAxisWidth, setYAxisWidth] = useState(56);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchWaitPreviousRef = useRef<boolean>(false);

  const dateFormat = useMemo(() => {
    if (!range || !range.from || !range.to) return "MM/DD HH:mm";
    let isOverOneDay = false;

    const diffInDays = dayjs(range.to).diff(dayjs(range.from), "day");
    switch (diffInDays) {
      case 1:
        isOverOneDay = true;
        break;
      case 7:
        isOverOneDay = true;
        break;
      case 14:
        isOverOneDay = true;
        break;
      default:
        isOverOneDay = false;
    }
    return isOverOneDay ? "MM/DD HH:mm" : "HH:mm";
  }, [range]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((data) =>
            Object.keys(data).filter(
              (item) => item !== "date" && item !== "value",
            ),
          )
          .flat(),
      ),
    );
  }, [data]);

  /**
   * it may return an array of metrics or a single metrics
   * @param res
   */
  const handleResponse = useCallback(
    (res: any | any[]) => {
      if (Array.isArray(res)) {
        if (res.length > 0) {
          const data = res.reduce((pre: any[], cur: any) => {
            const { data, metricsType } = cur;
            if (Array.isArray(data) && metricsType) {
              data.forEach((d) => {
                const index = pre.findIndex((p) => p.date === d.date);
                if (index !== -1) {
                  pre[index][metricsType] = d.value;
                } else {
                  pre.push({
                    date: d.date,
                    [metricsType]: d.value,
                  });
                }
              });
            }
            return pre;
          }, [] as any[]);
          setData(
            data.map((d) => ({
              ...d,
              date: dayjs.unix(d.date).utc().format(dateFormat),
            })),
          );
        }
      } else {
        if (Array.isArray(res.data) && res.metricsType) {
          setData(
            res.data.map((d: any) => ({
              ...d,
              date: dayjs.unix(d.date).utc().format(dateFormat),
              [res.metricsType]: d.value,
            })),
          );
        }
      }
    },
    [dateFormat],
  );

  const cancelFetch = useCallback(() => {
    abortControllerRef.current?.abort();
    fetchWaitPreviousRef.current = false;
    setIsLoading(false);
  }, []);

  const fetchWithAbort = useCallback(
    async ({ model }: { model?: string }) => {
      if (!model) return;
      // abort the previous request
      abortControllerRef.current?.abort();
      // create a new abort controller
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      try {
        const res = await fetchMetrics({
          signal: abortControllerRef.current.signal,
          model,
        });
        handleResponse(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleResponse, fetchMetrics],
  );

  const fetchWaitPrevious = useCallback(
    async ({ model }: { model?: string }) => {
      if (isLoading || fetchWaitPreviousRef.current) return;
      fetchWaitPreviousRef.current = true;
      await fetchWithAbort({ model });
      fetchWaitPreviousRef.current = false;
    },
    [isLoading, fetchWithAbort],
  );

  const clearData = useCallback(() => {
    cancelFetch();
    setData([]);
  }, [cancelFetch]);

  // warning: this is a workaround to get the yAxis width
  useEffect(() => {
    const resetYAxisWidth = () => {
      setTimeout(() => {
        if (chartRef.current && data.length > 0) {
          try {
            const yAxis = chartRef.current.querySelector("g.recharts-yAxis");
            if (yAxis && yAxis instanceof SVGGraphicsElement) {
              const bbox = (yAxis as SVGGraphicsElement)?.getBBox();
              if (bbox && bbox.width) {
                setYAxisWidth(Math.ceil(bbox.width) + 10);
                console.log("yAxis width set to:", Math.ceil(bbox.width) + 10);
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      }, 100);
    };
    resetYAxisWidth();
    window.addEventListener("resize", resetYAxisWidth);
    return () => {
      window.removeEventListener("resize", resetYAxisWidth);
    };
  }, [data]);

  useEffect(() => {
    EventEmitter.on(Metrics_Event.Fetch_With_Abort, fetchWithAbort);
    EventEmitter.on(Metrics_Event.Fetch_Wait_Previous, fetchWaitPrevious);
    EventEmitter.on(Metrics_Event.Clear, clearData);
    EventEmitter.on(Metrics_Event.Cancel, cancelFetch);
    return () => {
      EventEmitter.off(Metrics_Event.Fetch_With_Abort, fetchWithAbort);
      EventEmitter.off(Metrics_Event.Fetch_Wait_Previous, fetchWaitPrevious);
      EventEmitter.off(Metrics_Event.Clear, clearData);
      EventEmitter.off(Metrics_Event.Cancel, cancelFetch);
    };
  }, [fetchWithAbort, fetchWaitPrevious, clearData, cancelFetch]);

  return (
    <div className={`console-card ${styles.chat_wrapper}`}>
      <div className={styles.loading_bar}>
        {isLoading && (
          <div className="overflow-hidden">
            <div className={styles.bar}></div>
          </div>
        )}
      </div>
      <div className={styles.title}>{title}</div>
      <MetricsLineChart
        chartRef={chartRef}
        data={data}
        categories={categories}
        color={color}
        valueFormatter={valueFormatter}
        yAxisWidth={yAxisWidth}
        minValue={minValue ? minValue(data) : undefined}
        maxValue={maxValue ? maxValue(data) : undefined}
      />
    </div>
  );
}
