"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { message } from "@/components/ui/standard/notify";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";

export default function APIKeyAlert({
  apiKey,
  setNewAPIKey,
}: {
  apiKey: string;
  setNewAPIKey: (apiKey: string) => void;
}) {
  const [countdown, setCountdown] = useState(5);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const visible = useMemo(() => !!apiKey, [apiKey]);

  useEffect(() => {
    if (visible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsButtonEnabled(true);
    }
  }, [visible, countdown]);

  return (
    <Dialog open={visible}>
      <DialogContent closeable={false}>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription className={styles.api_key_alert_desc}>
            <span>Please save your secret key in a safe place</span>{" "}
            <span className="font-medium">{`since you won't be able to view it again.`}</span>{" "}
            <span>{`If you do lose it, you'll need to generate a new one.`}</span>
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex flex-row justify-between items-center ${styles.api_key_alert_key}`}
        >
          <div className={styles.content}>{apiKey}</div>
          <CopyToClipboard
            text={apiKey}
            onCopy={() => {
              message.success("Copied to clipboard");
            }}
          >
            <Button variant="default">
              <span className="iconfont icon-copy mr-2"></span>
              <span>Copy</span>
            </Button>
          </CopyToClipboard>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setNewAPIKey("");
            }}
            disabled={!isButtonEnabled}
          >
            {isButtonEnabled
              ? "I Have Saved It"
              : `Please wait (${countdown}s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
