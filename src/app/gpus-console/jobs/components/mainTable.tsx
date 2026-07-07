import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import styles from "./mainTable.module.scss";
import {
  MyPagination,
  MyTablePagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import dayjs from "dayjs";
import { reqGetJobs } from "@/api/gpu-instance/jobs";
import StopJob from "./stopJob";
import Logs from "./logs";
import DataEmpty from "../../components/DataEmpty";
import { sliceUTCString } from "@/lib/utils/date";
import { useAppSelector } from "@/store";
import TeamMemberSelector from "@/app/components/TeamMemberSelector";
import MemberCell from "@/app/components/Table/MemberCell";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import Modal from "@/app/components/Modal/Modal";
import { SearchInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { message } from "@/components/ui/standard/notify";

const JOB_PAGE_SIZE_KEY = "job_pageSize";
const DEFAULT_PAGE_SIZE = 10;
const JOB_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getStoredJobPageSize() {
  if (typeof window === "undefined") {
    return DEFAULT_PAGE_SIZE;
  }

  const pageSize = Number(
    window.localStorage.getItem(JOB_PAGE_SIZE_KEY) || DEFAULT_PAGE_SIZE,
  );

  return JOB_PAGE_SIZE_OPTIONS.includes(pageSize)
    ? pageSize
    : DEFAULT_PAGE_SIZE;
}

// const MyRangePicker = styled(DatePicker.RangePicker)({
//   "& .ant-picker-active-bar": {
//     background: "#2874FF !important",
//   },
//   "& .ant-picker-cell-inner": {
//     backgroundColor: "#2874FF !important",
//   },
//   ":global": {
//     ".ant-picker-cell-inner": {
//       backgroundColor: "#2874FF !important",
//     },
//   },
// });
// const dateFormat = "YYYY/MM/DD";

const MainTable = () => {
  const jobTypeOptions = [
    {
      value: "all",
      label: "All Job Type",
    },
    {
      value: "saveImage",
      label: "SaveImage",
    },
    {
      value: "instanceMigrate",
      label: "InstanceMigrate",
    },
    {
      value: "autoInstanceMigrate",
      label: "AutoInstanceMigrate",
    },
  ];
  const jobStateOptions = [
    {
      value: "all",
      label: "All Job State",
    },
    {
      value: "pulling",
      label: "Pulling",
    },
    {
      value: "running",
      label: "Running",
    },
    {
      value: "fail",
      label: "Fail",
    },
    {
      value: "break",
      label: "Break",
    },
    {
      value: "success",
      label: "Success",
    },
  ];
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const members = useMemo(() => teamMembers || [], [teamMembers]);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [billingList, setBillingList] = useState<any>([]);
  const hasLoadedStoredPageSize = useRef(false);
  const [isStoredPageSizeReady, setIsStoredPageSizeReady] = useState(false);
  const [paramsBilling, setParamsBilling] = useState<any>({
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    jobId: "",
    type: "all",
    state: "all",
    // startTime: moment().startOf("month").format("X"),
    // endTime: moment().endOf("month").format("X"),
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    creators: "-1",
  });

  // useEffect(() => {
  //   getBillingList();
  // }, []);
  const getBillingList = useCallback(
    (billingParamsTmp: any = null) => {
      const requestParams = billingParamsTmp
        ? { ...paramsBilling, ...billingParamsTmp }
        : paramsBilling;
      if (!requestParams.startTime || !requestParams.endTime) {
        message.error("Please complete the date selection");
        return;
      }
      let menberIdArr = [];
      const creators = requestParams.creators;
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
      reqGetJobs(
        billingParamsTmp
          ? {
              ...requestParams,
              type:
                !requestParams?.type || requestParams?.type === "all"
                  ? ""
                  : requestParams?.type,
              state:
                !requestParams?.state || requestParams?.state === "all"
                  ? ""
                  : requestParams?.state,
              startTime: Math.floor(
                requestParams.startTime.toDate().getTime() / 1000,
              ),
              endTime: Math.floor(
                requestParams.endTime
                  .add(1, "day")
                  .subtract(1, "second")
                  .toDate()
                  .getTime() / 1000,
              ),

              // (billingParamsTmp || paramsBilling).endTime.unix(),
              creators: creators === "-1" ? "" : menberIdArr.toString(),
            }
          : {
              ...paramsBilling,
              type:
                !paramsBilling?.type || paramsBilling?.type === "all"
                  ? ""
                  : paramsBilling?.type,
              state:
                !paramsBilling?.state || paramsBilling?.state === "all"
                  ? ""
                  : paramsBilling?.state,

              startTime: Math.floor(
                paramsBilling.startTime.toDate().getTime() / 1000,
              ),
              endTime: Math.floor(
                paramsBilling.endTime
                  .add(1, "day")
                  .subtract(1, "second")
                  .toDate()
                  .getTime() / 1000,
              ),
              creators: creators === "-1" ? "" : menberIdArr.toString(),
            },
      ).then((res: any) => {
        setBillingList(res || { total: 0, jobs: [] });
      });
    },
    [members, paramsBilling],
  );
  const handleChangeBillingRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    window.localStorage.setItem(JOB_PAGE_SIZE_KEY, event.target.value);
    setParamsBilling({
      ...paramsBilling,
      pageSize: parseInt(event.target.value, 10),
      pageNum: 1,
    });
    getBillingList({
      ...paramsBilling,
      pageNum: 1,
      pageSize: parseInt(event.target.value, 10),
    });
  };
  const changeTransationsBillingPage = (event: any, page: number) => {
    setParamsBilling({ ...paramsBilling, pageNum: page });
    getBillingList({ ...paramsBilling, pageNum: page });
  };
  const [showBreakInfo, setShowBreakInfo] = useState({
    showModal: false,
    jobInfo: {},
  });
  function closeBreakInfo(mark: any) {
    setShowBreakInfo({ ...showBreakInfo, showModal: false });
    if (mark) {
      getBillingList();
    }
  }
  const [showLogsModalInfo, setShowLogsModalInfo] = useState<{
    showModal: boolean;
    instanceAddress: string;
  }>({ showModal: false, instanceAddress: "" });

  useEffect(() => {
    if (hasLoadedStoredPageSize.current) {
      return;
    }

    hasLoadedStoredPageSize.current = true;
    const pageSize = getStoredJobPageSize();
    setParamsBilling((prevParamsBilling: any) =>
      pageSize === prevParamsBilling.pageSize
        ? prevParamsBilling
        : {
            ...prevParamsBilling,
            pageNum: 1,
            pageSize,
          },
    );
    setIsStoredPageSizeReady(true);
  }, []);

  const [time, setTime] = useState(30);
  useEffect(() => {
    if (!isStoredPageSizeReady) {
      return;
    }

    let timerHandler: ReturnType<typeof setTimeout> | undefined;
    if (time % 3 !== 0) {
      timerHandler = setTimeout(() => {
        setTime((time) => time - 1);
      }, 3000);
    }
    if (time <= 0) {
      setTime(30);
    }
    if (time % 3 === 0) {
      setTime((time) => time - 1);
      getBillingList();
    }
    return () => {
      if (timerHandler) {
        clearTimeout(timerHandler);
      }
    };
  }, [getBillingList, isStoredPageSizeReady, time]);

  const handleJobIdSearch = useCallback(
    (value: string) => {
      setParamsBilling({
        ...paramsBilling,
        pageNum: 1,
        jobId: value,
      });
      getBillingList({
        ...paramsBilling,
        pageNum: 1,
        jobId: value,
      });
      analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_SEARCH_JOBS);
    },
    [getBillingList, paramsBilling],
  );

  return (
    <div>
      <div className={styles.title}>
        <div className={styles.searchWrap}>
          {currentTeam && (
            <div>
              <TeamMemberSelector
                className={styles.topSelectSearchNew}
                onSelect={(member: any) => {
                  setParamsBilling({
                    ...paramsBilling,
                    pageNum: 1,
                    creators: member?.ids?.length ? member.ids[0] : "-1",
                  });
                  getBillingList({
                    ...paramsBilling,
                    pageNum: 1,
                    creators: member?.ids?.length ? member.ids[0] : "-1",
                  });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_SELECTED_MEMBER,
                  );
                }}
              />
            </div>
          )}
          <SearchInput
            className="h-8 w-[234px]"
            placeholder="Job ID"
            value={paramsBilling.jobId}
            onSearch={handleJobIdSearch}
          />
          <div>
            <Select
              value={paramsBilling.type}
              onValueChange={(value) => {
                setParamsBilling({
                  ...paramsBilling,
                  pageNum: 1,
                  type: value,
                });
                getBillingList({
                  ...paramsBilling,
                  pageNum: 1,
                  type: value,
                });
                analytics.trackClick(
                  CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_SELECTED_TYPE,
                  {
                    type: value,
                  },
                );
              }}
            >
              <SelectTrigger className={styles.topSelectSearch}>
                <span className={styles.selectTxt}>
                  {jobTypeOptions.find(
                    (item) => item.value === paramsBilling.type,
                  )?.label || paramsBilling.type}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-[450px]">
                {jobTypeOptions.map((item) => (
                  <SelectItem
                    className={styles.menuItem}
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={paramsBilling.state}
              onValueChange={(value) => {
                setParamsBilling({
                  ...paramsBilling,
                  pageNum: 1,
                  state: value,
                });
                getBillingList({
                  ...paramsBilling,
                  pageNum: 1,
                  state: value,
                });
                analytics.trackClick(
                  CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_SELECTED_STATE,
                  {
                    state: value,
                  },
                );
              }}
            >
              <SelectTrigger className={styles.topSelectSearch}>
                <span className={styles.selectTxt}>
                  {jobStateOptions.find(
                    (item) => item.value === paramsBilling.state,
                  )?.label || paramsBilling.state}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-[450px]">
                {jobStateOptions.map((item) => (
                  <SelectItem
                    className={styles.menuItem}
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <FormControl>
            <MyRangePicker
              placement="topRight"
              popupClassName={styles.dropClass}
              className={styles.rangePicker}
              value={[paramsBilling.startTime, paramsBilling.endTime]}
              placeholder={["Start Time", "End Time"]}
              format={dateFormat}
              onChange={(dates: any) => {
                setParamsBilling({
                  ...paramsBilling,
                  pageNum: 1,
                  startTime: dates
                    ? dates[0]
                    : dayjs(dayjs().startOf("month"), dateFormat),
                  endTime: dates
                    ? dayjs(dates[1].format("YYYY-MM-DD") + " 23:59:59")
                    : dayjs(dayjs().endOf("month"), dateFormat),
                });
                getBillingList({
                  ...paramsBilling,
                  pageNum: 1,
                  startTime: dates
                    ? dates[0]
                    : dayjs(dayjs().startOf("month"), dateFormat),
                  endTime: dates
                    ? dayjs(dates[1].format("YYYY-MM-DD") + " 23:59:59")
                    : dayjs(dayjs().endOf("month"), dateFormat),
                });
                analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_PICK_DATE);
              }}
              allowClear={false}
            />
          </FormControl> */}
          <div>
            <DateRangePicker
              style={{ maxWidth: 277, height: 32 }}
              startTime={paramsBilling.startTime?.toDate()}
              endTime={paramsBilling.endTime?.toDate()}
              onChange={(date) => {
                const nextParams = {
                  ...paramsBilling,
                  pageNum: 1,
                  startTime: date?.from ? dayjs(date?.from) : undefined,
                  endTime: date?.to ? dayjs(date?.to) : undefined,
                };
                setParamsBilling(nextParams);
                if (!nextParams.startTime || !nextParams.endTime) {
                  getBillingList(nextParams);
                  return;
                }
                getBillingList(nextParams);
                analytics.trackClick(CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_PICK_DATE);
              }}
            />
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table
            className="w-full min-w-[650px] border-collapse"
            aria-label="caption table"
          >
            <thead style={{ borderBottom: "1px solid var(--gray-2)" }}>
              <tr>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Job ID"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Instance ID"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Job Type"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Job State"}</span>
                </td>
                {currentTeam && (
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowTitle}>{"Creator"}</span>
                  </td>
                )}
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Create Time"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Completion Time"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span
                    className={styles.rowTitle}
                    style={{ marginLeft: "15px" }}
                  >
                    {"Operations"}
                  </span>
                </td>
              </tr>
            </thead>
            <tbody>
              {(billingList?.jobs || []).map((row: any) => (
                <tr
                  key={row.transactionTime}
                  style={{ borderBottom: "1px solid var(--gray-2)" }}
                >
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>{row.Id}</span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>{row.instanceId}</span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>
                      {
                        (
                          jobTypeOptions.find(
                            (item: any) => row?.type === item.value,
                          ) || { label: "" }
                        ).label
                      }
                    </span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>
                      {
                        (
                          jobStateOptions.find(
                            (item: any) => row?.state?.state === item.value,
                          ) || { label: "" }
                        ).label
                      }
                    </span>
                  </td>
                  {currentTeam && (
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {(row?.type || "") === "autoInstanceMigrate" ? (
                          "System"
                        ) : (
                          <MemberCell memberID={row.creator} uuid={row.uuid} />
                        )}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>
                      {row.createdAt &&
                        sliceUTCString(
                          new Date(Number(row.createdAt) * 1000).toUTCString(),
                          "hour",
                        )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    <span className={styles.rowData}>
                      {row.updateAt &&
                        row?.state?.state !== "running" &&
                        sliceUTCString(
                          new Date(Number(row.updateAt) * 1000).toUTCString(),
                          "hour",
                        )}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-left">
                    {row && row.type !== "autoInstanceMigrate" && (
                      <>
                        {row?.state?.state === "running" && (
                          <Button
                            type="link"
                            style={{ color: "#F00" }}
                            onClick={() =>
                              setShowBreakInfo({
                                jobInfo: row,
                                showModal: true,
                              })
                            }
                          >
                            {"Terminate"}
                          </Button>
                        )}
                        {row?.logAddress && (
                          <Button
                            type="link"
                            style={{ color: "var(--brand-0)" }}
                            id={CLICK_BTN_IDs.GPUS_CONSOLE.JOBS_SHOW_LOGS}
                            onClick={() =>
                              setShowLogsModalInfo({
                                showModal: true,
                                instanceAddress: row.logAddress || "",
                              })
                            }
                          >
                            {"Logs"}
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(billingList?.total || 0) <= 0 ? (
            <DataEmpty showBorder={false} />
          ) : (
            ""
          )}
        </div>

        {!!billingList?.total && (
          <div className={styles.pagination}>
            <MyTablePagination
              count={billingList?.total || 0}
              onPageChange={() => {}}
              page={1}
              style={{
                display: "inline-block",
                border: "none",
                color: "var(--black)",
              }}
              rowsPerPage={paramsBilling.pageSize}
              onRowsPerPageChange={handleChangeBillingRowsPerPage}
              labelRowsPerPage={"Rows per page:"}
            />
            <MyPagination
              style={{ display: "inline-block", color: "var(--black)" }}
              page={paramsBilling.pageNum}
              count={
                Math.floor(Number(billingList.total / paramsBilling.pageSize)) +
                (Math.round(billingList.total % paramsBilling.pageSize) === 0
                  ? 0
                  : 1)
              }
              // count={2}
              onChange={changeTransationsBillingPage}
              renderItem={(item: any) => {
                return (
                  <PaginationItem
                    sx={{ color: "var(--black)" }}
                    to={`/inbox${item.page === 1 ? "" : `?page=${item.page}`}`}
                    {...item}
                  />
                );
              }}
            />
          </div>
        )}
        {showBreakInfo.showModal && (
          <Modal
            width="508px"
            footer={null}
            open={showBreakInfo.showModal}
            title={null}
            onCancel={() =>
              setShowBreakInfo({ ...showBreakInfo, showModal: false })
            }
            styles={{
              content: {
                padding: 0,
                background: "transparent",
              },
            }}
          >
            <StopJob
              jobInfo={showBreakInfo.jobInfo}
              finishForm={closeBreakInfo}
            />
          </Modal>
        )}
        {showLogsModalInfo.showModal && (
          <Logs
            showModal={showLogsModalInfo.showModal}
            instanceLogAddress={showLogsModalInfo.instanceAddress}
            finishForm={() =>
              setShowLogsModalInfo({ ...showLogsModalInfo, showModal: false })
            }
          />
        )}
      </div>
    </div>
  );
};

export default MainTable;
