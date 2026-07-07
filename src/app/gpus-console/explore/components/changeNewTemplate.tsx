"use client";
import { useEffect, useState, useCallback } from "react";
import { message } from "@/components/ui/standard/notify";
import {
  reqGetTemplates,
  reqGetOfficialTemplates,
} from "@/api/gpu-instance/templates";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./changeNewTemplate.module.scss";
import { Button } from "@/components/ui/button";
import Modal from "@/app/components/Modal/Modal";
// import ContentSkeleton from "../../components/ContentSkeleton";
import { sliceUTCString } from "@/lib/utils/date";
import DataEmpty from "../../components/DataEmpty";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { usePathname, useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import React from "react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import TableSpinner from "@/components/ui/table";
import { SearchInput } from "./changeNewTemplateInput";
import ChangeNewTemplateOperations from "./changeNewTemplateOperations";
import ReadMe from "./readMe";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import Image from "next/image";
import type { KeyboardEvent } from "react";
import { useEncodedPath } from "./useEncodedPath";
const categoryList: any = {
  "0": "All Templates",
  "1": "My Favorites",
  "2": "Official",
  // "3": "Community",
  "4": "My Creations",
};

function runOnKeyboard(
  event: KeyboardEvent<HTMLElement>,
  callback: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  callback();
}

function RecommendTemplate({
  templateList,
  currentTemplate,
  templateLoading,
  refreshTemplateListFun,
  handleClick,
}: {
  templateList: any;
  currentTemplate: any;
  templateLoading: boolean;
  refreshTemplateListFun: (templateId: string, isCollected: any) => void;
  handleClick: (template: any) => void;
}) {
  return (
    <>
      <div
        style={{
          marginTop: "var(--spacing-console-16)",
        }}
      >
        <DataEmpty
          title="No results found"
          description="Try searching for something else, or create your own template."
        />
      </div>
      {(templateList || []).filter((ele: any) =>
        ["official"].includes(ele.channel),
      ).length > 0 && (
        <div className="mt-[26px]" key="recommended">
          <div className="font-h6 text-[var(--black)]">
            🔥 Recommended for You
          </div>
          <div className={styles.templateListContainer}>
            {!templateLoading &&
              (templateList || [])
                .filter((ele: any) => ["official"].includes(ele.channel))
                .slice(0, 6)
                .map((item: any) => (
                  <TemplateSelect
                    refreshTemplateListFun={refreshTemplateListFun}
                    selected={currentTemplate?.Id === item.Id}
                    selectFn={handleClick}
                    templateInfo={item}
                    key={item.Id}
                  />
                ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ChangeTemplateModal({
  open,
  onClose,
  onConfirm,
  currentTemplate,
}: {
  open: boolean;
  onClose?: () => void;
  onConfirm?: (params: any) => void;
  currentTemplate?: any;
}) {
  const userInfo = useAppSelector((state) => state.user) || {};
  const [params, setParams] = useState({
    name: "",
    channels: ["official", "private"],
  });
  const [favorite, setFavorite] = useState("0");
  const [templateList, setTemplateList] = useState([]);
  const [templateListPrivate, setTemplateListPrivate] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateLoadingPrivate, setTemplateLoadingPrivate] = useState(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const path = useEncodedPath(pathname);
  const router = useRouter();
  const { locale } = useI18n();
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
  const getTemplateData = useCallback(() => {
    const func = userInfo.uuid ? reqGetTemplates : reqGetOfficialTemplates;
    if (userInfo.uuid) {
      setTemplateLoadingPrivate(true);
      reqGetTemplates({
        ...params,
        name: "",
        channels: ["private"],
        creators: "",
        isMyCommunity: true,
      })
        .then((res: any) => {
          setTemplateListPrivate(res?.template || []);
          setTemplateLoading(true);
          func({
            ...params,
            name: "",
            channels: ["official"],
            isMyCommunity: true,
          })
            .then((res: any) => {
              const allTemplates = res?.template || [];
              const sortedTemplates = allTemplates
                .filter((item: any) => item.image)
                .sort((a: any, b: any) => {
                  if (a.channel === "official" && b.channel !== "official") {
                    return -1;
                  }
                  if (a.channel !== "official" && b.channel === "official") {
                    return 1;
                  }
                  if (
                    a.channel === b.channel &&
                    Number(a.sort || 0) !== Number(b.sort || 0)
                  ) {
                    return Number(b.sort || 0) - Number(a.sort || 0);
                  }
                  if (a.collectNum === b.collectNum) {
                    return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
                  } else {
                    return (
                      Number(b.collectNum || 0) - Number(a.collectNum || 0)
                    );
                  }
                });
              setTemplateList(sortedTemplates);
            })
            .finally(() => {
              setTemplateLoading(false);
            });
        })
        .finally(() => {
          setTemplateLoadingPrivate(false);
        });
    } else {
      setTemplateLoading(true);
      func({
        ...params,
        name: "",
        channels: ["official"],
        isMyCommunity: true,
      })
        .then((res: any) => {
          const allTemplates = res?.template || [];
          const sortedTemplates = allTemplates
            .filter((item: any) => item.image)
            .sort((a: any, b: any) => {
              if (a.channel === "official" && b.channel !== "official") {
                return -1;
              }
              if (a.channel !== "official" && b.channel === "official") {
                return 1;
              }
              if (
                a.channel === b.channel &&
                Number(a.sort || 0) !== Number(b.sort || 0)
              ) {
                return Number(b.sort || 0) - Number(a.sort || 0);
              }
              if (a.collectNum === b.collectNum) {
                return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
              } else {
                return Number(b.collectNum || 0) - Number(a.collectNum || 0);
              }
            });
          setTemplateList(sortedTemplates);
        })
        .finally(() => {
          setTemplateListPrivate([]);
          setTemplateLoading(false);
        });
    }
  }, [params, userInfo.uuid]);
  useEffect(() => {
    getTemplateData();
  }, [getTemplateData]);

  function inputChangeParams(item: any, e: any) {
    setParams({ ...params, [item]: e.target.value });
  }

  const handleTemplateSearch = useCallback(
    (value: string) => {
      setParams({ ...params, name: value });
    },
    [params],
  );

  function handleClick(template: any) {
    onConfirm && onConfirm(template);
  }
  function refreshTemplateListFun(templateId: string, isCollected: any) {
    const tempList = [...templateList];
    const index = tempList.findIndex((item: any) => item.Id === templateId);
    if (index !== -1) {
      (tempList[index] as any).isCollected = !isCollected;
      setTemplateList([...tempList]);
    }
    const tempListPrivate = [...templateListPrivate];
    const indexPrivate = tempListPrivate.findIndex(
      (item: any) => item.channel === "community" && item.Id === templateId,
    );
    if (indexPrivate !== -1) {
      (tempListPrivate[indexPrivate] as any).isCollected = !isCollected;
      setTemplateListPrivate([...tempListPrivate]);
    }
  }
  useEffect(() => {
    if (!open) return;
  }, [open]);
  function selectTemplateCategory(value: string) {
    if (value === "1" || value === "4") {
      isAuth();
    }
    setFavorite(value);
    analytics.trackClick(
      CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_CHANGE_TEMPLATE_FILTER,
      {
        templateType: categoryList[value] || "All Templates",
      },
    );
  }
  function getTemplateDataFun() {
    let tempList: any[] = [];
    let title = "";
    switch (favorite) {
      case "0":
        tempList = (templateList || [])
          .concat(templateListPrivate || [])
          .filter(
            (ele: any) =>
              ele.name
                .toLowerCase()
                .indexOf((params.name || "").toLowerCase()) > -1,
          );
        break;
      case "1":
        tempList = (templateList || [])
          .concat(
            (templateListPrivate || []).filter(
              (item: any) => item.channel === "community",
            ),
          )
          .filter(
            (ele: any) =>
              ele.isCollected &&
              ele.name
                .toLowerCase()
                .indexOf((params.name || "").toLowerCase()) > -1,
          );
        break;
      case "2":
        tempList = (templateList || []).filter(
          (ele: any) =>
            ele.channel === "official" &&
            ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) >
              -1,
        );
        break;
      case "3":
        tempList = (templateList || [])
          .concat(
            (templateListPrivate || []).filter(
              (item: any) => item.channel === "community",
            ),
          )
          .filter(
            (ele: any) =>
              ele.channel === "community" &&
              ele.name
                .toLowerCase()
                .indexOf((params.name || "").toLowerCase()) > -1,
          );
        break;
      case "4":
        tempList = (templateListPrivate || []).filter(
          (ele: any) =>
            ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) >
            -1,
        );
        break;
      default:
        break;
    }
    title = categoryList[favorite] || "All Templates";
    if (tempList.length > 0) {
      return (
        <div className="mt-[26px]" key={favorite}>
          <div className="font-h6 text-[var(--black)]">
            {`${title} (${tempList.length})`}
          </div>
          <div className={styles.templateListContainer}>
            {tempList.map((item: any) => (
              <TemplateSelect
                refreshTemplateListFun={refreshTemplateListFun}
                selected={currentTemplate?.Id === item.Id}
                selectFn={handleClick}
                templateInfo={item}
                key={item.Id}
              />
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <RecommendTemplate
          templateList={templateList}
          currentTemplate={currentTemplate || {}}
          templateLoading={templateLoading}
          refreshTemplateListFun={refreshTemplateListFun}
          handleClick={handleClick}
        />
      );
    }
  }
  const [showReadMe, setShowReadMe] = useState({
    showModal: false,
    readMe: "",
  });
  function closeReadMe() {
    setShowReadMe({ showModal: false, readMe: "" });
  }
  return (
    <>
      <React.Fragment>
        <Modal
          {...{
            width: "1184px",
            footer: null,
            open: open,
            title: null,
            onCancel: onClose,
            className: styles.templateModal,
            classNames: {
              body: styles.templateModalBody,
            },
            styles: {
              content: {
                padding: 0,
                borderRadius: "12px",
                background: "linear-gradient(180deg, #EFFCF5 0%, #FFF 22.14%)",
                height: "min(820px, calc(100vh - 32px))",
                minHeight: "570px",
              },
            },
          }}
        >
          <div className={styles.content}>
            <h2
              id="customized-dialog-title"
              className=""
              style={{
                fontSize: "16px",
                lineHeight: "16px",
                fontWeight: "bold",
                color: "var(--black)",
              }}
            ></h2>
          </div>
          <div
            className={styles.dialogContent}
            style={{
              color: "var(--black)",
              marginTop: "4px !important",
            }}
          >
            <div
              className={`${styles.templateHeader} flex items-center justify-center flex-col gap-[26px]`}
            >
              <div className="w-[673px] flex flex-col gap-[16px]">
                {currentTemplate?.Id && (
                  <div className="py-1 flex items-center justify-center gap-2 max-w-full">
                    {/* current template */}
                    <span
                      className="flex items-center justify-center px-[6px] py-[5px] bg-[var(--gray-3)]
                    font-small text-[var(--black)] rounded-[4px] flex-shrink-0"
                    >
                      {"Current Template"}
                    </span>
                    <div className="inline-flex items-center justify-start gap-1 min-w-0 max-w-full">
                      <Image
                        alt=""
                        className="w-5 h-5 flex-shrink-0"
                        width={20}
                        height={20}
                        src={matchLogoForTemplate(
                          currentTemplate?.logo,
                          currentTemplate?.image,
                        )}
                      />
                      <span className="font-small-medium text-[var(--black)] flex-shrink-0">
                        {currentTemplate?.name}
                      </span>
                      <Button
                        type="button"
                        variant="noborderghost"
                        size="icon"
                        aria-label="View current template README"
                        onClick={() =>
                          setShowReadMe({
                            showModal: true,
                            readMe: currentTemplate?.readme || "",
                          })
                        }
                        className="iconfont icon-badge-info text-[var(--dark-2)] text-[13px] cursor-pointer hover:opacity-80 flex-shrink-0 bg-transparent border-0 p-0"
                      ></Button>
                      <span className="w-[1px] h-[12px] bg-[var(--gray-1)] mx-2 flex-shrink-0"></span>
                      <span
                        title={currentTemplate?.image || ""}
                        className="font-small text-[var(--dark-2)] truncate min-w-0"
                      >
                        {currentTemplate?.image}
                      </span>
                    </div>
                  </div>
                )}
                <div className="w-full">
                  {/* search input */}
                  <SearchInput
                    placeholder="Search Template"
                    containerClassName={styles.searchInput}
                    value={params.name}
                    onSearch={handleTemplateSearch}
                  />
                </div>
                <div className={styles.categoryItemContainer}>
                  {/* category select */}
                  {[
                    {
                      label: "All Templates",
                      value: "0",
                      icon: "icon-grid-2x2",
                    },
                    { label: "Official", value: "2", icon: "icon-badge-check" },
                    {
                      label: "My Creations",
                      value: "4",
                      icon: "icon-square-pen",
                    },
                    { label: "My Favorites", value: "1", icon: "icon-star" },
                  ].map((item: any) => (
                    <Button
                      type="button"
                      variant="noborderghost"
                      className={`${styles.categoryItem} ${favorite === item.value ? styles.categoryItemActive : ""}`}
                      key={item.value}
                      onClick={() => selectTemplateCategory(item.value)}
                    >
                      <span
                        className={`iconfont ${item.icon} text-[var(--dark-1)] text-[16px]`}
                      ></span>
                      <span className="font-small-console text-[var(--black)]">
                        {item.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.templateListScroll}>
              <div
                className={styles.section}
                style={{ marginBottom: "0px", paddingBottom: "0px" }}
              >
                {(templateLoading || templateLoadingPrivate) && (
                  <div className="min-h-[480px] relative">
                    <TableSpinner />
                  </div>
                )}
                {!templateLoading &&
                  !templateLoadingPrivate &&
                  getTemplateDataFun()}
              </div>
            </div>
          </div>
        </Modal>
      </React.Fragment>
      {showReadMe.showModal && (
        <React.Fragment>
          <Modal
            width="608px"
            footer={null}
            open={open}
            title={null}
            onCancel={() => closeReadMe()}
            className={styles.templateModal}
            styles={{ content: { padding: 0 } }}
          >
            <ReadMe
              finishForm={() => closeReadMe()}
              readMe={showReadMe?.readMe || ""}
            />
          </Modal>
        </React.Fragment>
      )}
    </>
  );
}
export const TemplateSelect = ({
  templateInfo,
  selected,
  selectFn,
  refreshTemplateListFun,
}: {
  templateInfo: any;
  selected: boolean;
  selectFn: (templateInfo: any) => void;
  refreshTemplateListFun: (templateId: string, isCollected: any) => void;
}) => {
  return (
    // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- Template card includes nested template action controls, so it cannot be a native button.
    <div
      role="button"
      tabIndex={0}
      onClick={() => selectFn(templateInfo)}
      onKeyDown={(event) => runOnKeyboard(event, () => selectFn(templateInfo))}
      style={{
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
      className={`w-full p-4 flex flex-col gap-2 items-start cursor-pointer justify-center rounded-[6px] 
     border ${selected ? "bg-[var(--gray-3)] !border-[var(--dark-1)]" : "bg-[var(--white)] !border-[var(--gray-2)] hover:!border-[var(--dark-1)]"}`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between gap-[2px] mb-[2px]">
          <Image
            src={matchLogoForTemplate(templateInfo.logo, templateInfo.image)}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6"
          />
          {["official", "community"].includes(templateInfo.channel) && (
            <ChangeNewTemplateOperations
              templateInfo={templateInfo}
              refreshTemplateListFun={refreshTemplateListFun}
            />
          )}
        </div>
        <div
          className="font-body-medium text-[var(--dark-1)] whitespace-nowrap text-ellipsis overflow-hidden text-left"
          title={templateInfo.name}
        >
          {templateInfo.name}
        </div>
      </div>
      <div className="h-[1px] border-t border-[var(--dark-4)] border-dashed w-full"></div>
      <div className="w-full flex flex-col justify-start gap-[2px]">
        <div
          className="font-small text-[var(--black)] whitespace-nowrap text-ellipsis overflow-hidden text-left"
          title={templateInfo.image}
        >
          {templateInfo.image}
        </div>
        <div className="font-small text-[var(--dark-3-1)] flex items-center justify-start">
          <div>Updated time:</div>
          <div>
            {sliceUTCString(
              new Date(Number(templateInfo.updatedAt) * 1000).toUTCString(),
              "minute",
            )}
          </div>
        </div>
      </div>
      <div className="mt-[8px] w-full flex items-center justify-start gap-2">
        {templateInfo.extra?.tags?.includes("NEW") && (
          <div className="font-small-console text-[var(--white)] px-[6px] py-[3px] inline-flex items-center justify-center rounded-[4px] bg-[var(--brand-1)]">
            New
          </div>
        )}
        {templateInfo.channel && (
          <div
            className={`font-small-console 
            ${
              templateInfo.channel === "official"
                ? "text-[var(--purple-1)] bg-[var(--purple-6)]"
                : "text-[var(--yellow-1)] bg-[var(--yellow-7)]"
            }
            px-[6px] py-[3px] inline-flex items-center justify-center rounded-[4px]`}
          >
            {templateInfo.channel?.charAt(0).toUpperCase() +
              templateInfo.channel?.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};
