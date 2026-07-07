"use client";
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
import { Bill, getBillList, GetBillListParams } from "@/api/billing";
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
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import isEqual from "lodash-es/isEqual";
import { message } from "@/components/ui/standard/notify";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
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
const LLMTable = ({ copy, pageSize }: { copy?: unknown; pageSize: number }) => {
  const [billList, setBillList] = useState<Bill[]>([]);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions>({
    cycleType: "Day",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    productCategory: "llm",
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
  const handleRenderInputUnitPrice = useCallback(
    (row: Bill) => renderInputUnitPrice(row, "$"),
    [],
  );
  const handleRenderOutputUnitPrice = useCallback(
    (row: Bill) => renderOutputUnitPrice(row, "$"),
    [],
  );
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
        accessorKey: "productName",
        header: "Model Name",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return row.productName + (row.billingMethod == 5 ? `(batch)` : "");
        },
      },
      {
        accessorKey: "inputUsage",
        header: "Input Tokens" + "(tokens)",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return renderInputToken(row);
        },
      },
      {
        accessorKey: "outputUsage",
        header: "Output Tokens" + "(tokens)",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return renderOutputToken(row);
        },
      },
      {
        accessorKey: "inputUnitPrice",
        header: "Input Unit Price" + "(/Mt)",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return handleRenderInputUnitPrice(row);
        },
      },
      {
        accessorKey: "outputUnitPrice",
        header: "Output Unit Price" + "(/Mt)",
        className: "min-w-[200px]",
        render: (row: Bill) => {
          return handleRenderOutputUnitPrice(row);
        },
      },
      {
        accessorKey: "requestCount",
        header: "Request Count",
        className: "min-w-[120px]",
        render: (row: Bill) => {
          return row.requestCount || "";
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
      subtotal: "Subtotal" + EXCEL_MONEY_HEADER_SUFFIX,
      voucherDiscount: "Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX,
      totalDue: "Total Due" + EXCEL_MONEY_HEADER_SUFFIX,
    };
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
    const getBaseExportFields = (row: any): Record<string, any> => {
      const rowSupportsCache = isModelSupportPromptCache(row);
      const rowIsMultimodal = isMultimodalModel(row.billingMethod);
      return {
        [COL.inputTotal]: getInputTotal(row),
        ...(supportPromptCache
          ? {
              [COL.inputUncached]: rowSupportsCache ? row.billNum0 : "",
              [COL.inputCachedReads]: rowSupportsCache ? row.billNum2 : "",
              [COL.inputCachedWrites5m]: rowSupportsCache ? row.billNum3 : "",
              [COL.inputCachedWrites1h]: rowSupportsCache ? row.billNum5 : "",
            }
          : {}),
        [COL.outputTotal]: getOutputTotal(row),
        [COL.inputUnitPriceBeforeDiscount]:
          !rowSupportsCache && !rowIsMultimodal
            ? money(row.basePrice0, row.pricePrecision)
            : "",
        [COL.inputUnitPrice]:
          !rowSupportsCache && !rowIsMultimodal
            ? money(row.discountPrice0, row.pricePrecision)
            : "",
        ...(supportPromptCache
          ? {
              [COL.inputUnitPriceBeforeDiscountUncached]: rowSupportsCache
                ? money(row.basePrice0, row.pricePrecision)
                : "",
              [COL.inputUnitPriceUncached]: rowSupportsCache
                ? money(row.discountPrice0, row.pricePrecision)
                : "",
              [COL.inputUnitPriceBeforeDiscountCachedReads]: rowSupportsCache
                ? money(row.basePrice2, row.pricePrecision)
                : "",
              [COL.inputUnitPriceCachedReads]: rowSupportsCache
                ? money(row.discountPrice2, row.pricePrecision)
                : "",
              [COL.inputUnitPriceBeforeDiscountCachedWrites5m]: rowSupportsCache
                ? money(row.basePrice3, row.pricePrecision)
                : "",
              [COL.inputUnitPriceCachedWrites5m]: rowSupportsCache
                ? money(row.discountPrice3, row.pricePrecision)
                : "",
              [COL.inputUnitPriceBeforeDiscountCachedWrites1h]: rowSupportsCache
                ? money(row.basePrice5, row.pricePrecision)
                : "",
              [COL.inputUnitPriceCachedWrites1h]: rowSupportsCache
                ? money(row.discountPrice5, row.pricePrecision)
                : "",
            }
          : {}),
        [COL.outputUnitPriceBeforeDiscount]: !rowIsMultimodal
          ? money(row.basePrice1, row.pricePrecision)
          : "",
        [COL.outputUnitPrice]: !rowIsMultimodal
          ? money(row.discountPrice1, row.pricePrecision)
          : "",
      };
    };
    const fixedHeaders = [
      "Billing Period",
      "Model Name",
      COL.inputTotal,
      COL.outputTotal,
      COL.requestCount,
      COL.subtotal,
      COL.voucherDiscount,
      COL.totalDue,
    ];
    const { headerKeys, rows, merges } =
      createFullMultimodalHeaderRows(fixedHeaders);
    const tableData = billList.map((row: any) => {
      const record: Record<string, string | number> = {
        ["Billing Period"]: getDateRangeDisplay(
          filterOptions.cycleType,
          row?.startTime,
          row?.endTime,
        ),
        ["Model Name"]:
          row.productName + (row.billingMethod == 5 ? `(batch)` : ""),
        ...getBaseExportFields(row),
        [COL.requestCount]: row.requestCount || "",
        [COL.subtotal]: formatDecimalAmount(row.amountDecimal),
        [COL.voucherDiscount]: formatDecimalAmount(row.voucherAmountDecimal),
        [COL.totalDue]: formatDecimalAmount(row.payableDecimal),
      };
      addLlmCompatibleMultimodalExportFields(
        row,
        record,
        isMultimodalModel(row.billingMethod),
        Boolean(isModelSupportPromptCache(row)),
      );
      return headerKeys.map((key) => record[key] ?? "");
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...rows, ...tableData]);
    ws["!merges"] = merges;
    XLSX.utils.book_append_sheet(wb, ws, "sheetName");
    XLSX.writeFile(wb, `LLM-Serverless-Endpoints-Billing.xlsx`);
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
      <div className="mb-[30px] flex flex-row justify-between items-end gap-4">
        <div className="flex flex-row items-end gap-4 flex-wrap">
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
            placeholder={"Model Name"}
            style={{ maxWidth: 210 }}
            onSearch={(value) => {
              handleChange({ currentPage: 1, productName: value });
              analytics.trackClick(
                CLICK_BTN_IDs.BILLING.BILLING_DETAIL_SEARCH_MODEL_NAME,
              );
            }}
          />
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
export default LLMTable;
