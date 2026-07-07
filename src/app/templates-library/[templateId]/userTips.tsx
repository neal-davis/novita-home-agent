"use client";
import { reqComplaintTemplate } from "@/api/gpu-instance/templates";
import FeedbackModal from "./feedback";
import { message } from "@/components/ui/standard/notify";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function UserTips({ templateInfo }: { templateInfo: any }) {
  const [openFeedback, setOpenFeedback] = useState({
    open: false,
    templateId: "",
  });
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
      router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
      return;
    }
  }
  return (
    <div className="font-body text-[var(--dark-1)]">
      {"Can't be used normally? Click"}
      <span
        className="ml-1 mr-1 text-[var(--brand-0)] hover:cursor-pointer"
        onClick={() => {
          isAuth();
          setOpenFeedback({
            open: true,
            templateId: templateInfo.Id,
          });
        }}
        id={CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_FEEDBACK}
      >
        here
      </span>
      to let us know.
      {openFeedback.open && (
        <FeedbackModal
          open={openFeedback.open}
          templateId={openFeedback.templateId}
          onClose={() => {
            setOpenFeedback({
              open: false,
              templateId: "",
            });
          }}
          onConfirm={(params) => {
            console.log("params:", params);
            reqComplaintTemplate(params).then(() => {
              message.success(
                "Thank you for inform us. We will deal with it soon.",
              );
              setOpenFeedback({
                open: false,
                templateId: "",
              });
            });
          }}
        />
      )}
    </div>
  );
}
