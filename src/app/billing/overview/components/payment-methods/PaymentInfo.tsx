"use client";

import { CreditCard, Ticket } from "lucide-react";
import { Skeleton as Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { CardInfoContext } from "./CardInfoContext";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { CardItem } from "./CardItem";
import styles from "./index.module.scss";

export default function PaymentInfo({
  isLoading,
  delCard,
  addCard,
  welcomeVoucherEligible = false,
}: {
  isLoading: boolean;
  delCard: (methodId: string) => void;
  addCard: () => void;
  welcomeVoucherEligible?: boolean;
}) {
  const { cardsInfo } = useContext(CardInfoContext);
  return (
    <div>
      {isLoading && <Skeleton.Button active block />}
      {!isLoading &&
        (Array.isArray(cardsInfo) && cardsInfo.length > 0 ? (
          <div className={styles.card_item}>
            <div className="flex flex-row items-center justify-between gap-3">
              <div className={styles.card_label}>Current Payment Method</div>
              {cardsInfo.length > 0 && <CardItem {...cardsInfo[0]} />}
            </div>
            <Button
              size="sl"
              variant="ghost"
              className={styles.remove_btn}
              onClick={() => delCard(cardsInfo[0].id)}
              id={CLICK_BTN_IDs.BILLING.PAYMENTS_REMOVE_CARD}
            >
              Remove Payment Method
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.empty_state}>
              <div className="flex items-center gap-3">
                <span className={styles.icon}>
                  <CreditCard
                    className="w-5 h-5"
                    style={{ color: "var(--brand-1)" }}
                  />
                </span>
                <div>
                  <div className={styles.title}>Payment Methods</div>
                  <div className={styles.description}>
                    Add a payment method to access services.
                  </div>
                </div>
              </div>
              <Button
                variant="default"
                onClick={addCard}
                size="sl"
                className="h-[36px] px-4"
                disabled={isLoading}
                id={CLICK_BTN_IDs.BILLING.PAYMENTS_ADD_CARD}
              >
                Add Payment Method
              </Button>
            </div>
            {welcomeVoucherEligible && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded bg-[var(--brand-3)]">
                <Ticket className="w-3.5 h-3.5 shrink-0 text-[var(--brand-1)]" />
                <span className="font-small text-[var(--brand-1)] whitespace-nowrap">
                  Bind a card to receive a $1 Model API Voucher
                </span>
              </div>
            )}
          </>
        ))}
    </div>
  );
}
