"use client";

import { Table, TableColumn } from "@/app/billing/components/table/Table";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { orderList, getStripeInvoiceUrl } from "@/api/buy";
import { cn } from "@/lib/utils";
import { getUTCTimestampByTimezoneToDate } from "@/lib/utils/date";
import styles from "./BillingTable.module.scss";
import { usePermission } from "@/lib/hooks/usePermission";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import { PERMISSION } from "@/constants/constants";
import { getDateDisplay } from "@/lib/utils/date";
import StandardPagination from "@/components/ui/standard/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Loader2 } from "lucide-react";
import Big from "big.js";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Paying: {
    label: "Paying",
    className:
      "inline-flex items-center rounded-radius-sm bg-[var(--fill-3)] px-2 py-[2px] text-[var(--orange-1)]",
  },
  Success: {
    label: "Payment successful",
    className:
      "inline-flex items-center rounded-radius-sm bg-[var(--fill-3)] px-2 py-[2px] text-[var(--green-1)]",
  },
  Failed: {
    label: "Payment failed",
    className:
      "inline-flex items-center rounded-radius-sm bg-[var(--fill-3)] px-2 py-[2px] text-[var(--red-1)]",
  },
  Canceled: {
    label: "Payment closed",
    className:
      "inline-flex items-center rounded-radius-sm bg-[var(--fill-3)] px-2 py-[2px] text-[var(--dark-3)]",
  },
};

const getStatusDisplay = (status: string) => {
  if (status === "Success") return STATUS_MAP.Success;
  if (status === "Failed") return STATUS_MAP.Failed;
  if (status === "Paying" || status === "WaitingPay") return STATUS_MAP.Paying;
  if (status === "Expired" || status === "expired") return STATUS_MAP.Canceled;
  return STATUS_MAP.Canceled;
};

const formatTransactionAmount = (raw: number | string | undefined | null) => {
  const amount = new Big(raw || 0);
  const isNegative = amount.lt(0);
  const formatted = `$${amount.abs().toFixed(2)}`;

  if (isNegative) {
    return <span style={{ color: "var(--red-1)" }}>-{formatted}</span>;
  }
  return formatted;
};

interface FilterOptions {
  currentPage: number;
  startTime?: dayjs.Dayjs;
  endTime?: dayjs.Dayjs;
  status?: string;
  orderType?: "refund" | "recharge";
  paymentMethod?: string;
}

function ReceiptLink({ oid }: { oid: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getStripeInvoiceUrl(oid);
      if (res.invoiceUrl) {
        window.open(res.invoiceUrl, "_blank");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={cn(
        styles.link,
        "underline bg-transparent border-none cursor-pointer p-0",
        loading && "opacity-50 cursor-not-allowed",
      )}
      id={CLICK_BTN_IDs.BILLING.TRANSACTIONS_DOWNLOAD_INVOICE}
    >
      {loading ? (
        <span className="inline-flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading
        </span>
      ) : (
        "Download"
      )}
    </button>
  );
}

export function BillingHistory() {
  const columns: TableColumn[] = [
    {
      title: "Transaction ID",
      dataIndex: "oid",
    },
    {
      title: "Transaction Date",
      dataIndex: "transactionDate",
      render(v) {
        return getDateDisplay(Number(v), "hour");
      },
    },
    {
      title: "Transaction Type",
      dataIndex: "orderType",
      render(v: string) {
        if (v === "refund") return "Refund";
        return "Recharge";
      },
    },
    {
      title: "Note",
      dataIndex: "note",
    },
    {
      title: "Payment Method",
      dataIndex: "channel",
    },
    {
      title: "Status",
      dataIndex: "status",
      render(v: string) {
        const status = getStatusDisplay(v);
        return <span className={status.className}>{status.label}</span>;
      },
    },
    {
      title: "Amount",
      dataIndex: "payCount",
      align: "right" as const,
      render(_, record) {
        const raw = record.payCount == 0 ? record.price : record.payCount;
        return formatTransactionAmount(raw);
      },
    },
    {
      title: "Tax Amount",
      dataIndex: "taxAmount",
      align: "right" as const,
      render(v) {
        return formatTransactionAmount(v);
      },
    },
    {
      title: "Gross Amount",
      dataIndex: "grossAmount",
      align: "right" as const,
      render(v) {
        return formatTransactionAmount(v);
      },
    },
    {
      title: "Receipt",
      dataIndex: "oid",
      render(_, record) {
        if (!record.invoiceAddress) {
          return "";
        }
        return <ReceiptLink oid={record.oid} />;
      },
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    currentPage: 1,
  });
  const [total, setTotal] = useState(0);

  // billing transactions permission
  const hasBillingTransactionsPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.transactions,
    action: PERMISSION.ACTION.all,
  });

  useEffect(() => {
    if (!hasBillingTransactionsPermission) {
      setLoading(false);
      return;
    }
    let stale = false;
    setLoading(true);
    orderList({
      inputs: "",
      pageIndex: filterOptions.currentPage,
      pageSize: PAGE_SIZE,
      startTime: filterOptions.startTime
        ? getUTCTimestampByTimezoneToDate(
            filterOptions.startTime?.toDate(),
          ).toString()
        : undefined,
      endTime: filterOptions.endTime
        ? getUTCTimestampByTimezoneToDate(
            filterOptions.endTime?.add(1, "day").subtract(1, "second").toDate(),
          ).toString()
        : undefined,
      status: filterOptions.status !== "all" ? filterOptions.status : undefined,
      orderType: filterOptions.orderType,
      channel:
        filterOptions.paymentMethod !== "all"
          ? filterOptions.paymentMethod
          : undefined,
    })
      .then((res) => {
        if (!stale && Array.isArray(res.orders)) {
          setData(res.orders);
          setTotal(res.total || 0);
        }
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [filterOptions, hasBillingTransactionsPermission]);

  const handlePageChange = (page: number) => {
    setFilterOptions((prev) => ({ ...prev, currentPage: page }));
  };

  const handleChange = useCallback(
    (options: Partial<FilterOptions>) => {
      setFilterOptions({ ...filterOptions, ...options });
    },
    [filterOptions],
  );

  return (
    <div>
      <div className="flex flex-row gap-x-[10px] items-end mb-[30px]">
        <div>
          <p className={styles.filter_label}>Time Range</p>
          <DateRangePicker
            style={{ maxWidth: 277 }}
            startTime={filterOptions.startTime?.toDate()}
            endTime={filterOptions.endTime?.toDate()}
            allowEmpty={true}
            onChange={(date) => {
              analytics.trackClick(
                CLICK_BTN_IDs.BILLING.TRANSACTIONS_PICK_DATE,
                {
                  startTime: date?.from ? dayjs(date?.from) : undefined,
                  endTime: date?.to ? dayjs(date?.to) : undefined,
                },
              );
              handleChange({
                startTime: date?.from ? dayjs(date?.from) : undefined,
                endTime: date?.to ? dayjs(date?.to) : undefined,
                currentPage: 1,
              });
            }}
          />
        </div>
        <Select
          value={filterOptions.orderType || "all"}
          onValueChange={(value) => {
            handleChange({
              currentPage: 1,
              orderType:
                value === "all" ? undefined : (value as "refund" | "recharge"),
            });
          }}
        >
          <SelectTrigger
            className={cn(
              "w-[257px] text-groupbtn-foreground h-9",
              styles.select_trigger,
            )}
          >
            <span className={styles.select_label}>Transaction Type:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {[
              { label: "All", value: "all" },
              { label: "Recharge", value: "recharge" },
              { label: "Refund", value: "refund" },
            ].map((type) => (
              <SelectItem value={type.value} key={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterOptions.paymentMethod || "all"}
          onValueChange={(value) => {
            handleChange({
              currentPage: 1,
              paymentMethod: value === "all" ? undefined : value,
            });
          }}
        >
          <SelectTrigger
            className={cn(
              "w-[257px] text-groupbtn-foreground h-9",
              styles.select_trigger,
            )}
          >
            <span className={styles.select_label}>Payment Method:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {[
              { label: "All", value: "all" },
              { label: "Stripe", value: "Stripe" },
              { label: "Corporate transfer", value: "Corporate Transfer" },
            ].map((type) => (
              <SelectItem value={type.value} key={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterOptions.status || "all"}
          onValueChange={(value) => {
            analytics.trackClick(
              CLICK_BTN_IDs.BILLING.TRANSACTIONS_SELECTED_STATUS,
              {
                status: value,
              },
            );
            handleChange({
              currentPage: 1,
              status: value === "all" ? undefined : value,
            });
          }}
        >
          <SelectTrigger
            className={cn(
              "w-[257px] text-groupbtn-foreground h-9",
              styles.select_trigger,
            )}
          >
            <span className={styles.select_label}>Status:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {[
              { label: "All", value: "all" },
              { label: "Paying", value: "WaitingPay" },
              { label: "Payment successful", value: "Success" },
              { label: "Payment failed", value: "Failed" },
              { label: "Payment closed", value: "Canceled" },
            ].map((type) => (
              <SelectItem value={type.value} key={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table
        columns={columns}
        data={data}
        rowKey={"oid"}
        loading={loading}
      ></Table>
      {!loading && data.length > 0 && (
        <StandardPagination
          className="mt-8"
          total={total}
          pageSize={PAGE_SIZE}
          defaultCurrent={filterOptions.currentPage}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}
