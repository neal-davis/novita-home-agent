"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BREVO_BOOK_LINK } from "@/constants/urls";
import Link from "next/link";
import styles from "./GPUExceedModal.module.scss";

export default function GPUExceedModal({
  show,
  handleClose,
  userDEInfo,
}: {
  show: boolean;
  handleClose: () => void;
  userDEInfo: LLMDedicatedUserInfo;
}) {
  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent
        className={styles.modal_content}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>{"You've exceeded your GPU quota."}</h2>
        <div className={styles.content}>
          <p className={styles.description}>
            In Use:{" "}
            <span className={styles.highlight}>
              {userDEInfo.currentGpuCount}
            </span>
          </p>
          <p className={`${styles.description} mt-1`}>
            Please reduce your request or contact us for more GPU capacity.
          </p>
          <div className="flex justify-end gap-3 mt-8 mb-1">
            <Button
              size="sl"
              className="px-3"
              variant="secondary"
              onClick={handleClose}
            >
              <Link href={BREVO_BOOK_LINK} target="_blank">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
