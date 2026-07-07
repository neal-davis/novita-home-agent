"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import { updateStripeCustomerPortal } from "@/api/buy";
import { getMonthlyBill } from "@/api/billing";
import { getDateRangeDisplay } from "@/lib/utils/date";
import { NOVITA_URL } from "@/constants/urls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoData } from "@/components/ui/standard/no-data";
import { formatMonthlyBillAmount } from "@/lib/utils/money";
import { cn } from "@/lib/utils";
import styles from "./index.module.scss";

interface BillRecord {
  period: string;
  usageTotal: string;
  voucherApplied: string;
  balanceApplied: string;
  taxAmount: string;
  grossAmount: string;
  amountDue: string;
  amountPaid: string;
  status: "pending" | "outed" | "paid" | "overdue" | "voided";
  statusText: string;
  invoice: string;
  invoiceUrl?: string;
}

const getStatusDotClassName = (status: BillRecord["status"]) => {
  const statusMap = {
    pending: styles.status_dot_upcoming,
    outed: styles.status_dot_payment_due,
    overdue: styles.status_dot_overdue,
    voided: styles.status_dot_voided,
    paid: styles.status_dot_paid,
  };
  return statusMap[status] || styles.status_dot_upcoming;
};

const STATUS_OPTIONS: BillRecord["status"][] = [
  "pending",
  "outed",
  "overdue",
  "voided",
  "paid",
];

const getStatusDisplayText = (status: BillRecord["status"]) => {
  const statusTextMap = {
    pending: "Upcoming",
    outed: "Payment Due",
    paid: "Paid",
    overdue: "Overdue",
    voided: "Voided",
  };
  return statusTextMap[status] || status;
};

export function MonthlyBill() {
  const [isLoading, setIsLoading] = useState(false);
  const [billData, setBillData] = useState<BillRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        setIsLoadingData(true);
        const response = await getMonthlyBill();

        const transformedData: BillRecord[] = response.data.map((bill) => {
          let statusText: string = "-";
          if (bill.status === "pending") {
            statusText = "Upcoming";
          } else if (bill.status === "outed") {
            statusText = "Payment Due";
          } else if (bill.status === "paid") {
            statusText = "Paid";
          } else if (bill.status === "overdue") {
            statusText = "Overdue";
          } else if (bill.status === "voided") {
            statusText = "Voided";
          }

          const isOutstanding =
            Number(bill.totalAmount) === 0 && Number(bill.debtAmount) > 0;

          return {
            period: getDateRangeDisplay(
              "Day",
              Number(bill.startTime),
              Number(bill.endTime),
            ),
            usageTotal:
              bill.totalAmount && !isOutstanding
                ? `$${formatMonthlyBillAmount(bill.totalAmount)}`
                : "-",
            voucherApplied:
              bill.voucherPayAmount && !isOutstanding
                ? `$${formatMonthlyBillAmount(bill.voucherPayAmount)}`
                : "-",
            balanceApplied:
              bill.cashPayAmount && !isOutstanding
                ? `$${formatMonthlyBillAmount(bill.cashPayAmount)}`
                : "-",
            taxAmount:
              bill.taxAmount && !isOutstanding
                ? `$${formatMonthlyBillAmount(bill.taxAmount)}`
                : "-",
            grossAmount:
              bill.grossAmount && !isOutstanding
                ? `$${formatMonthlyBillAmount(bill.grossAmount)}`
                : "-",
            amountDue: bill.debtAmount
              ? `$${formatMonthlyBillAmount(bill.debtAmount)}`
              : "-",
            amountPaid: bill.repaidAmount
              ? `$${formatMonthlyBillAmount(bill.repaidAmount)}`
              : "-",
            status: bill.status as BillRecord["status"],
            statusText: statusText,
            invoice: "Download",
            invoiceUrl: bill.invoiceUrl,
          };
        });

        setBillData(transformedData);
      } catch (error) {
        console.error("Failed to fetch monthly bill data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBillData();
  }, []);

  const handleClick = useCallback(() => {
    setIsLoading(true);
    updateStripeCustomerPortal({
      redirect_url: NOVITA_URL.BILLING_TRANSACTIONS,
    })
      .then((res) => {
        const { url } = res;
        window.open(url, "_blank");
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredBillData = useMemo(() => {
    if (selectedStatus === "All") {
      return billData;
    }
    return billData.filter((bill) => bill.status === selectedStatus);
  }, [billData, selectedStatus]);

  return (
    <div className={styles.monthly_bill}>
      <div className={styles.header}>
        <div className={styles.title}>Monthly Bill</div>
        <Button
          variant="link"
          size="sl"
          className={styles.update_billing_info}
          onClick={handleClick}
          disabled={isLoading}
        >
          Update billing info
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <span className="iconfont icon-right-arrow ml-2"></span>
          )}
        </Button>
      </div>

      <div className={styles.note_section}>
        <div className={styles.note_header}>
          <Info className={styles.note_icon} />
          <span className={styles.note_title}>Note:</span>
        </div>
        <ul className={styles.note_list}>
          <li>
            Monthly bills are issued at{" "}
            <b>10:00 AM UTC on the 3rd day of the following month.</b>
          </li>
          <li>
            Current billing data is <b>not real-time</b> and is displayed with a{" "}
            <b>one-day delay (T-1)</b>.
          </li>
          <li>
            Billing updates take effect starting from November. Outstanding
            balances prior to October have been{" "}
            <b>consolidated into a single record under the October bill</b>.
          </li>
        </ul>
      </div>

      <Select
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value)}
      >
        <SelectTrigger
          className={cn(
            "w-[200px] text-groupbtn-foreground h-9",
            styles.select_trigger,
          )}
        >
          <div>
            <span className={`${styles.select_label} mr-1`}>Status:</span>
            <SelectValue placeholder="All" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem value={status} key={status}>
              {getStatusDisplayText(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className={`${styles.bill_table_wrapper} mt-2`}>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-0)]" />
          </div>
        ) : (
          <Table className={styles.bill_table}>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Billing Period</TableHead>
                <TableHead>Usage Total</TableHead>
                <TableHead>Voucher Applied</TableHead>
                <TableHead>Balance Applied</TableHead>
                <TableHead>Tax Amount</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-0">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBillData.length > 0 &&
                filteredBillData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-subtle text-[var(--dark-1)] pl-0">
                      {record.period}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.usageTotal}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.voucherApplied}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.balanceApplied}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.taxAmount}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.grossAmount}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.amountDue}
                    </TableCell>
                    <TableCell className="font-subtle text-[var(--dark-1)]">
                      {record.amountPaid}
                    </TableCell>
                    <TableCell>
                      <span className="font-subtle-medium flex items-center gap-1 text-[var(--dark-1)]">
                        <span
                          className={getStatusDotClassName(record.status)}
                        />
                        {record.statusText}
                      </span>
                    </TableCell>
                    <TableCell className="pr-0">
                      {record.invoiceUrl ? (
                        <a
                          href={record.invoiceUrl}
                          download
                          className="font-subtle-medium text-[var(--brand-0)] hover:text-[var(--brand-1)] cursor-pointer underline"
                          tabIndex={0}
                          aria-label={`Download invoice for ${record.period}`}
                        >
                          {record.invoice}
                        </a>
                      ) : (
                        <span className="font-subtle text-[var(--dark-3)]">
                          -
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        {!isLoadingData && filteredBillData.length === 0 && (
          <div className="w-full flex justify-center items-center">
            <div className="min-h-[300px] flex flex-col justify-center items-center">
              <NoData />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyBill;
