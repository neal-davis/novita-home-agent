"use client";

import { useEffect, useState } from "react";
import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { useAppSelector } from "@/store";

export const NOTICE_DESKTOP_HEIGHT = 50;
export const NOTICE_MOBILE_HEIGHT = 64;
export const ORI_HEADER_HEIGHT = 52;
export const CONSOLE_ORI_HEADER_HEIGHT = 54;

const getDefaultNoticeHeight = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches
    ? NOTICE_MOBILE_HEIGHT
    : NOTICE_DESKTOP_HEIGHT;

export const getCustomNoticeHeight = (
  height?: number,
  configuredHeight?: number,
) => {
  if (height) {
    return height;
  }

  if (configuredHeight && configuredHeight !== NOTICE_DESKTOP_HEIGHT) {
    return configuredHeight;
  }

  return undefined;
};

export const useNoticeHeight = (height?: number) => {
  const noticeConfig = useAppSelector((state) => state.config.notice);
  const [defaultNoticeHeight, setDefaultNoticeHeight] = useState(
    getDefaultNoticeHeight,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateNoticeHeight = () =>
      setDefaultNoticeHeight(
        mobileQuery.matches ? NOTICE_MOBILE_HEIGHT : NOTICE_DESKTOP_HEIGHT,
      );

    updateNoticeHeight();
    mobileQuery.addEventListener("change", updateNoticeHeight);

    return () => {
      mobileQuery.removeEventListener("change", updateNoticeHeight);
    };
  }, []);

  return (
    getCustomNoticeHeight(height, noticeConfig?.height) ?? defaultNoticeHeight
  );
};

export const useHeaderHeight = (
  page?: "playground" | "console",
  position?: "relative",
  hideNotice?: boolean,
) => {
  const originalHeaderHeight =
    page === "console" ? CONSOLE_ORI_HEADER_HEIGHT : ORI_HEADER_HEIGHT;

  const currentNoticeHeight = useNoticeHeight();
  const isNoticeShowing = useIsNoticeShowing() && !hideNotice;

  const noticeHeight = isNoticeShowing ? currentNoticeHeight : 0;
  const headerHeight =
    noticeHeight + (position === "relative" ? originalHeaderHeight : 0);

  return {
    headerHeight,
    noticeHeight,
    originalHeaderHeight,
    isNoticeShowing,
  };
};
