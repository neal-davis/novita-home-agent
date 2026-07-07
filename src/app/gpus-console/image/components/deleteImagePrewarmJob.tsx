"use client";
import styles from "./deleteImagePrewarmJob.module.scss";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqDeleteGpuImagePrewarm } from "@/api/gpu-instance/images";
export default function DeleteImagePrewarmJob({
  ids,
  finishForm,
}: {
  ids: Array<any>;
  finishForm: any;
}) {
  function deleteImagePrewarmJob() {
    reqDeleteGpuImagePrewarm({
      ids,
    }).then(() => {
      message.success("success");
      finishForm(true);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.section}>
        <div>
          <div className={styles.desc}>
            {
              "Are you sure you want to delete the image prewarm task with the following id?"
            }
          </div>
          <div>
            <span>{ids.join(",")}</span>
          </div>
          <div className={styles.actions}>
            <Button
              className={styles.confirmBtn}
              onClick={() => deleteImagePrewarmJob()}
              variant="default"
            >
              {"Confirm"}
            </Button>
            <Button
              onClick={() => finishForm(false)}
              className={styles.cancelBtn}
              variant="outline"
            >
              {"Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
