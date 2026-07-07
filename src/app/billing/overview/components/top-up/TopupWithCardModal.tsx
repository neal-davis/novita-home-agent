import { useTopup } from "@/app/billing/lib/hooks/topup";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useEffect, useState } from "react";
import styles from "./TopupWithCardModal.module.scss";
import { CardInterface } from "@/app/billing/lib/hooks/paymentMethods";
import { CardItem } from "../payment-methods/CardItem";
import { TOP_UP_REDIRECT_URL } from "@/constants/constants";
import { CreditCard, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Big from "big.js";

export function TopupWithCardModal({
  price,
  carInfo,
  open,
  onClose,
  redirectPath,
}: {
  price: number;
  carInfo?: CardInterface;
  open: boolean;
  onClose: () => void;
  redirectPath: string;
}) {
  const dispatch = useAppDispatch();
  const { topupWidthCard, topupByStripeLink, isLoading } = useTopup();
  const [result, setResult] = useState<"SUCC" | "FAIL" | "">("");
  const [activeAction, setActiveAction] = useState<"card" | "stripe" | null>(
    null,
  );
  const { discount } = useAppSelector((state) => state.config);

  const currentTeam = useAppSelector((state) => state.user.currentTeam);

  const paymentAmount = discount?.valid
    ? Big(price)
        .mul(1 - (discount?.percentOff ?? 0) / 100)
        .toFixed()
    : price;

  useEffect(() => {
    if (!open) {
      setResult("");
      setActiveAction(null);
    }
  }, [open]);

  const handleClose = () => {
    setResult("");
    setActiveAction(null);
    onClose();
  };

  const handlePayWithCard = () => {
    if (!carInfo?.id) return;
    try {
      setActiveAction("card");
      topupWidthCard({
        amount: price,
        paymentMethodId: carInfo.id,
        succCb: [
          () => {
            setResult("SUCC");
            setActiveAction(null);
            dispatch(fetchBalanceDetail() as any);
          },
        ],
        errCb: [() => setActiveAction(null)],
      });
    } catch (error) {
      console.error(error);
      setActiveAction(null);
    }
  };

  const handlePayWithStripe = async () => {
    try {
      setActiveAction("stripe");
      const sessionUrl = await topupByStripeLink(
        price,
        localStorage.getItem(TOP_UP_REDIRECT_URL) || redirectPath,
      );
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error(error);
      setActiveAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        style={{
          width: 500,
        }}
      >
        <DialogHeader>
          <DialogTitle className={styles.dialog_title}>
            Top-Up Credit
          </DialogTitle>
        </DialogHeader>
        {result === "" && (
          <div className={styles.topup_modal}>
            <div>
              {currentTeam && (
                <>
                  <p className={styles.row_info_title}>Account Information</p>
                  <div className={styles.row_info_content}>
                    <p className={styles.row_info_content_title}>
                      {currentTeam.name}
                    </p>
                    <p className={styles.row_info_content_value}>
                      Team ID: {currentTeam.id}
                    </p>
                  </div>
                </>
              )}
              {carInfo?.id && (
                <div className="mt-4">
                  <p className={`${styles.row_info_title} mb-2`}>
                    Payment method
                  </p>
                  <CardItem {...carInfo} style={{ width: "100%" }} />
                </div>
              )}
              <div className="mt-4">
                <p className={styles.row_info_title}>Description</p>
                <div className={styles.row_info_content}>
                  <div className="flex justify-between">
                    <p className={styles.row_info_content_title}>
                      Novita AI credit
                    </p>
                    <div>
                      <span className={styles.row_info_content_value}>
                        Amount
                      </span>
                      <span className={styles.row_info_moneny}>${price}</span>
                    </div>
                  </div>
                  {discount?.valid && (
                    <div className={styles.wrapper_2}>
                      <p>Payment amount</p>
                      <p
                        className="font-medium"
                        style={{
                          color: "var(--red-2)",
                        }}
                      >
                        ${paymentAmount}
                      </p>
                    </div>
                  )}
                  <p className="mt-3 text-[12px] leading-5 text-[var(--dark-3)]">
                    A 9% GST applies to payments from Singapore.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-3">
              <Button
                size="sl"
                variant="ghost"
                className="h-[32px] px-4"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                {carInfo?.id && (
                  <Button
                    size="sl"
                    variant="ghost"
                    className="h-[32px] px-4 text-[var(--dark-3)]"
                    disabled={isLoading}
                    onClick={handlePayWithCard}
                  >
                    {activeAction === "card" ? (
                      "Recharging..."
                    ) : (
                      <>
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        {`Pay with ••••${carInfo.last4}`}
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sl"
                  className="h-[32px] px-4"
                  disabled={isLoading}
                  onClick={handlePayWithStripe}
                >
                  {activeAction === "stripe" ? (
                    "Redirecting..."
                  ) : (
                    <>
                      Stripe Checkout
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        {result === "SUCC" && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-[var(--green-1)]" />
            <div style={{ color: "var(--black)" }}>
              The credit top-up of ${price} was successful.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
