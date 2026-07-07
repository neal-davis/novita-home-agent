"use client";

import { useEffect, useMemo, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { TopupWithCardModal } from "./TopupWithCardModal";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION, TOP_UP_REDIRECT_URL } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { ConsoleButtonDefault } from "@/app/user/components/console-button-default";
import { cn } from "@/lib/utils";
import { LOCATION_CHANGE_EVT } from "@/lib/hooks/useNavHistory";
import { PaymentMethodData } from "@/app/billing/lib/hooks/paymentMethods";
import { useTopup } from "@/app/billing/lib/hooks/topup";
import styles from "./index.module.scss";

const DEFAULT_PRICE = 10;
const MIN_PRICE = 10;
const MAX_PRICE = 1000000;

interface TopupProps {
  paymentMethodData?: PaymentMethodData;
}

export function Topup({ paymentMethodData }: TopupProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [price, setPrice] = useState<string>(DEFAULT_PRICE.toString());
  const [modalVisible, setModalVisible] = useState(false);
  const { topupByStripeLink, isLoading } = useTopup();

  // topup permission
  const hasTopupPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.recharge,
    action: PERMISSION.ACTION.all,
  });

  const { cardsInfo = [] } = paymentMethodData || {};

  const isBindCard = useMemo(() => {
    return Array.isArray(cardsInfo) && cardsInfo.length > 0;
  }, [cardsInfo]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(TOP_UP_REDIRECT_URL);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener(LOCATION_CHANGE_EVT, handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener(LOCATION_CHANGE_EVT, handleBeforeUnload);
    };
  }, []);

  const handleTopup = async () => {
    if (!hasTopupPermission) {
      showPermissionMessage();
      return;
    }
    if (!price) {
      message.warning("Please enter the amount to top up.");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isInteger(priceNum)) {
      message.warning("Price must be an integer.");
      return;
    }
    if (priceNum < MIN_PRICE) {
      message.warning(`The minimum top-up amount is $${MIN_PRICE}`);
      return;
    }
    if (priceNum >= MAX_PRICE) {
      message.warning(
        `The top-up amount cannot exceed $${MAX_PRICE.toLocaleString()} USD.`,
      );
      return;
    }
    if (isBindCard) {
      setModalVisible(true);
      return;
    }

    const sessionUrl = await topupByStripeLink(
      priceNum,
      localStorage.getItem(TOP_UP_REDIRECT_URL) || pathname,
    );
    if (sessionUrl) {
      window.location.href = sessionUrl;
    }
  };

  return (
    <>
      <div className={styles.topup_container}>
        <div className={styles.topup_label}>Top-Up Credit</div>
        <div className={cn("relative", styles.topup_input_wrapper)}>
          <span className={styles.currency_symbol}>$</span>
          <Input
            className={styles.topup_input}
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            placeholder={DEFAULT_PRICE.toString()}
          />
        </div>
        <ConsoleButtonDefault
          variant="default"
          size="sl"
          className={styles.topup_button}
          id={CLICK_BTN_IDs.BILLING.PAYMENTS_TOPUP}
          onClick={handleTopup}
          disabled={isLoading}
        >
          {isLoading ? "Redirecting..." : "Top Up"}
        </ConsoleButtonDefault>
      </div>
      <TopupWithCardModal
        price={Number(price) || 0}
        open={modalVisible}
        redirectPath={pathname}
        onClose={() => {
          setModalVisible(false);
          const redirectUrl = localStorage.getItem(TOP_UP_REDIRECT_URL);
          if (redirectUrl) {
            router.push(redirectUrl);
            localStorage.removeItem(TOP_UP_REDIRECT_URL);
          }
        }}
        carInfo={cardsInfo[0]}
      />
    </>
  );
}
