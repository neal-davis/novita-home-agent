"use client";
import { reqOperateTemplate } from "@/api/gpu-instance/templates";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { copyText } from "@/lib/utils/utils";
import { useLocation } from "react-use";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function CopyLinkBtn({ templateInfo }: { templateInfo: any }) {
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.href || "");
  function getSharer() {
    const sharer = searchParams.get("sharer");
    console.log("sharer", sharer);
    if (sharer) {
      return sharer;
    }
    if (userInfo.uuid) {
      return userInfo.uuid;
    }
    return "";
  }
  function handleCopy(templateId: string) {
    isAuth();
    analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_COPY_LINK, {
      template_id: templateId,
    });
    reqOperateTemplate({
      templateId,
      operatorType: "share",
    }).then(() => {
      copyText(
        window.location.origin +
          "/templates-library/" +
          templateId +
          "?sharer=" +
          getSharer(),
      );
    });
  }
  return (
    <Tooltip title={"Copy the link and share it"}>
      <div
        onClick={() => {
          handleCopy(templateInfo.Id);
        }}
        className="cursor-pointer h-[26px] bg-[var(--gray-3)] border border-[var(--gray-3)] rounded-[4px] px-[6px] py-[2px] flex items-center gap-1 hover:bg-[var(--gray-2)]"
      >
        <span className="iconfont icon-copy text-[var(--dark-1)] text-[14px]"></span>
        <span className="font-small-console text-[var(--black)]">
          Copy Link
        </span>
      </div>
    </Tooltip>
  );
}
