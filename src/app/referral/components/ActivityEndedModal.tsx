"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE_LINK } from "@/constants/urls";
import Link from "next/link";
import styles from "./ActivityEndedModal.module.scss";

export default function ActivityEndedModal({ show }: { show: boolean }) {
  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent
        closeable={false}
        className={`${styles.modal_content} focus:outline-none`}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>Referral Ended</h2>
        <div className={styles.content}>
          <p className={styles.description}>
            This referral campaign has ended. Join our Discord community to stay
            informed about upcoming events and exclusive offers.
          </p>
          <div className="flex justify-center mt-8 mb-1">
            <Button className="gap-2" style={{ height: 36 }} asChild>
              <Link
                href={DISCORD_INVITE_LINK}
                target="_blank"
                className="!text-sm"
              >
                <span className="iconfont icon-discord"></span>
                <span>Join Discord</span>
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
