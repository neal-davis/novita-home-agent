import { useState, useEffect, useCallback, useMemo } from "react";
import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker";
import Segmente from "@/app/gpus-console/explore/components/segmente";
import { reqWalletInnerBilling } from "@/api/gpu-instance/billing";
import styles from "./billingTableSection.module.scss";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import dayjs from "dayjs";
import { DATA_TYPE } from "./baseEnum";
import { SearchInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { sliceUTCString } from "@/lib/utils/date";

const mainTypeEnum: any = {
  "gpu-instance": "gpu_instance",
  "net-storage": "network_storage",
};

const dateFormat = "YYYY/MM/DD";
const CommonBillingTable = ({
  type = DATA_TYPE.GPUINSTANCE,
}: {
  type: DATA_TYPE;
}) => {
  const modeEnum: any = useMemo(
    () => ({
      ["Hour"]: "cycleHour",
      ["Day"]: "cycleDay",
      ["Week"]: "cycleWeek",
      ["Month"]: "cycleMonth",
    }),
    [],
  );
  const productTypeList = [
    {
      value: "instance",
      label: "Instance",
    },
    {
      value: "storage",
      label: "Local Storage",
    },
    {
      value: "network_storage",
      label: "Network Storage",
    },
  ];
  const billingModeList = [
    {
      value: "afterusage",
      label: "On Demand",
    },
    {
      value: "instance_afterusage",
      label: "On Demand",
    },
    {
      value: "prepaid",
      label: "Prepaid",
    },
    {
      value: "prepaidByDay",
      label: "Prepaid By Day",
    },
    {
      value: "prepaidByWeek",
      label: "Prepaid By Week",
    },
    {
      value: "prepaidByMonth",
      label: "Prepaid By Month",
    },
    {
      value: "prepaidByYear",
      label: "Prepaid By Year",
    },
  ];
  const [billingList, setBillingList] = useState([]);
  const [paramsBilling, setParamsBilling] = useState<any>({
    pageNo: 1,
    pageSize: 10,
    mainType: mainTypeEnum[type as string],
    productName: "",
    productType: type === DATA_TYPE.NETSTORAGE ? "network_storage" : "all",
    startTime: dayjs(dayjs().startOf("month"), dateFormat),
    endTime: dayjs(dayjs().endOf("month"), dateFormat),
  });
  const [billingParams, setBillingParams] = useState({
    statisticalCycle: "Hour",
  });

  const getBillingList = useCallback(
    (billingParamsTmp: any = null) => {
      reqWalletInnerBilling(
        billingParamsTmp
          ? {
              ...paramsBilling,
              ...billingParamsTmp,
              productType:
                type !== DATA_TYPE.NETSTORAGE
                  ? !billingParamsTmp?.productType ||
                    billingParamsTmp?.productType === "all"
                    ? ""
                    : billingParamsTmp?.productType
                  : "network_storage",
              statisticalCycle: billingParamsTmp.statisticalCycle
                ? billingParamsTmp.statisticalCycle
                : modeEnum[billingParams.statisticalCycle as string],
              startTime: billingParamsTmp.startTime.unix(),
              endTime: billingParamsTmp.endTime.unix(),
            }
          : {
              ...paramsBilling,
              productType:
                !paramsBilling?.productType ||
                paramsBilling?.productType === "all"
                  ? ""
                  : paramsBilling?.productType,
              statisticalCycle:
                modeEnum[billingParams.statisticalCycle as string],
              startTime: paramsBilling.startTime.unix(),
              endTime: paramsBilling.endTime.unix(),
            },
      ).then((res: any) => {
        setBillingList(res?.data || []);
      });
    },
    [billingParams.statisticalCycle, modeEnum, paramsBilling, type],
  );
  useEffect(() => {
    getBillingList();
  }, [getBillingList]);
  const changeBillingParams = (e: any) => {
    setBillingParams({ statisticalCycle: e });
    setParamsBilling({
      ...paramsBilling,
      productType: "all",
      pageNo: 1,
      startTime: dayjs(dayjs().startOf("month"), dateFormat),
      endTime: dayjs(dayjs().endOf("month"), dateFormat),
    });
    getBillingList({
      statisticalCycle: modeEnum[e as string],
      pageNo: 1,
      startTime: dayjs(dayjs().startOf("month"), dateFormat),
      endTime: dayjs(dayjs().endOf("month"), dateFormat),
    });
  };
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

  const handleProductNameSearch = useCallback(
    (value: string) => {
      setParamsBilling({
        ...paramsBilling,
        productName: value,
        pageNo: 1,
      });
      getBillingList({
        ...paramsBilling,
        productName: value,
        pageNo: 1,
      });
    },
    [getBillingList, paramsBilling],
  );

  return (
    <div style={{ color: "#11142D" }}>
      <div style={{ display: "flow-root", marginBottom: "10px" }}>
        <div style={{ maxWidth: "190px", float: "right" }}>
          <Segmente
            options={["Hour", "Day", "Week", "Month"]}
            onChange={(e: any) => changeBillingParams(e)}
            value={billingParams.statisticalCycle}
          />
        </div>
      </div>
      <div className={styles.searchWrapOutContainer}>
        <div className={styles.searchWrap}>
          <SearchInput
            className="mr-4 h-8 w-[234px]"
            placeholder="Product Name"
            value={paramsBilling.productName}
            onSearch={handleProductNameSearch}
          />
          <div>
            <Select
              value={paramsBilling.productType}
              onValueChange={(value) => {
                setParamsBilling({
                  ...paramsBilling,
                  pageNo: 1,
                  productType: value,
                });
                getBillingList({
                  ...paramsBilling,
                  pageNo: 1,
                  productType: value,
                });
              }}
            >
              <SelectTrigger
                className={styles.topSelectSearch}
                style={{ marginRight: "10px" }}
              >
                <span className={styles.selectTxt}>
                  {paramsBilling.productType &&
                  paramsBilling.productType !== "all"
                    ? productTypeList.find(
                        (item: any) => item.value === paramsBilling.productType,
                      )?.label || paramsBilling.productType
                    : "All"}
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-[450px]">
                <SelectItem className={styles.menuItem} value="all">
                  {"All"}
                </SelectItem>
                {type === DATA_TYPE.GPUINSTANCE && (
                  <SelectItem className={styles.menuItem} value={"instance"}>
                    {"Instance"}
                  </SelectItem>
                )}
                {type === DATA_TYPE.NETSTORAGE && (
                  <SelectItem
                    className={styles.menuItem}
                    value={"network_storage"}
                  >
                    {"Network Storage"}
                  </SelectItem>
                )}
                {type === DATA_TYPE.GPUINSTANCE && (
                  <SelectItem className={styles.menuItem} value={"storage"}>
                    {"Local Storage"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
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
        </div>
        <div className={styles.tableContainer}>
          <table
            className="w-full min-w-[650px] border-collapse"
            aria-label="caption table"
          >
            <thead style={{ backgroundColor: "var(--gray-2)" }}>
              <tr>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Billing Period"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Product"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Product Type"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Pricing Model"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Amount Should Pay"}</span>
                </td>
                <td className="px-3 py-2 text-left">
                  <span className={styles.rowTitle}>{"Voucher Deduction"}</span>
                </td>
                <td className="px-3 py-2 text-left">
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
                          ? billingParams.statisticalCycle === "Hour"
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
                            : billingParams.statisticalCycle === "Day"
                              ? ` ${sliceUTCString(
                                  new Date(
                                    Number(row.startTime) * 1000,
                                  ).toUTCString(),
                                  "day",
                                )}`
                              : ` ${sliceUTCString(
                                  new Date(
                                    Number(row.startTime) * 1000,
                                  ).toUTCString(),
                                  "day",
                                )} - ${sliceUTCString(
                                  new Date(
                                    Number(row.endTime) * 1000,
                                  ).toUTCString(),
                                  "day",
                                )}`
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.productName || "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.productType
                          ? productTypeList.find(
                              (item) => item.value === row.productType,
                            )?.label
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.billingMode
                          ? billingModeList.find(
                              (item) => item.value === row.billingMode,
                            )?.label
                          : "/"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-left">
                      <span className={styles.rowData}>
                        {row?.payableAmount
                          ? `${"$"}${
                              Math.round(
                                (Number(row.payableAmount) / 100) * 100,
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
                                (Number(row.voucherDeduction) / 100) * 100,
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
                                (Number(row.cashPayment) / 100) * 100,
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
              style={{
                display: "inline-block",
                border: "none",
                color: "var(--black)",
              }}
              rowsPerPage={paramsBilling.pageSize}
              onRowsPerPageChange={handleChangeBillingRowsPerPage}
              labelRowsPerPage={"Rows per page"}
            />
            <MyPagination
              style={{ display: "inline-block", color: "var(--black)" }}
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

export default CommonBillingTable;
