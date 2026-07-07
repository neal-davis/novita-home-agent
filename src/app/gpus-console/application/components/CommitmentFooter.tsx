import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { sliceUTCString } from "@/lib/utils/date";
import styles from "./section.module.scss";

const gpuPriceDot = 2;

type CommitmentFooterProps = {
  state: {
    productInfo: any;
    applicationDetailLoading: boolean;
    initParams: any;
    monthlyPrice: any;
    currentApplication: any;
    currentApplicationDetail: any;
    deployLoading: boolean;
  };
  actions: {
    deployApplication: (billingMode: string) => void;
    setInitParams: (params: any) => void;
    changeMonthlyPrice: (value: any) => void;
  };
};

// react-doctor-disable-next-line react-doctor/no-giant-component -- Transitional GPU console split component; further extraction changes a dense purchase flow and should be handled in a dedicated follow-up.
export default function CommitmentFooter({
  state,
  actions,
}: CommitmentFooterProps) {
  const {
    productInfo,
    applicationDetailLoading,
    initParams,
    monthlyPrice,
    currentApplication,
    currentApplicationDetail,
    deployLoading,
  } = state;
  const { deployApplication, setInitParams, changeMonthlyPrice } = actions;
  const availableRenewalPeriods = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ].filter((type) =>
    productInfo?.monthlyPrice?.find((item: any) => Number(item.month) === type),
  );

  if (productInfo?.productId && !applicationDetailLoading) {
    if (initParams.billingMode === "onDemand") {
      return (
        <div className={styles.commitment_container} data-commitment-footer>
          <div className="flex flex-col gap-[12px]">
            <div className="font-h6 text-[var(--black)]">{"On Demand"}</div>
            <div className="flex items-center gap-4">
              <span className="font-small-console text-[var(--dark-2)]">
                {"Pay as you go,with costs based on actual usage time."}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-end gap-3">
                <div className="flex items-center gap-1">
                  {Number(productInfo?.instancePrice?.price || 0) >
                    Number(productInfo?.instancePrice?.discount || 0) && (
                    <span className="font-small-console text-[var(--dark-2)] line-through">
                      {`$${(
                        Math.round(
                          (Number(productInfo?.instancePrice?.price || 0) *
                            Number(
                              currentApplicationDetail?.recommendCard?.gpuNum ||
                                0,
                            )) /
                            1000,
                        ) / 100
                      ).toFixed(gpuPriceDot)}/hr`}
                    </span>
                  )}
                  <span className="font-h4-large text-[var(--brand-1)]">
                    {`$${(
                      Math.round(
                        (Number(productInfo?.instancePrice?.discount || 0) *
                          Number(
                            currentApplicationDetail?.recommendCard?.gpuNum ||
                              0,
                          )) /
                          1000,
                      ) / 100
                    ).toFixed(gpuPriceDot)}`}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)]">
                    {"/hr"}
                  </span>
                </div>
              </div>
              <span className="font-small-console shrink-0 text-[var(--dark-2)] flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap">
                <span className="font-small-console shrink-0 text-[var(--dark-2)] whitespace-nowrap">
                  {"Total Disk"}: {Number(currentApplication?.rootfsSize)}{" "}
                  GB(Free {Number(productInfo?.freeStorage || 0)} GB)
                </span>
                <span className="font-menu-medium shrink-0 text-[var(--black)] whitespace-nowrap">
                  {"$"}
                  {(
                    (Math.round(
                      Number(currentApplication?.rootfsSize) >
                        Number(productInfo?.freeStorage || 0)
                        ? Number(currentApplication.rootfsSize) -
                            Number(productInfo?.freeStorage || 0)
                        : 0,
                    ) *
                      (Number(productInfo?.storagePrice?.discount || 0) || 0)) /
                    100000
                  ).toFixed(3)}{" "}
                </span>
                <span className="shrink-0 whitespace-nowrap">{"/day"}</span>
              </span>
            </div>
            <Button
              disabled={deployLoading}
              onClick={() => {
                deployApplication("onDemand");
              }}
              variant="default"
              className="h-9 w-[200px] px-4 py-2"
            >
              Deploy
            </Button>
          </div>
        </div>
      );
    } else if (initParams.billingMode === "monthly") {
      return (
        <div className={styles.commitment_container} data-commitment-footer>
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-row items-center gap-3">
              <div className="font-h6 text-[var(--black)]">
                {"Subscription"}
              </div>
              <span className="font-small-console text-[var(--dark-2)]">
                {`Expect
                ${
                  Number(monthlyPrice?.endTime || 0) > 0 &&
                  sliceUTCString(
                    new Date(
                      Number(monthlyPrice?.endTime) * 1000,
                    ).toUTCString(),
                    "second",
                  )
                }
                Expire`}
              </span>
            </div>
            <div className="flex flex-row items-center gap-3">
              <Select
                value={initParams.month}
                onValueChange={(value: any) => {
                  setInitParams({
                    ...initParams,
                    month: Number(value),
                  });
                  changeMonthlyPrice(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[210px]">
                  <SelectValue placeholder="Select Subscription" />
                </SelectTrigger>
                <SelectContent>
                  {productInfo?.monthlyPrice?.length > 0 &&
                    productInfo?.monthlyPrice?.map((item: any) => (
                      <SelectItem key={item.month} value={item.month}>
                        <span className="flex font-subtle">
                          {item.month +
                            (Number(item.month || 0) > 1
                              ? " months"
                              : " month")}
                          {Number(
                            (
                              (Number(item.price || 0) /
                                Number(item.pricePrecision || 1) /
                                10000 /
                                ((Number(
                                  productInfo?.instancePrice?.price || 1,
                                ) /
                                  100000) *
                                  24 *
                                  30)) *
                              10
                            ).toFixed(1),
                          ) < 10 && (
                            <span className="flex ml-[8px] px-[6px] justify-center items-center bg-[var(--red-7)] text-[var(--red-2)] rounded-[4px] font-small-console">
                              {(
                                100 -
                                (Number(item.price || 0) /
                                  Number(item.pricePrecision || 1) /
                                  10000 /
                                  ((Number(
                                    productInfo?.instancePrice?.price || 1,
                                  ) /
                                    100000) *
                                    24 *
                                    30)) *
                                  100
                              ).toFixed(0)}
                              % OFF
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="font-small-console text-[var(--dark-2)]">
                {
                  "Pay a one-time fixed fee for a long-term commitment to reserve stable, dedicated resources."
                }
              </div>
            </div>
            <div className="flex flex-col gap-3 p-3 rounded-[8px] border-[1px] border-[var(--gray-1)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-small-console shrink-0 text-[var(--dark-2)]">
                    {"Auto-renewal"}
                  </span>
                  <Switch
                    checked={initParams.autoRenew}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setInitParams({
                          ...initParams,
                          autoRenew: checked,
                          autoRenewMonth: initParams.month + "",
                        });
                      } else {
                        setInitParams({
                          ...initParams,
                          autoRenew: checked,
                        });
                      }
                    }}
                  />
                  {initParams.autoRenew && (
                    <div className="flex items-center gap-2">
                      <div className="w-[1px] bg-[var(--dark-4)] h-[12px]"></div>
                      <span className="font-small-console text-[var(--dark-2)]">
                        Auto-charge{" "}
                        <span className="text-[var(--brand-0)]">3 days</span>{" "}
                        before expiry; retry daily until due date. Switch to
                        pay-as-you-go if payment fails.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {initParams.autoRenew && (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-small-console shrink-0 text-[var(--dark-2)]">
                      {"Renewal period"}
                    </span>
                    <Select
                      value={initParams.autoRenewMonth}
                      onValueChange={(value: any) => {
                        setInitParams({
                          ...initParams,
                          autoRenewMonth: value,
                        });
                      }}
                    >
                      <SelectTrigger className="w-[120px] text-[var(--dark-1)] h-[28px]">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRenewalPeriods.map((type) => (
                          <SelectItem value={String(type)} key={type}>
                            {type}&nbsp;
                            {type > 1 ? "months" : "month"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {initParams.autoRenew && (
                      <span className="font-small-console text-[var(--dark-2)]">
                        Auto-renews every{" "}
                        <span className="text-[var(--brand-0)]">
                          {initParams.autoRenewMonth}{" "}
                          {initParams.autoRenewMonth > 1 ? "months" : "month"}
                        </span>
                        ; can be manually disabled.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-end gap-3">
                <div className="flex items-center gap-1">
                  {/* <span className="font-small-console text-[var(--dark-2)]">
                  {"~$158/mo estimated"}
                </span> */}
                  {(Number(productInfo?.instancePrice?.price || 0) *
                    24 *
                    30 *
                    Number(
                      currentApplicationDetail?.recommendCard?.gpuNum || 0,
                    ) *
                    Number(initParams.month || 0)) /
                    100000 >
                    Number(monthlyPrice?.instanceAmount || 0) / 10000 && (
                    <span className="font-small-console text-[var(--dark-2)] line-through">
                      $
                      {(
                        Math.round(
                          Number(productInfo?.instancePrice?.price || 0) *
                            24 *
                            30 *
                            Number(initParams.month || 0) *
                            Number(
                              currentApplicationDetail?.recommendCard?.gpuNum ||
                                0,
                            ) *
                            10000,
                        ) /
                        10000 /
                        100000
                      ).toFixed(gpuPriceDot)}
                    </span>
                  )}
                  <span className="font-h4-large text-[var(--brand-1)]">
                    $
                    {(
                      Number(monthlyPrice?.instanceAmount || 0) / 10000
                    ).toFixed(gpuPriceDot)}
                  </span>
                </div>
              </div>

              <span className="font-small-console shrink-0 text-[var(--dark-2)] flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap">
                <span className="font-small-console shrink-0 text-[var(--dark-2)] whitespace-nowrap">
                  {"Total Disk"}: {Number(currentApplication?.rootfsSize)}{" "}
                  GB(Free {Number(productInfo?.freeStorage || 0)} GB)
                </span>
                <span className="font-menu-medium shrink-0 text-[var(--black)] whitespace-nowrap">
                  {"$"}
                  {(
                    (Math.round(
                      Number(currentApplication?.rootfsSize) >
                        Number(productInfo?.freeStorage || 0)
                        ? Number(currentApplication.rootfsSize) -
                            Number(productInfo?.freeStorage || 0)
                        : 0,
                    ) *
                      (Number(productInfo?.storagePrice?.discount || 0) || 0)) /
                    100000
                  ).toFixed(3)}
                </span>{" "}
                <span className="shrink-0 whitespace-nowrap">{"/day"}</span>
              </span>
            </div>
            <Button
              disabled={deployLoading}
              onClick={() => {
                deployApplication("monthly");
              }}
              variant="default"
              className="h-9 w-[200px] px-4 py-2"
            >
              Deploy
            </Button>
          </div>
        </div>
      );
    } else if (initParams.billingMode === "spot") {
      return (
        <div className={styles.commitment_container} data-commitment-footer>
          <div className="flex flex-col gap-[12px] max-w-[650px]">
            <div className="flex flex-row items-center gap-3">
              <div className="font-h6 text-[var(--black)]">{"Spot"}</div>
              <div className={styles.spot_tag}>{"50% Off, Interruptible"}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="font-small-console text-[var(--dark-2)]">
                  {`Spot instances offer low prices but may be interrupted at any time.
                  The system will notify 1 hour in advance. A 1-hour protection period
                  is applied by default. Best suited for fault-tolerant tasks.`}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-end justify-end gap-3">
                <div className="flex items-center gap-1">
                  {Number(productInfo?.instancePrice?.price || 0) >
                    Number(productInfo?.instanceSpotPrice?.discount || 0) && (
                    <span className="font-small-console text-[var(--dark-2)] line-through">
                      {`$${(
                        Math.round(
                          (Number(productInfo?.instancePrice?.price || 0) *
                            Number(
                              currentApplicationDetail?.recommendCard?.gpuNum ||
                                0,
                            )) /
                            1000,
                        ) / 100
                      ).toFixed(gpuPriceDot)}/hr`}
                    </span>
                  )}
                  <span className="font-h4-large text-[var(--brand-1)]">
                    {`$${(
                      Math.round(
                        (Number(productInfo?.instanceSpotPrice?.discount || 0) *
                          Number(
                            currentApplicationDetail?.recommendCard?.gpuNum ||
                              0,
                          )) /
                          1000,
                      ) / 100
                    ).toFixed(gpuPriceDot)}`}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)]">
                    {"/hr"}
                  </span>
                </div>
              </div>

              <span className="font-small-console shrink-0 text-[var(--dark-2)] flex flex-row flex-nowrap items-center gap-1 whitespace-nowrap">
                <span className="font-small-console shrink-0 text-[var(--dark-2)] whitespace-nowrap">
                  {"Total Disk"}: {Number(currentApplication?.rootfsSize)}{" "}
                  GB(Free {Number(productInfo?.freeStorage || 0)} GB)
                </span>
                <span className="font-menu-medium shrink-0 text-[var(--black)] whitespace-nowrap">
                  {"$"}
                  {(
                    (Math.round(
                      Number(currentApplication?.rootfsSize) >
                        Number(productInfo?.freeStorage || 0)
                        ? Number(currentApplication.rootfsSize) -
                            Number(productInfo?.freeStorage || 0)
                        : 0,
                    ) *
                      (Number(productInfo?.storagePrice?.discount || 0) || 0)) /
                    100000
                  ).toFixed(3)}
                </span>{" "}
                <span className="shrink-0 whitespace-nowrap">{"/day"}</span>
              </span>
            </div>
            <Button
              disabled={deployLoading}
              onClick={() => {
                deployApplication("spot");
              }}
              variant="default"
              className="h-9 w-[200px] px-4 py-2"
            >
              Deploy
            </Button>
          </div>
        </div>
      );
    }
  } else {
    return (
      <div className={styles.commitment_container} data-commitment-footer>
        <div className="flex flex-col gap-[12px]">
          <div className="font-h6 text-[var(--black)]">{""}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-end justify-end gap-3">
            <div className="flex items-end gap-1">
              <span className="font-h4-large text-[var(--dark-2)]">{"--"}</span>
              <span className="font-small-console text-[var(--dark-2)]">
                {"/hr"}
              </span>
            </div>
            <Button disabled variant="disabled" className="h-9 w-[200px]">
              Deploy
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
