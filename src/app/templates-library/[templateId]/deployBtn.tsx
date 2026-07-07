"use client";

import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { useLocation } from "react-use";
import Cookies from "js-cookie";
import { useCallback } from "react";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export default function DeployBtn({
  templateInfo,
  urlSharer = "",
}: {
  templateInfo: any;
  urlSharer?: string;
}) {
  Cookies.set("share_template_id", templateInfo?.Id || "");
  Cookies.set("share_sharer_uuid", urlSharer || "");
  const userInfo = useAppSelector((state) => state.user) || {};
  const location = useLocation();
  function getSharer() {
    let sharer = "";
    const href: any = decodeURIComponent(location.href || "");
    if (href && href.includes("?")) {
      const tmpArr: any = href.split("?");
      if (tmpArr.length > 1) {
        const retMap: any = new URLSearchParams(tmpArr[1]);
        sharer = retMap.get("sharer") || "";
      }
    }
    console.log("sharer", sharer);
    if (sharer) {
      return sharer;
    }
    if (userInfo.uuid) {
      return userInfo.uuid;
    }
    return "";
  }
  const handleClick = useCallback(() => {
    analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_DEPLOY, {
      templateId: templateInfo.Id,
    });
  }, [templateInfo.Id]);
  return (
    <Button className="mt-4 w-[120px]" variant="secondary" size="sl" asChild>
      <Link
        onClick={handleClick}
        href={
          NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE +
          "?templateId=" +
          templateInfo.Id +
          "&sharer=" +
          getSharer()
        }
      >
        Deploy
      </Link>
    </Button>
  );
}
