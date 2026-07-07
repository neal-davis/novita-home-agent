"use client";
import {
  reqGetUnPrivateTemplateById,
  reqOperateTemplate,
} from "@/api/gpu-instance/templates";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { useEffect, useState, useCallback } from "react";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function FavoriteBtn({ templateInfo }: { templateInfo: any }) {
  const userInfo = useAppSelector((state) => state.user) || {};
  const dispatch = useAppDispatch();
  const path =
    usePathname() +
    (typeof window === "undefined"
      ? ""
      : encodeURIComponent((window as any)?.location?.search || ""));
  const router = useRouter();
  function isAuth() {
    if (!userInfo || !userInfo.uuid) {
      const token: any = Cookies.get("token");
      if (token) {
        message.error("Login failure, please log in again");
      } else {
        message.error("Please log in first");
      }
      dispatch(setUserState(UserState.logout) as any);
      setTimeout(() => {
        router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
      }, 1000);
      return;
    }
  }
  function handleFavorite(templateId: string, isCollected: any) {
    isAuth();
    analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_FAVORITE, {
      template_id: templateId,
      action: isCollected ? "cancelCollect" : "collect",
    });
    reqOperateTemplate({
      templateId,
      operatorType: isCollected ? "cancelCollect" : "collect",
    }).then(() => {
      message.success(
        isCollected ? "Unfavorite successfully" : "Favorite successfully",
      );
      getIsCollected();
    });
  }
  const [isCollected, setIsCollected] = useState(
    templateInfo?.isCollected || false,
  );
  const getIsCollected = useCallback(() => {
    reqGetUnPrivateTemplateById(templateInfo.Id)
      .then((res) => {
        setIsCollected(res?.template?.isCollected || false);
      })
      .catch((err: any) => {
        if (err && err.reason === "TEMPLATE_NOT_FOUND") {
          router.push(NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY);
        }
      });
  }, [router, templateInfo.Id]);
  useEffect(() => {
    getIsCollected();
  }, [getIsCollected, templateInfo]);
  return (
    <Tooltip
      title={
        isCollected ? "Unbookmark this template" : "Bookmark this template"
      }
    >
      <div
        onClick={() => {
          handleFavorite(templateInfo.Id, isCollected);
        }}
        className="cursor-pointer h-[26px] bg-[var(--gray-3)] border border-[var(--gray-3)] rounded-[4px] px-[6px] py-[2px] flex items-center gap-1 hover:bg-[var(--gray-2)]"
      >
        <span
          className={`font-small iconfont ${isCollected ? "icon-Unfavorite" : "icon-favorite"} text-[var(--dark-1)] text-[14px]`}
        ></span>
        <span className="font-small-console text-[var(--black)]">
          {isCollected ? "Unfavorite" : "Favorite"}
        </span>
      </div>
    </Tooltip>
  );
}
