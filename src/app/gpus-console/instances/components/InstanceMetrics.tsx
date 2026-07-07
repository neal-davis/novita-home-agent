"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MetricBar from "./metricBar";
import { useEffect, useRef, useState, useCallback } from "react";
import { reqMetricsGpuInstance } from "@/api/gpu-instance/instances";
import styles from "./InstanceMetrics.module.scss";

export default function InstanceMetrics({
  id,
  instanceInfo,
}: {
  id: string;
  instanceInfo: any;
}) {
  const [metricLoading, setMetricLoading] = useState(false);
  const [metricTimeStrap, setMetricTimeStrap] = useState(0);

  const [metrics, setMetrics] = useState<any>(null);

  const myTimer = useRef<NodeJS.Timeout | null>(null);

  const [intervalTime, setIntervalTime] = useState(Date.now());

  const refreshMetrics = useCallback(() => {
    setMetricLoading(true);
    setMetricTimeStrap(new Date().getTime());
    reqMetricsGpuInstance({
      instanceId: id,
    })
      .then((res: any) => {
        const metricsTmp: any = {};
        if (res?.cpuUtilization?.length > 0) {
          metricsTmp.cpuUtilizationValue =
            res.cpuUtilization[res.cpuUtilization.length - 1];
        } else {
          metricsTmp.cpuUtilizationValue = {
            timestamp: "",
            value: 0,
          };
        }
        if (res?.memUtilization?.length > 0) {
          metricsTmp.memUtilizationValue =
            res.memUtilization[res.memUtilization.length - 1];
        } else {
          metricsTmp.memUtilizationValue = {
            timestamp: "",
            value: 0,
          };
        }
        if (res?.rootDiskUtilization?.length > 0) {
          metricsTmp.rootDiskUtilizationValue =
            res.rootDiskUtilization[res.rootDiskUtilization.length - 1];
        } else {
          metricsTmp.rootDiskUtilizationValue = {
            timestamp: "",
            value: 0,
          };
        }
        if (res?.gpuMemUtilization?.avg?.length > 0) {
          metricsTmp.gpuMemUtilizationAvgValue =
            res.gpuMemUtilization.avg[res.gpuMemUtilization.avg.length - 1];
          if (res.gpuMemUtilization.gpuIds?.length > 0) {
            metricsTmp.gpuMemUtilizationArrValue = (
              res.gpuMemUtilization.gpuIds || []
            ).map((item: any) => {
              return {
                name: item.gpuId,
                value:
                  item.items.length > 0
                    ? item.items[item.items.length - 1].value
                    : 0,
              };
            });
          } else {
            metricsTmp.gpuMemUtilizationArrValue = [];
          }
        } else {
          metricsTmp.gpuMemUtilizationAvgValue = {
            timestamp: "",
            value: 0,
          };
        }
        if (res?.gpuUtilization?.avg?.length > 0) {
          metricsTmp.gpuUtilizationAvgValue =
            res.gpuUtilization.avg[res.gpuUtilization.avg.length - 1];
          if (res.gpuUtilization.gpuIds?.length > 0) {
            metricsTmp.gpuUtilizationArrValue = (
              res.gpuUtilization.gpuIds || []
            ).map((item: any) => {
              return {
                name: item.gpuId,
                value:
                  item.items.length > 0
                    ? item.items[item.items.length - 1].value
                    : 0,
              };
            });
          } else {
            metricsTmp.gpuUtilizationArrValue = [];
          }
        } else {
          metricsTmp.gpuUtilizationAvgValue = {
            timestamp: "",
            value: 0,
          };
        }
        setMetrics(metricsTmp);
      })
      .catch(() => {
        setMetrics({});
      })
      .finally(() => {
        setMetricLoading(false);
      });
  }, [id]);
  useEffect(() => {
    if (id) {
      refreshMetrics();
    }
  }, [id, refreshMetrics]);

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
    <div>
      <div className="flex items-center gap-2">
        <span className="font-subtle-medium text-[var(--dark-2)]">Metrics</span>
        <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
        <div className="font-small-console flex items-center">
          <span
            className="!text-[var(--brand-1)] mr-1"
            style={{
              width: `${
                Number((intervalTime - metricTimeStrap) / 1000).toFixed(0)
                  .length * 8
              }px`,
            }}
          >
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
              className={`iconfont icon-rotate ${styles.iconRefreshImg} ${metricLoading ? "animate-spin" : ""}`}
            />
          </span>
        </div>
      </div>
      <div className={styles.metricContainer}>
        <div className="mt-6">
          {metricLoading ? (
            <section className="flex flex-col gap-2">
              <Skeleton className="w-full h-[14px]" />
              <Skeleton className="w-full h-[14px]" />
              <Skeleton className="w-full h-[14px]" />
            </section>
          ) : (
            <MetricBar
              className="!min-w-[140px] !text-[var(--dark-1)]"
              descClassName="!min-w-[180px]"
              data={[
                {
                  name: "CPU Utilization",
                  value:
                    (metrics?.cpuUtilizationValue?.value || 0) /
                    (instanceInfo?.cpuNum || 1),
                  desc: `Avg: ${(
                    metrics?.cpuUtilizationValue?.value || 0
                  ).toFixed(2)}% / ${instanceInfo?.cpuNum || 1}`,
                },
                {
                  name: "Mem Utilization",
                  value: metrics?.memUtilizationValue?.value,
                },
                {
                  name: "Container Disk Utilization",
                  value: metrics?.rootDiskUtilizationValue?.value,
                },
              ]}
            />
          )}
        </div>
        <div>
          <div className="font-small-console !text-[var(--dark-1)] mb-1">
            GPU Utilization
          </div>
          {metricLoading ? (
            <Skeleton className="w-full h-[14px]" />
          ) : (
            <MetricBar
              className="!min-w-[30px] !text-[var(--dark-2)]"
              data={[
                {
                  name: "Avg",
                  value: metrics?.gpuUtilizationAvgValue?.value,
                },
                ...(metrics?.gpuUtilizationArrValue || []).map((item: any) => {
                  return {
                    name: item.name,
                    value: item.value,
                    tooltip: "GPU ID",
                  };
                }),
              ]}
            />
          )}
        </div>
        <div>
          <div className="font-small-console !text-[var(--dark-1)] mb-1">
            GPU Memory Used
          </div>
          {metricLoading ? (
            <Skeleton className="w-full h-[14px]" />
          ) : (
            <MetricBar
              className="!min-w-[30px] !text-[var(--dark-2)]"
              data={[
                {
                  name: "Avg",
                  value: metrics?.gpuMemUtilizationAvgValue?.value,
                },
                ...(metrics?.gpuMemUtilizationArrValue || []).map(
                  (item: any) => {
                    return {
                      name: item.name,
                      value: item.value,
                      tooltip: "GPU ID",
                    };
                  },
                ),
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
