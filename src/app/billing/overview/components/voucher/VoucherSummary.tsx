"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket } from "lucide-react";
import { useMemo } from "react";
import { balanceFormat } from "@/lib/utils/money";
import { VoucherItem } from "./constants";

interface VoucherSummaryProps {
  data: VoucherItem[];
  loading: boolean;
  onRedeemClick: () => void;
}

export function VoucherSummary({
  data,
  loading,
  onRedeemClick,
}: VoucherSummaryProps) {
  const { validVouchers, totalBalance } = useMemo(() => {
    const valid = data.filter((item) => item.status === "valid");
    const total = valid.reduce(
      (sum, item) => sum + (Number(item.balance) || 0),
      0,
    );
    return { validVouchers: valid, totalBalance: total };
  }, [data]);
  const availableBalanceText = `$${balanceFormat(totalBalance)} available`;

  return (
    <div className="bg-[var(--white)] border border-[var(--gray-2)] rounded-[var(--small-radius)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-menu-medium text-[var(--black)]">Vouchers</span>
          <span className="font-small text-[var(--dark-3)]">
            Charges are applied in order: Coding Plan &gt; Voucher &gt; Account
            balance &gt; Credit limit
          </span>
        </div>
        <Button variant="default" size="sl" onClick={onRedeemClick}>
          Redeem
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      ) : validVouchers.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 text-[var(--brand-1)]" />
            <span className="font-subtle text-[var(--brand-1)]">
              {validVouchers.length} valid
            </span>
          </div>
          <div className="h-3 w-px bg-[var(--gray-2)]" />
          <span className="font-subtle text-[var(--dark-1)]">
            {availableBalanceText}
          </span>
        </div>
      ) : (
        <span className="font-subtle text-[var(--dark-3)]">
          No active vouchers
        </span>
      )}
    </div>
  );
}
