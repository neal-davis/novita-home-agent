"use client";
import styles from "./deleteAuth.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqDeleteImageAuth } from "@/api/gpu-instance/settings";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function DeleteAuth({
  authInfoObj,
  finishForm,
}: {
  authInfoObj: any;
  finishForm: any;
}) {
  const [authInfo] = useState({ ...authInfoObj });
  function removeAuth() {
    reqDeleteImageAuth({ id: authInfo.id }).then((res: any) => {
      message.success("success");
      finishForm(true);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Delete Registry Auth"}</h1>
        <div>
          <div className={styles.desc}>
            {"Confirm delete auth"} &nbsp;
            <span style={{ color: "red" }}>{authInfoObj?.id || ""}</span> ?
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              className={styles.confirmBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.SETTINGS_DELETE_CREDENTIAL}
              onClick={() => removeAuth()}
              variant="default"
            >
              <span className={styles.confirmBtnTxt}>{"Yes"}</span>
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
