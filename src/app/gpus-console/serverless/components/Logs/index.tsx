"use client";

import styles from "./index.module.scss";
import { Button } from "@/components/ui/button";
import InstanceLog from "../../../components/InstanceLog";
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
      width="1216px"
      footer={null}
      open={showModal}
      title={null}
      onCancel={() => finishForm()}
      styles={{
        content: {
          padding: 0,
          maxHeight: "100%",
        },
      }}
    >
      <div className={styles.subContainer} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "71px",
            borderBottom: "1px solid var(--gray-2)",
            width: "100%",
            height: "1px",
          }}
        ></div>
        <div className={styles.section}>
          <h1 className={styles.title}>{"Logs"}</h1>
          <div>
            <div
              style={{
                marginTop: "48px",
              }}
            >
              <InstanceLog outHeight={"50vh"} address={instanceLogAddress} />
            </div>
            <div className="flex justify-end items-center mt-[24px]">
              <Button
                size="sl"
                variant="outline"
                onClick={() => finishForm()}
                style={{
                  width: "124px",
                }}
              >
                {"Close"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
