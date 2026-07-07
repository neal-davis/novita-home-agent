"use client";
import { useState, useEffect, useCallback } from "react";
import {
  reqGetTemplates,
  reqGetOfficialTemplates,
  reqOperateTemplate,
  reqGetTemplateById,
  reqAddTemplate,
} from "@/api/gpu-instance/templates";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import styles from "./section.module.scss";
import ContentSkeletonDeep from "@/app/gpus-console/components/ContentSkeletonDeep";
import DataEmpty from "../../components/DataEmpty";
import { useAppDispatch, useAppSelector } from "@/store";
import { message } from "@/components/ui/standard/notify";
import { copyText } from "@/lib/utils/utils";
import { NOVITA_URL } from "@/constants/urls";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { useLocation } from "react-use";
import { Button } from "@/components/ui/button";
import { LayoutGrid, PenTool, PlusIcon, ShieldCheck, Star } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import ItemList from "./itemList";
import AddTemplate from "../../components/addTemplate";
import { MyModal } from "../../templates/components/section";
import DeleteTemplate from "../../templates/components/deleteTemplate";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

function RecommendTemplate({
  copyTemplate,
  deleteTemplate,
  handleClick,
  handleCopy,
  handleFavorite,
  modifyTemplate,
  templateList,
  templateLoading,
}: {
  copyTemplate: (id: string, event: any) => void;
  deleteTemplate: (item: any) => void;
  handleClick: (id: string) => void;
  handleCopy: (id: string, event: any) => void;
  handleFavorite: (id: string, isCollected: any, event: any) => void;
  modifyTemplate: (id: string) => void;
  templateList: any[];
  templateLoading: boolean;
}) {
  const officialTemplates = (templateList || [])
    .filter((ele: any) => ["official"].includes(ele.channel))
    .slice(0, 6);

  return (
    <>
      <div
        style={{
          marginLeft: "3px",
          marginRight: "8px",
          marginTop: "var(--spacing-console-16)",
        }}
      >
        <DataEmpty
          title="No Results Found"
          description="Try searching for something else, or create your own template."
        />
      </div>
      {officialTemplates.length > 0 && (
        <div className="mt-6 mb-4">
          <div className="font-h6 text-[var(--black)] mb-4">
            🔥 Recommended for You
          </div>
          <div
            style={{
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {!templateLoading && (
              <ItemList
                deleteTemplate={deleteTemplate}
                modifyTemplate={modifyTemplate}
                copyTemplate={copyTemplate}
                items={officialTemplates}
                handleClick={handleClick}
                handleFavorite={handleFavorite}
                handleCopy={handleCopy}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Section() {
  const userInfo = useAppSelector((state) => state.user) || {};
  const { locale } = useI18n();
  const location = useLocation();
  const href: any = decodeURIComponent(location.href || "");
  let searchStr = "";
  if (href && href.includes("?")) {
    const tmpArr: any = href.split("?");
    if (tmpArr.length > 1) {
      searchStr = tmpArr[1];
    }
  }
  const searchMap = new URLSearchParams(searchStr);
  const categoryList: any = {
    "0": "All Templates",
    "1": "My Favorites",
    "2": "Official",
    "3": "Community",
  };
  const [params, setParams] = useState({
    // creators: "-1",
    name: searchMap.get("filterName") || "",
    channels: ["official"],
    isMyCommunity: true,
  });
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [path, setPath] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(pathname + encodeURIComponent(window.location.search));
    }
  }, [pathname]);
  function isAuth() {
    if (!userInfo || !userInfo.uuid) {
      const token: any = Cookies.get("token");
      if (typeof window !== "undefined") {
        if (token) {
          message.error("Login failure, please log in again");
        } else {
          message.error("Please log in first");
        }
      }
      dispatch(setUserState(UserState.logout) as any);
      setTimeout(() => {
        router.push(
          getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
        );
      }, 1000);
      return;
    }
  }
  const router = useRouter();
  const [favorite, setFavorite] = useState(
    categoryList[searchMap.get("favorite") as any]
      ? (searchMap.get("favorite") as any)
      : "0",
  );
  const [templateList, setTemplateList] = useState([]);
  const [privateTemplateList, setPrivateTemplateList] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(true);
  const getTemplateData = useCallback(() => {
    setTemplateLoading(true);
    // const func = userInfo.uuid ? reqGetTemplates : reqGetOfficialTemplates;
    reqGetOfficialTemplates({
      ...params,
      name: "",
    })
      .then((res: any) => {
        const allTemplates = res?.template || [];
        const sortedTemplates = allTemplates.sort((a: any, b: any) => {
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
        if (userInfo.uuid) {
          reqGetTemplates({
            channel: "private",
            creators: "",
            isMyCommunity: true,
            name: "",
          }).then((res: any) => {
            setPrivateTemplateList(res?.template || []);
          });
        } else {
          setPrivateTemplateList([]);
        }
        setTemplateLoading(false);
      })
      .catch(() => {
        setTemplateLoading(false);
      });
  }, [params, userInfo.uuid]);
  useEffect(() => {
    getTemplateData();
  }, [getTemplateData]);

  const handleTemplateSearch = useCallback(
    (value: string) => {
      setParams({ ...params, name: value });
    },
    [params],
  );

  function handleFavorite(templateId: string, isCollected: any, e: any) {
    isAuth();
    e.stopPropagation();
    analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_LIBRARY_FAVORITE, {
      template_id: templateId,
      action: isCollected ? "cancelCollect" : "collect",
    });
    reqOperateTemplate({
      templateId,
      operatorType: isCollected ? "cancelCollect" : "collect",
    }).then(() => {
      // getTemplateData();
      const tempList = [...templateList];
      const index = tempList.findIndex((item: any) => item.Id === templateId);
      if (index !== -1) {
        (tempList[index] as any).isCollected = !isCollected;
        setTemplateList([...tempList]);
      }
      message.success(
        isCollected ? "Unfavorite successfully" : "Favorite successfully",
      );
    });
  }
  function handleCopy(templateId: string, e: any) {
    isAuth();
    e.stopPropagation();
    analytics.trackClick(
      CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_LIBRARY_COPY_LINK,
      {
        template_id: templateId,
      },
    );
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
          userInfo.uuid,
      );
    });
  }
  function handleClick(templateId: string) {
    analytics.trackClick(
      CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_LIBRARY_GO_TO_DETAIL,
      {
        templateId,
      },
    );
    router.push(
      getLocalizedPath(
        `${NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY}?templateId=${templateId}`,
        locale,
      ),
    );
  }
  function copyTemplate(Id: string, e: any) {
    isAuth();
    e.stopPropagation();
    reqGetTemplateById(Id).then((res: any) => {
      const templateTmp = res?.template || { Id: "", name: "" };
      templateTmp.name = templateTmp.name + "(1)";
      delete templateTmp.enableApplication;
      delete templateTmp.enableApplicationInstance;
      delete templateTmp.enableApplicationServerless;
      delete templateTmp.instanceApplicationConfig;
      delete templateTmp.serverlessApplicationConfig;
      reqAddTemplate({ template: templateTmp }).then(() => {
        message.success("success");
        if (userInfo.uuid) {
          reqGetTemplates({
            channel: "private",
            creators: "",
            isMyCommunity: true,
            name: "",
          }).then((res: any) => {
            setPrivateTemplateList(res?.template || []);
          });
        } else {
          setPrivateTemplateList([]);
        }
      });
    });
  }
  const [operateInfo, setOperateInfo] = useState<{
    mode: "Create" | "Edit";
    addOpen: boolean;
    templateObj: object;
  }>({ mode: "Edit", addOpen: false, templateObj: {} });
  function modifyTemplate(Id: string) {
    reqGetTemplateById(Id).then((res: any) => {
      const templateTmp = res?.template || { Id: "" };
      if (templateTmp.Id) {
        setOperateInfo({
          mode: "Edit",
          addOpen: true,
          templateObj: templateTmp,
        });
      }
    });
  }
  function finishForm(mark: boolean) {
    if (mark) {
      message.success("success");
      if (userInfo.uuid) {
        reqGetTemplates({
          channel: "private",
          creators: "",
          isMyCommunity: true,
          name: "",
        }).then((res: any) => {
          setPrivateTemplateList(res?.template || []);
        });
      } else {
        setPrivateTemplateList([]);
      }
    }
    setOperateInfo({ ...operateInfo, addOpen: false, templateObj: {} });
  }
  function deleteTemplate(item: any) {
    setShowTerminateInfo({
      templateInfo: item,
      showModal: true,
    });
  }
  const [templateTitle, setTemplateTitle] = useState("");
  const [showTemplateList, setShowTemplateList] = useState<any[]>([]);
  useEffect(() => {
    const myCreationsTemplates = (privateTemplateList || []).filter(
      (ele: any) =>
        ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) > -1,
    );
    const myFavoritesTemplates = (templateList || []).filter(
      (ele: any) =>
        ele.isCollected &&
        ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) >
          -1 &&
        ele.isCollected,
    );
    const allTemplates = [
      ...(templateList || []),
      ...(privateTemplateList || []),
    ].filter(
      (ele: any) =>
        ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) > -1,
    );
    const officialTemplates = (templateList || []).filter(
      (ele: any) =>
        ele.channel === "official" &&
        ele.name.toLowerCase().indexOf((params.name || "").toLowerCase()) > -1,
    );
    switch (favorite) {
      case "-1":
        setShowTemplateList(myCreationsTemplates);
        setTemplateTitle("My Creations" + `(${myCreationsTemplates.length})`);
        break;
      case "1":
        setShowTemplateList(myFavoritesTemplates);
        setTemplateTitle("My Favorites" + `(${myFavoritesTemplates.length})`);
        break;
      case "0":
        setShowTemplateList(allTemplates);
        setTemplateTitle("All Templates" + `(${allTemplates.length})`);
        break;
      case "2":
        setShowTemplateList(officialTemplates);
        setTemplateTitle("Official" + `(${officialTemplates.length})`);
        break;
    }
  }, [favorite, params.name, privateTemplateList, templateList]);
  const [showTerminateInfo, setShowTerminateInfo] = useState({
    showModal: false,
    templateInfo: {},
  });
  function closeDeleteTemplateInfo(mark: any) {
    setShowTerminateInfo({ ...showTerminateInfo, showModal: false });
    if (mark) {
      if (userInfo.uuid) {
        reqGetTemplates({
          channel: "private",
          creators: "",
          isMyCommunity: true,
          name: "",
        }).then((res: any) => {
          setPrivateTemplateList(res?.template || []);
        });
      } else {
        setPrivateTemplateList([]);
      }
    }
  }
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div className="flex justify-between items-center gap-2 mb-4">
          <div>
            <div className="font-h5 text-[var(--black)] mt-2">
              Templates Library
            </div>
            <div className="text-subtle text-[var(--dark-2)]">
              Deploy pre-configured environments or create your own.
            </div>
          </div>
          <Button
            onClick={() => {
              isAuth();
              setOperateInfo({
                mode: "Create",
                addOpen: true,
                templateObj: {},
              });
            }}
            variant="default"
            size="lg"
          >
            <PlusIcon className="w-4 h-4 text-[var(--white)] mr-1" />
            <span className="font-subtle-medium">Create Template</span>
          </Button>
        </div>
        <div className="flex justify-between items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="px-3 h-8"
              size="lg"
              onClick={() => {
                setFavorite("0");
              }}
            >
              <LayoutGrid
                className={`w-4 h-4 
                ${favorite === "0" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"} mr-2`}
              />
              <span
                className={`font-subtle-medium ${favorite === "0" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"}`}
              >
                All Templates
              </span>
            </Button>
            <Button
              variant="ghost"
              className="px-3 h-8"
              size="lg"
              onClick={() => {
                setFavorite("2");
              }}
            >
              <ShieldCheck
                className={`w-4 h-4 
                ${favorite === "2" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"} mr-2`}
              />
              <span
                className={`font-subtle-medium ${favorite === "2" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"}`}
              >
                Official
              </span>
            </Button>
            <Button
              variant="ghost"
              className="px-3 h-8"
              size="lg"
              onClick={() => {
                if (!userInfo.uuid) {
                  message.error("Please log in first");
                  dispatch(setUserState(UserState.logout) as any);
                  setTimeout(() => {
                    router.push(
                      getLocalizedPath(
                        `${NOVITA_URL.USER_LOGIN}?redirect=${path}`,
                        locale,
                      ),
                    );
                  }, 1000);
                  return;
                }
                setFavorite("-1");
              }}
            >
              <PenTool
                className={`w-4 h-4 
                ${favorite === "-1" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"} mr-2`}
              />
              <span
                className={`font-subtle-medium ${favorite === "-1" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"}`}
              >
                My Creations
              </span>
            </Button>
            <Button
              variant="ghost"
              className="px-3 h-8"
              size="lg"
              onClick={() => {
                if (!userInfo.uuid) {
                  message.error("Please log in first");
                  dispatch(setUserState(UserState.logout) as any);
                  setTimeout(() => {
                    router.push(
                      getLocalizedPath(
                        `${NOVITA_URL.USER_LOGIN}?redirect=${path}`,
                        locale,
                      ),
                    );
                  }, 1000);
                  return;
                }
                setFavorite("1");
              }}
            >
              <Star
                className={`w-4 h-4 
                ${favorite === "1" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"} mr-2`}
              />
              <span
                className={`font-subtle-medium ${favorite === "1" ? "text-[var(--brand-1)]" : "text-[var(--dark-2)]"}`}
              >
                My Favorites
              </span>
            </Button>
          </div>
          <SearchInput
            className="w-[448px]"
            placeholder={"Search templates..."}
            value={params.name}
            onSearch={handleTemplateSearch}
          />
        </div>
        {templateLoading && (
          <ContentSkeletonDeep
            itemHeight={96}
            className={`${styles.skeleton}`}
          />
        )}
        {/* {!templateLoading &&
          (templateList || []).filter(
            (ele: any) =>
              (Number(favorite) === 0 ? true : ele.isCollected) &&
              ele.name
                .toLowerCase()
                .indexOf((params.name || "").toLowerCase()) > -1,
          ).length === 0 && (
            <>
              <RecommendTemplate
                copyTemplate={copyTemplate}
                deleteTemplate={deleteTemplate}
                handleClick={handleClick}
                handleCopy={handleCopy}
                handleFavorite={handleFavorite}
                modifyTemplate={modifyTemplate}
                templateList={templateList}
                templateLoading={templateLoading}
              />
            </>
          )} */}
        {showTemplateList.length > 0 ? (
          <div className="mt-6 mb-4">
            <div className="font-h6 text-[var(--black)] mb-4">
              {templateTitle}
            </div>
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {!templateLoading && (
                <ItemList
                  deleteTemplate={deleteTemplate}
                  modifyTemplate={modifyTemplate}
                  copyTemplate={copyTemplate}
                  items={showTemplateList}
                  handleClick={handleClick}
                  handleFavorite={handleFavorite}
                  handleCopy={handleCopy}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <RecommendTemplate
              copyTemplate={copyTemplate}
              deleteTemplate={deleteTemplate}
              handleClick={handleClick}
              handleCopy={handleCopy}
              handleFavorite={handleFavorite}
              modifyTemplate={modifyTemplate}
              templateList={templateList}
              templateLoading={templateLoading}
            />
          </>
        )}
      </div>
      {operateInfo.addOpen ? (
        <AddTemplate
          mode={operateInfo.mode}
          templateObj={operateInfo.templateObj}
          finishForm={finishForm}
        />
      ) : (
        ""
      )}
      {showTerminateInfo.showModal ? (
        <MyModal
          centered
          width={"auto"}
          style={{
            padding: "0",
            maxWidth: "608px",
            width: "auto !important",
          }}
          footer={null}
          open={showTerminateInfo.showModal}
          title={null}
          onCancel={() =>
            setShowTerminateInfo({ ...showTerminateInfo, showModal: false })
          }
        >
          <DeleteTemplate
            templateInfoObj={showTerminateInfo.templateInfo}
            finishForm={closeDeleteTemplateInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
    </div>
  );
}
