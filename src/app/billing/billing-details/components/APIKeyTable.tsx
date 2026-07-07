"use client";
function createCopyDateGroupOptionsAPIKey() {
  return [
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
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
import { getBillListByAPIKey, GetBillListParams } from "@/api/billing";
import styles from "../page.module.scss";
import {
  getDateRangeDisplay,
  getUTCTimestampByTimezoneToDate,
} from "@/lib/utils/date";
import { formatBillingPrice, formatDecimalAmount } from "@/lib/utils/money";
import { IFilterOptions } from "../index";
import { EXCEL_MONEY_HEADER_SUFFIX } from "../excelMoneyHeader";
import * as XLSX from "xlsx";
import { ConsoleButton } from "@/app/user/components/console-button";
import DateToggleGroup from "./DateToggleGroup";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc-common";
import dayjs from "dayjs";
import isEqual from "lodash-es/isEqual";
import { message } from "@/components/ui/standard/notify";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  isModelSupportPromptCache,
  isMultimodalModel,
  renderInputToken,
  renderOutputToken,
  renderInputUnitPrice,
  renderOutputUnitPrice,
} from "./billTokenPriceFieldRenderers";
import {
  addLlmCompatibleMultimodalExportFields,
  createFullMultimodalHeaderRows,
  getFullMultimodalTotal,
} from "./multimodalBillingFields";
import {
  formatGenApiApiKeyOriginalAmount,
  formatGenApiApiKeyUsage,
  formatGenApiApiKeyUsageUnit,
  getGenApiApiKeyExportValues,
} from "./genApiBillingFields";
const APIKeyTable = ({
  copy,
  pageSize,
}: {
  copy?: unknown;
  pageSize: number;
}) => {
  const [billList, setBillList] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions>({
    cycleType: "Day",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    productCategory: "llm",
    currentPage: 1,
    productName: "",
    category: "all",
    ownerId: "",
  });
  const handleChange = useCallback((obj: Partial<IFilterOptions>) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      ...obj,
    }));
  }, []);
  const handleRenderInputUnitPrice = useCallback(
    (row: any) => renderInputUnitPrice(row, "$"),
    [],
  );
  const handleRenderOutputUnitPrice = useCallback(
    (row: any) => renderOutputUnitPrice(row, "$"),
    [],
  );
  const columns = useMemo(
    () => [
      {
        accessorKey: "apiKey",
        header: "Key Name",
        render: (row: any) => row.apikeyName,
      },
      {
        accessorKey: "apiKey",
        header: "API Key",
        render: (row: any) => row.apikeyMask,
      },
      {
        accessorKey: "productName",
        header: "Model Name",
        className: "min-w-[200px]",
        render: (row: any) => {
          return row.productName + (row.billingMethod == 5 ? `(batch)` : "");
        },
      },
      {
        accessorKey: "billingPeriod",
        header: "Billing Period",
        className: "min-w-[200px]",
        render: (row: any) =>
          getDateRangeDisplay(
            filterOptions.cycleType,
            row?.startTime,
            row?.endTime,
          ),
      },
      {
        accessorKey: "inputUsage",
        header: "Input Tokens" + "(tokens)",
        className: "min-w-[200px]",
        render: (row: any) =>
          row.category === "llm" ? renderInputToken(row) : "-",
      },
      {
        accessorKey: "outputUsage",
        header: "Output Tokens" + "(tokens)",
        className: "min-w-[200px]",
        render: (row: any) =>
          row.category === "llm" ? renderOutputToken(row) : "-",
      },
      {
        accessorKey: "inputUnitPrice",
        header: "Input Unit Price" + "(/Mt)",
        className: "min-w-[200px]",
        render: (row: any) =>
          row.category === "llm" ? handleRenderInputUnitPrice(row) : "-",
      },
      {
        accessorKey: "outputUnitPrice",
        header: "Output Unit Price" + "(/Mt)",
        className: "min-w-[200px]",
        render: (row: any) =>
          row.category === "llm" ? handleRenderOutputUnitPrice(row) : "-",
      },
      {
        accessorKey: "requestCount",
        header: "Request Count",
        className: "min-w-[120px]",
        render: (row: any) => {
          return row.requestCount || "";
        },
      },
      {
        accessorKey: "usage",
        header: "Usage",
        className: "min-w-[120px]",
        render: (row: any) => formatGenApiApiKeyUsage(row),
      },
      {
        accessorKey: "usageUnit",
        header: "Usage Unit",
        className: "min-w-[120px]",
        render: (row: any) => formatGenApiApiKeyUsageUnit(row),
      },
      {
        accessorKey: "originAmount",
        header: "Original Amount",
        className: "min-w-[120px]",
        render: (row: any) => formatGenApiApiKeyOriginalAmount(row),
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        className: "min-w-[120px]",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.amountDecimal)}`;
        },
      },
      {
        accessorKey: "voucherDiscount",
        header: "Voucher Discount",
        className: "min-w-[200px]",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.voucherAmountDecimal)}`;
        },
      },
      {
        accessorKey: "totalDue",
        header: "Total Due",
        className: "min-w-[120px]",
        render: (row: any) => {
          return `${"$"}${formatDecimalAmount(row.payableDecimal)}`;
        },
      },
    ],
    [
      filterOptions.cycleType,
      handleRenderInputUnitPrice,
      handleRenderOutputUnitPrice,
    ],
  );
  const exportFile = useCallback(() => {
    if (!billList || !billList.length) {
      message.warning("No Data!");
      return;
    }
    const supportPromptCache = billList.some((row: any) =>
      isModelSupportPromptCache(row),
    );
    const COL = {
      inputTotal: "Input Tokens" + "(tokens)",
      inputUncached: "Uncached input(tokens)",
      inputCachedReads: "Cached reads input(tokens)",
      inputCachedWrites5m: "Cached writes:5m input(tokens)",
      inputCachedWrites1h: "Cached writes:1h input(tokens)",
      outputTotal: "Output Tokens" + "(tokens)",
      inputUnitPriceBeforeDiscount:
        "Input Unit Price" + "(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPrice:
        "Input Unit Price" +
        "(discount price)(/Mt)" +
        EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceBeforeDiscountUncached:
        "Uncached input(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceUncached:
        "Uncached input(discount price)(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceBeforeDiscountCachedReads:
        "Cached reads input(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceCachedReads:
        "Cached reads input(discount price)(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceBeforeDiscountCachedWrites5m:
        "Cached writes:5m input(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceCachedWrites5m:
        "Cached writes:5m input(discount price)(/Mt)" +
        EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceBeforeDiscountCachedWrites1h:
        "Cached writes:1h input(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      inputUnitPriceCachedWrites1h:
        "Cached writes:1h input(discount price)(/Mt)" +
        EXCEL_MONEY_HEADER_SUFFIX,
      outputUnitPriceBeforeDiscount:
        "Output Unit Price" + "(/Mt)" + EXCEL_MONEY_HEADER_SUFFIX,
      outputUnitPrice:
        "Output Unit Price" +
        "(discount price)(/Mt)" +
        EXCEL_MONEY_HEADER_SUFFIX,
      requestCount: "Request Count",
      usage: "Usage",
      usageUnit: "Usage Unit",
      originAmount: "Original Amount" + EXCEL_MONEY_HEADER_SUFFIX,
      subtotal: "Subtotal" + EXCEL_MONEY_HEADER_SUFFIX,
      voucherDiscount: "Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX,
      totalDue: "Total Due" + EXCEL_MONEY_HEADER_SUFFIX,
    };
    const isLlm = (row: any) => row.category === "llm";
    const money = (price: number, precision: number) =>
      formatBillingPrice(price, precision);
    const getInputTotal = (row: any) => {
      if (isMultimodalModel(row.billingMethod)) {
        return getFullMultimodalTotal(row, "input");
      }
      if (!isModelSupportPromptCache(row)) return row.billNum0;
      return (
        (Number(row.billNum0) || 0) +
        (Number(row.billNum2) || 0) +
        (Number(row.billNum3) || 0) +
        (Number(row.billNum5) || 0)
      );
    };
    const getOutputTotal = (row: any) =>
      isMultimodalModel(row.billingMethod)
        ? getFullMultimodalTotal(row, "output")
        : row.billNum1;
    const fixedHeaders = [
      "Key Name",
      "API Key",
      "Model Name",
      "Billing Period",
      COL.inputTotal,
      COL.outputTotal,
      COL.requestCount,
      COL.usage,
      COL.usageUnit,
      COL.originAmount,
      COL.subtotal,
      COL.voucherDiscount,
      COL.totalDue,
    ];
    const { headerKeys, rows, merges } =
      createFullMultimodalHeaderRows(fixedHeaders);
    const tableData = billList.map((row: any) => {
      const genApiBusinessValues = getGenApiApiKeyExportValues(row);
      const record: Record<string, string | number> = {
        ["Key Name"]: row.apikeyName,
        ["API Key"]: row.apikeyMask,
        ["Model Name"]:
          row.productName + (row.billingMethod == 5 ? `(batch)` : ""),
        ["Billing Period"]: getDateRangeDisplay(
          filterOptions.cycleType,
          row?.startTime,
          row?.endTime,
        ),
        [COL.requestCount]: row.requestCount || "",
        [COL.usage]: genApiBusinessValues.usage,
        [COL.usageUnit]: genApiBusinessValues.usageUnit,
        [COL.originAmount]: genApiBusinessValues.originAmount,
        [COL.inputTotal]: isLlm(row) ? getInputTotal(row) : "",
        [COL.outputTotal]: isLlm(row) ? getOutputTotal(row) : "",
        [COL.subtotal]: formatDecimalAmount(row.amountDecimal),
        [COL.voucherDiscount]: formatDecimalAmount(row.voucherAmountDecimal),
        [COL.totalDue]: formatDecimalAmount(row.payableDecimal),
      };
      if (isLlm(row)) {
        addLlmCompatibleMultimodalExportFields(
          row,
          record,
          isMultimodalModel(row.billingMethod),
          Boolean(isModelSupportPromptCache(row)),
        );
      }
      return headerKeys.map((key) => record[key] ?? "");
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...rows, ...tableData]);
    ws["!merges"] = merges;
    XLSX.utils.book_append_sheet(wb, ws, "sheetName");
    XLSX.writeFile(wb, `API_Key-Billing.xlsx`);
  }, [billList, filterOptions.cycleType]);
  const [dateGroupOptions] = useState<any>(createCopyDateGroupOptionsAPIKey());
  const prevFilterOptions = useRef<IFilterOptions | undefined>();
  const prevAbortController = useRef<AbortController | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (filterOptions?.startTime) {
      if (filterOptions?.startTime?.isBefore(dayjs("2026-01-01"))) {
        message.error("The query time range cannot be earlier than 2026-01-01");
        return;
      }
    }
    if (filterOptions?.endTime) {
      if (filterOptions?.endTime?.isBefore(dayjs("2026-01-01"))) {
        message.error("The query time range cannot be earlier than 2026-01-01");
        return;
      }
    }
    if (filterOptions?.startTime && filterOptions?.endTime) {
      if (filterOptions?.startTime?.isAfter(filterOptions?.endTime)) {
        message.error("The start time cannot be later than the end time");
        return;
      }
      if (
        !filterOptions?.startTime?.isAfter(
          filterOptions?.endTime?.subtract(31, "day"),
        )
      ) {
        message.error("The query time range cannot exceed 31 days");
        return;
      }
    }
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
    if (filterOptions.category === "all") {
      param.category = "";
    }
    setLoading(true);
    getBillListByAPIKey(param, abortController.signal)
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
      <div className="mb-[30px] flex flex-row justify-between items-end gap-4">
        <div className="flex flex-row items-end gap-4 flex-wrap">
          <div>
            <p className={styles.filter_label}>{"Time Range"}</p>
            <DateRangePicker
              disabled={{ before: new Date("2026-01-01") }}
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
            placeholder={"Model Name"}
            style={{ maxWidth: 210 }}
            onSearch={(value) => {
              handleChange({ currentPage: 1, productName: value });
              analytics.trackClick(
                CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SEARCH_MODEL_NAME,
              );
            }}
          />
          <Select
            value={filterOptions.category}
            onValueChange={(value) => {
              handleChange({ currentPage: 1, category: value });
            }}
          >
            <SelectTrigger className="w-[220px]">
              <span className={styles.select_label}>{"Product Type"}:</span>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="llm">LLM</SelectItem>
              <SelectItem value="gen_api">Image/Video/Search</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row gap-2">
          <ConsoleButton
            size="lg"
            onClick={exportFile}
            id={CLICK_BTN_IDs.BILLING.BILLING_DETAIL_EXPORT_EXCEL}
            className={styles.export_button}
          >
            {"Export"}
          </ConsoleButton>
        </div>
      </div>

      <div className={styles.llm_table_container}>
        <Table loading={loading}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  className={`${column.className || ""} ${index === 0 ? styles.fixed_first_column_header : ""}`}
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
                            : ((row[accessorKey] as
                                | ReactNode
                                | string
                                | number
                                | undefined) ?? "")}
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
      </div>
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
export default APIKeyTable;
