"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { NOVITA_URL } from "@/constants/urls";
import Cookies from "js-cookie";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
// import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
// import analytics from "@/app/components/analytics/analytics";

export default function GlobalNotice() {
  const token = Cookies.get("token");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (token && localStorage.getItem("gpuGlobalNotice3") !== "1") {
      setOpen(true);
    }
  }, [token]);

  function onOpenChange() {
    setOpen(false);
    localStorage.setItem("gpuGlobalNotice3", "1");
    // analytics.trackClick(CLICK_BTN_IDs.NOTICE_DIALOG.CLOSE_NOTICE_DIALOG);
  }

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className={styles.outContainer}
        style={{
          background: "transparent !important",
          border: "none !important",
          paddingTop: "14px",
          paddingBottom: "14px",
          overflow: "hidden",
        }}
      >
        <div className={`${styles.container} relative`}>
          <img
            src="/gpu-instance/console/globalNotice/alert-top.svg"
            alt="alert-top"
            className="w-[50px] h-[50px] absolute top-[-14px] left-[19px] z-[1]"
          />
          <div className="flex flex-col z-[2] relative">
            <div className="font-body-medium mb-[16px] text-[var(--black)]">
              Important Update: Enhanced Instance Migration Experience
            </div>
            <div
              className={`flex flex-col gap-[8px] ${styles.alertContent} text-[var(--dark-1)] mb-[16px]`}
            >
              <div>
                We are pleased to announce a major upgrade to the instance
                migration process on our platform. This enhancement is designed
                to improve migration stability, reliability, and service
                continuity.
              </div>
              <div>
                <div className="font-semibold">{"What's New"}</div>
                <div className="font-semibold mt-2">
                  Reduced service interruption
                </div>
                <div>
                  {`The new migration workflow reduces service interruption from minutes 
                  to seconds, helping minimize impact to your workloads. 
                  The instance's port mapping address will remain unchanged after migration.`}
                </div>

                <div className="font-semibold mt-2">
                  Snapshot-based migration
                </div>
                <div>
                  {`When data migration is enabled, both manual migrations and 
                  failure-triggered automatic migrations will be performed based 
                  on the instance snapshot captured at the time the migration task 
                  is initiated. The platform will create a new replica in the background 
                  in advance. Once the new replica is ready, traffic will be switched 
                  over and the original replica will be released, ensuring a smoother 
                  and more reliable migration experience.`}
                </div>
                <div className="font-semibold mt-2">Data consistency</div>
                <div>
                  {`After migration, the new replica will be restored to the snapshot 
                  state captured when the migration was initiated or when the automatic 
                  failure migration was triggered, helping ensure no data loss during 
                  the process.`}
                </div>
              </div>
            </div>
            <div className={styles.alertContent}>
              <div className="font-semibold mt-2">Recommendation</div>
              <div>
                {`To achieve the fastest possible service recovery, we strongly recommend 
                designing and configuring your applications as stateless services. 
                Stateless applications can be migrated without data migration, as they do 
                not depend on persistent local data, enabling faster recovery and reduced 
                migration time.`}
              </div>
            </div>
            <div className="mt-[31px] flex flex-row gap-[22px] justify-end items-center">
              <Button
                className="h-[36px] w-[90px]"
                onClick={onOpenChange}
                id={CLICK_BTN_IDs.GPUS_CONSOLE.NOTICE_DIALOG_CLOSE}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
