"use client";

import {
  reqSandboxUsage,
  reqSandboxRunningCount,
  reqSandboxStats,
  reqSandboxStorageStats,
  reqSandboxStorageRealTime,
} from "@/api/sandbox";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./page.module.scss";
import * as echarts from "echarts";
import { message } from "@/components/ui/standard/notify";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import SelectTemplate from "./selectTemplate";

function getTimestampByTimezone(date: Date = new Date()) {
  const targetDate = new Date(date.getTime());
  return Math.floor(targetDate.getTime() / 1000);
}

function ChartSkeletonBars({
  className = "",
  rows = 6,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={`flex w-full flex-col justify-between ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-5 w-full rounded-[4px] bg-muted-light animate-pulse"
        />
      ))}
    </div>
  );
}

export default function Section() {
  const [usage, setUsage] = useState<
    Array<{
      cycle: string;
      vcpu: string;
      ram: string;
      amount: string;
    }>
  >([]);
  const vCpuChartRef = useRef<echarts.ECharts | null>(null);
  const ramChartRef = useRef<echarts.ECharts | null>(null);
  const costChartRef = useRef<echarts.ECharts | null>(null);
  const storageChartRef = useRef<echarts.ECharts | null>(null);
  const runningSandboxChartRef = useRef<echarts.ECharts | null>(null);
  const ramEchartRef = useRef<HTMLDivElement>(null);
  const runningSandboxEchartRef = useRef<HTMLDivElement>(null);
  const vCpuEchartRef = useRef<HTMLDivElement>(null);
  const storageEchartRef = useRef<HTMLDivElement>(null);
  const costEchartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sandboxLoading, setSandboxLoading] = useState(true);
  const [costLoading, setCostLoading] = useState(true);
  const [vcpuRam, setVcpuRam] = useState<any>({});
  const [runningSandbox, setRunningSandbox] = useState<any>({});
  const [todayVcpuRam, setTodayVcpuRam] = useState<any>({});

  const [storageLoading, setStorageLoading] = useState(true);
  const [storageData, setStorageData] = useState<any>({});
  const [timeUnitStr, setTimeUnitStr] = useState<string>("GB");

  const [filterOptions, setFilterOptions] = useState<any>({
    cycleType: "Minute",
    startTime: dayjs().utc().startOf("day"),
    endTime: dayjs().utc().startOf("day"),
    templateId: "",
  });

  const [filterStorageOptions, setFilterStorageOptions] = useState<any>({
    cycleType: "Hour",
    startTime: dayjs().utc().startOf("day"),
    endTime: dayjs().utc().startOf("day"),
  });

  const dealSeriesStorageData = useCallback(
    (data: any, type: string, type2?: string) => {
      if (!filterStorageOptions.startTime || !filterStorageOptions.endTime) {
        return data;
      } else {
        const newData = [];
        if (
          !filterStorageOptions.cycleType ||
          filterStorageOptions.cycleType === "Day"
        ) {
          let start = filterStorageOptions.startTime.unix();
          const end = filterStorageOptions.endTime
            .add(1, "day")
            .subtract(1, "second")
            .unix();
          const nowUTC = dayjs().utc().unix();
          while (
            start <= end &&
            (filterStorageOptions.startTime.unix() <= nowUTC && end >= nowUTC
              ? start <= nowUTC
              : true)
          ) {
            if (!type2) {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
              });
            } else {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
                [type2]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type2] || 0,
              });
            }
            start = start + 86400;
            // start = start.add(1, "day");
          }
        } else if (filterStorageOptions.cycleType === "Hour") {
          // let start = dayjs.unix(getTimestampByTimezone(0, filterStorageOptions.startTime.toDate()));
          // const end = dayjs.unix(getTimestampByTimezone(0, filterStorageOptions.endTime.add(1, "day").subtract(1, "second").toDate()));
          let start = filterStorageOptions.startTime.unix();
          const end = filterStorageOptions.endTime
            .add(1, "day")
            .subtract(1, "second")
            .unix();
          // const now = dayjs().utc();
          const nowUTC = dayjs().utc().unix();
          while (
            start <= end &&
            (filterStorageOptions.startTime.unix() <= nowUTC && end >= nowUTC
              ? start <= nowUTC
              : true)
          ) {
            if (!type2) {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:00") ===
                    //   start.format("YYYY-MM-DD HH:00")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
              });
            } else {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:00") ===
                    //   start.format("YYYY-MM-DD HH:00")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
                [type2]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:00") ===
                    //   start.format("YYYY-MM-DD HH:00")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type2] || 0,
              });
            }
            start = start + 3600;
            // start = start.add(1, "hour");
          }
        }
        return newData;
      }
    },
    [
      filterStorageOptions.cycleType,
      filterStorageOptions.endTime,
      filterStorageOptions.startTime,
    ],
  );

  const dealSeriesData = useCallback(
    (data: any, type: string, type2?: string) => {
      if (!filterOptions.startTime || !filterOptions.endTime) {
        return data;
      } else {
        const newData = [];
        if (!filterOptions.cycleType || filterOptions.cycleType === "Day") {
          let start = filterOptions.startTime.unix();
          const end = filterOptions.endTime
            .add(1, "day")
            .subtract(1, "second")
            .unix();
          const nowUTC = dayjs().utc().unix();
          // const tmp1 = start.isAfter(end);
          // const tmp2 = filterOptions.startTime.isAfter(nowUTC);
          // const tmp3 = end.isBefore(nowUTC);
          // const tmp4 = start.isBefore(nowUTC);
          // const tmp5 = start.isSame(nowUTC);
          // console.log(tmp1, tmp2, tmp3, tmp4, tmp5);
          while (
            start <= end &&
            (filterOptions.startTime.unix() <= nowUTC && end >= nowUTC
              ? start <= nowUTC
              : true)
          ) {
            if (!type2) {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
              });
            } else {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
                [type2]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp))
                    //   .utc();
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD") ===
                    //   start.format("YYYY-MM-DD")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type2] || 0,
              });
            }
            start = start + 86400;
            // start = start.add(1, "day");
          }
        } else if (filterOptions.cycleType === "Minute") {
          let start = filterOptions.startTime.unix();
          const end = filterOptions.endTime
            .add(1, "day")
            .subtract(1, "second")
            .unix();
          // const now = dayjs();
          const nowUTC = dayjs().utc().unix();
          while (
            start <= end &&
            (filterOptions.startTime.unix() <= nowUTC && end >= nowUTC
              ? start <= nowUTC
              : true)
          ) {
            if (!type2) {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp));
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:mm") ===
                    //   start.format("YYYY-MM-DD HH:mm")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
              });
            } else {
              newData.push({
                timestamp: start,
                [type]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp));
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:mm") ===
                    //   start.format("YYYY-MM-DD HH:mm")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type] || 0,
                [type2]:
                  data.find((item: any) => {
                    // const itemTimestamp = dayjs
                    //   .unix(Number(item.timestamp));
                    // return (
                    //   itemTimestamp.format("YYYY-MM-DD HH:mm") ===
                    //   start.format("YYYY-MM-DD HH:mm")
                    // );
                    return Number(item.timestamp) === start;
                  })?.[type2] || 0,
              });
            }
            start = start + 60;
            // start = start.add(1, "minute");
          }
        }
        return newData;
      }
    },
    [filterOptions.cycleType, filterOptions.endTime, filterOptions.startTime],
  );

  const [usageFilterOptions, setUsageFilterOptions] = useState<any>({
    templateId: "",
  });

  useEffect(() => {
    setCostLoading(true);
    reqSandboxUsage({ ...usageFilterOptions })
      .then((res) => {
        // setVcpuRam(res.usages || []);
        setUsage(res.usages || []);
      })
      .finally(() => {
        setCostLoading(false);
      });
  }, [usageFilterOptions]);

  // Redraw charts when window size changes
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Use debounce to optimize performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        vCpuChartRef.current?.resize();
        ramChartRef.current?.resize();
        costChartRef.current?.resize();
        runningSandboxChartRef.current?.resize();
        storageChartRef.current?.resize();
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    if (!vCpuEchartRef.current || vcpuRam.length <= 0) return;

    let vCpuChartInstance = echarts.getInstanceByDom(vCpuEchartRef.current);

    if (!vCpuChartInstance) {
      vCpuChartInstance = echarts.init(vCpuEchartRef.current);
    }
    vCpuChartRef.current = vCpuChartInstance;

    const option = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLabel: {
          fontSize: 12,
          color: "#666",
          margin: 8,
          formatter: function (value: string) {
            if (typeof value === "string" && value.includes(" ")) {
              const splitValue = value.split(" ");
              if (splitValue.length > 1) {
                return splitValue[1];
              }
              // return value.replace(" ", "\n");
            }
            return value;
          },
        },
        data: vcpuRam.map((item: any) => {
          return getFormatDate(
            dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
            filterOptions.cycleType,
          );
        }),
      },
      yAxis: {
        type: "value",
      },
      grid: {
        left: "20px",
        right: "35px",
        bottom: "0%",
        top: "12px",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
      },
      series: [
        {
          data: vcpuRam.map((item: any) =>
            Number(
              (Math.round((Number(item.vcpu) / 3600) * 10000) / 10000).toFixed(
                4,
              ),
            ),
          ),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#16B063",
          },
          lineStyle: {
            color: "#16B063",
          },
          // areaStyle: {
          //   color: {
          //     type: "linear",
          //     x: 0,
          //     y: 0,
          //     x2: 0,
          //     y2: 1,
          //     colorStops: [
          //       {
          //         offset: 0,
          //         color: "rgba(22, 176, 99, 0.30)", // 0%
          //       },
          //       {
          //         offset: 1,
          //         color: "rgba(255, 255, 255, 0.30)", // 100%
          //       },
          //     ],
          //     global: false,
          //   },
          // },
        },
      ],
    };

    vCpuChartInstance.setOption(option);

    return () => {
      vCpuChartInstance?.dispose();
      if (vCpuChartRef.current === vCpuChartInstance) {
        vCpuChartRef.current = null;
      }
    };
  }, [filterOptions.cycleType, vcpuRam]);

  useEffect(() => {
    if (!ramEchartRef.current || vcpuRam.length <= 0) return;

    let ramChartInstance = echarts.getInstanceByDom(ramEchartRef.current);

    if (!ramChartInstance) {
      ramChartInstance = echarts.init(ramEchartRef.current);
    }
    ramChartRef.current = ramChartInstance;

    const option = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisLabel: {
          fontSize: 12,
          color: "#666",
          margin: 8,
          formatter: function (value: string) {
            if (typeof value === "string" && value.includes(" ")) {
              const splitValue = value.split(" ");
              if (splitValue.length > 1) {
                return splitValue[1];
              }
              // return value.replace(" ", "\n");
            }
            return value;
          },
        },
        data: vcpuRam.map((item: any) =>
          getFormatDate(
            dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
            filterOptions.cycleType,
          ),
        ),
      },
      yAxis: {
        type: "value",
      },
      grid: {
        left: "20px",
        right: "35px",
        bottom: "0%",
        top: "12px",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
      },
      series: [
        {
          data: vcpuRam.map((item: any) =>
            (
              Math.round((Number(item.ram) / 3600 / 1024) * 10000) / 10000
            ).toFixed(4),
          ),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#16B063",
          },
          lineStyle: {
            color: "#16B063",
          },
          // areaStyle: {
          //   color: {
          //     type: "linear",
          //     x: 0,
          //     y: 0,
          //     x2: 0,
          //     y2: 1,
          //     colorStops: [
          //       {
          //         offset: 0,
          //         color: "rgba(22, 176, 99, 0.30)", // 0%
          //       },
          //       {
          //         offset: 1,
          //         color: "rgba(255, 255, 255, 0.30)", // 100%
          //       },
          //     ],
          //     global: false,
          //   },
          // },
        },
      ],
    };

    ramChartInstance.setOption(option);

    return () => {
      ramChartInstance?.dispose();
      if (ramChartRef.current === ramChartInstance) {
        ramChartRef.current = null;
      }
    };
  }, [filterOptions.cycleType, vcpuRam]);

  useEffect(() => {
    if (!storageEchartRef.current || storageData.length <= 0) return;

    let storageChartInstance = echarts.getInstanceByDom(
      storageEchartRef.current,
    );

    if (!storageChartInstance) {
      storageChartInstance = echarts.init(storageEchartRef.current);
    }
    storageChartRef.current = storageChartInstance;
    const option = {
      axisLabel: {
        fontSize: 12,
        color: "#666",
        margin: 8,
        formatter: function (value: string) {
          if (typeof value === "string" && value.includes(" ")) {
            const splitValue = value.split(" ");
            if (splitValue.length > 1) {
              return splitValue[1];
            }
            // return value.replace(" ", "\n");
          }
          return value;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: storageData.allData.map((item: any) => {
          return getFormatDate(
            dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
            filterStorageOptions.cycleType,
          );
        }),
      },
      yAxis: {
        type: "value",
      },
      grid: {
        left: "20px",
        right: "35px",
        bottom: "0%",
        top: "30px",
        containLabel: true,
      },
      legend: {
        top: "0",
        right: "35px",
      },
      tooltip: {
        trigger: "axis",
      },
      series: [
        {
          data: storageData.allData.map((item: any) =>
            Number(Number(Number(item.storage) / 1024).toFixed(2)),
          ),
          type: "line",
          smooth: true,
          name: "Total Storage",
          itemStyle: {
            color: "#16B063",
          },
          lineStyle: {
            color: "#16B063",
          },
          tooltip: {
            valueFormatter: function (value: any) {
              return value + " " + timeUnitStr;
            },
          },
        },
        {
          data: storageData.templateBuildData.map((item: any) =>
            Number(Number(Number(item.storage) / 1024).toFixed(2)),
          ),
          type: "line",
          smooth: true,
          name: "Template",
          itemStyle: {
            color: "#18BFFF",
          },
          lineStyle: {
            color: "#18BFFF",
          },
          tooltip: {
            valueFormatter: function (value: any) {
              return value + " " + timeUnitStr;
            },
          },
        },
        {
          data: storageData.sandboxSnapshotData.map((item: any) =>
            Number(Number(Number(item.storage) / 1024).toFixed(2)),
          ),
          type: "line",
          smooth: true,
          name: "Paused Sandbox",
          itemStyle: {
            color: "#A78BFA",
          },
          lineStyle: {
            color: "#A78BFA",
          },
          tooltip: {
            valueFormatter: function (value: any) {
              return value + " " + timeUnitStr;
            },
          },
        },
        {
          data: storageData.snapshotTemplateData.map((item: any) =>
            Number(Number(Number(item.storage) / 1024).toFixed(2)),
          ),
          type: "line",
          smooth: true,
          name: "Snapshot",
          itemStyle: {
            color: "#F59E0B",
          },
          lineStyle: {
            color: "#F59E0B",
          },
          tooltip: {
            valueFormatter: function (value: any) {
              return value + " " + timeUnitStr;
            },
          },
        },
      ],
    };

    storageChartInstance.setOption(option);

    return () => {
      storageChartInstance?.dispose();
      if (storageChartRef.current === storageChartInstance) {
        storageChartRef.current = null;
      }
    };
  }, [filterStorageOptions.cycleType, storageData, timeUnitStr]);

  useEffect(() => {
    if (!runningSandboxEchartRef.current || runningSandbox.length <= 0) return;

    let runningSandboxChartInstance = echarts.getInstanceByDom(
      runningSandboxEchartRef.current,
    );

    if (!runningSandboxChartInstance) {
      runningSandboxChartInstance = echarts.init(
        runningSandboxEchartRef.current,
      );
    }
    runningSandboxChartRef.current = runningSandboxChartInstance;

    const option = {
      axisLabel: {
        fontSize: 12,
        color: "#666",
        margin: 8,
        formatter: function (value: string) {
          if (typeof value === "string" && value.includes(" ")) {
            const splitValue = value.split(" ");
            if (splitValue.length > 1) {
              return splitValue[1];
            }
            // return value.replace(" ", "\n");
          }
          return value;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: runningSandbox.map((item: any) =>
          getFormatDate(
            dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
            filterOptions.cycleType,
          ),
        ),
      },
      yAxis: {
        type: "value",
      },
      grid: {
        left: "20px",
        right: "35px",
        bottom: "0%",
        top: "12px",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
      },
      series: [
        {
          data: runningSandbox.map((item: any) => Number(item.runningCount)),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#16B063",
          },
          lineStyle: {
            color: "#16B063",
          },
          // areaStyle: {
          //   color: {
          //     type: "linear",
          //     x: 0,
          //     y: 0,
          //     x2: 0,
          //     y2: 1,
          //     colorStops: [
          //       {
          //         offset: 0,
          //         color: "rgba(22, 176, 99, 0.30)", // 0%
          //       },
          //       {
          //         offset: 1,
          //         color: "rgba(255, 255, 255, 0.30)", // 100%
          //       },
          //     ],
          //     global: false,
          //   },
          // },
        },
      ],
    };

    runningSandboxChartInstance.setOption(option);

    return () => {
      runningSandboxChartInstance?.dispose();
      if (runningSandboxChartRef.current === runningSandboxChartInstance) {
        runningSandboxChartRef.current = null;
      }
    };
  }, [filterOptions.cycleType, runningSandbox]);

  useEffect(() => {
    if (!costEchartRef.current || usage.length <= 0) return;

    let costChartInstance = echarts.getInstanceByDom(costEchartRef.current);

    if (!costChartInstance) {
      costChartInstance = echarts.init(costEchartRef.current);
    }
    costChartRef.current = costChartInstance;

    const option = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: usage.map((item: any) => item.cycle),
      },
      yAxis: {
        type: "value",
      },
      grid: {
        left: "20px",
        right: "35px",
        bottom: "0%",
        top: "12px",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
      },
      series: [
        {
          data: usage.map((item: any) => Number(item.amount || 0) / 10000),
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#16B063",
          },
          lineStyle: {
            color: "#16B063",
          },
          // areaStyle: {
          //   color: {
          //     type: "linear",
          //     x: 0,
          //     y: 0,
          //     x2: 0,
          //     y2: 1,
          //     colorStops: [
          //       {
          //         offset: 0,
          //         color: "rgba(22, 176, 99, 0.30)", // 0%
          //       },
          //       {
          //         offset: 1,
          //         color: "rgba(255, 255, 255, 0.30)", // 100%
          //       },
          //     ],
          //     global: false,
          //   },
          // },
        },
      ],
    };

    costChartInstance.setOption(option);

    return () => {
      costChartInstance?.dispose();
      if (costChartRef.current === costChartInstance) {
        costChartRef.current = null;
      }
    };
  }, [usage]);

  const [storageRealTime, setStorageRealTime] = useState<any>({
    storage: 0,
    freeStorage: 0,
  });

  const [runningSandboxRealTime, setRunningSandboxRealTime] = useState<any>(0);

  useEffect(() => {
    console.log(filterOptions);
    if (!filterOptions.startTime || !filterOptions.endTime) {
      return;
    }
    if (
      !filterOptions.startTime.isAfter(filterOptions.endTime.add(-31, "day"))
    ) {
      message.error(
        "The selected time range is too long for grouping. Please select 1 - 31 days",
      );
      return;
    }
    if (filterOptions.cycleType === "Minute") {
      if (!filterOptions.startTime || !filterOptions.endTime) {
        message.error("Please select a time range");
        return;
      }
      if (
        !filterOptions.startTime.isAfter(filterOptions.endTime.add(-1, "day"))
      ) {
        message.error(
          "The selected time range is too long for minute-level grouping. Please select 1 day",
        );
        return;
      }
    }
    setSandboxLoading(true);
    reqSandboxRunningCount({
      ...filterOptions,
      cycleType: filterOptions.cycleType,
      startTime: getTimestampByTimezone(
        filterOptions.startTime.toDate(),
      ).toString(),
      endTime: getTimestampByTimezone(
        filterOptions.endTime.add(1, "day").subtract(1, "second").toDate(),
      ).toString(),
    })
      .then((res) => {
        console.log(res);
        const runningSandboxData = dealSeriesData(
          res.stats || [],
          "runningCount",
        );
        setRunningSandbox(runningSandboxData);
        const thisMoment = dayjs();
        if (
          runningSandboxData.length > 0 &&
          filterOptions.cycleType === "Minute" &&
          !thisMoment.isBefore(filterOptions.startTime) &&
          !thisMoment.isAfter(
            filterOptions.endTime.add(1, "day").subtract(1, "second"),
          )
        ) {
          setRunningSandboxRealTime(
            runningSandboxData[runningSandboxData.length - 1]?.runningCount ||
              0,
          );
        }
      })
      .finally(() => {
        setSandboxLoading(false);
      });
    setLoading(true);
    reqSandboxStats({
      ...filterOptions,
      cycleType: filterOptions.cycleType,
      startTime: getTimestampByTimezone(
        filterOptions.startTime.toDate(),
      ).toString(),
      endTime: getTimestampByTimezone(
        filterOptions.endTime.add(1, "day").subtract(1, "second").toDate(),
      ).toString(),
    })
      .then((res) => {
        console.log(res);
        setVcpuRam(dealSeriesData(res.stats || [], "vcpu", "ram"));
      })
      .finally(() => {
        setLoading(false);
      });
    reqSandboxStats({
      templateId: filterOptions.templateId,
      cycleType: "Day",
      startTime: getTimestampByTimezone(
        dayjs().utc().startOf("day").toDate(),
      ).toString(),
      endTime: getTimestampByTimezone(
        dayjs()
          .utc()
          .startOf("day")
          .add(1, "day")
          .subtract(1, "second")
          .toDate(),
      ).toString(),
    }).then((res: any) => {
      setTodayVcpuRam(res.stats || []);
    });
  }, [dealSeriesData, filterOptions]);

  useEffect(() => {
    console.log(filterStorageOptions);
    if (!filterStorageOptions.startTime || !filterStorageOptions.endTime) {
      return;
    }
    if (
      !filterStorageOptions.startTime.isAfter(
        filterStorageOptions.endTime.add(-31, "day"),
      )
    ) {
      message.error(
        "The selected time range is too long for grouping. Please select 1 - 31 days",
      );
      return;
    }
    if (filterStorageOptions.cycleType === "Hour") {
      if (!filterStorageOptions.startTime || !filterStorageOptions.endTime) {
        message.error("Please select a time range");
        return;
      }
      if (
        !filterStorageOptions.startTime.isAfter(
          filterStorageOptions.endTime.add(-1, "day"),
        )
      ) {
        message.error(
          "The selected time range is too long for hour-level grouping. Please select 1 day",
        );
        return;
      }
    }
    setStorageLoading(true);
    reqSandboxStorageStats({
      ...filterStorageOptions,
      cycleType: filterStorageOptions.cycleType,
      startTime: getTimestampByTimezone(
        filterStorageOptions.startTime.toDate(),
      ).toString(),
      endTime: getTimestampByTimezone(
        filterStorageOptions.endTime
          .add(1, "day")
          .subtract(1, "second")
          .toDate(),
      ).toString(),
    })
      .then((res: any) => {
        console.log("reqSandboxStorageStats: ", res);
        const resData = res.stats || [];
        if (resData.length > 0) {
          let allData =
            resData.find((item: any) => item.storageType === "")?.infos || [];
          let templateBuildData =
            resData.find((item: any) => item.storageType === "template_build")
              ?.infos || [];
          let sandboxSnapshotData =
            resData.find((item: any) => item.storageType === "sandbox_snapshot")
              ?.infos || [];
          let snapshotTemplateData =
            resData.find(
              (item: any) => item.storageType === "snapshot_template",
            )?.infos || [];

          allData = dealSeriesStorageData(allData, "storage");
          templateBuildData = dealSeriesStorageData(
            templateBuildData,
            "storage",
          );
          sandboxSnapshotData = dealSeriesStorageData(
            sandboxSnapshotData,
            "storage",
          );
          snapshotTemplateData = dealSeriesStorageData(
            snapshotTemplateData,
            "storage",
          );
          const timeUnit =
            filterStorageOptions.cycleType === "Minute" ? 1 : 3600;
          setTimeUnitStr(
            filterStorageOptions.cycleType === "Minute" ? "GB" : "GB·h",
          );
          allData = allData.map((item: any) => {
            return {
              ...item,
              storage: Number(item.storage) / timeUnit,
            };
          });
          templateBuildData = templateBuildData.map((item: any) => {
            return {
              ...item,
              storage: Number(item.storage) / timeUnit,
            };
          });
          sandboxSnapshotData = sandboxSnapshotData.map((item: any) => {
            return {
              ...item,
              storage: Number(item.storage) / timeUnit,
            };
          });
          snapshotTemplateData = snapshotTemplateData.map((item: any) => {
            return {
              ...item,
              storage: Number(item.storage) / timeUnit,
            };
          });
          setStorageData({
            allData,
            templateBuildData,
            sandboxSnapshotData,
            snapshotTemplateData,
          });
        } else {
          setStorageData(res.stats || []);
        }
      })
      .finally(() => {
        setStorageLoading(false);
      });
    reqSandboxStorageRealTime().then((res: any) => {
      console.log("reqSandboxStorageRealTime: ", res);
      setStorageRealTime({
        storage: res?.storage,
        freeStorage: res?.freeStorage,
      });
    });
  }, [dealSeriesStorageData, filterStorageOptions]);

  function getFormatDate(date: dayjs.Dayjs, cycleType: string) {
    if (cycleType === "Minute") {
      return date.format("YYYY-MM-DD HH:mm");
    }
    if (cycleType === "Hour") {
      return date.format("YYYY-MM-DD HH:00");
    }
    return date.format("YYYY-MM-DD");
  }

  function exportGroupStorageData() {
    if (storageLoading) {
      message.warning("Please wait for the data to load");
      return;
    }
    const originData = storageData?.allData?.map((item: any) => {
      return {
        "Date/Time": getFormatDate(
          dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
          filterStorageOptions.cycleType,
        ),
        ["Total Storage (" + timeUnitStr + ")"]: Number(
          Number(
            Number(
              storageData.allData.find(
                (ele: any) => ele.timestamp === item.timestamp,
              )?.storage || 0,
            ) / 1024,
          ).toFixed(2),
        ),
        ["Template (" + timeUnitStr + ")"]: Number(
          Number(
            Number(
              storageData.templateBuildData.find(
                (ele: any) => ele.timestamp === item.timestamp,
              )?.storage || 0,
            ) / 1024,
          ).toFixed(2),
        ),
        ["Paused Sandbox (" + timeUnitStr + ")"]: Number(
          Number(
            Number(
              storageData.sandboxSnapshotData.find(
                (ele: any) => ele.timestamp === item.timestamp,
              )?.storage || 0,
            ) / 1024,
          ).toFixed(2),
        ),
        ["Snapshot (" + timeUnitStr + ")"]: Number(
          Number(
            Number(
              storageData.snapshotTemplateData.find(
                (ele: any) => ele.timestamp === item.timestamp,
              )?.storage || 0,
            ) / 1024,
          ).toFixed(2),
        ),
      };
    });
    if (!originData || !originData.length) {
      message.warning("No Data!");
      return;
    }
    const header = [
      "Date/Time",
      "Total Storage (" + timeUnitStr + ")",
      "Template (" + timeUnitStr + ")",
      "Paused Sandbox (" + timeUnitStr + ")",
      "Snapshot (" + timeUnitStr + ")",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(originData, {
      header: header as string[],
    });

    XLSX.utils.book_append_sheet(wb, ws, "sheetName");
    XLSX.writeFile(wb, `Usage-Storage.xlsx`);
  }

  function exportGroupData() {
    if (loading || sandboxLoading || storageLoading) {
      message.warning("Please wait for the data to load");
      return;
    }
    const originData = vcpuRam.map((item: any) => {
      return {
        "Date/Time": getFormatDate(
          dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
          filterOptions.cycleType,
        ),
        "vCPU Data (hours)": Number(
          (Math.round((Number(item.vcpu) / 3600) * 10000) / 10000).toFixed(4),
        ),
        "RAM Data (GB-hours)": Number(
          (
            Math.round((Number(item.ram) / 3600 / 1024) * 10000) / 10000
          ).toFixed(4),
        ),
        "Running Sandboxes":
          runningSandbox.find((ele: any) => ele.timestamp === item.timestamp)
            ?.runningCount || 0,
      };
    });
    if (!originData || !originData.length) {
      message.warning("No Data!");
      return;
    }
    const header = [
      "Date/Time",
      "vCPU Data (hours)",
      "RAM Data (GB-hours)",
      "Running Sandboxes",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(originData, {
      header: header as string[],
    });

    XLSX.utils.book_append_sheet(wb, ws, "sheetName");
    XLSX.writeFile(wb, `Usage-Group.xlsx`);
  }

  function exportCostData(type: string) {
    if (costLoading) {
      message.warning("Please wait for the data to load");
      return;
    }
    let originData = [];
    let titleUnit = "";
    switch (type) {
      case "vCPU":
        titleUnit = "hours";
        originData = vcpuRam.map((item: any) => {
          return {
            "Date/Time": getFormatDate(
              dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
              filterOptions.cycleType,
            ),
            "Data (hours)": Number(
              (Math.round((Number(item.vcpu) / 3600) * 10000) / 10000).toFixed(
                4,
              ),
            ),
          };
        });
        break;
      case "RAM":
        titleUnit = "GB-hours";
        originData = vcpuRam.map((item: any) => {
          return {
            "Date/Time": getFormatDate(
              dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
              filterOptions.cycleType,
            ),
            "Data (GB-hours)": (
              Math.round((Number(item.ram) / 3600 / 1024) * 10000) / 10000
            ).toFixed(4),
          };
        });
        break;
      case "RunningSandbox":
        originData = runningSandbox.map((item: any) => {
          return {
            "Date/Time": getFormatDate(
              dayjs(new Date(Number(item.timestamp) * 1000)).utc(),
              filterOptions.cycleType,
            ),
            Data: Number(item.runningCount),
          };
        });
        break;
      case "Cost":
        titleUnit = "$";
        originData = usage.map((item: any) => {
          return {
            "Date/Time": item.cycle,
            "Data ($)": Number(item.amount || 0) / 10000,
          };
        });
        break;
    }
    if (!originData || !originData.length) {
      message.warning("No Data!");
      return;
    }
    const header = [
      "Date/Time",
      titleUnit ? "Data (" + titleUnit + ")" : "Data",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(originData, {
      header: header as string[],
    });
    XLSX.utils.book_append_sheet(wb, ws, "sheetName");
    XLSX.writeFile(wb, `Usage-${type}.xlsx`);
  }

  function handleChangeUnCost(templateId: string) {
    console.log(templateId);
    setFilterOptions({
      ...filterOptions,
      templateId,
    });
  }

  function handleChangeCost(templateId: string) {
    setUsageFilterOptions({
      ...usageFilterOptions,
      templateId,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-x-2">
        <div className="flex-1 p-4 flex flex-col gap-y-1 border border-[#E5E6EB] bg-white rounded-[6px]">
          <div className="text-[var(--black)] font-menu-medium">vCPU Hours</div>
          <div className="flex gap-1 items-end">
            <span className="text-[var(--black)] font-h6">
              {Number(
                (
                  Math.round(
                    (Number(todayVcpuRam[todayVcpuRam.length - 1]?.vcpu || 0) /
                      3600) *
                      10000,
                  ) / 10000
                ).toFixed(4),
              )}
            </span>
            <span className="text-[var(--dark-2)] font-subtle">
              hours today
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-y-1 border border-[#E5E6EB] bg-white rounded-[6px]">
          <div className="text-[var(--black)] font-menu-medium">RAM Hours</div>
          <div className="flex gap-1 items-end">
            <span className="text-[var(--black)] font-h6">
              {Number(
                (
                  Math.round(
                    (Number(todayVcpuRam[todayVcpuRam.length - 1]?.ram || 0) /
                      3600 /
                      1024) *
                      10000,
                  ) / 10000
                ).toFixed(4),
              )}
            </span>
            <span className="text-[var(--dark-2)] font-subtle">
              GB-hours today
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-[280px] p-4 flex flex-col gap-y-1 border border-[#E5E6EB] bg-white rounded-[6px]">
          <div className="flex flex-row items-center gap-1">
            <div className="text-[var(--black)] font-menu-medium">
              Storage Capacity
            </div>
            <div
              className="text-[var(--dark-2)] font-small-console"
              style={{
                lineHeight: "14px",
              }}
            >
              {(Number(storageRealTime.freeStorage || 0) / 1024).toFixed(2)}
              <span className="ml-[4px]">GB free quota</span>
            </div>
          </div>
          <div className="flex gap-1 items-end">
            <span className="text-[var(--black)] font-h6">
              {(Number(storageRealTime.storage || 0) / 1024).toFixed(2)}
            </span>
            <span className="text-[var(--dark-2)] font-subtle">
              GB used now
            </span>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-y-1 border border-[#E5E6EB] bg-white rounded-[6px]">
          <div className="text-[var(--black)] font-menu-medium">
            Running Sandboxes
          </div>
          <div className="flex gap-1 items-end">
            <span className="text-[var(--black)] font-h6">
              {runningSandboxRealTime}
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-y-1 border border-[#E5E6EB] bg-white rounded-[6px]">
          <div className="text-[var(--black)] font-menu-medium">
            Usage Costs
          </div>
          <div className="flex gap-1 items-end">
            <span className="text-[var(--black)] font-h6">
              $
              {usage.length > 0
                ? Number(usage[usage.length - 1].amount) / 10000
                : 0}
            </span>
            <span className="text-[var(--dark-2)] font-subtle">today</span>
          </div>
        </div>
      </div>

      <div className="border border-[var(--gray-2)] bg-white border-r-0 rounded-[6px]">
        <div className="flex flex-row items-start justify-between">
          <div className="flex p-4 pb-0 flex-row gap-x-4">
            <div className="">
              <p className={styles.filter_label}>{"Time Range"}</p>
              <DateRangePicker
                style={{ maxWidth: 277, height: 32 }}
                startTime={filterOptions.startTime?.toDate()}
                endTime={filterOptions.endTime?.toDate()}
                onChange={(date) => {
                  setFilterOptions({
                    ...filterOptions,
                    startTime: date?.from ? dayjs(date?.from) : undefined,
                    endTime: date?.to ? dayjs(date?.to) : undefined,
                  });
                  // handleChange({
                  //   startTime: date?.from ? dayjs(date?.from) : undefined,
                  //   endTime: date?.to ? dayjs(date?.to) : undefined,
                  // });
                  // analytics.trackClick(
                  //   CLICK_BTN_IDs.BILLING.BILLING_DETAIL_PICK_DATE,
                  //   {
                  //     startTime: date?.from,
                  //     endTime: date?.to,
                  //   },
                  // );
                }}
              />
            </div>
            <div>
              <p className={styles.filter_label}>{"Group By"}</p>
              <ToggleGroup
                type="single"
                value={filterOptions.cycleType}
                defaultValue="Day"
                className={styles.cycle_toggle_group}
                onValueChange={(newValue: string) => {
                  if (newValue) {
                    setFilterOptions({
                      ...filterOptions,
                      cycleType: newValue,
                    });
                  }
                  // handleChange({ cycleType, currentPage: 1 });
                  //         analytics.trackClick(
                  //           CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SELECTED_TIME_GROUP,
                  //           {
                  //             cycleType,
                  //           },
                  //         );
                }}
                style={{
                  borderColor: "var(--gray-1)",
                }}
              >
                {[
                  { label: "Minute", value: "Minute" },
                  { label: "Day", value: "Day" },
                ].map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    style={{
                      height: 22,
                    }}
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div>
              <p className={styles.filter_label}>Template</p>
              <SelectTemplate
                className={styles.topSelectSearchNew}
                onSelect={(value: any) => {
                  console.log(value);
                  handleChangeUnCost(value?.templateID || "");
                }}
              />
            </div>
          </div>
          <div>
            <Button
              id={CLICK_BTN_IDs.SANDBOX_CONSOLE.EXPORT_VCPU_RAM_SANDBOX}
              onClick={() => {
                exportGroupData();
              }}
              className="mr-[51px] mt-[42px]"
              variant="secondary"
              size="sl"
            >
              <span>{"Export"}</span>
            </Button>
          </div>
        </div>
        <div className="w-full flex flex-row min-h-[292px]">
          <div
            className="w-[50%] p-4"
            style={{
              borderRadius: "6px 0 0 6px",
            }}
          >
            <div className="font-body-medium text-[var(--black)]">
              vCPU Hours
            </div>
            <div className="font-small-console text-[var(--dark-2)]">
              Virtual CPU time consumed by your sandboxes.
            </div>
            {loading ? (
              <ChartSkeletonBars className="h-[220px] py-2" />
            ) : vcpuRam.length <= 0 ? (
              <div className="relative h-[calc(100%-40px)]">
                <img
                  src="/sandbox/console/nodataGraph.png"
                  alt="nodataGraph"
                  className="w-full h-full"
                />
                <span
                  className={`absolute bg-white border border-[var(--gray-2)] opacity-90 rounded-[4px] px-4 py-2 ${styles.noData}
              `}
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  No vCPU usage data found
                </span>
              </div>
            ) : (
              <div className="relative h-[calc(100%-40px)]">
                <div className="my-2">
                  <span className="font-body text-[var(--black)]">
                    {Number(
                      (
                        Math.round(
                          (Number(
                            todayVcpuRam[todayVcpuRam.length - 1]?.vcpu || 0,
                          ) /
                            3600) *
                            10000,
                        ) / 10000
                      ).toFixed(4),
                    )}{" "}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)]">
                    hours today
                  </span>
                </div>
                {!loading && (
                  <div
                    ref={vCpuEchartRef}
                    className="w-full h-[calc(100%-40px)]"
                  />
                )}
              </div>
            )}
          </div>
          <div
            className="w-[50%] border-t-0 border-r-0 border-b-0 border-l-1 border-[var(--gray-2)] bg-white p-4"
            style={{
              borderRadius: "0 6px 6px 0",
            }}
          >
            <div className="font-body-medium text-[var(--black)]">
              RAM Hours
            </div>
            <div className="font-small-console text-[var(--dark-2)]">
              Memory usage duration across all sandboxes.
            </div>
            {loading ? (
              <ChartSkeletonBars className="h-[220px] py-2" />
            ) : vcpuRam.length <= 0 ? (
              <div className="relative h-[calc(100%-40px)]">
                <img
                  src="/sandbox/console/nodataGraph.png"
                  alt="nodataGraph"
                  className="w-full h-full"
                />
                <span
                  className={`absolute bg-white border border-[var(--gray-2)] opacity-90 rounded-[4px] px-4 py-2 ${styles.noData}
              `}
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  No RAM usage data found
                </span>
              </div>
            ) : (
              <div className="relative h-[calc(100%-40px)]">
                <div className="my-2">
                  <span className="font-body text-[var(--black)]">
                    {Number(
                      (
                        Math.round(
                          (Number(
                            todayVcpuRam[todayVcpuRam.length - 1]?.ram || 0,
                          ) /
                            3600 /
                            1024) *
                            10000,
                        ) / 10000
                      ).toFixed(4),
                    )}{" "}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)]">
                    GB-hours today
                  </span>
                </div>
                <div
                  ref={ramEchartRef}
                  className="w-full h-[calc(100%-40px)]"
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-full p-4 pt-1 min-h-[264px]">
          <div className="font-body-medium text-[var(--black)] mb-2">
            Running Sandboxes
          </div>
          {/* <div className="font-small-console text-[var(--dark-2)]">
          </div> */}
          {sandboxLoading ? (
            <ChartSkeletonBars className="h-[220px] py-2" />
          ) : runningSandbox.length <= 0 ? (
            <div className="relative h-[220px] w-full">
              <img
                src="/sandbox/console/nodataGraph.png"
                alt="nodataGraph"
                className="w-full h-full"
              />
              <span
                className={`absolute bg-white border border-[var(--gray-2)] opacity-90 rounded-[4px] px-4 py-2 ${styles.noData}
            `}
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                No running sandboxes data found
              </span>
            </div>
          ) : (
            <div className="min-h-[220px] relative h-full w-full">
              {/* <div className="my-2">
                  <span className="font-body text-[var(--black)]">
                    ${Number(usage[usage.length - 1].amount) / 10000}{" "}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)]">
                    today
                  </span>
                </div> */}
              <div
                ref={runningSandboxEchartRef}
                className="min-h-[220px] w-full h-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border border-[var(--gray-2)] bg-white border-r-0 rounded-[6px]">
        <div className="flex flex-row items-start justify-between">
          <div className="flex p-4 pb-0 flex-row gap-x-4">
            <div className="">
              <p className={styles.filter_label}>{"Time Range"}</p>
              <DateRangePicker
                style={{ maxWidth: 277, height: 32 }}
                startTime={filterStorageOptions.startTime?.toDate()}
                endTime={filterStorageOptions.endTime?.toDate()}
                onChange={(date) => {
                  setFilterStorageOptions({
                    ...filterStorageOptions,
                    startTime: date?.from ? dayjs(date?.from) : undefined,
                    endTime: date?.to ? dayjs(date?.to) : undefined,
                  });
                }}
              />
            </div>
            <div>
              <p className={styles.filter_label}>{"Group By"}</p>
              <ToggleGroup
                type="single"
                value={filterStorageOptions.cycleType}
                defaultValue="Day"
                className={styles.cycle_toggle_group}
                onValueChange={(newValue: string) => {
                  if (newValue) {
                    setFilterStorageOptions({
                      ...filterStorageOptions,
                      cycleType: newValue,
                    });
                  }
                }}
                style={{
                  borderColor: "var(--gray-1)",
                }}
              >
                {[
                  { label: "Hour", value: "Hour" },
                  { label: "Day", value: "Day" },
                ].map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    style={{
                      height: 22,
                    }}
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
          <div>
            <Button
              onClick={() => {
                exportGroupStorageData();
              }}
              className="mr-[51px] mt-[42px]"
              variant="secondary"
              size="sl"
            >
              <span>{"Export"}</span>
            </Button>
          </div>
        </div>
        <div className="w-full p-4 pt-4 min-h-[264px]">
          <div className="font-body-medium text-[var(--black)] mb-2">
            Storage Capacity(GB)
          </div>
          <div className="font-small-console text-[var(--dark-2)]">
            Persistent storage used across all sandboxes. Storage usage cannot
            be filtered by template.
          </div>
          <div className="flex flex-row gap-x-2 items-end mb-[-20px]">
            <span className="font-body text-[var(--black)]">
              {(Number(storageRealTime.storage || 0) / 1024).toFixed(2)}
            </span>
            <span className="font-small-console text-[var(--dark-2)]">
              GB used now,{" "}
            </span>
            <span className="font-body text-[var(--dark-1)]">
              {(Number(storageRealTime.freeStorage || 0) / 1024).toFixed(2)}
            </span>
            <span className="font-small-console text-[var(--dark-2)]">
              GB free quota
            </span>
          </div>
          {storageLoading ? (
            <ChartSkeletonBars className="h-[220px] pb-2 pt-7" />
          ) : storageData.length <= 0 ? (
            <div className="relative h-[220px] w-full">
              <img
                src="/sandbox/console/nodataGraph.png"
                alt="nodataGraph"
                className="w-full h-full"
              />
              <span
                className={`absolute bg-white border border-[var(--gray-2)] opacity-90 rounded-[4px] px-4 py-2 ${styles.noData}
            `}
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                No Storage data found
              </span>
            </div>
          ) : (
            <div className="min-h-[220px] relative h-full w-full">
              <div
                ref={storageEchartRef}
                className="min-h-[220px] w-full h-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="min-h-[318px] w-full border border-[var(--gray-2)] bg-white p-4 rounded-[6px]">
        <div className="flex flex-row items-start justify-between">
          <div>
            <div className="flex pb-4 flex-row gap-x-4">
              <div>
                <p className={styles.filter_label}>Template</p>
                <SelectTemplate
                  className={styles.topSelectSearchNew}
                  onSelect={(value: any) => {
                    console.log(value);
                    handleChangeCost(value?.templateID || "");
                  }}
                />
              </div>
            </div>
            <div className="font-body-medium text-[var(--black)]">
              Usage Costs
            </div>
          </div>
          <div>
            <Button
              id={CLICK_BTN_IDs.SANDBOX_CONSOLE.EXPORT_COST}
              onClick={() => {
                exportCostData("Cost");
              }}
              className="mr-[35px]"
              variant="secondary"
              size="sl"
            >
              <span>{"Export"}</span>
            </Button>
          </div>
        </div>
        {costLoading ? (
          <ChartSkeletonBars className="h-[254px] pb-2 pt-7" />
        ) : usage.length <= 0 ? (
          <div className="relative h-[calc(100%-40px)] w-full">
            <img
              src="/sandbox/console/nodataGraph.png"
              alt="nodataGraph"
              className="w-full h-full"
            />
            <span
              className={`absolute bg-white border border-[var(--gray-2)] opacity-90 rounded-[4px] px-4 py-2 ${styles.noData}
            `}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              No cost data found
            </span>
          </div>
        ) : (
          <div className="min-h-[246px] relative h-[calc(100%-40px)] w-full">
            <div className="my-2">
              <span className="font-body text-[var(--black)]">
                ${Number(usage[usage.length - 1].amount) / 10000}{" "}
              </span>
              <span className="font-small-console text-[var(--dark-2)]">
                today
              </span>
            </div>
            <div
              ref={costEchartRef}
              className="min-h-[210px] h-[210px] w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
