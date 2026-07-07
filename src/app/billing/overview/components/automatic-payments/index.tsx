"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import AutomaticPaymentModal from "./AutomaticPaymentModal";
import { type useAutoPayment } from "@/app/billing/lib/hooks/autoPayment";
import { PaymentMethodData } from "@/app/billing/lib/hooks/paymentMethods";
import { PaymentMethods } from "../payment-methods";
import styles from "./index.module.scss";

export type AutoPaymentData = ReturnType<typeof useAutoPayment>;

interface AutomaticPaymentsProps {
  paymentMethodData?: PaymentMethodData;
  autoPaymentData?: AutoPaymentData;
  compact?: boolean;
}

export default function AutomaticPayments({
  paymentMethodData,
  autoPaymentData,
  compact,
}: AutomaticPaymentsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localAutoRecharge, setLocalAutoRecharge] = useState(false);
  const [isOpening, setIsOpening] = useState(false); // Track if user is trying to enable

  const {
    isLoading = false,
    rechargeSetting = {
      amount: "0",
      threshold: "0",
      isAutoRecharge: false,
    },
    setAutoRechargeConfig,
    fetchAutoRecharge,
  } = autoPaymentData || {};

  const { cardsInfo = [] } = paymentMethodData || {};

  const { isAutoRecharge, threshold, amount } = rechargeSetting;

  useEffect(() => {
    setLocalAutoRecharge(isAutoRecharge);
    setIsOpening(false); // Reset opening state when server state changes
  }, [isAutoRecharge]);

  const handleModifyClick = () => {
    if (!cardsInfo || cardsInfo.length === 0) {
      message.warning("Please add a payment method for Auto Recharge first.");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSwitchChange = async (checked: boolean) => {
    if (!setAutoRechargeConfig) return;

    // Check if user has payment method when trying to enable auto recharge
    if (checked && (!cardsInfo || cardsInfo.length === 0)) {
      message.warning("Please add a payment method for Auto Recharge first.");
      return;
    }

    // If turning ON: open dialog first, don't update state until saved
    if (checked) {
      setIsOpening(true);
      setIsDialogOpen(true);
      return;
    }

    // If turning OFF: update state immediately and call API
    setLocalAutoRecharge(false);
    try {
      await setAutoRechargeConfig({
        ...rechargeSetting,
        isAutoRecharge: false,
      });
    } catch (error) {
      setLocalAutoRecharge(isAutoRecharge);
      message.error("Failed to update Auto Recharge setting.");
    }
  };

  const handleSaveSetting = async (newThreshold: string, newAmount: string) => {
    if (!setAutoRechargeConfig) return;

    try {
      // If opening (turning ON), set isAutoRecharge to true
      const shouldEnable = isOpening || isAutoRecharge;
      await setAutoRechargeConfig({
        threshold: newThreshold,
        amount: newAmount,
        isAutoRecharge: shouldEnable,
      });

      // Only update local state if we're opening (turning ON)
      if (isOpening) {
        setLocalAutoRecharge(true);
        setIsOpening(false);
      }

      message.success("Auto Recharge settings have been updated successfully");
    } catch (error) {
      message.error("Failed to update Auto Recharge settings");
      // If opening failed, reset opening state
      if (isOpening) {
        setIsOpening(false);
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    // If dialog is closed and we were trying to open, cancel the operation
    if (!open && isOpening) {
      setIsOpening(false);
      // State will remain false since we never updated it
    }
  };

  const compactView = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={localAutoRecharge}
            onCheckedChange={handleSwitchChange}
            size="sm"
            disabled={isLoading}
          />
          <span className="font-subtle text-[var(--dark-1)]">
            Auto Recharge {localAutoRecharge ? "ON" : "OFF"}
          </span>
        </div>
        <Button
          variant="link"
          size="sl"
          className="h-auto p-0 font-subtle"
          onClick={handleModifyClick}
        >
          {localAutoRecharge ? "Modify" : "Set up"}
        </Button>
      </div>
      <p className="font-small text-[var(--dark-3)] pl-9">
        {localAutoRecharge
          ? `When balance falls below $${threshold}, auto recharge to $${amount}.`
          : "Automatically recharge when your balance falls below a threshold."}
      </p>
      <div className="mt-2 border-t border-[var(--gray-2)] pt-3">
        <PaymentMethods
          paymentMethodData={paymentMethodData}
          autoPaymentData={autoPaymentData}
          compact
        />
      </div>
    </div>
  );

  return (
    <>
      {compact ? (
        compactView
      ) : (
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>Auto Recharge</div>
            <div className={styles.toggle_wrapper}>
              <Switch
                checked={localAutoRecharge}
                onCheckedChange={handleSwitchChange}
                size="sm"
                disabled={isLoading}
              />
              <span className={styles.toggle_label}>
                Auto Recharge is {localAutoRecharge ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          <div className={styles.content}>
            <span>
              {localAutoRecharge
                ? `When the account balance falls below ${threshold}, it will automatically recharge the account balance back up to ${amount}`
                : "When your Available Credit falls below your threshold, we'll charge your default card to restore your balance to that amount."}
            </span>
            {localAutoRecharge && (
              <Button onClick={handleModifyClick} variant="link" size="sl">
                Modify
              </Button>
            )}
          </div>
        </div>
      )}

      <AutomaticPaymentModal
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        defaultThreshold={threshold}
        defaultTopUp={amount}
        max_threshold={1000}
        max_amount={5000}
        onSave={handleSaveSetting}
      />
    </>
  );
}
