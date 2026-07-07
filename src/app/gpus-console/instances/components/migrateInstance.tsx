"use client";
import styles from "./migrateInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { reqMigrateGpuInstance } from "@/api/gpu-instance/instances";
import { Button as SButton } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { dealErrorByObj } from "@/lib/utils/dealError";
export default function MigrateInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [loading, setLoading] = useState(false);
  const [migrateData, setMigrateData] = useState(false);
  const [backupData, setBackupData] = useState(false);
  function migrateInstance() {
    if (loading) return;
    setLoading(true);
    reqMigrateGpuInstance(
      instanceInfo.id,
      instanceInfo.version === "v2" ? { saveData: migrateData } : {},
    )
      .then((res: any) => {
        message.success("success");
        finishForm(true, { ...instanceInfo, jobId: res?.jobId });
      })
      .catch((error: any) => {
        if (
          error?.reason === "INSUFFICIENT_RESOURCE" ||
          error?.reason === "MIGRATE_INSUFFICIENT_RESOURCE"
        ) {
          message.error(
            "No resources available, please try again later or contact customer support!",
          );
        }
        if (error?.reason === "CUDA_VERSION_INCOMPATIBLE") {
          message.error("CUDA version is incompatible");
        }
        if (error?.reason === "EXPIRED_OR_BALANCE_NOT_ENOUGH") {
          message.error(dealErrorByObj(error));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Instance Migration"}</h1>
        <div>
          {instanceInfo.version === "v2" ? (
            <div className={styles.desc}>
              {
                "After migration, instance details (e.g., ID, outbound IP) remain unchanged. The image will be securely stored in"
              }{" "}
              <span style={{ color: "var(--red-1)" }}>
                {"the Novita official Repo."}
              </span>{" "}
              {"Please"}{" "}
              <span style={{ color: "var(--red-1)" }}>
                {"back up your data"}
              </span>{" "}
              {
                "in advance to prevent loss. Instance migration Job can't be terminated."
              }
            </div>
          ) : (
            <>
              <div className={styles.desc}>
                {
                  "After migration, your instance information will remain unchanged (such as Instance ID and Egress IP)."
                }{" "}
                <span style={{ color: "var(--red-1)" }}>
                  {"However, local data on the node will not be preserved."}
                </span>{" "}
                {"To ensure data safety,"}{" "}
                <span style={{ color: "var(--red-1)" }}>
                  {"we recommend backing up your data in advance."}
                </span>
                <div>
                  {"The migration task cannot be canceled once started."}
                </div>
              </div>
              <div className="mb-4">
                <label className={styles.confirmCheckbox}>
                  <Checkbox
                    checked={backupData}
                    onCheckedChange={(checked) =>
                      setBackupData(checked === true)
                    }
                  />
                  <span className={styles.isMigrateDataTxt}>
                    {
                      "I understand that current data will not be retained after migration, and I have completed a backup."
                    }
                  </span>
                </label>
              </div>
            </>
          )}
          {instanceInfo.version === "v2" && (
            <div className="flex flex-col gap-2 mb-4">
              <label className="inline-flex items-center gap-2">
                <Checkbox
                  checked={migrateData}
                  onCheckedChange={(checked) =>
                    setMigrateData(checked === true)
                  }
                />
                <span
                  className={styles.isMigrateDataTxt}
                  style={{
                    color: "var(--black)",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {"Migrate data"}
                </span>
              </label>
              {migrateData && (
                <div className="text-[var(--dark-2)] text-sm font-normal leading-5">
                  {
                    "If selected, the Container Disk will be imaged and migrated with the instance. The new image includes Container Disk data and is ready to use."
                  }
                </div>
              )}
            </div>
          )}
          <div>
            {/* <Button
          disabled={loading}
          className={styles.migrateBtn}
          onClick={() => migrateInstance()}
          variant="default"
        >
          <span className={styles.migrateBtnTxt}>
            {"Confirm"}
          </span>
        </Button> */}
            {instanceInfo.version !== "v2" && !backupData ? (
              <Tooltip title="Please confirm that you have backed up your data.">
                <SButton
                  variant={"disabled"}
                  disabled={true}
                  className={`${styles.migrateBtn} cursor-not-allowed`}
                >
                  {"Confirm"}
                </SButton>
              </Tooltip>
            ) : (
              <SButton
                variant={loading ? "disabled" : "default"}
                className={`${styles.migrateBtn} ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_MIGRATE_INSTANCE}
                onClick={() => migrateInstance()}
              >
                {"Confirm"}
              </SButton>
            )}
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
