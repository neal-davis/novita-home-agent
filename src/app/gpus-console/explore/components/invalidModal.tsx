"use client";

import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import styles from "./invalidModal.module.scss";
import { Button } from "@/components/ui/button";

export default function InvalidModal({ finishForm }: { finishForm: any }) {
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Volume Disk mounting"}</h1>
        <div>
          <div className={styles.content}>
            Your template currently includes Volume Disk mounting, which is no
            longer supported (Container Disk has been expanded). Please update
            your template to remove Volume Disk mounting configurations and
            store data on the Container Disk.{" "}
            <span
              onClick={() => {
                finishForm(true);
              }}
              className="text-[var(--brand-0)] cursor-pointer"
              id={CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CUSTOMIZE_UPDATE_TEMPLATE}
            >
              Update Template Now
            </span>{" "}
          </div>
          <div style={{ marginTop: "24px" }}>
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
