"use client";
import styles from "./deleteStorage.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { reqDeleteNetworkStorage } from "@/api/gpu-instance/storage";
import { copyText, dealParamsText } from "@/lib/utils/utils";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function DeleteStorage({
  storageId,
  storageName,
  finishForm,
}: {
  storageId: any;
  storageName: any;
  finishForm: any;
}) {
  const [myStorageName, setMyStorageName] = useState("");
  function deleteStorage() {
    reqDeleteNetworkStorage({
      storageId,
    }).then(() => {
      message.success("success");
      finishForm(true);
    });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Delete Network Volume"}</h1>
        <div>
          <div className={styles.desc}>
            {dealParamsText(
              'Delete the volume named "${0}". This action is irreversible! Confirm you want to permanently delete this Volume by entering it\'s name below.',
              { 0: storageName },
            )}
          </div>
          <div style={{ marginTop: "32px", marginBottom: "20px" }}>
            <Tooltip title={<div>{"Click to copy"}</div>}>
              <span
                onClick={() => copyText(storageName)}
                className={styles.storageName}
              >
                {storageName}
              </span>
            </Tooltip>
          </div>
          <div style={{ marginTop: "32px", marginBottom: "20px" }}>
            <div className={styles.enterNameTip}>{"Enter the name"}</div>
            <Input
              className="h-12 pl-5"
              style={{
                background: "transparent",
                width: "100%",
                borderRadius: "8px",
              }}
              placeholder={"Enter your storage name to delete"}
              value={myStorageName}
              onChange={(e: any) => setMyStorageName(e.target.value)}
            />
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
            <Button
              disabled={myStorageName !== storageName}
              className={styles.confirmBtn}
              id={CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_DELETE_STORAGE}
              onClick={() => deleteStorage()}
              variant="default"
            >
              {"Confirm"}
            </Button>
            <Button
              onClick={finishForm}
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
