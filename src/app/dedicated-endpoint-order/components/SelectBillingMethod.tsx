import { Button } from "@/components/ui/button";
import styles from "./SelectBillingMethod.module.scss";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { bindPaymentMethod } from "@/api/buy";
import { usePaymentMethod } from "@/app/billing/lib/hooks/paymentMethods";
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import VISA from "@/lib/icons/VISA";
import { TOP_UP_REDIRECT_URL } from "@/constants/constants";

export enum BillingMethodEnum {
  CARD = 1,
  BALANCE = 2,
}

export default function SelectBillingMethod({
  onSelect,
}: {
  onSelect: (
    type: BillingMethodEnum,
    data?: {
      paymentMethodId?: string;
    },
  ) => void;
}) {
  const pathname = usePathname();
  const searchParam = useSearchParams();
  const { cardsInfo, isLoading } = usePaymentMethod({
    initFetch: true,
    initLoading: true,
  });
  const [selectedMethod, setSelectedMethod] = useState<BillingMethodEnum>(
    BillingMethodEnum.CARD,
  );

  const { accountBalance } = useAppSelector(
    (state) => state.billing.balanceDetail,
  );
  const { billingMethod } = useAppSelector((state) => state.config.enterprise);

  const cardInfo = useMemo(() => {
    if (!cardsInfo) return null;
    return cardsInfo[0];
  }, [cardsInfo]);

  useEffect(() => {
    if (billingMethod === BillingMethodEnum.BALANCE) {
      setSelectedMethod(BillingMethodEnum.BALANCE);
    } else {
      setSelectedMethod(BillingMethodEnum.CARD);
    }
  }, [billingMethod]);

  useEffect(() => {
    onSelect(selectedMethod, {
      paymentMethodId: cardInfo?.id ?? "",
    });
  }, [selectedMethod, cardInfo, onSelect]);

  return (
    <div className="flex flex-col gap-2">
      <RadioGroup
        value={String(selectedMethod)}
        onValueChange={(value) => {
          setSelectedMethod(Number(value) as BillingMethodEnum);
        }}
      >
        <div
          className={styles.item}
          onClick={() => {
            setSelectedMethod(BillingMethodEnum.CARD);
          }}
          id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_SWITCH_CREDIT_CARD}
        >
          <div className="flex items-center gap-2 flex-grow">
            <RadioGroupItem value={String(BillingMethodEnum.CARD)} />
            <label htmlFor="card">Credit Card</label>
          </div>
          <div className="flex-shrink-0">
            {isLoading ? (
              <Skeleton className="w-30 h-5" />
            ) : cardInfo ? (
              <div className="flex items-center gap-4 bg-common-gray-3 py-[10px] px-[13px] rounded-[6px]">
                <VISA />
                <div className="flex items-center gap-1">
                  <span className="text-sm">{cardInfo.brand}</span>
                  <span className="w-1 h-1 bg-black rounded-full"></span>
                  <span className="w-1 h-1 bg-black rounded-full"></span>
                  <span className="w-1 h-1 bg-black rounded-full"></span>
                  <span className="w-1 h-1 bg-black rounded-full"></span>
                  <span className="text-sm">{cardInfo.last4}</span>
                </div>
                <div className="text-sm">
                  Expiration: {cardInfo.expMonth}/{cardInfo.expYear}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_ADD_PAYMENT_METHOD}
                onClick={() => {
                  console.log(pathname);
                  bindPaymentMethod({
                    redirect_url: `${pathname}?oid=` + searchParam.get("oid"),
                  })
                    .then((res) => {
                      if (res && res.url) {
                        window.location.href = res.url;
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    })
                    .finally(() => {});
                }}
              >
                Add payment method
              </Button>
            )}
          </div>
        </div>
        <div
          className={styles.item}
          onClick={() => {
            setSelectedMethod(BillingMethodEnum.BALANCE);
          }}
          id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_SWITCH_BALANCE}
        >
          <div className="flex items-center gap-2 flex-grow">
            <RadioGroupItem value={String(BillingMethodEnum.BALANCE)} />
            <label htmlFor="balance">Account Balance</label>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <div>
              <span className="text-sm">Your Balance:</span>{" "}
              <span>${accountBalance}</span>
            </div>
            <Button
              variant="default"
              asChild
              id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_TOP_UP}
              style={{
                height: 32,
                background: "var(--brand-2)",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Link
                href={NOVITA_URL.BILLING_OVERVIEW}
                onClick={() => {
                  localStorage.setItem(
                    TOP_UP_REDIRECT_URL,
                    `${pathname}?oid=` + searchParam.get("oid"),
                  );
                }}
              >
                Top up
              </Link>
            </Button>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
