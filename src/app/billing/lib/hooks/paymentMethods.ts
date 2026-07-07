import {
  bindPaymentMethod,
  getPaymentMethod,
  unbindPaymentMethod,
} from "@/api/buy";
import { useCallback, useEffect, useState } from "react";

export type CardInterface = {
  brand: string;
  country: string;
  expMonth: string;
  expYear: string;
  funding: string;
  id: string;
  last4: string;
};

export function usePaymentMethod({
  initFetch,
  initLoading,
  useCache,
}: {
  initFetch?: boolean;
  initLoading?: boolean;
  useCache?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(initLoading ? true : false);
  const [cardsInfo, setCardsInfo] = useState<Array<CardInterface>>([]);
  const [welcomeVoucherEligible, setWelcomeVoucherEligible] = useState(false);

  const fetchPaymentMethod = useCallback(() => {
    setIsLoading(true);
    getPaymentMethod()
      .then((res) => {
        if (res && Array.isArray(res.paymentMethods)) {
          setCardsInfo(res.paymentMethods);
          localStorage.setItem("cardsInfo", JSON.stringify(res.paymentMethods));
        }
        if (res) {
          setWelcomeVoucherEligible(Boolean(res.welcomeVoucherEligible));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const delPaymentMethod = useCallback(
    (paymentMethodId: string) => {
      setIsLoading(true);
      unbindPaymentMethod({ paymentMethodId: paymentMethodId })
        .then(() => {})
        .finally(() => {
          setIsLoading(false);
          fetchPaymentMethod();
        });
    },
    [fetchPaymentMethod],
  );

  const addPaymentMethod = (redirect: string) => {
    return bindPaymentMethod({
      redirect_url: redirect,
    });
  };

  useEffect(() => {
    if (useCache) {
      try {
        const cache = localStorage.getItem("cardsInfo");
        if (cache) {
          setCardsInfo(JSON.parse(cache));
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      if (initFetch) {
        fetchPaymentMethod();
      }
    }
  }, [fetchPaymentMethod, initFetch, useCache]);

  return {
    isLoading,
    cardsInfo,
    welcomeVoucherEligible,
    fetchPaymentMethod,
    delPaymentMethod,
    addPaymentMethod,
  };
}

export type PaymentMethodData = ReturnType<typeof usePaymentMethod>;
