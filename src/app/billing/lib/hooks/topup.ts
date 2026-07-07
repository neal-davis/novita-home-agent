import { createCheckoutSessionV3, getTopUpStatus, topUp } from "@/api/buy";
import { message } from "@/components/ui/standard/notify";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useRef, useState } from "react";
export function useTopup() {
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef<any>();
  const clean = () => {
    setIsLoading(false);
    timer.current && clearInterval(timer.current);
  };
  const topupWidthCard = async ({
    amount,
    paymentMethodId,
    succCb = [],
    errCb = [],
  }: {
    amount: number;
    paymentMethodId: string;
    succCb?: any[];
    errCb?: any[];
  }) => {
    try {
      setIsLoading(true);
      const res = await topUp({
        amount,
        paymentMethodId,
        campaign: Cookies.get("utm_campaign") ?? "",
      });
      if (res && res.topUpId) {
        const now = dayjs();
        timer.current = setInterval(() => {
          if (dayjs().diff(now, "second") > 60) {
            if (Array.isArray(errCb)) {
              errCb.forEach((c) => c());
            }
            message.error("Payment timeout");
            clean();
          }
          getTopUpStatus(res.topUpId).then((res) => {
            if (res.status == 0) {
              clean();
              if (Array.isArray(succCb)) {
                succCb.forEach((c) => c());
              }
            }
          });
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      if (typeof error === "string") {
        message.error(error || "Top up failed");
      }
      if (Array.isArray(errCb)) {
        errCb.forEach((c) => c());
      }
    }
  };
  const topupByStripeLink = async (amount: number, redirect_url: string) => {
    try {
      setIsLoading(true);
      const res = await createCheckoutSessionV3({
        price: amount,
        redirect_url,
      });
      if (res && res.sessionUrl) {
        return res.sessionUrl;
      }
    } catch (error) {
      if (typeof error === "string") {
        message.error(error || "Top up failed");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  return { isLoading, topupWidthCard, topupByStripeLink };
}
