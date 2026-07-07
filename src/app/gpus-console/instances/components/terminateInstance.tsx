"use client";
import styles from "./terminateInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqDeleteGpuInstance } from "@/api/gpu-instance/instances";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function TerminateInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [btnLoading, setBtnLoading] = useState(false);
  function terminateInstance() {
    if (btnLoading) {
      return;
    }
    setBtnLoading(true);
    reqDeleteGpuInstance(instanceInfo.id)
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
        <h1 className={styles.title}>{"Terminate Instance"}</h1>
        <div>
          <div className={styles.desc}>
            <span style={{ color: "var(--red-1)" }}>
              {"Delete your instance."}
            </span>
            {
              "This action will remove your pod configuration as well as any non-network volumes and data associated with it."
            }{" "}
            <span style={{ color: "var(--red-1)" }}>
              {"This is irreversible! Do you want to proceed?"}
            </span>
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              className={styles.terminateBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_TERMINATE_INSTANCE}
              onClick={() => terminateInstance()}
              variant="default"
            >
              <span className={styles.terminateBtnTxt}>{"Yes"}</span>
            </Button>
            <Button
              onClick={() => finishForm(false)}
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
