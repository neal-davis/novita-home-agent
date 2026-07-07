"use client";
import styles from "./section.module.scss";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as AButton } from "@/components/ui/standard/legacy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "@/app/components/Modal/Modal";
import AddNetworkVolume from "./addNetworkVolume";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import DeleteStorage from "./deleteStorage";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import DataEmpty from "../../components/DataEmpty";
import ContentSkeleton from "@/app/gpus-console/components/ContentSkeleton";
import { sliceUTCString } from "@/lib/utils/date";
import { useAppSelector } from "@/store";
import TeamMemberSelector from "@/app/components/TeamMemberSelector";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const STORAGE_PAGE_SIZE_KEY = "storage_pageSize";
const DEFAULT_PAGE_SIZE = 10;
const STORAGE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getStoredStoragePageSize() {
  if (typeof window === "undefined") {
    return DEFAULT_PAGE_SIZE;
  }

  const pageSize = Number(
    window.localStorage.getItem(STORAGE_PAGE_SIZE_KEY) || DEFAULT_PAGE_SIZE,
  );

  return STORAGE_PAGE_SIZE_OPTIONS.includes(pageSize)
    ? pageSize
    : DEFAULT_PAGE_SIZE;
}

export default function Section() {
  const { locale } = useI18n();
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const members = useMemo(() => teamMembers || [], [teamMembers]);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [operStorageInfo, setOperStorageInfo] = useState({
    mode: "Add",
    open: false,
    info: {},
  });
  const hasLoadedStoredPageSize = useRef(false);
  const [isStoredPageSizeReady, setIsStoredPageSizeReady] = useState(false);
  const [params, setParams] = useState({
    pageNo: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    storageName: "",
    creators: "-1",
  });
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  const [resultTable, setResultTable] = useState({ data: [], total: 0 });
  const [tableLoading, setTableLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<any>([]);
  const getTableData = useCallback(
    (pageNo?: any, pageSize?: any, creators?: string, paramObj?: any) => {
      setTableLoading(true);
      const latestParams = paramsRef.current;
      let menberIdArr = [];
      if (creators !== "-1") {
        const currentMember = members.find(
          (item: any) => item.memberId === creators,
        );
        if (currentMember) {
          menberIdArr = members
            .filter((item: any) => item.userId === currentMember.userId)
            .map((ele: any) => ele.memberId);
        }
      }
      reqGetStorage({
        ...latestParams,
        ...paramObj,
        pageNo: !isNaN(Number(pageNo)) ? pageNo : latestParams.pageNo,
        pageSize: !isNaN(Number(pageSize)) ? pageSize : latestParams.pageSize,
        creators: creators === "-1" ? "" : menberIdArr.toString(),
      })
        .then((res: any) => {
          const datas = res.data || [];
          setResultTable({ data: datas, total: Number(res.total) });
          const opentags = [];
          for (let i = 0; i < datas.length; i++) {
            opentags.push(false);
          }
          setDropdownOpen(opentags);
          setParams((prev) => ({
            ...prev,
            pageNo: isNaN(Number(pageNo)) ? prev.pageNo : pageNo,
            pageSize: isNaN(Number(pageSize)) ? prev.pageSize : pageSize,
            creators: creators || prev.creators,
          }));
          setTableLoading(false);
        })
        .catch(() => {
          setTableLoading(false);
        });
    },
    [members],
  );
  useEffect(() => {
    if (hasLoadedStoredPageSize.current) {
      return;
    }

    hasLoadedStoredPageSize.current = true;
    const pageSize = getStoredStoragePageSize();
    setParams((prevParams) =>
      pageSize === prevParams.pageSize
        ? prevParams
        : {
            ...prevParams,
            pageNo: 1,
            pageSize,
          },
    );
    setIsStoredPageSizeReady(true);
  }, []);

  useEffect(() => {
    if (!isStoredPageSizeReady) {
      return;
    }

    getTableData(1);
  }, [getTableData, isStoredPageSizeReady]);

  function menuClickHandler(index: any, isOpen: boolean) {
    const openTags = [...dropdownOpen];
    openTags[index] = isOpen;
    setDropdownOpen(openTags);
  }
  function finishOper(operMark: any) {
    if (!operMark) {
      setOperStorageInfo({ ...operStorageInfo, open: false });
    } else {
      message.success("success");
      setOperStorageInfo({ ...operStorageInfo, open: false });
      getTableData(1);
    }
  }
  const [showDeleteInfo, setShowDeleteInfo] = useState({
    showModal: false,
    storageId: "",
    storageName: "",
  });
  function closeDeleteInfo(refresh: boolean) {
    setShowDeleteInfo({ ...showDeleteInfo, showModal: false });
    if (refresh) {
      getTableData(1);
    }
  }
  function toOtherPage(url: string) {
    if ("undefined" != typeof window) {
      window.location.href = getLocalizedPath(url, locale);
      // window.location.reload();
    }
  }
  function deleteStorage(index: any, storageId: any, storageName: any) {
    menuClickHandler(index, false);
    setShowDeleteInfo({
      ...showDeleteInfo,
      storageId,
      storageName,
      showModal: true,
    });
  }
  function editStorage(index: any, storageInfo: any) {
    setOperStorageInfo({
      ...operStorageInfo,
      mode: "Edit",
      info: storageInfo,
      open: true,
    });
    menuClickHandler(index, false);
  }
  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    window.localStorage.setItem(STORAGE_PAGE_SIZE_KEY, event.target.value);
    setParams({ ...params, pageSize: parseInt(event.target.value, 10) });
    getTableData(1, parseInt(event.target.value, 10));
  }
  function changePage(event: any, page: number) {
    setParams({ ...params, pageNo: page });
    getTableData(page);
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

  const handleStorageSearch = useCallback(
    (value: string) => {
      setParams({ ...params, storageName: value, pageNo: 1 });
      getTableData(1, params.pageSize, params.creators, {
        storageName: value,
      });
      analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_SEARCH_STORAGE);
    },
    [getTableData, params],
  );

  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div className={styles.noticeWrap}>
          <div className="flex justify-between gap-1 px-3 py-2 rounded-[var(--radius-input)] bg-common-gray-2">
            <div className="w-4 shrink-0 mt-[-2px]">
              <span className="iconfont icon-badge-alert text-common-dark-2 text-[16px]"></span>
            </div>
            <div className="flex flex-col gap-2 grow">
              <div className="text-common-dark-2 font-small-console">
                <div>
                  Please note that if your account is in arrears and no
                  instances are running, your Network Volume will be{" "}
                  {
                    <section className={`inline ${styles.noticeStrong}`}>
                      released 3 days later.
                    </section>
                  }
                </div>
                <div>
                  Network Volume is provided in the pursuit of running tasks
                  using its GPUs and is{" "}
                  {
                    <section className={`inline ${styles.noticeStrong}`}>
                      not meant to be a long-term backup solution.
                    </section>
                  }{" "}
                  It is highly advisable to continually back up anything you
                  want to save offsite locally or to a cloud provider.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.searchArea}>
          <Button
            className={styles.addBtn}
            onClick={() =>
              setOperStorageInfo({
                ...operStorageInfo,
                info: {},
                mode: "Add",
                open: true,
              })
            }
            variant="outline"
          >
            <span className={styles.addBtnTxt}>{"+ New Network Volume"}</span>
          </Button>
          <span className={styles.filter}>
            {currentTeam && (
              <div className="flex flex-col gap-1">
                <TeamMemberSelector
                  className={styles.topSelectSearch}
                  onSelect={(member: any) => {
                    setParams({
                      ...params,
                      pageNo: 1,
                      creators: member?.ids?.length ? member.ids[0] : "-1",
                    });
                    getTableData(
                      1,
                      params.pageSize,
                      member?.ids?.length ? member.ids[0] : "-1",
                    );
                    analytics.trackClick(
                      CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_SELECTED_MEMBER,
                    );
                  }}
                />
              </div>
            )}
            <SearchInput
              className="h-8 w-[234px]"
              placeholder="Storage Name/ID Filter"
              value={params.storageName}
              onSearch={handleStorageSearch}
            />
          </span>
        </div>
        <div className={styles.cardList}>
          {!tableLoading && resultTable.total > 0 && (
            <div className={styles.cardListInner}>
              {resultTable.data.map((item: any, index: any) => (
                <div key={index} className={`${styles.cardFlex}`}>
                  <div>
                    <div className={`${styles.cardFlexAddTop}`}>
                      <span className={styles.logoWrap}>
                        <img
                          alt=""
                          className={styles.cardFlexImg}
                          src="/gpu-instance/console/icon-Storage-mark.png"
                        />
                      </span>
                      <span className={styles.cardFlexBtn}>
                        <div className={styles.cardMenuWrap}>
                          <DropdownMenu
                            open={dropdownOpen[index]}
                            onOpenChange={(open) =>
                              menuClickHandler(index, open)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <div
                                onMouseEnter={() =>
                                  menuClickHandler(index, true)
                                }
                              >
                                <AButton
                                  className={styles.moreBtn}
                                  shape="circle"
                                >
                                  {/* <img
                  alt=""
                  src="/gpu-instance/storage/icon-more.svg"
                /> */}
                                  <span
                                    className={`iconfont icon-ellipsis ${styles.moreIcon}`}
                                  />
                                </AButton>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="bottom"
                              align="end"
                              className={styles.dropdownRender}
                              onMouseLeave={() =>
                                menuClickHandler(index, false)
                              }
                            >
                              <DropdownMenuItem
                                className={styles.dropdownMenuItem}
                                onSelect={() => editStorage(index, item)}
                              >
                                {"Edit"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`${styles.dropdownMenuItem} ${styles.dropdownMenuDeleteItem}`}
                                onSelect={() =>
                                  deleteStorage(
                                    index,
                                    item.storageId,
                                    item.storageName,
                                  )
                                }
                              >
                                {"Delete"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </span>
                    </div>
                    <div
                      className={`${styles.cardFlexAddMiddle} ${
                        currentTeam
                          ? styles.cardFlexAddMiddleCompact
                          : styles.cardFlexAddMiddleDefault
                      }`}
                    >
                      <span className={styles.cardMainInfo}>
                        <div className={styles.storageName}>
                          {item.storageName}
                        </div>
                        <div className={styles.storageId}>{item.storageId}</div>
                        <div className={styles.storageSize}>
                          {item.storageSize} GB I {item.clusterName}
                        </div>
                        {/* <div className={styles.storageSize}>
                  {item.clusterName}
                </div> */}
                      </span>
                      <span className={styles.cardFlexBtn}>
                        <div>
                          <Button
                            id={CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_DEPLOY}
                            onClick={() =>
                              toOtherPage(
                                "/gpus-console/explore?clusterId=" +
                                  item.clusterId +
                                  "&storageId=" +
                                  item.storageId,
                              )
                            }
                            className={styles.deployBtn}
                          >
                            <span className={styles.deployBtnTxt}>
                              {"Deploy"}
                            </span>
                          </Button>
                        </div>
                      </span>
                    </div>
                  </div>
                  {currentTeam && (
                    <div className={styles.teamPanel}>
                      <div className={styles.teamDivider}></div>
                      <div
                        className={`${styles.teamInfo} ${styles.teamInfoInset}`}
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
            </div>
          )}
          {tableLoading && <ContentSkeleton className="p-2" />}
          {!tableLoading && resultTable.total === 0 && (
            <div className={styles.emptyState}>
              <DataEmpty />
            </div>
          )}
          {!tableLoading && resultTable.total > 0 ? (
            <div className={styles.pagination}>
              <MyTablePagination
                count={0}
                onPageChange={() => {}}
                page={1}
                className={styles.tablePagination}
                rowsPerPage={params.pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={"Rows per page:"}
              />
              <MyPagination
                className={styles.paginationInner}
                page={params.pageNo}
                count={
                  Math.floor(Number(resultTable.total / params.pageSize)) +
                  (Math.round(resultTable.total % params.pageSize) === 0
                    ? 0
                    : 1)
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
      {operStorageInfo.open ? (
        <AddNetworkVolume
          openDiag={operStorageInfo.open}
          mode={operStorageInfo.mode}
          info={operStorageInfo.info}
          finishOper={finishOper}
        />
      ) : (
        ""
      )}
      {showDeleteInfo.showModal ? (
        <Modal
          {...{
            centered: true,
            width: "608px",
            footer: null,
            open: showDeleteInfo.showModal,
            title: null,
            onCancel: () =>
              setShowDeleteInfo({ ...showDeleteInfo, showModal: false }),
            className: styles.editModal,
            styles: {
              content: {
                padding: 0,
              },
            },
          }}
        >
          <DeleteStorage
            storageId={showDeleteInfo.storageId}
            storageName={showDeleteInfo.storageName}
            finishForm={closeDeleteInfo}
          />
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
}
