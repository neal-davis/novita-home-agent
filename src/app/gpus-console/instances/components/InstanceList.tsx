"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import CopyButton from "@/app/gpus-console/components/CopyButton";
import ContentSkeleton from "@/app/gpus-console/components/ContentSkeleton";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { sliceUTCString } from "@/lib/utils/date";
import { dealParamsText } from "@/lib/utils/utils";
import PodState from "./podState";
import SpotState from "./spotState";
import AutoRenewState from "./autoRenewState";
import InstanceMetrics from "./InstanceMetrics";
import InstanceLog from "../../components/InstanceLog";
import NetInfo from "./netInfo";
import DataEmpty from "../../components/DataEmpty";
import { CircleQuestionMark } from "lucide-react";
import InstanceCardActions from "./InstanceCardActions";
import styles from "./section.module.scss";
import Image from "next/image";

const INSTANCE_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function runOnKeyboard(
  event: React.KeyboardEvent<HTMLElement>,
  callback: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.stopPropagation();
  callback();
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- Keeps the legacy instance row layout and expansion behavior together after route-level cleanup; row-level decomposition is follow-up work.
export default function InstanceList({
  state,
  actions,
  modalActions,
  hasJobPermission,
}: any) {
  const {
    tableLoading,
    tableData,
    expandedId,
    batchMode,
    batSelectedIds,
    currentTeam,
    dropdownOpen,
    params,
  } = state;
  const {
    operaInstance,
    setBatSelectedIds,
    getCreator,
    getBillingStr,
    setDropdownOpen,
    menuClickHandler,
    checkMarkedInstance,
    handleChangeRowsPerPage,
    changePage,
  } = actions;
  const { setUpdateNameInfo } = modalActions;

  return (
    <>
      {!tableLoading &&
        tableData?.data?.length > 0 &&
        tableData.data.map((item: any, index: number) => (
          <div key={item?.id} className={styles.cardOuter}>
            <div className={styles.card}>
              {/* react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- The expandable row header contains checkbox/copy/edit affordances, so it cannot be a native button. */}
              <div
                role="button"
                tabIndex={0}
                className={`flex w-full cursor-pointer items-start justify-between p-4 text-left outline-none ${styles.cardHeaderButton}`}
                // i18n-disable-next-line
                aria-controls="panel3-content"
                aria-expanded={expandedId === item?.id}
                id="panel3-header"
                onClick={() =>
                  operaInstance(item?.id, index, expandedId !== item?.id)
                }
                onKeyDown={(event) =>
                  runOnKeyboard(event, () =>
                    operaInstance(item?.id, index, expandedId !== item?.id),
                  )
                }
              >
                <div className={styles.cardHeaderContent}>
                  <div className={styles.cardHead}>
                    <div className="flex items-center gap-[8px] w-[calc(100%-150px)]">
                      {batchMode && (
                        <div>
                          <Checkbox
                            disabled={item.billingMode !== "monthly"}
                            checked={batSelectedIds.includes(item.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setBatSelectedIds([...batSelectedIds, item.id]);
                              } else {
                                setBatSelectedIds(
                                  batSelectedIds.filter(
                                    (id: any) => id !== item.id,
                                  ),
                                );
                              }
                            }}
                            onClick={(e: any) => {
                              e.stopPropagation();
                            }}
                          />
                        </div>
                      )}
                      <div className="w-full">
                        <div
                          className={`${styles.titleContainer} ${styles.titleContainerWrap}`}
                        >
                          <div
                            className={`${styles.titleItem} ${styles.titleItem1}`}
                          >
                            <div className={styles.instanceName}>
                              {Boolean(item?.name) && (
                                <span
                                  className={`${styles.textEllipsis} ${styles.instanceNameText}`}
                                >
                                  {item?.name || ""}
                                </span>
                              )}
                              {/* react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- Header is a clickable row, so the nested edit affordance cannot be a native button. */}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label="Edit instance name"
                                className={`iconfont icon-pencil-line text-[var(--black)] hover:text-[var(--brand-0)] cursor-pointer ${styles.editNameIcon}`}
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  setUpdateNameInfo({
                                    showModal: true,
                                    id: item.id,
                                    name: item.name,
                                  });
                                  return true;
                                }}
                                onKeyDown={(e) =>
                                  runOnKeyboard(e, () =>
                                    setUpdateNameInfo({
                                      showModal: true,
                                      id: item.id,
                                      name: item.name,
                                    }),
                                  )
                                }
                              />
                            </div>
                            <div className={styles.idTxt}>
                              ID:{" "}
                              <span className={styles.textEllipsis}>
                                {item?.id || ""}{" "}
                              </span>
                              <CopyButton
                                id={
                                  CLICK_BTN_IDs.GPUS_CONSOLE
                                    .INSTANCE_COPY_INSTANCE_ID
                                }
                                className={styles.copyIdBtn}
                                content={item?.id || ""}
                              />
                            </div>
                          </div>
                          <div
                            className={`${styles.titleItem} ${styles.titleItem2}`}
                          >
                            <div className={styles.gpuSummaryRow}>
                              <span className={styles.gpuTxt}>GPU:&nbsp;</span>
                              <span className={styles.gpuNameTxt}>
                                {(item?.productName || "") +
                                  " * " +
                                  (typeof item?.gpuNum === "undefined"
                                    ? ""
                                    : item?.gpuNum)}
                              </span>
                              {item?.gpuIds?.length ? (
                                <Tooltip
                                  title={
                                    <div>GPU ID: {item.gpuIds.join(",")}</div>
                                  }
                                >
                                  <CircleQuestionMark className="w-4 h-4 shrink-0 text-[var(--black)]" />
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className={styles.cpuRamTxt}>
                              {dealParamsText(
                                "CPU/RAM: ${0} vCPU, ${1} GB RAM",
                                {
                                  0: item?.cpuNum || "-",
                                  1: item?.memory || "-",
                                },
                              )}
                            </div>
                          </div>
                          <div
                            className={`${styles.titleItem} ${styles.titleItem3}`}
                          >
                            <div className={styles.metaSummaryRow}>
                              <span
                                className={`${styles.templateTxt} min-w-[56px]`}
                              >
                                {"Template"}:&nbsp;
                              </span>
                              <span
                                className={`${styles.templateUrlTxt} ${styles.textEllipsis}`}
                              >
                                {item?.imageUrl}
                              </span>
                            </div>
                            <div className={styles.billingTxt}>
                              {"Billing"}:&nbsp;
                              <span>
                                {item?.billingMode === "monthly" &&
                                item?.endTime &&
                                item.endTime !== "0" &&
                                item.endTime !== "-1" ? (
                                  <>
                                    <span>{getBillingStr(item)}</span>
                                    <span className="ml-2">
                                      Expiration time:{" "}
                                    </span>
                                    <span className="mr-[4px]">
                                      {sliceUTCString(
                                        new Date(
                                          Number(item.endTime) * 1000,
                                        ).toUTCString(),
                                        "second",
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <span className="mr-[4px]">
                                    {getBillingStr(item)}
                                  </span>
                                )}
                                {item?.billingMode === "monthly" && (
                                  <span>
                                    <AutoRenewState instanceInfo={item} />
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.creatorInfo}>
                          {currentTeam && (
                            <>
                              {"Creator"}:&nbsp;
                              {getCreator(item.creator, item.uuid)}
                              <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
                            </>
                          )}
                          {"Create Time"}:&nbsp;
                          {sliceUTCString(
                            new Date(
                              Number(item.createdAt) * 1000,
                            ).toUTCString(),
                            "second",
                          )}
                        </div>
                      </div>
                    </div>
                    {["notified", "reclaiming"].includes(
                      item?.spotStatus || "",
                    ) ? (
                      <SpotState
                        state={item?.spotStatus}
                        reclaimTime={item?.spotReclaimTime || "0"}
                      ></SpotState>
                    ) : (
                      <PodState
                        instanceInfo={item}
                        state={item?.status}
                        errorText={
                          currentTeam &&
                          currentTeam?.id &&
                          currentTeam?.id ===
                            "team_cd87986ef6224e669de53af891715a03" &&
                          item?.statusError?.state === "oom"
                            ? ""
                            : item?.statusError?.state
                        }
                        errorMessage={item?.statusError?.message || ""}
                      ></PodState>
                    )}
                  </div>
                </div>
                <Image
                  alt=""
                  src="/gpu-instance/instances/icon-chevron-up.svg"
                  width={24}
                  height={24}
                  className={
                    expandedId === item?.id
                      ? styles.expandedIcon
                      : styles.expandIcon
                  }
                />
              </div>
              {expandedId === item?.id && (
                <div
                  className={`p-[var(--spacing-console-16)] ${styles.expandedBody}`}
                >
                  <div className={styles.volumeSize}>
                    <span
                      className={`${styles.detailItem} ${styles.netVolTxt}`}
                    >
                      {/* {legacyCopy.netVolTxt}:{" "}
          <span>
            {
              (
                item?.details?.volumeMounts?.find(
                  (item: any) => item.type === "network",
                ) || { size: 0 }
              )?.size
            }{" "}
            GB
          </span>{" "} */}
                      {item?.details?.volumeMounts?.find(
                        (item: any) => item.type === "local",
                      ) ? (
                        <>
                          {"Disk"}:{" "}
                          <span>
                            {
                              (
                                item?.details?.volumeMounts?.find(
                                  (item: any) => item.type === "local",
                                ) || { size: 0 }
                              )?.size
                            }{" "}
                            GB
                          </span>
                          {" , "}
                        </>
                      ) : (
                        ""
                      )}
                      {"Container Disk"}:{" "}
                      <span className={styles.detailValue}>
                        {item?.rootfsSize} GB
                      </span>
                    </span>
                    {((
                      item?.details?.volumeMounts?.filter(
                        (item: any) => item.type === "network",
                      ) || []
                    ).length > 0 ||
                      item?.details?.volumeMounts?.find(
                        (item: any) => item.type === "local",
                      )) && (
                      <>
                        <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
                        <span
                          className={`${styles.detailItem} ${styles.netVolPath}`}
                        >
                          {"Network Volume"}:{" "}
                          {(
                            item?.details?.volumeMounts?.filter(
                              (item: any) => item.type === "network",
                            ) || []
                          ).length > 0 && (
                            <Tooltip
                              title={
                                <NetInfo
                                  netInfoList={
                                    item?.details?.volumeMounts?.filter(
                                      (item: any) => item.type === "network",
                                    ) || []
                                  }
                                />
                              }
                              placement="bottom"
                              overlayStyle={{ maxWidth: "none" }}
                            >
                              <span
                                className={`iconfont icon-badge-info inline-block text-[14px] w-[14px] h-[14px] text-[var(--dark-2)]`}
                              />
                            </Tooltip>
                          )}
                        </span>
                        {item?.details?.volumeMounts?.find(
                          (item: any) => item.type === "local",
                        ) ? (
                          <>
                            {" "}
                            &nbsp;,&nbsp; {"Local Volume Path"}:{" "}
                            <span className={styles.detailValueStrong}>
                              {
                                (
                                  item?.details?.volumeMounts?.find(
                                    (item: any) => item.type === "local",
                                  ) || { mountPath: "-" }
                                )?.mountPath
                              }
                            </span>
                          </>
                        ) : (
                          ""
                        )}
                      </>
                    )}
                    <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
                    <span className={`${styles.detailItem} ${styles.dcTxt}`}>
                      <span>{"Data Center"}:&nbsp;&nbsp;</span>
                      <Image
                        alt="icon"
                        src="/gpu-instance/instances/icon-dataCenter.svg"
                        width={16}
                        height={16}
                        className="mr-1 inline-block"
                      />
                      <span>{item?.details?.clusterName || "/"}</span>
                    </span>
                  </div>
                  {[
                    "toCreate",
                    "creating",
                    "pulling",
                    "starting",
                    "restarting",
                    "toStart",
                  ].includes(item?.status) && expandedId === item?.id ? (
                    <div className="mb-4">
                      <InstanceLog
                        address={
                          item?.details?.connectComponentLog?.systemLogAddress
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {expandedId === item?.id && (
                    <div>
                      <InstanceMetrics
                        key={item?.id}
                        id={item?.id}
                        instanceInfo={item || {}}
                      />
                    </div>
                  )}
                </div>
              )}
              {expandedId === item?.id && (
                <div className="w-[calc(100%-32px)] h-[1px] bg-[var(--gray-2)] ml-[16px] mr-[16px] mb-[16px]"></div>
              )}
              <InstanceCardActions
                item={item}
                state={{ expandedId, dropdownOpen }}
                actions={{ setDropdownOpen, menuClickHandler }}
                modalActions={modalActions}
                hasJobPermission={hasJobPermission}
                checkMarkedInstance={checkMarkedInstance}
              />
            </div>
          </div>
        ))}
      {!tableLoading && (!tableData || tableData.data.length === 0) && (
        <DataEmpty />
      )}
      {tableLoading && (
        <ContentSkeleton
          count={5}
          itemHeight={80}
          className={`${styles.skeleton}`}
        />
      )}
      {!tableLoading && !!tableData?.total && (
        <div className={styles.paginationContainer}>
          <MyTablePagination
            {...{
              count: 0,
              onPageChange: () => {},
              page: 1,
              className: styles.paginationControl,
              rowsPerPage: params.pageSize,
              rowsPerPageOptions: INSTANCE_ROWS_PER_PAGE_OPTIONS,
              onRowsPerPageChange: handleChangeRowsPerPage,
              labelRowsPerPage: "Rows per page:",
            }}
          />
          <MyPagination
            className={styles.pagination}
            page={params.pageNum}
            count={
              Math.floor(Number(tableData.total / params.pageSize)) +
              (Math.round(tableData.total % params.pageSize) === 0 ? 0 : 1)
            }
            onChange={changePage}
            renderItem={(item: any) => {
              return <PaginationItem {...item} />;
            }}
          />
        </div>
      )}
    </>
  );
}
