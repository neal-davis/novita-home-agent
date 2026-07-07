"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePermission } from "@/lib/hooks/usePermission";
import { showPermissionMessage } from "@/lib/utils/permission";
import { Button } from "@/components/ui/button";
import { CreditCard, Ticket } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardInfoContext } from "./CardInfoContext";
import PaymentInfo from "./PaymentInfo";
import { CardItem } from "./CardItem";
import { PERMISSION, TOP_UP_REDIRECT_URL } from "@/constants/constants";
import { PaymentMethodData } from "@/app/billing/lib/hooks/paymentMethods";
import type { AutoPaymentData } from "../automatic-payments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "./index.module.scss";

interface PaymentMethodsProps {
  paymentMethodData?: PaymentMethodData;
  autoPaymentData?: AutoPaymentData;
  compact?: boolean;
}

export function PaymentMethods({
  paymentMethodData,
  autoPaymentData,
  compact,
}: PaymentMethodsProps) {
  const path = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");

  const {
    cardsInfo = [],
    isLoading = false,
    welcomeVoucherEligible = false,
    addPaymentMethod,
    delPaymentMethod,
  } = paymentMethodData || {};

  const { fetchAutoRecharge } = autoPaymentData || {};

  const hasAddCardPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.payment_method,
    action: PERMISSION.ACTION.all,
  });

  const addCard = useCallback(() => {
    if (!hasAddCardPermission) {
      showPermissionMessage();
      return;
    }
    const redirectUrl = localStorage.getItem(TOP_UP_REDIRECT_URL);
    const addMethod = addPaymentMethod || (() => Promise.resolve({ url: "" }));
    addMethod(redirectUrl || path).then((res) => {
      if (res && res.url) {
        window.location.href = res.url;
      }
    });
  }, [addPaymentMethod, path, hasAddCardPermission]);

  const delCard = useCallback((methodId: string) => {
    setSelectedMethodId(methodId);
    setIsDialogOpen(true);
  }, []);

  // Refresh auto payment settings after card list changes from a delete
  const pendingDeleteRef = useRef(false);
  useEffect(() => {
    if (pendingDeleteRef.current && !isLoading) {
      pendingDeleteRef.current = false;
      fetchAutoRecharge?.();
    }
  }, [isLoading, fetchAutoRecharge]);

  const handleDeleteCard = useCallback(() => {
    const delMethod = delPaymentMethod || (() => {});
    pendingDeleteRef.current = true;
    delMethod(selectedMethodId);
    setIsDialogOpen(false);
    setSelectedMethodId("");
  }, [delPaymentMethod, selectedMethodId]);

  const hasCard = Array.isArray(cardsInfo) && cardsInfo.length > 0;
  const card = cardsInfo[0];

  const compactView = (
    <div className="flex flex-col">
      {isLoading ? (
        <Skeleton className="h-5 w-48" />
      ) : hasCard ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/billing/billing-visa.png"
              alt={card?.brand}
              className="h-4 w-6 object-contain"
            />
            <span className="font-subtle text-[var(--dark-1)]">
              {card?.brand}****{card?.last4}
            </span>
            <span className="font-small text-[var(--dark-3)]">
              Exp {card?.expMonth}/{card?.expYear}
            </span>
          </div>
          <Button
            variant="link"
            size="sl"
            className="h-auto p-0 font-subtle"
            onClick={() => delCard(card?.id)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--dark-3)]" />
              <span className="font-subtle text-[var(--dark-3)]">
                No payment method
              </span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Button
                variant="link"
                size="sl"
                className="h-auto p-0 font-subtle"
                onClick={addCard}
              >
                Add card
              </Button>
              {welcomeVoucherEligible && (
                <div className="flex items-center gap-1.5 h-5 px-2 rounded bg-[var(--brand-3)]">
                  <Ticket className="w-3.5 h-3.5 shrink-0 text-[var(--brand-1)]" />
                  <span className="font-small text-[var(--brand-1)] whitespace-nowrap">
                    Bind a card to receive a $1 Model API Voucher
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {compact ? (
        compactView
      ) : (
        <CardInfoContext.Provider value={{ cardsInfo: cardsInfo }}>
          <div className={styles.box_wrapper}>
            <PaymentInfo
              addCard={addCard}
              delCard={delCard}
              isLoading={isLoading}
              welcomeVoucherEligible={welcomeVoucherEligible}
            />
          </div>
        </CardInfoContext.Provider>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={styles.dialog_content}>
          <DialogHeader>
            <DialogTitle className={styles.dialog_title}>
              Confirmation of Card Deletion
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className={styles.dialog_description}>
              Removing this card will disable Auto Recharge.
            </p>
            <CardItem {...cardsInfo[0]} />
            <div className={styles.warning_message}>
              <img src="/billing/billing-warning.svg" alt="warning" />
              <span className={styles.warning_text}>
                You can update your credit card only once each month.
              </span>
            </div>
            <div className={styles.dialog_footer}>
              <Button
                size="sl"
                variant="ghost"
                className="h-[32px] px-3"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sl"
                variant="warn"
                className="h-[32px] px-3"
                onClick={handleDeleteCard}
              >
                Remove card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
