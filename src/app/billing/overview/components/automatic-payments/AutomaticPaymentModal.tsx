"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import styles from "./index.module.scss";

// Constants from AutoPayment.tsx
const Topup_Min_Dif_Price = 50;
const Topup_Min_Threshold = 5;

interface AutomaticPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultThreshold?: string;
  defaultTopUp?: string;
  max_threshold?: number;
  max_amount?: number;
  onSave: (threshold: string, topUp: string) => Promise<void>;
}

export default function AutomaticPaymentModal({
  open,
  onOpenChange,
  defaultThreshold = "500",
  defaultTopUp = "1000",
  max_threshold = 1000,
  max_amount = 5000,
  onSave,
}: AutomaticPaymentModalProps) {
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [amount, setAmount] = useState(defaultTopUp);
  const [matchErrs, setMatchErrs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setThreshold(defaultThreshold);
      setAmount(defaultTopUp);
      setIsSaving(false);
    }
  }, [open, defaultThreshold, defaultTopUp]);

  // Validate on change
  useEffect(() => {
    // Validation logic from AutoPayment.tsx
    const checkString = [];
    const thresholdNum = Number(threshold);
    const amountNum = Number(amount);
    const min =
      (threshold && !isNaN(thresholdNum) ? thresholdNum : 0) +
      Topup_Min_Dif_Price;

    if (
      !threshold ||
      isNaN(thresholdNum) ||
      thresholdNum < Topup_Min_Threshold ||
      thresholdNum > max_threshold ||
      !Number.isInteger(thresholdNum)
    ) {
      checkString.push("threshold");
    }
    if (
      !amount ||
      isNaN(amountNum) ||
      amountNum < min ||
      amountNum > max_amount ||
      !Number.isInteger(amountNum)
    ) {
      checkString.push("amount");
    }

    setMatchErrs(checkString);
  }, [threshold, amount, max_threshold, max_amount]);

  const thresholdErr = matchErrs.includes("threshold");
  const amountErr = matchErrs.includes("amount");

  const handleSaveSetting = async () => {
    if (matchErrs.length > 0) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave(threshold, amount);
      onOpenChange(false);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog_content}>
        <DialogHeader>
          <DialogTitle className={styles.dialog_title}>
            Auto Recharge
          </DialogTitle>
        </DialogHeader>

        <div className={styles.dialog_body}>
          <div className={styles.form_field}>
            <label className={styles.label}>When credit goes below</label>
            <Input
              type="number"
              step={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className={cn(styles.input, thresholdErr && styles.error)}
            />
            <span
              className={cn(styles.hint, thresholdErr && styles.error_text)}
            >
              Enter an integer amount between ${Topup_Min_Threshold} and $
              {max_threshold}
            </span>
          </div>

          <div className={styles.form_field}>
            <label className={styles.label}>Bring credit back up to</label>
            <Input
              type="number"
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(styles.input, amountErr && styles.error)}
            />
            <span className={cn(styles.hint, amountErr && styles.error_text)}>
              Enter an integer amount between $
              {Number(threshold) + Topup_Min_Dif_Price} and ${max_amount}
            </span>
          </div>
        </div>

        <div className={styles.warning_container}>
          <p className={cn("font-small-console", styles.warning_text)}>
            Auto Recharge is not guaranteed. If a payment attempt fails and your
            balance reaches 0, your services may be interrupted. Please ensure
            your payment method is valid and check your balance regularly, or
            enable a{" "}
            <Link
              href="/billing/balance-warning"
              className={styles.warning_link}
            >
              Low Balance Alert
            </Link>{" "}
            to get notified in advance.
          </p>
        </div>

        <DialogFooter className={styles.dialog_footer}>
          <Button
            size="sl"
            className="h-[32px] px-4"
            onClick={handleCancel}
            variant="ghost"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sl"
            className="h-[32px] px-4"
            onClick={handleSaveSetting}
            variant="default"
            disabled={matchErrs.length > 0 || isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Setting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
