"use client";

import styles from "./migrateJobCreateSuccess.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function MigrateJobCreateSuccess({
  jobInfoObj,
  finishForm,
}: {
  jobInfoObj: any;
  finishForm: any;
}) {
  const { locale } = useI18n();
  const [jobInfo] = useState({ ...jobInfoObj });
  function toJobPage() {
    if ("undefined" != typeof window) {
      window.location.href = getLocalizedPath(
        NOVITA_URL.GPU_CONSOLE_JOBS,
        locale,
      );
    }
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Job Created Success"}</h1>
        <div>
          <div className={styles.desc}>
            {"A job has been created. Job ID:"}{" "}
            <span style={{ color: "var(--red-1)" }}>{jobInfo.jobId}</span>
            {". You can view and manage your jobs in the [Console - Jobs]."}
          </div>
          <div className={styles.btnContainer}>
            <Button
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_TO_JOBS}
              className={styles.toJobsBtn}
              onClick={() => toJobPage()}
              variant="default"
            >
              <span className={styles.toJobsBtnTxt}>{"To [Jobs]"}</span>
            </Button>
            <Button
              onClick={() => finishForm(false)}
              className={styles.closeBtn}
              variant="default"
            >
              <span className={styles.closeBtnTxt}>{"Close"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
