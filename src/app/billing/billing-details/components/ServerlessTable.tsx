import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import * as XLSX from "xlsx";
import { SearchInput } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableSpinner,
} from "@/components/ui/table";
import { NoData } from "@/components/ui/standard/no-data";
import StandardPagination from "@/components/ui/standard/pagination";
import { Bill, getBillList, GetBillListParams } from "@/api/billing";
import styles from "../page.module.scss";
import {
  getDateRangeDisplay,
  getUTCTimestampByTimezoneToDate,
} from "@/lib/utils/date";
import { ConsoleButton } from "@/app/user/components/console-button";
import {
  balanceFormat,
  formatBillingPrice,
  formatDecimalAmount,
} from "@/lib/utils/money";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IFilterOptions } from "../index";
import { EXCEL_MONEY_HEADER_SUFFIX } from "../excelMoneyHeader";
import DateToggleGroup from "./DateToggleGroup";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import isEqual from "lodash-es/isEqual";
import { message } from "@/components/ui/standard/notify";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
function createCopyDateGroupOptions() {
  return [
    {
      value: "Hour",
      label: "Hour",
    },
    {
      value: "Day",
      label: "Day",
    },
    {
      value: "Week",
      label: "Week",
    },
    {
      value: "Month",
      label: "Month",
    },
  ];
}
const ServerlessTable = ({
  copy,
  pageSize,
}: {
  copy?: unknown;
  pageSize: number;
}) => {
  const [billList, setBillList] = useState<Bill[]>([]);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions>({
    cycleType: "Day",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    productCategory: "serverless",
    currentPage: 1,
    productName: "",
    category: "",
    ownerId: "",
  });
  const handleChange = useCallback((obj: Partial<IFilterOptions>) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      ...obj,
    }));
  }, []);
  const columns = useMemo(
    () => [
      {
        accessorKey: "billingPeriod",
        header: "Billing Period",
        className: "min-w-[200px]",
        render: (row: Bill) =>
          getDateRangeDisplay(
            filterOptions.cycleType,
            row?.startTime,
            row?.endTime,
          ),
      },
      {
        accessorKey: "endpoint",
        header: "Endpoint",
        className: "min-w-[160px]",
        render: (row: Bill) => {
          return row.ownerID;
        },
      },
      {
        accessorKey: "gpuType",
        header: "GPU Type",
        className: "min-w-[140px]",
        render: (row: Bill) => {
          return row.productName;
        },
      },
      {
        accessorKey: "usageDuration",
        header: (
          <span>
            {"Usage Duration"}
            (seconds)
            <HoverCard>
              <HoverCardTrigger>
                <span className="iconfont icon-badge-help ml-2"></span>
              </HoverCardTrigger>
              <HoverCardContent style={{ width: 800 }}>
                {
                  "For each endpoint, usage duration is calculated based on the total GPU time consumed by all workers under it. Specifically, each worker's usage duration is determined by (number of GPUs) * (time in seconds), and the endpoint's total usage duration is the sum of all workers' GPU usage within the billing period."
                }
              </HoverCardContent>
            </HoverCard>
          </span>
        ),
        className: "min-w-[160px]",
        render: (row: Bill) => {
          return `${row.billNum0}`;
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        className: "min-w-[160px]",
        render: (row: Bill) => {
          return `${"$"}${formatBillingPrice(row.discountPrice0, row.pricePrecision)}`;
        },
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        className: "min-w-[120px]",
        render: (row: Bill) => {
          return `${"$"}${formatDecimalAmount(row.amountDecimal)}`;
        },
      },
      {
        accessorKey: "voucherDiscount",
        header: "Voucher Discount",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return `${"$"}${formatDecimalAmount(row.voucherAmountDecimal)}`;
        },
      },
      {
        accessorKey: "totalDue",
        header: "Total Due",
        className: "min-w-[120px]",
        render: (row: Bill) => {
          return `${"$"}${formatDecimalAmount(row.payableDecimal)}`;
        },
      },
    ],
    [filterOptions.cycleType],
  );
  const exportFile = useCallback(() => {
    if (!billList || !billList.length) {
      message.warning("No Data!");
      return;
    }
    if (billList) {
      const tableData: any = billList.map((row: any) => {
        return {
          ["Billing Period"]: getDateRangeDisplay(
            filterOptions.cycleType,
            row?.startTime,
            row?.endTime,
          ),
          ["Endpoint"]: row?.ownerID || "",
          ["GPU Type"]: row?.productName || "",
          ["Usage Duration" + "(seconds)"]: row?.billNum0
            ? `${row.billNum0}`
            : "/",
          ["Unit Price" + EXCEL_MONEY_HEADER_SUFFIX]: formatBillingPrice(
            row.discountPrice0,
            row.pricePrecision,
          ),
          ["Subtotal" + EXCEL_MONEY_HEADER_SUFFIX]: formatDecimalAmount(
            row.amountDecimal,
          ),
          ["Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX]: formatDecimalAmount(
            row.voucherAmountDecimal,
          ),
          ["Total Due" + EXCEL_MONEY_HEADER_SUFFIX]: formatDecimalAmount(
            row.payableDecimal,
          ),
        };
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(tableData, {
        header: [
          "Billing Period",
          "Endpoint",
          "GPU Type",
          "Usage Duration" + "(seconds)",
          "Unit Price" + EXCEL_MONEY_HEADER_SUFFIX,
          "Subtotal" + EXCEL_MONEY_HEADER_SUFFIX,
          "Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX,
          "Total Due" + EXCEL_MONEY_HEADER_SUFFIX,
        ],
      });
      XLSX.utils.book_append_sheet(wb, ws, "sheetName");
      XLSX.writeFile(wb, `GPU-Serverless-Ondemand-Billing.xlsx`);
    }
  }, [billList, filterOptions.cycleType]);
  const [dateGroupOptions] = useState<any>(createCopyDateGroupOptions());
  const prevFilterOptions = useRef<IFilterOptions | undefined>();
  const prevAbortController = useRef<AbortController | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { cycleType, productCategory, startTime, endTime } = filterOptions;
    if (prevAbortController.current) {
      prevAbortController.current.abort();
    }
    // Pseudo pagination, not requesting the first page, no need to actually send a request
    if (filterOptions.currentPage !== 1) {
      setLoading(true);
      setTimeout(() => setLoading(false), 200);
      return;
    }
    if (
      isEqual(prevFilterOptions.current, filterOptions) &&
      !prevAbortController.current?.signal.aborted
    ) {
      return;
    }
    const abortController = new AbortController();
    prevAbortController.current = abortController;
    if (!startTime || !endTime) {
      setBillList([]);
      return;
    }
    prevFilterOptions.current = filterOptions;
    const param: GetBillListParams = {
      cycleType,
      productCategory,
      startTime: getUTCTimestampByTimezoneToDate(startTime.toDate()).toString(),
      endTime: getUTCTimestampByTimezoneToDate(
        endTime.add(1, "day").subtract(1, "second").toDate(),
      ).toString(),
    };
    if (filterOptions.productName) {
      param.productName = filterOptions.productName;
    }
    if (filterOptions.category) {
      param.category = filterOptions.category;
    }
    if (filterOptions.ownerId) {
      param.ownerId = filterOptions.ownerId;
    }
    setLoading(true);
    getBillList(param, abortController.signal)
      .then((res: any) => {
        setBillList(res.bills);
        setLoading(false);
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          setLoading(false);
        }
      });
  }, [filterOptions]);
  return (
    <div>
      <div className="mb-[30px] flex flex-row justify-between items-end">
        <div className="flex flex-row items-end gap-x-4">
          <div>
            <p className={styles.filter_label}>{"Time Range"}</p>
            <DateRangePicker
              style={{ maxWidth: 277 }}
              startTime={filterOptions.startTime?.toDate()}
              endTime={filterOptions.endTime?.toDate()}
              onChange={(date) => {
                handleChange({
                  startTime: date?.from ? dayjs(date?.from) : undefined,
                  endTime: date?.to ? dayjs(date?.to) : undefined,
                  currentPage: 1,
                });
                analytics.trackClick(
                  CLICK_BTN_IDs.BILLING.BILLING_DETAIL_PICK_DATE,
                  {
                    startTime: date?.from,
                    endTime: date?.to,
                  },
                );
              }}
            />
          </div>
          <div>
            <p className={styles.filter_label}>{"Group By"}</p>
            <DateToggleGroup
              selected={filterOptions.cycleType}
              options={dateGroupOptions}
              onCycleChange={(cycleType) => {
                handleChange({ cycleType, currentPage: 1 });
                analytics.trackClick(
                  CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SELECTED_TIME_GROUP,
                  {
                    cycleType,
                  },
                );
              }}
            />
          </div>
          <SearchInput
            className="h-9"
            placeholder={"Endpoint"}
            style={{ maxWidth: 210 }}
            onSearch={(value) => {
              handleChange({
                currentPage: 1,
                ownerId: value,
              });
              analytics.trackClick(
                CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SEARCH_ENDPOINT,
                {
                  endpoint: value,
                },
              );
            }}
          />
          <SearchInput
            className="h-9"
            placeholder={"GPU Type"}
            style={{ maxWidth: 210 }}
            onSearch={(value) => {
              handleChange({
                currentPage: 1,
                productName: value,
              });
              analytics.trackClick(
                CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SEARCH_GPU_TYPE,
                {
                  gpuType: value,
                },
              );
            }}
          />
        </div>
        <ConsoleButton
          size="lg"
          onClick={exportFile}
          id={CLICK_BTN_IDs.BILLING.BILLING_DETAIL_EXPORT_EXCEL}
          className={styles.export_button}
        >
          {"Export"}
        </ConsoleButton>
      </div>

      <Table loading={loading}>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                className={`${column.className} ${index === 0 ? styles.fixed_first_column_header : ""}`}
                key={column.accessorKey}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {billList.length > 0 && (
          <TableBody>
            {billList
              .slice(
                (filterOptions.currentPage - 1) * pageSize,
                filterOptions.currentPage * pageSize,
              )
              .map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => {
                    const accessorKey = columns[colIndex]
                      .accessorKey as keyof typeof row;
                    return (
                      <TableCell
                        key={column.accessorKey}
                        className={`${styles.table_cell} ${colIndex === 0 ? styles.fixed_first_column : ""}`}
                      >
                        {column.render
                          ? column.render(row)
                          : typeof row[accessorKey] === "object" &&
                              row[accessorKey] !== null
                            ? JSON.stringify(row[accessorKey])
                            : String(row[accessorKey] ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        )}
        {loading && (
          <div className="min-h-[300px]">
            <TableSpinner />
          </div>
        )}
        {!loading && billList.length === 0 && (
          <div className="w-full flex justify-center items-center table-caption col-span-full">
            <div className="min-h-[300px] flex flex-col justify-center items-center">
              <NoData />
            </div>
          </div>
        )}
      </Table>
      {!loading && billList.length !== 0 && (
        <StandardPagination
          className="mt-8"
          total={billList.length}
          pageSize={pageSize}
          defaultCurrent={filterOptions.currentPage}
          onChange={(page) => handleChange({ currentPage: page })}
        />
      )}
    </div>
  );
};
export default ServerlessTable;
