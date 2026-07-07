"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
import { Bill, getEnterpriseBillList, GetBillListParams } from "@/api/billing";
import {
  getDateDisplay,
  getUTCTimestampByTimezoneToDate,
} from "@/lib/utils/date";
import {
  balanceFormat,
  dealMoneyWithPrecision,
  formatDecimalAmount,
} from "@/lib/utils/money";
import { IFilterOptions } from "../index";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import styles from "../page.module.scss";

const EnterpriseTable = ({ pageSize }: { pageSize: number }) => {
  const [billList, setBillList] = useState<Bill[]>([]);
  const [filterOptions, setFilterOptions] = useState<IFilterOptions>({
    cycleType: "Day",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    productCategory: "token_saving_plan",
    currentPage: 1,
    productName: "",
    category: "",
    ownerId: "",
  });
  const [loading, setLoading] = useState(true);
  const prevFilterOptions = useRef<IFilterOptions | undefined>();
  const prevAbortController = useRef<AbortController | undefined>();

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
        render: (row: Bill) => getDateDisplay(Number(row.startTime), "day"),
      },
      {
        accessorKey: "productName",
        header: "Model Name",
        render: (row: Bill) => row.productName,
      },
      {
        accessorKey: "pricingModel",
        header: "Pricing Model",
        render: () => "LLM Saving Plan",
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price(/Mt)",
        render: (row: Bill) => {
          const unitPrice = dealMoneyWithPrecision(
            row.discountPrice0,
            row.pricePrecision,
          );
          return `$${unitPrice}`;
        },
      },
      {
        accessorKey: "committedUsage",
        header: "Committed Usage (TPM)",
        render: (row: Bill) => {
          const committedUsage = row.committedUsage;
          return committedUsage.toLocaleString();
        },
      },
      {
        accessorKey: "billableUsage",
        header: "Billable Usage",
        render: (row: Bill) => {
          const minutesInDay = 1440;
          const committedUsage = row.committedUsage;
          return `${committedUsage.toLocaleString()} TPM × ${minutesInDay} minutes`;
        },
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        render: (row: Bill) => `$${formatDecimalAmount(row.amountDecimal)}`,
      },
      {
        accessorKey: "voucherDiscount",
        header: "Voucher Discount",
        render: (row: Bill) =>
          `$${formatDecimalAmount(row.voucherAmountDecimal)}`,
      },
      {
        accessorKey: "totalDue",
        header: "Total Due",
        render: (row: Bill) => `$${formatDecimalAmount(row.payableDecimal)}`,
      },
    ],
    [],
  );

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
    getEnterpriseBillList(param, abortController.signal)
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
            <p className={styles.filter_label}>Time Range</p>
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
              }}
            />
          </div>
        </div>
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
          <div className="w-full justify-center items-center table-caption col-span-full">
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

export default EnterpriseTable;
