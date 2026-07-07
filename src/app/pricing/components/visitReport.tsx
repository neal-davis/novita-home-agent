"use client";

import { reportInternalEvent } from "@/api/config";
import { useAppSelector } from "@/store";
import { useEffect } from "react";

export function VisitReport() {
  const userInfo = useAppSelector((state) => state.user);
  useEffect(() => {
    if (userInfo.uid && userInfo.uuid) {
      reportInternalEvent({
        uid: String(userInfo.uid),
        action: "PAGE_VIEW_PRICING",
      });
    }
  }, [userInfo.uid, userInfo.uuid]);

  return null;
}
