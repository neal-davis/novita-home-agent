"use client";
import styles from "./stopInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqRestartGpuInstance } from "@/api/gpu-instance/instances";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function RestartInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [btnLoading, setBtnLoading] = useState(false);
  function restartInstance() {
    if (btnLoading) {
      return;
    }
    setBtnLoading(true);
    reqRestartGpuInstance(instanceInfo.id)
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
        <h1 className={styles.title}>{"Restart Instance"}</h1>
        <div>
          <div className={styles.desc}>
            {
              "You will restart the running instance, please confirm whether to continue?"
            }
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              className={styles.stopBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_RESTART_INSTANCE}
              onClick={() => restartInstance()}
              variant="default"
            >
              <span className={styles.stopBtnTxt}>{"Restart"}</span>
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
