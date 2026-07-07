"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CircleCheck } from "lucide-react";
import { useVoucherRedeem, RedeemResult } from "./useVoucherRedeem";
import { formatUnix, formatBusinessTypes } from "./constants";
import { balanceFormat } from "@/lib/utils/money";

function getRedeemSuccessFields(result: RedeemResult) {
  const amount = "$" + balanceFormat(Number(result?.amount || 0));

  const expiry = result.endTime ? formatUnix(result.endTime) : "";

  const applicable = formatBusinessTypes(result.businessTypes || []);

  return { amount, applicable, expiry };
}

interface VoucherRedeemModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VoucherRedeemModal({
  open,
  onClose,
  onSuccess,
}: VoucherRedeemModalProps) {
  const {
    code,
    error,
    loading,
    redeemed,
    redeemResult,
    handleCodeChange,
    handleRedeem,
    reset,
  } = useVoucherRedeem();

  const handleClose = () => {
    if (redeemed) {
      onSuccess?.();
    }
    reset();
    onClose();
  };

  // Success view
  if (redeemed) {
    const fields = redeemResult ? getRedeemSuccessFields(redeemResult) : null;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[448px] min-w-[448px]">
          <div className="flex flex-col items-center gap-4 pt-4 pb-2">
            <CircleCheck className="h-12 w-12 text-[var(--brand-0)]" />
            <p className="font-h6 text-[var(--dark-1)]">
              Voucher Redeemed Successfully!
            </p>
          </div>

          {fields && (
            <div className="flex flex-col gap-2 px-4 py-3 rounded-[var(--small-radius)] bg-[var(--gray-3)]">
              <div className="flex items-baseline justify-between">
                <span className="font-subtle text-[var(--dark-3)]">Amount</span>
                <span className="font-subtle-medium text-[var(--brand-1)]">
                  {fields.amount}
                </span>
              </div>
              <div className="h-px bg-[var(--gray-2)]" />
              <div className="flex items-baseline justify-between">
                <span className="font-subtle text-[var(--dark-3)]">
                  Applicable
                </span>
                <span className="font-subtle-medium text-[var(--dark-1)]">
                  {fields.applicable}
                </span>
              </div>
              <div className="h-px bg-[var(--gray-2)]" />
              <div className="flex items-baseline justify-between">
                <span className="font-subtle text-[var(--dark-3)]">
                  Valid Until
                </span>
                <span className="font-subtle-medium text-[var(--dark-1)] whitespace-nowrap">
                  {fields.expiry}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="justify-center sm:justify-center">
            <Button
              size="sl"
              variant="default"
              className="w-[80px]"
              onClick={handleClose}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default input view
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[448px] min-w-[448px]">
        <DialogHeader>
          <DialogTitle>Voucher Code Redeem</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          <label className="font-subtle text-[var(--dark-1)]">
            Voucher Code
          </label>
          <Input
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRedeem();
            }}
            className={error ? "border-[var(--red-2)]" : ""}
          />
          {error && (
            <p className="font-small-console text-[var(--red-2)]">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            size="sl"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sl"
            variant="default"
            onClick={handleRedeem}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Redeem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
