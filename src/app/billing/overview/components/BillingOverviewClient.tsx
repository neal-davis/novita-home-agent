"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePaymentMethod } from "@/app/billing/lib/hooks/paymentMethods";
import { useAutoPayment } from "@/app/billing/lib/hooks/autoPayment";
import { getVoucherList } from "@/api/user";
import { VoucherItem } from "./voucher/constants";
import AvailableCredit from "./available-credit";
import { VoucherSummary } from "./voucher/VoucherSummary";
import Voucher from "./voucher";
import { Topup } from "./top-up";
import AutomaticPayments from "./automatic-payments";
import { MonthlyBill } from "./monthly-bill";
import styles from "../page.module.scss";

export default function BillingOverviewClient() {
  const paymentMethodData = usePaymentMethod({
    initFetch: true,
    initLoading: true,
  });

  const autoPaymentData = useAutoPayment({
    initFetch: true,
    initLoading: true,
  });

  const [voucherData, setVoucherData] = useState<VoucherItem[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryVoucher = useCallback(() => {
    setVoucherLoading(true);
    getVoucherList()
      .then((res) => {
        if (res.totalBalance !== undefined && Array.isArray(res.data)) {
          setVoucherData(res.data);
        }
      })
      .finally(() => {
        setVoucherLoading(false);
      });
  }, []);

  useEffect(() => {
    queryVoucher();
  }, [queryVoucher]);

  // Handle ?redeem=1 URL param
  useEffect(() => {
    const redeem = searchParam.get("redeem");
    if (redeem) {
      setRedeemOpen(true);
      router.replace(pathname);
    }
  }, [searchParam, pathname, router]);

  return (
    <>
      <div className={styles.card}>
        <div className="flex flex-row justify-between gap-4 items-stretch">
          {/* Left column */}
          <div className="flex-1 flex flex-col gap-3">
            <AvailableCredit />
            <VoucherSummary
              data={voucherData}
              loading={voucherLoading}
              onRedeemClick={() => setRedeemOpen(true)}
            />
          </div>

          {/* Right column */}
          <div className="flex-1 bg-[var(--white)] border border-[var(--gray-2)] rounded-[var(--small-radius)] p-4">
            <div className="font-menu-medium text-[var(--black)] mb-3">
              Fund Your Account
            </div>
            <Topup paymentMethodData={paymentMethodData} />
            <div className="my-4 h-px bg-[var(--gray-2)]" />
            <AutomaticPayments
              paymentMethodData={paymentMethodData}
              autoPaymentData={autoPaymentData}
              compact
            />
          </div>
        </div>
      </div>

      <div className={`${styles.card} mt-3`}>
        <Voucher
          data={voucherData}
          loading={voucherLoading}
          redeemOpen={redeemOpen}
          onRedeemClose={() => setRedeemOpen(false)}
          onRedeemSuccess={queryVoucher}
          hasCard={
            Array.isArray(paymentMethodData.cardsInfo) &&
            paymentMethodData.cardsInfo.length > 0
          }
          welcomeVoucherEligible={paymentMethodData.welcomeVoucherEligible}
          onAddCard={
            paymentMethodData.addPaymentMethod
              ? () => {
                  paymentMethodData.addPaymentMethod!(pathname).then((res) => {
                    if (res?.url) window.location.href = res.url;
                  });
                }
              : undefined
          }
        />
      </div>

      <div className={`${styles.card} mt-3`}>
        <MonthlyBill />
      </div>
    </>
  );
}
