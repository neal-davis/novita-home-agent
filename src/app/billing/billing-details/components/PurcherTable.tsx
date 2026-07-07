"use client";
function createDateGroupOptions() {
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
import {
  BillByMember,
  getBillListByMember,
  GetBillListParams,
} from "@/api/billing";
import styles from "../page.module.scss";
import {
  getDateRangeDisplay,
  getUTCTimestampByTimezoneToDate,
} from "@/lib/utils/date";
import { formatDecimalAmount } from "@/lib/utils/money";
import { IFilterOptions } from "../index";
import { EXCEL_MONEY_HEADER_SUFFIX } from "../excelMoneyHeader";
import MemberCell from "@/app/components/Table/MemberCell";
import { useAppSelector } from "@/store";
import * as XLSX from "xlsx";
import { ConsoleButton } from "@/app/user/components/console-button";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import dayjs from "dayjs";
import isEqual from "lodash-es/isEqual";
import { message } from "@/components/ui/standard/notify";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import DateToggleGroup from "./DateToggleGroup";
const PurcherTable = ({
  copy,
  pageSize,
}: {
  copy?: unknown;
  pageSize: number;
}) => {
  const userInfo = useAppSelector((state) => state.user) || {};
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const members = useMemo(() => teamMembers || [], [teamMembers]);
  const prevFilterOptions = useRef<IFilterOptions | undefined>();
  const prevAbortController = useRef<AbortController | undefined>();
  const [loading, setLoading] = useState(true);
  const [billListByMember, setBillListByMember] = useState<BillByMember[]>([]);
  const [dateGroupOptions] = useState<any>(createDateGroupOptions());
  const [filterOptions, setFilterOptions] = useState<any>({
    cycleType: "Month",
    startTime: dayjs().utc().startOf("month"),
    endTime: dayjs().utc().endOf("month").subtract(1, "day").add(1, "second"),
    currentPage: 1,
    productName: "",
    category: "",
    ownerId: "",
  });
  const handleChange = useCallback((obj: Partial<any>) => {
    setFilterOptions((prevOptions: any) => ({
      ...prevOptions,
      ...obj,
    }));
  }, []);
  const purchersColumns = useMemo(
    () => [
      {
        accessorKey: "purchaserAccount",
        header: "Creator Account",
        render: (row: BillByMember) => {
          return <MemberCell memberID={row.memberId} uuid={row.userId} />;
        },
      },
      {
        accessorKey: "billingPeriod",
        header: "Billing Period",
        render: (row: BillByMember) =>
          getDateRangeDisplay(
            filterOptions.cycleType,
            row?.startTime,
            row?.endTime,
          ),
      },
      {
        accessorKey: "productName",
        header: "Product Name",
        render: (row: BillByMember) => {
          return row.productName;
        },
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        render: (row: BillByMember) => {
          return `${"$"}${formatDecimalAmount(row.amountDecimal)}`;
        },
      },
      {
        accessorKey: "voucherDiscount",
        header: "Voucher Discount",
        render: (row: BillByMember) => {
          return `${"$"}${formatDecimalAmount(row.voucherAmountDecimal)}`;
        },
      },
      {
        accessorKey: "totalDue",
        header: "Total Due",
        render: (row: BillByMember) => {
          return `${"$"}${formatDecimalAmount(row.payableDecimal)}`;
        },
      },
    ],
    [filterOptions.cycleType],
  );
  const getCreator = useCallback(
    (memberId: any, uuid: any) => {
      const targetItem = members.find(
        (item: any) => item.memberId === memberId,
      );
      if (targetItem) {
        return targetItem.email;
      } else {
        const newTargetItem = members.find((item: any) => item.userId === uuid);
        if (newTargetItem) {
          return newTargetItem.email;
        } else if (uuid === userInfo.uuid) {
          return userInfo.email;
        } else {
          return "";
        }
      }
    },
    [members, userInfo.email, userInfo.uuid],
  );
  const exportFile = useCallback(() => {
    if (!billListByMember || !billListByMember.length) {
      message.warning("No Data!");
      return;
    }
    if (billListByMember) {
      const tableData: any = billListByMember.map((row: any) => {
        return {
          ["Creator Account"]: getCreator(row.memberId, row.userId),
          ["Billing Period"]: getDateRangeDisplay(
            filterOptions.cycleType,
            row?.startTime,
            row?.endTime,
          ),
          ["Product Name"]: row.productName,
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
          "Creator Account",
          "Billing Period",
          "Product Name",
          "Subtotal" + EXCEL_MONEY_HEADER_SUFFIX,
          "Voucher Discount" + EXCEL_MONEY_HEADER_SUFFIX,
          "Total Due" + EXCEL_MONEY_HEADER_SUFFIX,
        ],
      });
      XLSX.utils.book_append_sheet(wb, ws, "sheetName");
      XLSX.writeFile(wb, `Creator-Ondemand-Billing.xlsx`);
    }
  }, [billListByMember, filterOptions.cycleType, getCreator]);
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
      setBillListByMember([]);
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
    getBillListByMember(
      {
        cycleType: param.cycleType,
        startTime: param.startTime,
        endTime: param.endTime,
      },
      abortController.signal,
    )
      .then((res) => {
        setBillListByMember(res.bills);
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
            {purchersColumns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {billListByMember.length > 0 && (
          <TableBody>
            {billListByMember
              .slice(
                (filterOptions.currentPage - 1) * pageSize,
                filterOptions.currentPage * pageSize,
              )
              .map((row, index) => (
                <TableRow key={index}>
                  {purchersColumns.map((column, index) => {
                    const accessorKey = purchersColumns[index]
                      .accessorKey as keyof typeof row;
                    return (
                      <TableCell
                        key={column.accessorKey}
                        className={styles.table_cell}
                      >
                        {column.render ? column.render(row) : row[accessorKey]}
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
        {!loading && billListByMember.length === 0 && (
          <div className="w-full flex justify-center items-center table-caption col-span-full">
            <div className="min-h-[300px] flex flex-col justify-center items-center">
              <NoData />
            </div>
          </div>
        )}
      </Table>
      {!loading && billListByMember.length !== 0 && (
        <StandardPagination
          className="mt-8"
          total={billListByMember.length}
          pageSize={pageSize}
          defaultCurrent={filterOptions.currentPage}
          onChange={(page) => handleChange({ currentPage: page })}
        />
      )}
    </div>
  );
};
export default PurcherTable;
