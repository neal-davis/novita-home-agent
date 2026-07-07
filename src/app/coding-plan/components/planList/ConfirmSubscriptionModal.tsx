"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle } from "lucide-react";

interface ConfirmSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierName: string;
  modelList: string[];
  onConfirm: () => void;
  loading: boolean;
}

export default function ConfirmSubscriptionModal({
  open,
  onOpenChange,
  tierName,
  modelList,
  onConfirm,
  loading,
}: ConfirmSubscriptionModalProps) {
  const [countdown, setCountdown] = useState(3);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (!open) {
      setCountdown(3);
      setCanProceed(false);
      return;
    }

    if (countdown <= 0) {
      setCanProceed(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [open, countdown]);

  const handleConfirm = useCallback(() => {
    if (!canProceed || loading) return;
    onConfirm();
  }, [canProceed, loading, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] py-6 px-8">
        <DialogHeader className="pb-0">
          <DialogTitle className="font-h4">
            Confirm Your Subscription
          </DialogTitle>
          <DialogDescription className="font-subtle text-[var(--dark-2)] mt-1">
            You&apos;re about to subscribe to the{" "}
            <span className="font-subtle-medium">
              Coding Plan – {tierName}.
            </span>
            <br />
            Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-2">
          {/* Available Models Section */}
          <div className="bg-[var(--gray-4)] border border-[var(--gray-2)] rounded-lg p-4">
            <div className="font-p-button text-[--dark-3] mb-4">
              Available Models
            </div>
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto">
              {modelList.map((model, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 font-subtle text-[--black]"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-3)]">
                    <Check className="w-3 h-3 text-[var(--brand-1)]" />
                  </div>
                  <span>{model}</span>
                </div>
              ))}
            </div>
          </div>

          {/* No Refund Policy Warning */}
          <Alert className="bg-[var(--yellow-7)] border !border-[var(--orange-4)] text-[var(--orange-1)]">
            <AlertCircle size={16} color={"var(--orange-1)"} />
            <AlertTitle className="font-body-medium text-[var(--orange-1)]">
              No Refund Policy
            </AlertTitle>
            <AlertDescription className="font-menu text-[var(--orange-2)]">
              By proceeding to payment, you acknowledge that
              <strong className="font-menu-medium">
                this subscription is non-refundable and access is limited to the
                models listed above.
              </strong>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="mt-2">
          <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center sm:justify-between">
            <Button
              variant="tertiary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="sm:shrink-0 sm:grow-0 sm:basis-[160px]"
            >
              Cancel
            </Button>
            <Button
              variant={canProceed ? "default" : "disabled"}
              onClick={handleConfirm}
              disabled={!canProceed || loading}
              className="flex-none sm:flex-1 min-w-[180px]"
            >
              {loading
                ? "Processing..."
                : canProceed
                  ? "Proceed to Payment"
                  : `Proceed to Payment (${countdown}s)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
