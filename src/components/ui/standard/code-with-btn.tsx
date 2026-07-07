"use client";

import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Check as CheckOutlined } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./code-copy-btn.module.scss";
import analytics from "@/app/components/analytics/analytics";
interface CopyBtnProps {
  content: string;
  className?: string;
  size?: number;
  id?: string;
}

export default function CopyBtn({
  content,
  className,
  size,
  id,
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
      }}
    >
      <Button variant="outline" size="sm">
        {isCopy ? (
          <CheckOutlined
            className={`${styles.copy_btn} ${styles.success} ${className}`}
          />
        ) : (
          <span
            className={`iconfont icon-copy transition hover:scale-110 delay-75 duration-200 ${styles.copy_btn} ${className}`}
            style={size ? { fontSize: size } : {}}
          ></span>
        )}
        Copy
      </Button>
    </CopyToClipboard>
  );
}
