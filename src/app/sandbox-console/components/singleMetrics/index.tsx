"use client";

import { reqSandboxMetrics } from "@/api/sandbox";
import { useEffect, useRef, useState, useCallback } from "react";
import { LineChart } from "@tremor/react";
import dayjs from "dayjs";
import React from "react";
import styles from "./index.module.scss";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const useOnWindowResize = (handler: () => void) => {
  React.useEffect(() => {
    const handleResize = () => {
      handler();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [handler]);
};

export default function SingleMetrics({
  state,
  sandboxID,
  colCount,
}: {
  state: string;
  sandboxID: string;
  colCount: number;
}) {
  const [metrics, setMetrics] = useState<any>(null);
  const [dataList, setDataList] = useState<any[]>([]);
  const chartLeftRef = useRef<HTMLDivElement>(null);
  const chartRightRef = useRef<HTMLDivElement>(null);
  const [yAxisWidth, setYAxisWidth] = useState(56);

  useOnWindowResize(() => {
    console.log("resize");
  });

  const refreshMetrics = useCallback(() => {
    setIsLoading(true);
    reqSandboxMetrics({ sandboxId: sandboxID })
      .then((res) => {
        setMetrics(res);
        const dataListTmp: any[] = [];
        res.items.forEach((item: any) => {
          const itemTimestamp = dayjs.unix(Number(item.timestamp));
          dataListTmp.push({
            ...item,
            cpuUtilization: item.cpuUtilization,
            "CPU Utilization": item.cpuUtilization,
            "Total Memory": item.memTotalMB,
            "Used Memory": item.memUsedMB,
            timestamp: itemTimestamp.format("YYYY-MM-DD HH:mm:ss"),
          });
        });
        setDataList(dataListTmp);
      })
      .finally(() => {
        setMetricTimeStrap(new Date().getTime());
        setIsLoading(false);
      });
  }, [sandboxID]);
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics, sandboxID]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const resetYAxisWidth = () => {
      setTimeout(() => {
        if (chartLeftRef.current && dataList.length > 0) {
          try {
            const yAxis =
              chartLeftRef.current.querySelector("g.recharts-yAxis");
            if (yAxis && yAxis instanceof SVGGraphicsElement) {
              const bbox = (yAxis as SVGGraphicsElement)?.getBBox();
              if (bbox && bbox.width) {
                setYAxisWidth(Math.ceil(bbox.width) + 15);
                console.log("yAxis width set to:", Math.ceil(bbox.width) + 15);
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
  }, [dataList]);

  const [metricTimeStrap, setMetricTimeStrap] = useState(-1);
  const myTimer = useRef<NodeJS.Timeout | null>(null);
  const [intervalTime, setIntervalTime] = useState(Date.now());

  useEffect(() => {
    myTimer.current = setInterval(() => {
      setIntervalTime(Date.now());
    }, 1000);
    return () => {
      if (myTimer.current) {
        clearInterval(myTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      intervalTime > 0 &&
      metricTimeStrap > 0 &&
      (intervalTime - metricTimeStrap) / 1000 >= 60
    ) {
      refreshMetrics();
    }
  }, [metricTimeStrap, intervalTime, refreshMetrics]);

  return (
    <tr>
      <td
        colSpan={colCount}
        className="w-full p-4"
        style={{
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-subtle-medium text-[var(--dark-2)]">
            Metrics
          </span>
          <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
          <div className="font-small-console flex items-center">
            <span className="!text-[var(--brand-1)] mr-1 min-w-[16px] inline-flex justify-center">
              {metricTimeStrap > 0 &&
              intervalTime > 0 &&
              intervalTime - metricTimeStrap >= 0
                ? Number((intervalTime - metricTimeStrap) / 1000).toFixed(0)
                : "/"}
            </span>
            <span className="!text-[var(--dark-1)] mr-1">Seconds ago</span>
            <span
              onClick={() => {
                refreshMetrics();
              }}
              className={styles.refreshMetricsBtn}
            >
              <span
                className={`${isLoading ? "animate-spin" : ""} iconfont icon-rotate ${styles.iconRefreshImg}`}
              />
            </span>
            {state === "paused" && (
              <span className={styles.helpMetricsBtn}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`iconfont icon-badge-alert ${styles.iconRefreshImg}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        Supports querying data from the 72 hours before the
                        Pause.
                      </div>
                      <div>
                        If there are multiple Pauses, only the data query
                        before{" "}
                      </div>
                      <div>the most recent Pause is displayed.</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            )}
          </div>
        </div>
        <div className="w-full"></div>
        <div className="w-full min-h-[200px] flex flex-row gap-[48px]">
          <div className="w-full">
            <div className="mb-[-4px]">
              <span className="font-small-console !text-[var(--dark-2)] mr-[12px] inline-block">
                Peak CPU Utilization:{" "}
                {Number(metrics?.cpuUtilizationMax || 0).toFixed(2)} %
              </span>
              <span className="font-small-console !text-[var(--dark-2)] w-[200px] inline-block">
                Average CPU Utilization:{" "}
                {Number(metrics?.cpuUtilizationAvg || 0).toFixed(2)} %
              </span>
            </div>
            <LineChart
              ref={chartLeftRef}
              yAxisWidth={yAxisWidth}
              tickGap={8}
              data={dataList || []}
              categories={["CPU Utilization"]}
              index="timestamp"
              colors={["blue"]}
              className={`h-[300px] w-full max-w-none ${styles.chart}`}
              valueFormatter={(value) => {
                return value + "%";
              }}
            />
          </div>
          <div className="w-full">
            <div className="mb-[-4px]">
              <span className="font-small-console !text-[var(--dark-2)] mr-[12px] inline-block">
                Memory Utilization Max: {metrics?.memUsedMBMax} MB
              </span>
              <span className="font-small-console !text-[var(--dark-2)] w-[200px] inline-block">
                Memory Utilization Avg: {metrics?.memUsedMBAvg} MB
              </span>
            </div>
            <LineChart
              ref={chartRightRef}
              tickGap={8}
              yAxisWidth={yAxisWidth + 20}
              data={dataList || []}
              categories={["Total Memory", "Used Memory"]}
              index="timestamp"
              colors={["blue", "green"]}
              className={`h-[300px] w-full max-w-none ${styles.chart}`}
              valueFormatter={(value) => {
                return value + "MB";
              }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}
