"use client";
import { Button } from "@/components/ui/button";
import styles from "./templateDetail.module.scss";
import { ChevronRight, Link } from "lucide-react";
import { DetailsTab } from "./detailsTab";
import { sliceUTCString } from "@/lib/utils/date";
import { copyText, matchLogoForTemplate } from "@/lib/utils/utils";
import {
  reqOperateTemplate,
  reqGetTemplateById,
} from "@/api/gpu-instance/templates";
import { NOVITA_URL } from "@/constants/urls";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { setUserState } from "@/store/slice/userSlice";
import { UserState } from "@/store/slice/userSlice";
import LoadingComponent from "@/components/ui/standard/empty-page-loading";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function TemplateDetail({ templateId }: { templateId: string }) {
  const [templateInfo, setTemplateInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [path, setPath] = useState("");
  const router = useRouter();
  const { locale } = useI18n();
  const userInfo = useAppSelector((state: any) => state.user) || {};
  const getTemplateData = useCallback(() => {
    setLoading(true);
    reqGetTemplateById(templateId)
      .then((res: any) => {
        setTemplateInfo(res?.template || {});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [templateId]);
  useEffect(() => {
    if (templateId) {
      getTemplateData();
    }
  }, [getTemplateData, templateId]);

  function isAuth() {
    if (!userInfo || !userInfo.uuid) {
      message.error("Please log in first");
      dispatch(setUserState(UserState.logout) as any);
      setTimeout(() => {
        router.push(
          getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
        );
      }, 1000);
      return;
    }
  }
  function handleFavorite(templateId: string, isCollected: any, e: any) {
    isAuth();
    e.stopPropagation();
    reqOperateTemplate({
      templateId,
      operatorType: isCollected ? "cancelCollect" : "collect",
    }).then(() => {
      // getTemplateData();
      message.success(
        isCollected ? "Unfavorite successfully" : "Favorite successfully",
      );
      getTemplateData();
    });
  }
  const searchParams = new URLSearchParams(location.href || "");
  function getSharer() {
    const sharer = searchParams.get("sharer");
    if (sharer) {
      return sharer;
    }
    if (userInfo.uuid) {
      return userInfo.uuid;
    }
    return "";
  }
  function handleCopy(templateId: string, e: any) {
    isAuth();
    e.stopPropagation();
    reqOperateTemplate({
      templateId,
      operatorType: "share",
    }).then(() => {
      copyText(
        (typeof window !== "undefined" ? window.location.origin : "") +
          NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY +
          "?templateId=" +
          templateId +
          "&sharer=" +
          getSharer(),
      );
    });
  }
  function deployApplication(templateId: string) {
    router.push(
      getLocalizedPath(
        NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE +
          "?templateId=" +
          templateId +
          "&sharer=" +
          getSharer(),
        locale,
      ),
    );
  }
  return !loading ? (
    <div>
      <div className="flex flex-row items-center gap-2 mb-6">
        <div
          className="bg-[var(--white)] rounded-[4px] px-[6px] py-1 flex items-center justify-center
          hover:cursor-pointer hover:bg-[var(--gray-3)] inline-block font-body-medium text-[var(--black)]"
          onClick={() => {
            router.replace(
              getLocalizedPath(NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY, locale),
              {
                scroll: false,
              },
            );
          }}
        >
          {"Templates Library"}
        </div>
        <ChevronRight className="w-[14px] h-[14px] text-[var(--dark-2)]" />
        <div className="font-menu text-[var(--black)]">{templateInfo.name}</div>
      </div>
      <div className={styles.template_detail_container}>
        <div className="flex flex-row gap-4">
          <div className="w-[44px] h-[44px] flex items-center justify-center bg-[var(--gray-3)] shrink-0 rounded-[8px]">
            <img
              alt="icon"
              src={matchLogoForTemplate(
                templateInfo?.logo || "",
                templateInfo?.image || "",
              )}
              className="w-[32px] h-[32px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-[26px] items-center mb-2">
              <div className="font-h5 text-[var(--black)]">
                {templateInfo.name}
              </div>
              <div className="flex items-center justify-center gap-3">
                {["official"].includes(templateInfo.channel) && (
                  <Tooltip
                    title={`${templateInfo.isCollected ? "Unfavorite Template" : "Favorite Template"}`}
                  >
                    <div
                      className="w-6 h-6 shrink-0 flex items-center 
                  justify-center hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
                      onClick={(e: any) => {
                        handleFavorite(
                          templateInfo.Id,
                          templateInfo.isCollected,
                          e,
                        );
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
                {["official"].includes(templateInfo.channel) && (
                  <Tooltip title="Copy link">
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
            </div>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row items-center gap-2">
                <div
                  className="h-5 flex items-center justify-center px-[6px] bg-[var(--purple-6)] 
                  rounded-[4px] font-small-console text-[var(--purple-1)]"
                >
                  {"Official"}
                </div>
              </div>
              <div className="w-[1px] h-[14px] bg-[var(--gray-2)]"></div>
              <div className="font-body text-[var(--dark-2)]">
                {templateInfo.image}
              </div>
              <div className="w-[1px] h-[14px] bg-[var(--gray-2)]"></div>
              <div className="font-body text-[var(--dark-2)]">
                {`Updated time: ${sliceUTCString(new Date(Number(templateInfo.updatedAt) * 1000).toUTCString(), "day")}`}
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => deployApplication(templateInfo.Id)}
        >
          <span className="font-subtle-medium text-white mr-1">{"Deploy"}</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </Button>
      </div>
      <DetailsTab templateInfo={templateInfo} />
    </div>
  ) : (
    <LoadingComponent />
  );
}
