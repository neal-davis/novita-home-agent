"use client";

import styles from "./logs.module.scss";
import { Button } from "@/components/ui/button";
import InstanceLog from "../../components/InstanceLog";
import Modal from "@/app/components/Modal/Modal";

export default function Logs({
  finishForm,
  instanceLogAddress,
  showModal,
}: {
  finishForm: () => void;
  instanceLogAddress: string;
  showModal: boolean;
}) {
  return (
    <Modal
      width="890px"
      className={styles.modal}
      footer={null}
      open={showModal}
      title={null}
      onCancel={() => finishForm()}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <div className={styles.subContainer} style={{ position: "relative" }}>
        <div className={styles.line}></div>
        <div className={styles.section}>
          <h1 className={styles.title}>{"Logs"}</h1>
          <div>
            <div className={styles.logContent}>
              <InstanceLog
                outHeight={"min(56vh, 560px)"}
                address={instanceLogAddress}
              />
            </div>
            <div style={{ marginTop: "24px" }}>
              <Button
                onClick={() => finishForm()}
                className={styles.closeBtn}
                variant="default"
              >
                <span className={styles.closeBtnTxt}>{"Close"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
