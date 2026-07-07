"use client";
import styles from "./deleteTemplate.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqDeleteTemplate } from "@/api/gpu-instance/templates";
export default function DeleteTemplate({
  templateInfoObj,
  finishForm,
}: {
  templateInfoObj: any;
  finishForm: any;
}) {
  const [templateInfo] = useState({ ...templateInfoObj });
  function removeTemplate() {
    reqDeleteTemplate(templateInfo.Id).then((res: any) => {
      message.success("success");
      finishForm(true);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Delete Template"}</h1>
        <div>
          <div className={styles.content}>
            {"Confirm delete template"}{" "}
            <span style={{ color: "red" }}>{templateInfoObj?.Id || ""}</span> ?
          </div>
          <div style={{ marginTop: "24px" }}>
            <Button
              className={styles.confirmBtn}
              onClick={() => removeTemplate()}
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
