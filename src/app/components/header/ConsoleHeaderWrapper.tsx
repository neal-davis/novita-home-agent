"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import {
  CONSOLE_ORI_HEADER_HEIGHT,
  useNoticeHeight,
} from "@/hooks/useHeaderHeight";
import Notice from "../Notice/Notice";
import SideNavigationItems from "./partials/SideNavigationItems";
import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { useSideNavigationItems } from "@/hooks/useSideNavigationItems";
import { ConsoleProduct } from "@/types/header";
import { getPathnameWithoutLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import styles from "./ConsoleHeaderWrapper.module.scss";

interface ConsoleHeaderWrapperProps {
  children: React.ReactNode;
  product: ConsoleProduct;
  className?: string;
  mainClassName?: string;
}

export default function ConsoleHeaderWrapper({
  children,
  product,
  className,
  mainClassName,
}: ConsoleHeaderWrapperProps) {
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const isNoticeShowing = useIsNoticeShowing(true);
  const sideNavItems = useSideNavigationItems(product);
  const currentNoticeHeight = useNoticeHeight();
  const noticeHeight = isNoticeShowing ? currentNoticeHeight : 0;
  const consolePageTitle =
    sideNavItems.find(
      (item) =>
        item.path === businessPathname ||
        item.altPaths?.includes(businessPathname),
    )?.title || "";

  return (
    <>
      {isNoticeShowing && <Notice position="relative" page="console" />}
      <div
        className={cn(styles.container, className)}
        style={{ height: `calc(100vh - ${noticeHeight}px)` }}
      >
        <div className={`${styles.side} console-side-navigation`}>
          <SideNavigationItems items={sideNavItems} product={product} />
        </div>
        <div className={`flex-1 ${styles.content_wrapper}`}>
          <Header
            page="console"
            position="relative"
            size="full"
            hideNotice={true}
            consolePageTitle={consolePageTitle as string}
          />
          <div
            className={cn(styles.main, mainClassName)}
            style={{ height: `calc(100% - ${CONSOLE_ORI_HEADER_HEIGHT}px)` }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
