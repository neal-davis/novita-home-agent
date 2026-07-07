"use client";
import styles from "./autoMigrateInstance.module.scss";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import { reqSetAutoMigrate } from "@/api/gpu-instance/instances";
import { Button as SButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
export default function MigrateInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo] = useState({ ...instanceInfoObj });
  const [instanceAutoMigrate, setInstanceAutoMigrate] = useState(
    instanceInfoObj.autoMigrateOpen,
  );
  const [migrateSystemDisk, setMigrateSystemDisk] = useState(
    instanceInfoObj.autoMigrateSystemDisk,
  );
  const [loading, setLoading] = useState(false);
  function migrateInstance() {
    if (loading) return;
    setLoading(true);
    reqSetAutoMigrate({
      instanceId: instanceInfo.id,
      autoMigrateOpen: instanceAutoMigrate,
      autoMigrateSystemDisk: instanceAutoMigrate ? migrateSystemDisk : false,
    })
      .then((res: any) => {
        message.success("success");
        finishForm(true, instanceInfo);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Automatic Migration"}</h1>
        <div className={styles.desc}>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-2">
              <Switch
                size="sm"
                checked={instanceAutoMigrate}
                onCheckedChange={(checked: boolean) =>
                  setInstanceAutoMigrate(checked)
                }
              />
              <div className="font-subtle text-[var(--black)]">
                {"Automatic Instance Migration"}
              </div>
            </div>
            {instanceAutoMigrate && (
              <>
                <div className="h-[16px] w-[1px] bg-[var(--gray-1)]"></div>
                <div className="flex flex-row items-center gap-2">
                  <Checkbox
                    checked={migrateSystemDisk}
                    onCheckedChange={(checked: boolean) =>
                      setMigrateSystemDisk(checked)
                    }
                  />
                  <div className="font-subtle text-[var(--black)]">
                    {"Migrate System Disk"}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="border-b border-[var(--gray-1)] border-dashed mt-3 mb-3"></div>
          {instanceAutoMigrate ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>1.</span>
                <span>
                  {"The following regions don't support this feature:"}{" "}
                  <span className="font-small-console-medium text-[var(--black)]">
                    US-CA-03/US-CA-NAS-01/US-02/US-CA-02
                  </span>
                  .
                </span>
              </div>
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>2.</span>
                <span>
                  Automatically migrates the instance to a healthy node on
                  hardware failure. Instance ID, Port Mapping Address, and data
                  remain unchanged, with only brief downtime.
                </span>
              </div>
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>3.</span>
                <span>
                  If the system disk is included, downtime depends on its size
                  (typically minutes to ~10+ minutes).
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>1.</span>
                <span>
                  You’ll be notified of faults and must migrate manually within
                  7 days.
                </span>
              </div>
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>2.</span>
                <span>
                  If no action is taken, the system will auto-migrate to
                  maintain service continuity.
                </span>
              </div>
              <div className="flex flex-row items-start gap-2 font-small-console text-[var(--dark-1)]">
                <span>3.</span>
                <span>Support is available during migration if needed.</span>
              </div>
            </div>
          )}

          <div className="mt-[30px]">
            <SButton
              variant={loading ? "disabled" : "default"}
              className={`${styles.migrateBtn} ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => migrateInstance()}
            >
              {"Confirm"}
            </SButton>
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
