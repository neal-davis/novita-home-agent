"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useRef, useState } from "react";
import party from "party-js";

import styles from "./CelebrateModal.module.css";
import { setIsReg } from "@/store/slice/configSlice";
import { DISCORD_INVITE_LINK } from "@/constants/urls";
import { CLICK_BTN_IDs } from "../analytics/constants";
import { getActivityConfig } from "@/api/config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function CelebrateModal() {
  const isReg = useAppSelector((state) => state.config.isReg);
  const dispatch = useAppDispatch();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const openIntercom = () => {
    window.Intercom && window.Intercom("showNewMessage");
  };

  useEffect(() => {
    if (isReg) {
      const initContent = `We're thrilled to have you on board. You've received $0.5 in credits for nearly 100 image generations.`;
      getActivityConfig()
        .then((res: any) => {
          if (res?.isOn) {
            setContent(
              ` We're thrilled to have you on board. You've received $0.5 in credits for nearly 150 image generations.`,
            );
          } else {
            setContent(initContent);
          }
        })
        .catch(() => {
          setContent(initContent);
        })
        .finally(() => {
          setOpen(true);
        });
    }
  }, [isReg]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        wrapperRef.current &&
          party.confetti(wrapperRef.current, {
            count: 80,
            shapes: ["star", "rectangle"],
          });
      }, 300);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          dispatch(setIsReg(false));
        }
        setOpen(value);
      }}
    >
      <DialogContent
        closeable={false}
        className="max-w-[520px] rounded-[10px]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Welcome to Novita AI</DialogTitle>
        <div
          id="cele-modal"
          ref={wrapperRef}
          className={styles.modal_container}
        >
          <h3 className={styles.title}>{"🎉 "} Welcome to Novita AI</h3>
          <div className={styles.desc}>{content}</div>
          <div className={styles.desc}>
            If you encounter any issues, please contact us through the{" "}
            <span
              className={`${styles.link} c_welcom_link`}
              onClick={() => {
                openIntercom();
              }}
              id={CLICK_BTN_IDs.REPORT_WELCOME_INTERCOM_LINK}
            >
              Intercom
            </span>{" "}
            or join our{" "}
            <a
              className={`${styles.link} c_welcom_link`}
              href={DISCORD_INVITE_LINK}
              target="link"
              id={CLICK_BTN_IDs.REPORT_WELCOME_JOIN_LINK}
            >
              Discord server
            </a>{" "}
            for additional support.
          </div>
          <div className={styles.footer}>
            <div className="inline-flex items-center gap-2">
              <Button
                id={CLICK_BTN_IDs.REPORT_WELCOME_START_NOW}
                onClick={() => {
                  dispatch(setIsReg(false));
                  setOpen(false);
                }}
              >
                Start Now
              </Button>
              <Button
                id={CLICK_BTN_IDs.REPORT_WELCOME_JOIN_DISCORD}
                variant="outline"
                onClick={() => {
                  window.open(
                    "https://discord.com/channels/1113789452079337522/1115192537104265257",
                    "_blank",
                  );
                  dispatch(setIsReg(false));
                  setOpen(false);
                }}
              >
                Join Discord
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
