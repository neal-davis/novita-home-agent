"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { Bill, getBillListMonthly } from "@/api/billing";
import styles from "../page.module.scss";
import { getUTCTimestampByTimezoneToDate } from "@/lib/utils/date";
import { formatDecimalAmount } from "@/lib/utils/money";
import { IFilterOptions } from "../index";
import { EXCEL_MONEY_HEADER_SUFFIX } from "../excelMoneyHeader";
import * as XLSX from "xlsx";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import { message } from "@/components/ui/standard/notify";
import { ConsoleButton } from "@/app/user/components/console-button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
const SummaryTableMonthly = ({
  copy,
  pageSize,
}: {
  copy?: unknown;
  pageSize: number;
}) => {
  const [billList, setBillList] = useState<Bill[]>([]);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions>({
    cycleType: "Month",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    productCategory: "summary",
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
  // function dealMonthDate(timestamp: number) {
  //   if (Number(timestamp || 0) > 0) {
  //     return dayjs.unix(timestamp).format("YYYY-MM");
  //   } else {
  //     return "/";
  //   }
  // }
  const columns = useMemo(
    () => [
      {
        accessorKey: "createTime",
        header: "Billing Period",
        render: (row: any) => {
          return `${row.cycle}`;
        },
      },
      {
        accessorKey: "amount",
        header: "Subtotal",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.amountDecimal)}`;
        },
      },
      {
        accessorKey: "voucherAmount",
        header: "Voucher Discount",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.voucherAmountDecimal)}`;
        },
      },
      {
        accessorKey: "payAmount",
        header: "Total Due",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.payableDecimal)}`;
        },
      },
    ],
    [],
  );
  const exportFile = useCallback(() => {
    if (!billList || !billList.length) {
      message.warning("No Data!");
      return;
    }
    if (billList) {
      const tableData: any = billList.map((row: any) => {
        return {
          ["Billing Period"]: `${row.cycle}`,
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
          "Subtotal" + EXCEL_MONEY_HEADER_SUFFIX,
          "Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX,
          "Total Due" + EXCEL_MONEY_HEADER_SUFFIX,
        ],
      });
      XLSX.utils.book_append_sheet(wb, ws, "sheetName");
      XLSX.writeFile(wb, `Summary-Monthly-Billing.xlsx`);
    }
  }, [billList]);
  // const [dateGroupOptions, ] = useState<any>(
  //   dateGroupOptions,
  // );
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
    const param: any = {
      cycleType,
      category: productCategory,
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
    getBillListMonthly(param, abortController.signal)
      .then((res) => {
        setBillList(res.bills);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoading(false);
        }
      });
  }, [filterOptions]);
  return (
    <div>
      <div className="mb-[30px] flex flex-row justify-between items-end">
        <div className="flex flex-row gap-x-4">
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
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
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
                  {columns.map((column, index) => {
                    const accessorKey = columns[index]
                      .accessorKey as keyof typeof row;
                    return (
                      <TableCell
                        key={column.accessorKey}
                        className={styles.table_cell}
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
export default SummaryTableMonthly;
