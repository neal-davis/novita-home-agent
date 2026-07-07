"use client";
import styles from "./stepThree.module.scss";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  reqGetProductMonthlyPricing,
  reqGetProductPricing,
} from "@/api/gpu-instance/explore";
import { dealMoney } from "@/lib/utils/money";
import { sliceUTCString } from "@/lib/utils/date";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getCampaignConfig from "@/config/campaign";
import BuildMonthTag from "@/app/components/buildMonth";
import StepThreeSummary from "./StepThreeSummary";
const commonTips = {
  success: "success",
  paginationPreTxt: "Rows per page",
  balanceNotEnough: "Balance is not enough.",
  portLimit: "Please enter valid port, split with [,] port can be 1 to 65535",
  port2000: "Port can not be 2222, 2223, 2224",
  portSame: "Exposed ports cannot be same.",
  httpTcpPortSame: "Exposed http ports and tcp ports cannot be same.",
  httpTcpPortLimit: "Exposed http ports and tcp ports cannot be more than 25.",
  emptyKeyValue: "Key can not be empty",
  loginFailure: "Login failure, please log in again",
  itemIsRequired: "This field is required",
  loginFirst: "Please log in first",
  instanceStatus: {
    Creating: "Creating",
    Created: "Created",
    Starting: "Starting",
    Running: "Running",
    Stopping: "Stopping",
    Exited: "Exited",
    Terminating: "Terminating",
    Terminated: "Terminated",
    creating: "creating",
    toCreate: "toCreate",
    pulling: "pulling",
    running: "running",
    toStart: "toStart",
    starting: "starting",
    migrating: "migrating",
    toStop: "toStop",
    stopping: "stopping",
    exited: "exited",
    toRemove: "toRemove",
    removing: "removing",
    removed: "removed",
    resetting: "resetting",
    toRestart: "toRestart",
    restarting: "restarting",
    other: "other",
  },
  noData: "No Data",
  copyFailed: "Copy failed",
  copySuccess: "Copy success",
  clickCopy: "Click to copy",
  maxHttp10: "The max number of http ports is 10",
  newVoucherTitle: "New Voucher",
  newVoucherTip: "Received a new voucher!",
  newVoucherView: "view",
  invalidImagePath: "The container image is not valid",
  gpuPriceDot: 2,
  storagePriceDot: 3,
};
const StepThree = (createInstanceInfoOut: any, ref: any) => {
  const campaign = getCampaignConfig();
  const [createInstanceInfo, setCreateInstanceInfo] = useState(
    createInstanceInfoOut.createInstanceInfoOut?.createInstanceInfo,
  );
  const [demandItems, setDemandItems] = useState<any>([]);
  const [priceInfo, setPriceInfo] = useState({
    basePrice: 0,
    discountPrice: 0,
  });
  const [monthlyPrice, setMonthlyPrice] = useState({
    endTime: "",
    instanceAmount: "",
    storageAmount: "",
    instanceMonthPrice: "",
    instanceMonthPricePrecision: 0,
    storagePrice: "",
    storagePricePricePrecision: 0,
    gpuNum: 0,
    storageSize: 0,
    month: 0,
  });
  useEffect(() => {
    let productId = "";
    let createInstanceInfoOutTmp = { ...createInstanceInfo };
    if (createInstanceInfo?.createInstanceInfoOut) {
      createInstanceInfoOutTmp = {
        ...createInstanceInfo.createInstanceInfoOut,
      };
      productId = createInstanceInfoOutTmp.productId;
      // setCreateInstanceInfo(createInstanceInfoOutTmp);
    } else {
      productId = createInstanceInfo.productId;
    }
    if (
      createInstanceInfoOutTmp.currProduct.monthlyPrice &&
      createInstanceInfoOutTmp.currProduct.monthlyPrice.length > 0
    ) {
      createInstanceInfoOutTmp.month =
        createInstanceInfoOutTmp.currProduct.monthlyPrice[0].month;
    }
    if (!productId) {
      return;
    }
    reqGetProductPricing({ productId }).then((res: any) => {
      if (res) {
        setPriceInfo({
          basePrice: dealMoney(Number(res.basePrice), 4),
          discountPrice: dealMoney(Number(res.discountPrice), 5),
        });
      }
    });
    if (
      createInstanceInfoOutTmp.currProduct.monthlyPrice &&
      createInstanceInfoOutTmp.currProduct.monthlyPrice.length > 0
    ) {
      reqGetProductMonthlyPricing({
        productId,
        month:
          createInstanceInfoOutTmp.month ||
          createInstanceInfoOutTmp.currProduct.monthlyPrice[0].month,
        gpuNum: createInstanceInfo.gpuNum,
        storageSize:
          Number(createInstanceInfo.rootfsSize) +
          Number(
            createInstanceInfo.mountLocal
              ? createInstanceInfo.volumeMounts.find(
                  (item: any) => item.type === "local",
                ).size
              : 0,
          ),
      }).then((res: any) => {
        if (res) {
          setMonthlyPrice(res);
        }
      });
    }
    setDemandItems([
      {
        id: "",
        name: "",
        days: 1,
        price:
          createInstanceInfoOutTmp?.priceInfos?.instancePrice?.discount || 0,
      },
    ]);
  }, [createInstanceInfo]);
  useEffect(() => {
    let productId = "";
    const parentCreateInstanceInfo =
      createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo;
    if (!parentCreateInstanceInfo) {
      return;
    }
    const createInstanceInfoOutTmp = { ...parentCreateInstanceInfo };
    productId = createInstanceInfoOutTmp.productId;
    if (
      createInstanceInfoOutTmp.currProduct.monthlyPrice &&
      createInstanceInfoOutTmp.currProduct.monthlyPrice.length > 0
    ) {
      createInstanceInfoOutTmp.month =
        createInstanceInfoOutTmp.currProduct.monthlyPrice[0].month;
    }
    setCreateInstanceInfo((prev: any) => ({
      ...createInstanceInfoOutTmp,
      billingMode: prev?.billingMode || createInstanceInfoOutTmp.billingMode,
    }));
    if (!productId) {
      return;
    }
    reqGetProductPricing({ productId }).then((res: any) => {
      if (res) {
        setPriceInfo({
          basePrice: dealMoney(Number(res.basePrice), 4),
          discountPrice: dealMoney(Number(res.discountPrice), 5),
        });
      }
    });
    if (
      createInstanceInfoOutTmp.currProduct.monthlyPrice &&
      createInstanceInfoOutTmp.currProduct.monthlyPrice.length > 0
    ) {
      reqGetProductMonthlyPricing({
        productId,
        month:
          createInstanceInfoOutTmp.month ||
          createInstanceInfoOutTmp.currProduct.monthlyPrice[0].month,
        gpuNum: createInstanceInfoOutTmp.gpuNum,
        storageSize:
          Number(createInstanceInfoOutTmp.rootfsSize) +
          Number(
            createInstanceInfoOutTmp.mountLocal
              ? createInstanceInfoOutTmp.volumeMounts?.find(
                  (item: any) => item.type === "local",
                )?.size || 0
              : 0,
          ),
      }).then((res: any) => {
        if (res) {
          setMonthlyPrice(res);
        }
      });
    }
    setDemandItems([
      {
        id: "",
        name: "",
        days: 1,
        price:
          createInstanceInfoOutTmp?.priceInfos?.instancePrice?.discount || 0,
      },
    ]);
  }, [
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo,
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo
      .currProduct,
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo.gpuNum,
    createInstanceInfoOut?.createInstanceInfoOut?.createInstanceInfo.rootfsSize,
  ]);
  useImperativeHandle(ref, () => ({
    getCreateParameter: () => {
      const val: any = { ...createInstanceInfo };
      return val;
    },
    getMonthluSumFee: () => {
      return (
        Number(monthlyPrice?.instanceAmount || 0) / 10000 +
        Number(monthlyPrice?.storageAmount || 0) / 10000
      ).toFixed(commonTips.storagePriceDot);
    },
  }));
  function getGPUSpotCost() {
    if (createInstanceInfo?.savingPlanTemplateId) {
      const demandItem: any = demandItems.find(
        (item: any) => item.id === createInstanceInfo.savingPlanTemplateId,
      );
      return (
        Math.round(
          (Number(demandItem?.price || 0) *
            Number(createInstanceInfo?.gpuNum || 0) *
            Number(demandItem?.days || 0)) /
            1000,
        ) / 100
      );
    } else {
      return (
        (
          Math.round(
            Number(
              createInstanceInfo?.priceInfos?.instanceSpotPrice?.discount || 0,
            ) *
              Number(createInstanceInfo?.gpuNum || 0) *
              10000,
          ) / 10000
        ).toFixed(commonTips.gpuPriceDot) + ` /${"hr"}`
      );
    }
  }
  function getGPUCost() {
    if (createInstanceInfo?.savingPlanTemplateId) {
      const demandItem: any = demandItems.find(
        (item: any) => item.id === createInstanceInfo.savingPlanTemplateId,
      );
      return (
        Math.round(
          (Number(demandItem?.price || 0) *
            Number(createInstanceInfo?.gpuNum || 0) *
            Number(demandItem?.days || 0)) /
            1000,
        ) / 100
      );
    } else {
      return (
        (
          Math.round(
            Number(
              priceInfo.discountPrice ||
                createInstanceInfo?.priceInfos?.instancePrice?.discount ||
                0,
            ) *
              Number(createInstanceInfo?.gpuNum || 0) *
              10000,
          ) / 10000
        ).toFixed(commonTips.gpuPriceDot) + ` /${"hr"}`
      );
    }
  }
  function changeMonthlyPrice(value: any) {
    setCreateInstanceInfo({
      ...createInstanceInfo,
      billingMode: "monthly",
      month: value || "",
    });
    reqGetProductMonthlyPricing({
      productId: createInstanceInfo.productId,
      month: value || createInstanceInfo.currProduct.monthlyPrice[0].month,
      gpuNum: createInstanceInfo.gpuNum,
      storageSize:
        Number(createInstanceInfo.rootfsSize) +
        Number(
          createInstanceInfo.mountLocal
            ? createInstanceInfo.volumeMounts.find(
                (item: any) => item.type === "local",
              ).size
            : 0,
        ),
    }).then((res: any) => {
      if (res) {
        setMonthlyPrice(res);
      }
    });
  }
  return (
    <div className="mt-[16px]">
      <div className="flex flex-col rounded-[6px] bg-[var(--white)] border !border-[var(--gray-2)] p-[16px]">
        <div className="font-body-medium mb-[20px]">
          <span className="text-[var(--dark-3)]">
            {"Deploy an Instance > Customize Deployment"}
          </span>{" "}
          <span className="text-[var(--dark-1)]">{"> Launch a instance"}</span>
        </div>
        <div className="font-subtle-medium text-[var(--dark-1)] mb-[16px]">
          Commitment
        </div>
        <RadioGroup
          value={createInstanceInfo?.billingMode || ""}
          onValueChange={(value: any) => {
            setCreateInstanceInfo({
              ...createInstanceInfo,
              billingMode: value,
            });
          }}
        >
          {demandItems && demandItems.length
            ? demandItems.map((item: any, index: number) => (
                <div key={item.id} className={styles.billingOptionWrap}>
                  <div
                    className={`${
                      createInstanceInfo?.savingPlanTemplateId === item.id
                        ? styles.selectDemandItem
                        : styles.unSelectDemandItem
                    } ${styles.billingItem} ${
                      createInstanceInfo?.billingMode === "onDemand"
                        ? styles.billingSelected
                        : styles.billingUnselected
                    }`}
                  >
                    <label className="inline-flex items-center gap-2">
                      <RadioGroupItem value="onDemand" />
                      <span className={styles.onDemandTxt}>
                        {index === 0 ? "On Demand" : "Savings Plan"}
                        {createInstanceInfo?.currProduct?.activityActive &&
                          campaign?.enabled && (
                            <BuildMonthTag
                              type={"common" as "small" | "common"}
                              text={campaign?.gpuExploreDisplayName || ""}
                            />
                          )}
                      </span>
                    </label>
                    <div className={styles.billingOptionRow}>
                      {index > 0 ? (
                        <span className={styles.totalSaveTxt}>
                          {"Total Save"} {"$"}
                          {Math.round(
                            (Math.round(
                              Number(
                                createInstanceInfo?.priceInfos?.instancePrice
                                  ?.discount || 0,
                              ) * 100,
                            ) *
                              24 -
                              Math.round(Number(item.price) / 1000)) *
                              Number(item?.days || 0),
                          ) / 100}
                        </span>
                      ) : (
                        ""
                      )}
                      <span className={styles.price}>
                        {index !== 0 && (item.price || item.price === 0)
                          ? `${"$"}${(Math.round(Number(item.price) / (1000 * 24)) / 100).toFixed(commonTips.gpuPriceDot)}/${"hr"}`
                          : `${"$"}${(
                              Number(
                                priceInfo.discountPrice ||
                                  createInstanceInfo?.priceInfos?.instancePrice
                                    ?.discount ||
                                  0,
                              ) * createInstanceInfo.gpuNum
                            ).toFixed(commonTips.gpuPriceDot)}/${"hr"}`}
                        <span className={styles.originPrice}>
                          {index !== 0 && (item.price || item.price === 0)
                            ? `${"$"}${
                                Math.round(Number(item.price) / (1000 * 24)) /
                                100
                              }/${"hr"}`
                            : Number(
                                  priceInfo.discountPrice ||
                                    createInstanceInfo?.priceInfos
                                      ?.instancePrice?.discount ||
                                    0,
                                ) ===
                                Number(
                                  createInstanceInfo?.priceInfos?.instancePrice
                                    ?.price || 0,
                                )
                              ? ""
                              : `${"$"}${(
                                  Number(
                                    createInstanceInfo?.priceInfos
                                      ?.instancePrice?.price || 0,
                                  ) * createInstanceInfo.gpuNum
                                ).toFixed(commonTips.gpuPriceDot)}/${"hr"}`}
                        </span>
                      </span>
                    </div>
                    {index === 0 &&
                    createInstanceInfo?.savingPlanTemplateId === item.id ? (
                      <div>
                        {/* <div className={styles.demandDesc}>
                      {createInstanceInfo.billingMode === "onDemand"
                        ? "Pay as you go,with costs based on actual usage time."
                        : ""}
                    </div> */}
                        {createInstanceInfo.billingMode === "onDemand" &&
                          (createInstanceInfo?.currProduct?.activityActive &&
                          campaign?.enabled ? (
                            <div className="font-small text-[var(--dark-2)]">
                              {campaign?.gpuExploreOnDemandDesc || ""}
                            </div>
                          ) : (
                            <div className={styles.demandDesc}>
                              {createInstanceInfo.billingMode === "onDemand"
                                ? "Pay as you go,with costs based on actual usage time."
                                : ""}
                            </div>
                          ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  {index !== 0 &&
                  createInstanceInfo?.savingPlanTemplateId === item.id ? (
                    <div>
                      <div className={styles.savingPlanDesc}>
                        {item.name} Savings Plan: Reserve a GPU for {item.name}{" "}
                        at a discounted hourly cost.
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))
            : ""}
          {(createInstanceInfo?.currProduct?.monthlyPrice?.length || 0) > 0 && (
            <>
              <div
                className={`${styles.monthlyOptionWrap} ${
                  createInstanceInfo?.billingMode === "monthly"
                    ? styles.monthlyOptionWrapExpanded
                    : ""
                }`}
              >
                <div className="w-full">
                  <div
                    className={
                      // createInstanceInfo?.savingPlanTemplateId === item.id
                      //   ? styles.selectDemandItem
                      //   :
                      `${styles.unSelectDemandItem} ${styles.billingItem} ${styles.billingItemFull} ${
                        createInstanceInfo?.billingMode === "monthly"
                          ? styles.billingSelected
                          : styles.billingUnselected
                      }`
                    }
                  >
                    <label className="inline-flex items-center gap-2">
                      <RadioGroupItem value="monthly" />
                      <span className={styles.onDemandTxt}>
                        {"Subscription"}
                      </span>
                    </label>
                    <div className="font-subtle text-[var(--dark-2)]">
                      Expect{" "}
                      {Number(monthlyPrice?.endTime || 0) > 0 &&
                        sliceUTCString(
                          new Date(
                            Number(monthlyPrice?.endTime) * 1000,
                          ).toUTCString(),
                          "second",
                        )}{" "}
                      expire
                    </div>
                    <div className="flex gap-[12px] items-center">
                      <span className={styles.price}>
                        {`${"$"} ${(
                          Math.round(
                            (Number(
                              (
                                createInstanceInfo.currProduct.monthlyPrice.find(
                                  (item: any) =>
                                    item.month === createInstanceInfo.month,
                                ) ||
                                createInstanceInfo.currProduct.monthlyPrice[0]
                              ).price,
                            ) /
                              Number(
                                (
                                  createInstanceInfo.currProduct.monthlyPrice.find(
                                    (item: any) =>
                                      item.month === createInstanceInfo.month,
                                  ) ||
                                  createInstanceInfo.currProduct.monthlyPrice[0]
                                ).pricePrecision,
                              )) *
                              createInstanceInfo.gpuNum,
                          ) / 10000
                        ).toFixed(commonTips.gpuPriceDot)} /month`}
                      </span>
                      <Select
                        value={String(
                          createInstanceInfo.month ||
                            createInstanceInfo.currProduct.monthlyPrice[0]
                              .month,
                        )}
                        onValueChange={(value) => {
                          changeMonthlyPrice(Number(value));
                        }}
                      >
                        <SelectTrigger
                          className={`${styles.topSelectSearch} ${styles.monthlySelectTrigger}`}
                        >
                          {(() => {
                            const selected =
                              createInstanceInfo.month ||
                              createInstanceInfo.currProduct.monthlyPrice[0]
                                .month;
                            const curItem =
                              createInstanceInfo.currProduct.monthlyPrice.find(
                                (item: any) =>
                                  Number(item.month) === Number(selected),
                              );
                            const ret = curItem
                              ? curItem.month +
                                (Number(curItem.month || 0) > 1
                                  ? " months"
                                  : " month")
                              : selected;
                            return (
                              <span
                                className={`${styles.statusTxt} text-[var(--dark-1)] flex items-center`}
                              >
                                {ret}
                                {curItem &&
                                  Number(
                                    (
                                      (Number(curItem?.price || 0) /
                                        Number(curItem.pricePrecision || 1) /
                                        10000 /
                                        (Number(
                                          createInstanceInfo?.priceInfos
                                            ?.instancePrice?.price || 1,
                                        ) *
                                          24 *
                                          30)) *
                                      10
                                    ).toFixed(1),
                                  ) < 10 && (
                                    <span className="flex ml-[8px] px-[6px] justify-center items-center bg-[var(--red-7)] text-[var(--red-2)] rounded-[4px] font-small-console">
                                      {(
                                        100 -
                                        (Number(curItem?.price || 0) /
                                          Number(curItem.pricePrecision || 1) /
                                          10000 /
                                          (Number(
                                            createInstanceInfo?.priceInfos
                                              ?.instancePrice?.price || 1,
                                          ) *
                                            24 *
                                            30)) *
                                          100
                                      ).toFixed(0)}
                                      % OFF
                                    </span>
                                  )}
                              </span>
                            );
                          })()}
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {createInstanceInfo.currProduct.monthlyPrice.map(
                            (item: any) => (
                              <SelectItem
                                className={styles.menuItem}
                                key={item.month}
                                value={String(item.month)}
                              >
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
                                        (Number(
                                          createInstanceInfo?.priceInfos
                                            ?.instancePrice?.price || 1,
                                        ) *
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
                                          (Number(
                                            createInstanceInfo?.priceInfos
                                              ?.instancePrice?.price || 1,
                                          ) *
                                            24 *
                                            30)) *
                                          100
                                      ).toFixed(0)}
                                      % OFF
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <div>
                        <div className={styles.demandDesc}>
                          {createInstanceInfo.billingMode === "monthly"
                            ? "Pay a one-time fixed fee for a long-term commitment to reserve stable, dedicated resources."
                            : ""}
                        </div>
                      </div>
                    </div>
                    {createInstanceInfo?.billingMode === "monthly" && (
                      <div className={styles.monthlyDesc}>
                        <div>
                          <div
                            className={`${createInstanceInfo.autoRenew ? "mb-[16px]" : ""} flex items-center gap-[8px]`}
                          >
                            <span className="font-subtle text-[var(--dark-1)] min-w-[73px]">
                              Auto-renew
                            </span>
                            <Switch
                              size="sm"
                              checked={createInstanceInfo.autoRenew}
                              onCheckedChange={(checked: boolean) => {
                                if (checked) {
                                  setCreateInstanceInfo({
                                    ...createInstanceInfo,
                                    autoRenew: checked,
                                    autoRenewMonth:
                                      createInstanceInfo.month + "",
                                  });
                                } else {
                                  setCreateInstanceInfo({
                                    ...createInstanceInfo,
                                    autoRenew: checked,
                                  });
                                }
                              }}
                            />
                            {createInstanceInfo.autoRenew && (
                              <span className="font-small-console text-[var(--dark-2)]">
                                We will attempt charge{" "}
                                <span className="text-[var(--brand-0)]">
                                  3 days
                                </span>{" "}
                                before expiration; retries once per day until
                                the due date. If still failed, the instance
                                falls back to pay-as-you-go
                              </span>
                            )}
                          </div>
                          {createInstanceInfo.autoRenew && (
                            <div className="flex gap-[8px] items-center">
                              <span className="font-subtle text-[var(--dark-1)] min-w-[96px]">
                                Renewal period
                              </span>
                              <Select
                                // value={filterOptions.category}
                                // onValueChange={(value) => {
                                //   handleChange({
                                //     currentPage: 1,
                                //     category: value === "All" ? "" : value,
                                //   });
                                // }}
                                value={createInstanceInfo.autoRenewMonth}
                                onValueChange={(value: any) => {
                                  setCreateInstanceInfo({
                                    ...createInstanceInfo,
                                    autoRenewMonth: value,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-[120px] text-[var(--dark-1)] h-[28px]">
                                  <SelectValue placeholder={""} />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                    .filter((type) =>
                                      createInstanceInfo.currProduct.monthlyPrice.find(
                                        (item: any) =>
                                          Number(item.month) === type,
                                      ),
                                    )
                                    .map((type) => (
                                      <SelectItem
                                        value={String(type)}
                                        key={type}
                                      >
                                        {type}&nbsp;
                                        {type > 1 ? "months" : "month"}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              {createInstanceInfo.autoRenew && (
                                <span className="font-small-console text-[var(--dark-2)]">
                                  Auto-renews every{" "}
                                  <span className="text-[var(--brand-0)]">
                                    {createInstanceInfo.autoRenewMonth}{" "}
                                    {createInstanceInfo.autoRenewMonth > 1
                                      ? "months"
                                      : "month"}
                                  </span>
                                  ; can be manually disabled.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {
            // createInstanceInfo?.billingModes.includes("spot") &&
            createInstanceInfo?.currProduct?.instanceSpotPrice && (
              <div>
                <div
                  className={`${styles.unSelectDemandItem} ${
                    styles.billingItem
                  } ${
                    createInstanceInfo?.billingMode === "spot"
                      ? styles.billingSelected
                      : styles.billingUnselected
                  }`}
                >
                  <label className="inline-flex items-center gap-2">
                    <RadioGroupItem value="spot" />
                    <span className={styles.onDemandTxt}>{"Spot"}</span>
                  </label>
                  <span className={styles.billingOptionRow}>
                    <span className={styles.price}>
                      {`${"$"}${(
                        Number(
                          createInstanceInfo?.priceInfos?.instanceSpotPrice
                            ?.discount || 0,
                        ) * createInstanceInfo.gpuNum
                      ).toFixed(commonTips.gpuPriceDot)}/${"hr"}`}
                      <span className={styles.originPrice}>
                        {Number(
                          createInstanceInfo?.priceInfos?.instanceSpotPrice
                            ?.discount || 0,
                        ) ===
                        Number(
                          createInstanceInfo?.priceInfos?.instanceSpotPrice
                            ?.price || 0,
                        )
                          ? ""
                          : `${"$"}${(
                              Number(
                                createInstanceInfo?.priceInfos
                                  ?.instanceSpotPrice?.price || 0,
                              ) * createInstanceInfo.gpuNum
                            ).toFixed(commonTips.gpuPriceDot)}/${"hr"}`}
                        <span
                          className={`${styles.originPrice} ${styles.spotOriginPrice}`}
                        >
                          {Number(
                            createInstanceInfo?.priceInfos?.instanceSpotPrice
                              ?.discount || 0,
                          ) ===
                          Number(
                            createInstanceInfo?.priceInfos?.instancePrice
                              ?.price || 0,
                          )
                            ? ""
                            : `${"$"}${(
                                Number(
                                  createInstanceInfo?.priceInfos?.instancePrice
                                    ?.price || 0,
                                ) * createInstanceInfo.gpuNum
                              ).toFixed(commonTips.gpuPriceDot)}/${"hr"}`}
                        </span>
                      </span>
                    </span>
                  </span>
                  <div>
                    <div className={styles.spotDesc}>
                      {createInstanceInfo.billingMode === "spot"
                        ? "Spot instances offer low prices but may be interrupted at any time. The system will notify 1 hour in advance. A 1-hour protection period is applied by default. Best suited for fault-tolerant tasks."
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </RadioGroup>
      </div>

      <StepThreeSummary
        createInstanceInfo={createInstanceInfo}
        monthlyPrice={monthlyPrice}
        getGPUCost={getGPUCost}
        getGPUSpotCost={getGPUSpotCost}
      />
    </div>
  );
};
export default forwardRef(StepThree);
