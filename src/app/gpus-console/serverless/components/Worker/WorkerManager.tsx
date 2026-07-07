"use client";
import { useCallback, useEffect, useState } from "react";
import { Worker } from "@/api/gpu-instance/serverless";
import styles from "./Worker.module.scss";
import Log from "../../../components/InstanceLog";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { WORKER_STATE } from "@/api/gpu-instance/serverless";
export default function WorkerManager({ workers }: { workers: Worker[] }) {
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(
    workers[0],
  );
  useEffect(() => {
    if (
      selectedWorker?.id &&
      workers?.find((w) => w.id === selectedWorker?.id)
    ) {
      return;
    } else {
      setSelectedWorker(workers[0]);
    }
  }, [selectedWorker?.id, workers]);
  const selectWorker = useCallback(
    (id: string) => {
      setSelectedWorker(workers.find((w) => w.id === id));
    },
    [workers],
  );
  return (
    <div className={styles.worker_manager}>
      <div className={styles.worker_nav}>
        {workers.map((w) => {
          return (
            <Tooltip
              key={w.id}
              title={
                w.state === WORKER_STATE.RUNNING
                  ? w.healthy
                    ? "Click to view Worker Logs"
                    : "Health check failed"
                  : "Click to view Worker Logs"
              }
            >
              <span
                className={
                  styles.worker_nav_item +
                  (selectedWorker?.id === w.id ? " " + styles.selected : "") +
                  (w.state === WORKER_STATE.RUNNING
                    ? w.healthy
                      ? ""
                      : " " + styles.unhealthy
                    : "")
                }
                onClick={() => {
                  selectWorker(w.id);
                }}
              >
                {w.id}
              </span>
            </Tooltip>
          );
        })}
      </div>
      <div className={styles.worker_console_wrapper}>
        <Log
          outHeight={200}
          key={selectedWorker?.id || selectedWorker?.logAddress}
          address={selectedWorker?.logAddress || ""}
        ></Log>
      </div>
    </div>
  );
}
