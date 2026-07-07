"use client";
import styles from "./startInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqStartGpuInstance } from "@/api/gpu-instance/instances";
import { dealParamsText } from "@/lib/utils/utils";
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
export default function StartInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [btnLoading, setBtnLoading] = useState(false);
  function startInstance() {
    if (btnLoading) {
      return;
    }
    setBtnLoading(true);
    reqStartGpuInstance(instanceInfo.id)
      .then((res: any) => {
        message.success("success");
        setBtnLoading(false);
        finishForm(true);
      })
      .catch((e: any) => {
        setBtnLoading(false);
        finishForm(false, e.reason);
      });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Start Instance"}</h1>
        <div>
          {instanceInfo.billingMode === "monthly" ? (
            <div className={styles.desc}>{"Start your Instance."}</div>
          ) : (
            <div className={styles.desc}>
              {
                "Start your Instance. If you have a volume configured, it will be retrieved and mounted."
              }
              <br />
              {"The current machine price for"}{" "}
              <span style={{ fontWeight: 700 }}>
                {dealParamsText("${0}x ${1} is $${2}/hr", {
                  0: instanceInfo?.gpuNum || "",
                  1: instanceInfo?.productName || "",
                  2: (
                    Math.round(
                      Number(instanceInfo?.instancePrice || 0) *
                        Number(instanceInfo?.gpuNum || 0),
                    ) / 100000
                  ).toFixed(commonTips.gpuPriceDot),
                })}
              </span>
            </div>
          )}
          <div>
            <Button
              className={styles.startBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_START_INSTANCE}
              onClick={() => startInstance()}
              variant="default"
            >
              <span className={styles.startBtnTxt}>{"Start"}</span>
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
