"use client";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { reqOperateTemplate } from "@/api/gpu-instance/templates";
import { copyText } from "@/lib/utils/utils";
import { useState } from "react";
import { Check as CheckOutlined } from "lucide-react";
import styles from "./changeNewTemplateOperations.module.scss";
import { Copy, Link } from "lucide-react";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useEncodedPath } from "./useEncodedPath";

export default function ChangeNewTemplateOperations({
  templateInfo,
  refreshTemplateListFun,
}: {
  templateInfo: any;
  refreshTemplateListFun: (templateId: string, isCollected: any) => void;
}) {
  const userInfo = useAppSelector((state) => state.user) || {};
  const { locale } = useI18n();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const path = useEncodedPath(pathname);
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
      router.push(
        getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
      );
      return;
    }
  }
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  function handleFavorite(templateId: string, isCollected: any, e: any) {
    isAuth();
    e.stopPropagation();
    analytics.trackClick(
      CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CHANGE_TEMPLATE_FAVORITE,
      {
        template_id: templateId,
        action: isCollected ? "cancelCollect" : "collect",
      },
    );
    if (favoriteLoading) {
      return;
    }
    setFavoriteLoading(true);
    reqOperateTemplate({
      templateId,
      operatorType: isCollected ? "cancelCollect" : "collect",
    })
      .then(() => {
        // getTemplateData();
        refreshTemplateListFun(templateId, isCollected);
        message.success(
          isCollected ? "Unfavorite successfully" : "Favorite successfully",
        );
        setIsFavorite(true);
        const timer = setTimeout(() => {
          setIsFavorite(false);
          clearTimeout(timer);
        }, 1500);
      })
      .finally(() => {
        setFavoriteLoading(false);
      });
  }
  function handleCopy(templateId: string, e: any) {
    isAuth();
    e.stopPropagation();
    reqOperateTemplate({
      templateId,
      operatorType: "share",
    }).then(() => {
      // getTemplateData();
      copyText(
        window.location.origin +
          getLocalizedPath(
            "/gpus-console/templates-library?templateId=" +
              templateId +
              "&sharer=" +
              userInfo.uuid,
            locale,
          ),
      );
      setIsCopy(true);
      const timer = setTimeout(() => {
        setIsCopy(false);
        clearTimeout(timer);
      }, 1500);
    });
  }
  const [isCopy, setIsCopy] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <div className="flex flex-row gap-1">
      {["official"].includes(templateInfo.channel) && (
        <Tooltip
          title={`${templateInfo.isCollected ? "Unfavorite Template" : "Favorite Template"}`}
        >
          <div
            className="w-6 h-6 shrink-0 flex items-center 
                  justify-center hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
            onClick={(e: any) => {
              handleFavorite(templateInfo.Id, templateInfo.isCollected, e);
            }}
          >
            <img
              src={
                templateInfo.isCollected
                  ? "/gpu-instance/template-library/icon-fav.svg"
                  : "/gpu-instance/template-library/icon-unfav.svg"
              }
              alt="icon-fav"
              className="w-4 h-4 shrink-0"
            />
          </div>
        </Tooltip>
      )}
      {templateInfo.channel === "private" && (
        <Tooltip title="Copy Template">
          <div
            className="w-6 h-6 shrink-0 flex items-center justify-center
                    hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
            onClick={(e: any) => {
              handleCopy(templateInfo.Id, e);
            }}
          >
            <Copy className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
          </div>
        </Tooltip>
      )}
      {["official"].includes(templateInfo.channel) && (
        <Tooltip title="Copy Link">
          <div
            className="w-6 h-6 shrink-0 flex 
                    items-center justify-center hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
            onClick={(e: any) => handleCopy(templateInfo.Id, e)}
          >
            <Link className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
          </div>
        </Tooltip>
      )}
    </div>
    // <div className="inline-flex items-center justify-start gap-2">
    //   {isCopy ? (
    //     <CheckOutlined
    //       className={`${styles.oper_btn} ${styles.success} text-[16px]`}
    //     />
    //   ) : (<div className="flex items-center justify-center cursor-pointer rounded-[50%] w-6 h-6 p-[2px] hover:bg-[var(--gray-3)]"
    //     onClick={(e: any) => {
    //       handleCopy(templateInfo.Id, e);
    //       e.stopPropagation();
    //       analytics.trackClick(
    //         CLICK_BTN_IDs.GPUS_CONSOLE
    //           .EXPLORE_CHANGE_TEMPLATE_COPY_LINK,
    //         {
    //           template_id: templateInfo.Id,
    //         },
    //       );
    //     }
    //   }>
    //     <span className="iconfont icon-copy2 text-[var(--dark-1)] text-[16px]"></span>
    //   </div>)}
    //   <div className="flex items-center justify-center cursor-pointer rounded-[50%] w-6 h-6 p-[2px] hover:bg-[var(--gray-3)]"
    //     onClick={(e: any) => {
    //       handleFavorite(templateInfo.Id, templateInfo.isCollected, e);
    //       e.stopPropagation();
    //     }}>
    //       {isFavorite ? (
    //         <CheckOutlined
    //           className={`${styles.oper_btn} ${styles.success} text-[16px]`}
    //         />
    //       ) : (<>
    //       {templateInfo.isCollected ? <span className="iconfont icon-Unfavorite text-[var(--brand-1)] text-[16px]"></span> :
    //         <span className="iconfont icon-favorite text-[var(--black)] text-[16px]"></span>
    //       }</>)
    //       }
    //   </div>
    // </div>
  );
}
