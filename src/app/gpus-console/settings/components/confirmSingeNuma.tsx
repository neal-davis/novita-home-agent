"use client";

import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import styles from "./confirmSingeNuma.module.scss";
import { Button } from "@/components/ui/button";

export default function ConfirmSingeNuma({
  finishForm,
}: {
  singleNuma: any;
  finishForm: any;
}) {
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Modify Single-Numa"}</h1>
        <div>
          <div className={styles.desc}>{"Confirm modify Single-Numa ?"}</div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              className={styles.confirmBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.SETTINGS_CHANGE_SINGLE_NUMA}
              onClick={() => finishForm(true)}
              variant="default"
            >
              <span className={styles.confirmBtnTxt}>{"Confirm"}</span>
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
