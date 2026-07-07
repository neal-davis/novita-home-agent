"use client";
import styles from "./stopInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqStopGpuInstance } from "@/api/gpu-instance/instances";
import { sliceUTCString } from "@/lib/utils/date";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
const commonTips = {
  success: "success",
  paginationPreTxt: "Rows per page",
  balanceNotEnough: "Balance is not enough.",
  portLimit: "Please enter valid port, split with [,] port can be 1 to 65535",
  port2000: "Port can not be 2222, 2223, 2224",
  portSame: "Exposed ports cannot be same.",
  httpTcpPortSame: "Exposed http ports and tcp ports cannot be same.",
  httpTcpPortLimit: "Exposed http ports and tcp ports cannot be more than 25.",
  emptyKeyValue: "Key can not be empty",
  loginFailure: "Login failure, please log in again",
  itemIsRequired: "This field is required",
  loginFirst: "Please log in first",
  instanceStatus: {
    Creating: "Creating",
    Created: "Created",
    Starting: "Starting",
    Running: "Running",
    Stopping: "Stopping",
    Exited: "Exited",
    Terminating: "Terminating",
    Terminated: "Terminated",
    creating: "creating",
    toCreate: "toCreate",
    pulling: "pulling",
    running: "running",
    toStart: "toStart",
    starting: "starting",
    migrating: "migrating",
    toStop: "toStop",
    stopping: "stopping",
    exited: "exited",
    toRemove: "toRemove",
    removing: "removing",
    removed: "removed",
    resetting: "resetting",
    toRestart: "toRestart",
    restarting: "restarting",
    other: "other",
  },
  noData: "No Data",
  copyFailed: "Copy failed",
  copySuccess: "Copy success",
  clickCopy: "Click to copy",
  maxHttp10: "The max number of http ports is 10",
  newVoucherTitle: "New Voucher",
  newVoucherTip: "Received a new voucher!",
  newVoucherView: "view",
  invalidImagePath: "The container image is not valid",
  gpuPriceDot: 2,
  storagePriceDot: 3,
};
export default function StopInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [btnLoading, setBtnLoading] = useState(false);
  function stopInstance() {
    if (btnLoading) {
      return;
    }
    setBtnLoading(true);
    reqStopGpuInstance(instanceInfo.id)
      .then((res: any) => {
        message.success("success");
        finishForm(true);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Stop Instance"}</h1>
        <div>
          {instanceInfo.billingMode === "monthly" ? (
            <div className={styles.desc}>
              {"Stop your instance. You can start the instance later."}
            </div>
          ) : (
            <div className={styles.desc}>
              <div>
                {
                  "When the instance is stopped, if another user preempts this node, your instance cannot be restarted normally, but migration to other nodes is supported."
                }
              </div>
              <div>
                {"For suspended instances, data will be retained for"}{" "}
                <span
                  className={styles.tip12}
                >{`${instanceInfo.keepDataDay} days`}</span>{" "}
                {`with storage fees charged at $${(Math.round(Number(instanceInfo?.exitedLocalStoragePrice || 0)) / 100000).toFixed(commonTips.storagePriceDot)}/GB per day.`}
              </div>
              <div>
                <span className={styles.tip12}>
                  {`After ${instanceInfo.keepDataDay} days (${sliceUTCString(new Date(Number(instanceInfo.releaseDataAt) * 1000).toUTCString(), "day")}), instance data will be purged. Please ensure backups are completed!`}
                </span>
              </div>
              <div>{"Are you sure you want to stop your instance?"}</div>
            </div>
          )}
          <div>
            <Button
              className={styles.stopBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_STOP_INSTANCE}
              onClick={() => stopInstance()}
              variant="default"
            >
              <span className={styles.stopBtnTxt}>{"Stop"}</span>
            </Button>
            <Button
              onClick={finishForm}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
