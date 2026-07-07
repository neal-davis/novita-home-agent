"use client";

import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Check as CheckOutlined } from "lucide-react";
import styles from "./code-copy-btn.module.scss";
import analytics from "@/app/components/analytics/analytics";
interface CopyBtnProps {
  content: string;
  className?: string;
  size?: number;
  id?: string;
  onCopySuccess?: () => void;
}

export default function CopyBtn({
  id,
  content,
  className,
  size,
  onCopySuccess,
}: CopyBtnProps) {
  const [isCopy, setIsCopy] = useState(false);
  return (
    <CopyToClipboard
      text={content}
      onCopy={() => {
        if (id) {
          analytics.trackClick(id);
        }
        setIsCopy(true);
        setTimeout(() => {
          setIsCopy(false);
        }, 1500);
        onCopySuccess?.();
      }}
    >
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size || 14, height: size || 14 }}
      >
        {isCopy ? (
          <CheckOutlined
            className={`${styles.copy_btn} ${styles.success}`}
            style={{ fontSize: size || 14 }}
          />
        ) : (
          <span
            className={`iconfont icon-copy ${styles.copy_btn}`}
            style={{ fontSize: size || 14 }}
          />
        )}
      </span>
    </CopyToClipboard>
  );
}
