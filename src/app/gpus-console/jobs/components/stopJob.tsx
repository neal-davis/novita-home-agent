"use client";
import styles from "./stopJob.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqBreakJob } from "@/api/gpu-instance/jobs";
import { Button as UButton } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function StopJob({
  jobInfo,
  finishForm,
}: {
  jobInfo: any;
  finishForm: any;
}) {
  const { locale } = useI18n();
  const [authInfoState] = useState({ ...jobInfo });
  function stopJob() {
    reqBreakJob({ jobId: authInfoState.Id }).then((res: any) => {
      message.success("success");
      finishForm(true);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Terminate Job"}</h1>
        <div>
          <div className={styles.desc}>
            <div>
              {"Confirm to Terminate Job?"} (Job ID:{" "}
              <span style={{ color: "var(--red-1)" }}>
                {authInfoState?.Id || ""}
              </span>
              )
            </div>
            {"If you confirm terminate, the job will be deleted. You can go to"}{" "}
            &nbsp;&nbsp;
            <a
              href={getLocalizedPath(NOVITA_URL.GPU_CONSOLE_INSTANCES, locale)}
              className={styles.instanceManagement}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--black)",
                paddingLeft: "0",
                paddingRight: "0",
              }}
            >
              {"Instance Management"}
            </a>
            &nbsp;&nbsp;
            {" to recreate the job!"}
          </div>
          <div>
            <Button
              className={styles.confirmBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_TERMINATE_JOB}
              onClick={() => stopJob()}
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
