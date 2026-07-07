"use client";

import styles from "./confirmCreate.module.scss";
import { Button } from "@/components/ui/button";

export default function ConfirmCreate({
  sumFee,
  finishForm,
  createInstanceInfo,
}: {
  sumFee: any;
  finishForm: any;
  createInstanceInfo: any;
}) {
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>Confirm Create</h1>
        <div>
          <div className={styles.desc}>
            Create a <span className="font-bold">Subscription Instance</span>,
            you need to pay upfront{" "}
            <span className={styles.tip12}>${sumFee}</span>{" "}
            {`, the instance is not refundable and cannot be released, if there is a problem during operation, you can click "Migrate" to seamlessly switch to other GPUs, do you confirm payment?`}
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              className={styles.stopBtn}
              onClick={() => finishForm(true, createInstanceInfo)}
              variant="default"
            >
              <span className={styles.stopBtnTxt}>Confirm</span>
            </Button>
            <Button
              onClick={() => finishForm(false)}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>Cancel</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
