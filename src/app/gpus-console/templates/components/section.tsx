"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { message } from "@/components/ui/standard/notify";
import {
  reqGetTemplates,
  reqGetTemplateById,
  reqAddTemplate,
} from "@/api/gpu-instance/templates";
import AddTemplate from "@/app/gpus-console/components/addTemplate";
import styles from "./section.module.scss";
import DeleteTemplate from "./deleteTemplate";
import ContentSkeleton from "@/app/gpus-console/components/ContentSkeleton";
import DataEmpty from "../../components/DataEmpty";
import { sliceUTCString } from "@/lib/utils/date";
import { useAppSelector } from "@/store";
import TeamMemberSelector from "@/app/components/TeamMemberSelector";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import {
  MyPagination,
  MyTablePagination,
  PaginationItem,
} from "../../components/myPagination";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import Modal from "@/app/components/Modal/Modal";

export const MyModal = Modal;
export default function Section() {
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const members = useMemo(() => teamMembers || [], [teamMembers]);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [params, setParams] = useState({
    pageNum: 1,
    pageSize: 12,
    name: "",
    channels: ["private"],
    creators: "-1",
    isMyCommunity: true,
  });
  const [templateList, setTemplateList] = useState({ template: [], total: 0 });
  const [templateLoading, setTemplateLoading] = useState(true);
  const [operateInfo, setOperateInfo] = useState<{
    mode: "Create" | "Edit";
    addOpen: boolean;
    templateObj: object;
  }>({ mode: "Create", addOpen: false, templateObj: {} });
  const [showTerminateInfo, setShowTerminateInfo] = useState({
    showModal: false,
    templateInfo: {},
  });
  const getTemplateData = useCallback(
    (pageNum?: any, pageSize?: any, creators?: string, paramObj?: any) => {
      setTemplateLoading(true);
      let menberIdArr = [];
      if (creators && creators !== "-1") {
        const currentMember = members.find(
          (item: any) => item.memberId === creators,
        );
        if (currentMember) {
          menberIdArr = members
            .filter((item: any) => item.userId === currentMember.userId)
            .map((ele: any) => ele.memberId);
        }
      }
      reqGetTemplates({
        ...params,
        ...paramObj,
        pageNum: !isNaN(Number(pageNum)) ? pageNum : params.pageNum,
        pageSize: !isNaN(Number(pageSize)) ? pageSize : params.pageSize,
        creators: creators === "-1" ? "" : menberIdArr.toString(),
      })
        .then((res: any) => {
          setTemplateList(res || { template: [], total: 0 });
          // setParams({
          //   ...params,
          //   pageNum: isNaN(Number(pageNum)) ? params.pageNum : pageNum,
          //   pageSize: isNaN(Number(pageSize)) ? params.pageSize : pageSize,
          //   creators: creators || params.creators,
          // });
          setTemplateLoading(false);
        })
        .catch(() => {
          setTemplateLoading(false);
        });
    },
    [members, params],
  );
  useEffect(() => {
    getTemplateData();
  }, [getTemplateData]);

  function closeDeleteTemplateInfo(mark: any) {
    setShowTerminateInfo({ ...showTerminateInfo, showModal: false });
    if (mark) {
      getTemplateData();
    }
  }
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
  function copyTemplate(Id: string) {
    reqGetTemplateById(Id).then((res: any) => {
      const templateTmp = res?.template || { Id: "", name: "" };
      // delete templateTmp.Id;
      // delete templateTmp.createTime;
      // delete templateTmp.user;
      // delete templateTmp.logo;
      // delete templateTmp.volumes;
      templateTmp.name = templateTmp.name + "(1)";
      reqAddTemplate({ template: templateTmp }).then(() => {
        message.success("success");
        getTemplateData();
      });
    });
  }
  function finishForm(mark: boolean) {
    if (mark) {
      message.success("success");
      getTemplateData();
    }
    setOperateInfo({ ...operateInfo, addOpen: false, templateObj: {} });
  }
  function getCreator(creator: any, uuid: any) {
    const targetItem = members.find((item: any) => item.memberId === creator);
    if (targetItem) {
      return targetItem.alias
        ? `${targetItem.email} (${targetItem.alias})`
        : targetItem.email;
    } else {
      const newTargetItem = members.find((item: any) => item.userId === uuid);
      if (newTargetItem) {
        return newTargetItem.alias
          ? `${newTargetItem.email} (${newTargetItem.alias})`
          : newTargetItem.email;
      } else {
        return "";
      }
    }
  }
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setParams({
      ...params,
      pageNum: 1,
      pageSize: parseInt(event.target.value, 10),
    });
    getTemplateData(1, parseInt(event.target.value, 10));
  };
  const changePage = (event: any, page: number) => {
    setParams({ ...params, pageNum: page });
    getTemplateData(page);
  };

  const handleTemplateSearch = useCallback(
    (value: string) => {
      setParams({
        ...params,
        name: value,
        pageNum: 1,
      });
      getTemplateData(1, params.pageSize, params.creators, {
        name: value,
      });
      analytics.trackClick(
        CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATES_SEARCH_TEMPLATE,
      );
    },
    [getTemplateData, params],
  );

  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div className="flex justify-between">
          <div className={styles.searchArea}>
            <Button
              className={styles.addBtn}
              onClick={() =>
                setOperateInfo({
                  ...operateInfo,
                  mode: "Create",
                  addOpen: true,
                  templateObj: {},
                })
              }
              variant="outline"
            >
              <span className={styles.addBtnTxt}>{"+ New Template"}</span>
            </Button>
            <span className={styles.filter}>
              {currentTeam && (
                <div className="flex flex-col gap-1">
                  <TeamMemberSelector
                    className={styles.topSelectSearch}
                    onSelect={(member: any) => {
                      setParams({
                        ...params,
                        pageNum: 1,
                        creators: member?.ids?.length ? member.ids[0] : "-1",
                      });
                      getTemplateData(
                        1,
                        params.pageSize,
                        member?.ids?.length ? member.ids[0] : "-1",
                      );
                      analytics.trackClick(
                        CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATES_SELECTED_MEMBER,
                      );
                    }}
                  />
                </div>
              )}
              <SearchInput
                className="h-8 w-[234px]"
                placeholder="Template Name Filter"
                value={params.name}
                onSearch={handleTemplateSearch}
              />
            </span>
          </div>
        </div>
        {templateLoading && (
          <ContentSkeleton className={`${styles.skeleton}`} />
        )}
        {!templateLoading && templateList?.template?.length === 0 && (
          <div className={styles.emptyState}>
            <DataEmpty />
          </div>
        )}
        <div className={styles.cardList}>
          {!templateLoading &&
            templateList &&
            templateList?.template?.length > 0 &&
            templateList?.template?.map((item: any, index: number) => (
              <div key={index} className={styles.cardFlexContainer}>
                <div
                  className={`${styles.cardFlex} ${
                    currentTeam
                      ? styles.cardFlexCompact
                      : styles.cardFlexDefault
                  }`}
                >
                  <div className={styles.channel}>
                    {item.channel === "private"
                      ? "Private"
                      : item.isUsed
                        ? "Community"
                        : "Flagged"}
                  </div>
                  <span className={styles.logoWrap}>
                    <img
                      alt=""
                      className={styles.logo}
                      src={matchLogoForTemplate(item.logo, item.image)}
                    />
                  </span>
                  <span className={styles.cardMainInfo}>
                    <div className="flex items-center gap-2 mb-[6px]">
                      <div title={item.name} className={styles.name}>
                        {item.name}
                      </div>
                    </div>
                    <div className={styles.id}>ID: {item.Id}</div>
                    <div className={styles.image}>{item.image}</div>
                    <Tooltip placement="bottom" title={item.startCommand}>
                      <div className={styles.startCommand}>
                        {item.startCommand}
                      </div>
                    </Tooltip>
                  </span>
                  <span className={styles.cardActions}>
                    <Button
                      className={`${styles.baseBtn} ${styles.cardActionBtn}`}
                      onClick={() => modifyTemplate(item.Id)}
                    >
                      {/* <img alt="" src="/gpu-instance/templates/icon-edit.svg" /> */}
                      <span
                        className={`iconfont icon-pencil-line ${styles.cardIcon}`}
                      />
                    </Button>
                    <Button
                      className={`${styles.baseBtn} ${styles.cardActionBtn}`}
                      onClick={() =>
                        setShowTerminateInfo({
                          templateInfo: item,
                          showModal: true,
                        })
                      }
                    >
                      {/* <img alt="" src="/gpu-instance/templates/icon-delete.svg" /> */}
                      <span
                        className={`iconfont icon-delete ${styles.cardIcon}`}
                      />
                    </Button>
                    <Button
                      className={styles.baseBtn}
                      id={CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATES_COPY_TEMPLATE}
                      onClick={() => copyTemplate(item.Id)}
                    >
                      {/* <img src="/gpu-instance/templates/icon-copy.svg" /> */}
                      <span
                        className={`iconfont icon-copy ${styles.cardIcon}`}
                      />
                    </Button>
                  </span>
                </div>
                {currentTeam && (
                  <div className={styles.creatorPanel}>
                    <div className={styles.creatorDivider}></div>
                    <div
                      className={`${styles.creatorInfo} ${styles.creatorInfoInset}`}
                    >
                      {"Creator"}: {getCreator(item.creator, item.uuid)}
                      <br />
                      {"Create Time"}:{" "}
                      {sliceUTCString(
                        new Date(Number(item.createdAt) * 1000).toUTCString(),
                        "second",
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              width="608px"
              footer={null}
              open={showTerminateInfo.showModal}
              title={null}
              onCancel={() =>
                setShowTerminateInfo({ ...showTerminateInfo, showModal: false })
              }
              styles={{
                content: {
                  padding: 0,
                },
              }}
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
        {!templateLoading && templateList.total > 0 ? (
          <div className={`${styles.pagination} mb-8`}>
            <MyTablePagination
              {...{
                count: 0,
                onPageChange: () => {},
                page: 1,
                rowsPerPageOptions: [10, 12, 25, 50, 100],
                className: styles.tablePagination,
                rowsPerPage: params.pageSize,
                onRowsPerPageChange: handleChangeRowsPerPage,
                labelRowsPerPage: "Rows per page:",
              }}
            />
            <MyPagination
              className={styles.paginationInner}
              page={params.pageNum}
              count={
                Math.floor(Number(templateList.total / params.pageSize)) +
                (Math.round(templateList.total % params.pageSize) === 0 ? 0 : 1)
              }
              // count={2}
              onChange={changePage}
              renderItem={(item: any) => {
                return <PaginationItem {...item} />;
              }}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
