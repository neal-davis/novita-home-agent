import { getAutoRecharge, setAutoRecharge } from "@/api/buy";
import { message } from "@/components/ui/standard/notify";
import { useCallback, useEffect, useState } from "react";
message.config({
  top: 120,
});
export type RechargeSetting = {
  amount: string | undefined;
  threshold: string | undefined;
  isAutoRecharge: boolean;
};
const transformInt64toString = (setting: RechargeSetting) => {
  return {
    ...setting,
    amount: String(setting.amount),
    threshold: String(setting.threshold),
  };
};
export function useAutoPayment({
  initFetch,
  initLoading,
}: {
  initFetch?: boolean;
  initLoading?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(initLoading ? true : false);
  const [rechargeSetting, setRechargeSetting] = useState<RechargeSetting>({
    amount: "0",
    threshold: "0",
    isAutoRecharge: false,
  });
  const fetchAutoRecharge = useCallback(() => {
    setIsLoading(true);
    getAutoRecharge()
      .then((res) => {
        if (res) {
          setRechargeSetting(transformInt64toString(res));
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  const setAutoRechargeConfig = useCallback(
    (setting: RechargeSetting, cb?: any[]) => {
      setIsLoading(true);
      return setAutoRecharge({
        threshold: setting.threshold ? Number(setting.threshold) : 0,
        amount: setting.amount ? Number(setting.amount) : 0,
        isAutoRecharge: setting.isAutoRecharge,
      })
        .then(() => {
          fetchAutoRecharge();
          if (Array.isArray(cb)) {
            cb.forEach((c) => c());
          }
        })
        .catch((err) => {
          message.error("Failed to set auto recharge");
          console.log(err);
          throw err;
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [fetchAutoRecharge],
  );
  useEffect(() => {
    if (initFetch) {
      fetchAutoRecharge();
    }
  }, [initFetch, fetchAutoRecharge]);
  return {
    isLoading,
    rechargeSetting,
    fetchAutoRecharge,
    setAutoRechargeConfig,
  };
}
