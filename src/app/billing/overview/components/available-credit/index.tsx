"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { RootState } from "@/store";
import CreditRow from "./CreditRow";
import styles from "./index.module.scss";

export default function AvailableCredit() {
  const dispatch = useDispatch();
  const balanceDetail = useSelector(
    (state: RootState) => state.billing.balanceDetail,
  );
  const loading = balanceDetail?.status === null;
  const data = balanceDetail?.status === "success" ? balanceDetail : null;

  useEffect(() => {
    if (balanceDetail?.status === null) {
      dispatch(fetchBalanceDetail() as any);
    }
  }, [dispatch, balanceDetail?.status]);

  if (loading || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-1  gap-x-12 py-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if there are other rows besides Account Balance
  const hasOtherRows =
    Number(data.pendingCharges) > 0 ||
    Number(data.creditLimit) > 0 ||
    Number(data.outstandingInvoices) > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Available Credit</div>
        <div className={styles.amount}>$ {data.availableCredit}</div>
        {hasOtherRows && (
          <div className={styles.description}>
            Your available credit is the remaining amount you can use after
            pending charges, before reaching your credit limit.
          </div>
        )}
      </div>

      <div className={styles.table}>
        <CreditRow
          label="Account balance"
          value={data.accountBalance}
          tooltip="Prepaid funds in your account that decrease as you make usage-based purchases."
        />

        {Number(data.pendingCharges) > 0 && (
          <CreditRow
            label="Pending charges"
            value={data.pendingCharges}
            tooltip="Usage charges that have been incurred but are not yet due for deduction. These amounts will be automatically charged from your balance or credit limit once the billing cycle reaches its payment time."
          />
        )}

        {Number(data.creditLimit) > 0 && (
          <CreditRow
            label="Credit limit"
            value={data.creditLimit}
            tooltip="The maximum postpaid amount approved based on your account's credit profile, allowing you to consume first and pay later."
          />
        )}

        {Number(data.outstandingInvoices) > 0 && (
          <CreditRow
            label="Outstanding invoices"
            value={data.outstandingInvoices}
            tooltip="Total amount owed under your credit limit that must be repaid within the payment period."
            isWarning
          />
        )}
      </div>
    </div>
  );
}
