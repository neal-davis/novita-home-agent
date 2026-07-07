import { useState, useEffect, useCallback } from "react";
import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker";
import { reqWalletInnerBilling } from "@/api/gpu-instance/billing";
import styles from "./billingTableSection.module.scss";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import moment from "moment";
import dayjs from "dayjs";
import Button from "@/app/components/button/Button";
import * as XLSX from "xlsx";
import { sliceUTCString } from "@/lib/utils/date";
import { SearchInput } from "@/components/ui/input";
const dateFormat = "YYYY/MM/DD";
const ServerlessBillingTable = () => {
  const [billingList, setBillingList] = useState<any>([]);
  const [paramsBilling, setParamsBilling] = useState<any>({
    pageNo: 1,
    pageSize: 10,
    mainType: "serverless",
    endpointId: "",
    gpuType: "",
    startTime: dayjs(dayjs().startOf("month"), dateFormat),
    endTime: dayjs(dayjs().endOf("month"), dateFormat),
  });

  const getBillingList = useCallback(
    (billingParamsTmp: any = null) => {
      reqWalletInnerBilling(
        billingParamsTmp
          ? {
              ...billingParamsTmp,
              gpuType: billingParamsTmp?.gpuType || "",
              startTime: billingParamsTmp.startTime.unix(),
              endTime: billingParamsTmp.endTime.unix(),
            }
          : {
              ...paramsBilling,
              gpuType: paramsBilling?.gpuType || "",
              startTime: paramsBilling.startTime.unix(),
              endTime: paramsBilling.endTime.unix(),
            },
      ).then((res: any) => {
        setBillingList(res?.data || []);
      });
    },
    [paramsBilling],
  );
  useEffect(() => {
    getBillingList();
  }, [getBillingList]);
  const handleChangeBillingRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setParamsBilling({
      ...paramsBilling,
      pageSize: parseInt(event.target.value, 10),
      pageNo: 1,
    });
  };
  const changeTransationsBillingPage = (event: any, page: number) => {
    setParamsBilling({ ...paramsBilling, pageNo: page });
  };

  const handleEndpointIdSearch = useCallback(
    (value: string) => {
      setParamsBilling({
        ...paramsBilling,
        endpointId: value,
        pageNo: 1,
      });
      getBillingList({
        ...paramsBilling,
        endpointId: value,
        pageNo: 1,
      });
    },
    [getBillingList, paramsBilling],
  );

  const handleGpuTypeSearch = useCallback(
    (value: string) => {
      setParamsBilling({
        ...paramsBilling,
        gpuType: value,
        pageNo: 1,
      });
      getBillingList({
        ...paramsBilling,
        gpuType: value,
        pageNo: 1,
      });
    },
    [getBillingList, paramsBilling],
  );

  function formatSeconds(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = seconds % 60;
    const hoursStr: string = hours.toString().padStart(2, "0");
    const minutesStr: string = minutes.toString().padStart(2, "0");
    const secondsStr: string = remainingSeconds.toString().padStart(2, "0");
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  }
  function exportFile() {
    if (billingList || billingList.length > 0) {
      const tableData: any = billingList.map((row: any) => {
        return {
          ["Billing Period"]: row?.startTime
            ? `${moment(Number(row.startTime) * 1000)
                .utc()
                .format("YYYY-MM-DD HH:mm")} - ${moment(
                Number(row.endTime) * 1000,
              )
                .utc()
                .format("YYYY-MM-DD HH:mm")}`
            : "/",
          ["Endpoint id"]: row?.endpointId || "",
          ["Work id"]: row?.workerId || "",
          ["GPU Type"]: row?.gpuType || "",
          ["GPUs/Worker"]: row?.gpusPerWork || "",
          ["Price(Unit:/s)"]:
            row && (row.price || row.price === 0)
              ? `${"$"}` + (Number(row?.price || 0) / 1000000).toFixed(6)
              : "/",
          ["Duration"]: isNaN(row?.billingTime)
            ? "/"
            : formatSeconds(Number(row?.billingTime || 0)),
          ["Amount Should Pay"]: row?.payableAmount
            ? `${"$"}${
                Math.round((Number(row?.payableAmount || 0) / 10000) * 100) /
                100
              }`
            : "/",
          ["Voucher Deduction"]: row?.voucherDeduction
            ? `${"$"}${
                Math.round((Number(row?.voucherDeduction || 0) / 10000) * 100) /
                100
              }`
            : "/",
          ["Cash Paid"]: row?.cashPayment
            ? `${"$"}${
                Math.round((Number(row?.cashPayment || 0) / 10000) * 100) / 100
              }`
            : "/",
        };
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(tableData, {
        header: [
          "Billing Period",
          "Endpoint id",
          "Work id",
          "GPU Type",
          "GPUs/Worker",
          "Price(Unit:/s)",
          "Duration",
          "Amount Should Pay",
          "Voucher Deduction",
          "Cash Paid",
        ],
      });
      XLSX.utils.book_append_sheet(wb, ws, "sheetName");
      XLSX.writeFile(wb, `${"Serverless-Billing"}.xlsx`);
    }
  }
  return (
    <div className="text-[var(--dark-1)]">
      <div className={styles.searchWrapOutContainer}>
        <div className={styles.searchWrap}>
          <SearchInput
            className="mr-4 h-8 w-[234px]"
            placeholder="Endpoint ID"
            value={paramsBilling.endpointId}
            onSearch={handleEndpointIdSearch}
          />
          <SearchInput
            className="mr-4 h-8 w-[234px]"
            placeholder="GPU Type"
            value={paramsBilling.gpuType}
            onSearch={handleGpuTypeSearch}
          />
          <div>
            <DayjsRangePicker
              className={styles.rangePicker}
              value={[paramsBilling.startTime, paramsBilling.endTime]}
              onChange={(dates) => {
                setParamsBilling({
                  ...paramsBilling,
                  pageNo: 1,
                  startTime: dates
                    ? dates[0]
                    : dayjs(dayjs().startOf("month"), dateFormat),
                  endTime: dates
                    ? dates[1]
                    : dayjs(dayjs().endOf("month"), dateFormat),
                });
                getBillingList({
                  ...paramsBilling,
                  pageNo: 1,
                  startTime: dates
                    ? dates[0]
                    : dayjs(dayjs().startOf("month"), dateFormat),
                  endTime: dates
                    ? dates[1]
                    : dayjs(dayjs().endOf("month"), dateFormat),
                });
              }}
            />
          </div>
          <Button
            className={styles.exportBtn}
            type="primary"
            onClick={exportFile}
          >
            {"Export"}
          </Button>
        </div>
        <div className={styles.tableContainer}>
          <table
            className="w-full min-w-[650px] border-collapse"
            aria-label="caption table"
          >
            <thead className={styles.tableHead}>
              <tr>
                <td className={`${styles.wideColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Billing Period"}</span>
                </td>
                <td className={`${styles.wideColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Endpoint id"}</span>
                </td>
                <td className={`${styles.wideColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Work id"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"GPU Type"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"GPUs/Worker"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Price(Unit:/s)"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Duration"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Amount Should Pay"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Voucher Deduction"}</span>
                </td>
                <td className={`${styles.normalColumn} px-3 py-2 text-left`}>
                  <span className={styles.rowTitle}>{"Cash Paid"}</span>
                </td>
              </tr>
            </thead>
            <tbody>
              {billingList
                .slice(
                  (paramsBilling.pageNo - 1) * paramsBilling.pageSize,
                  paramsBilling.pageNo * paramsBilling.pageSize,
                )
                .map((row: any) => (
                  <tr key={row.transactionTime}>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.startTime
                          ? `${sliceUTCString(
                              new Date(
                                Number(row.startTime) * 1000,
                              ).toUTCString(),
                              "hour",
                            )} - ${sliceUTCString(
                              new Date(
                                Number(row.endTime) * 1000,
                              ).toUTCString(),
                              "hour",
                            )}`
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>{row?.endpointId}</span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>{row?.workerId}</span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>{row?.gpuType}</span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>{row?.gpusPerWork}</span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row && (row.price || row.price === 0)
                          ? `${"$"}` +
                            (Number(row?.price || 0) / 1000000).toFixed(6)
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {isNaN(row?.billingTime)
                          ? "/"
                          : formatSeconds(Number(row?.billingTime || 0))}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.payableAmount
                          ? `${"$"}${
                              Math.round(
                                (Number(row?.payableAmount || 0) / 10000) * 100,
                              ) / 100
                            }`
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.voucherDeduction
                          ? `${"$"}${
                              Math.round(
                                (Number(row?.voucherDeduction || 0) / 10000) *
                                  100,
                              ) / 100
                            }`
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.cashPayment
                          ? `${"$"}${
                              Math.round(
                                (Number(row?.cashPayment || 0) / 10000) * 100,
                              ) / 100
                            }`
                          : "/"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!!billingList?.length && (
          <div className={styles.paginationWrap}>
            <MyTablePagination
              count={0}
              onPageChange={() => {}}
              page={1}
              className={styles.paginationControl}
              rowsPerPage={paramsBilling.pageSize}
              onRowsPerPageChange={handleChangeBillingRowsPerPage}
              labelRowsPerPage={"Rows per page"}
            />
            <MyPagination
              className={styles.pagination}
              page={paramsBilling.pageNo}
              count={
                Math.floor(
                  Number(billingList.length / paramsBilling.pageSize),
                ) +
                (Math.round(billingList.length % paramsBilling.pageSize) === 0
                  ? 0
                  : 1)
              }
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
      </div>
    </div>
  );
};

export default ServerlessBillingTable;
