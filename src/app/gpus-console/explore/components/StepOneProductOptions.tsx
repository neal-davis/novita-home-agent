"use client";

import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import ContentSkeletonDeep from "@/app/gpus-console/components/ContentSkeletonDeep";
import DataEmpty from "../../components/DataEmpty";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Check, CircleQuestionMark, Cpu } from "lucide-react";
import styles from "./stepOne.module.scss";
import type { KeyboardEvent } from "react";

const commonTips = {
  gpuPriceDot: 2,
};

const SelectedCorner = () => (
  <div
    className="absolute top-[-2px] right-[-3px] flex h-[22px] w-[22px] items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-[var(--dark-1)] shadow-sm"
    aria-hidden
  >
    <Check className="h-[14px] w-[14px] text-white" />
  </div>
);

function runOnKeyboard(
  event: KeyboardEvent<HTMLElement>,
  callback: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  callback();
}

function getStockNode(inventoryState: any) {
  switch (inventoryState) {
    case "none":
      return (
        <div className="flex flex-row items-center gap-1">
          <div className="rounded-[50%] w-[6px] h-[6px] bg-[var(--red-1)]"></div>
          <span className={`text-[var(--red-1)] ${styles.gpu_store_level}`}>
            Unavailable
          </span>
        </div>
      );
    case "low":
      return (
        <div className="flex flex-row items-center gap-1">
          <div className="rounded-[50%] w-[6px] h-[6px] bg-[var(--yellow-2)]"></div>
          <span className={`text-[var(--yellow-2)] ${styles.gpu_store_level}`}>
            Low
          </span>
        </div>
      );
    case "normal":
      return (
        <div className="flex flex-row items-center gap-1">
          <div className="rounded-[50%] w-[6px] h-[6px] bg-[var(--brand-1)]"></div>
          <span className={`text-[var(--brand-1)] ${styles.gpu_store_level}`}>
            Medium
          </span>
        </div>
      );
    case "high":
      return (
        <div className="flex flex-row items-center gap-1">
          <div className="rounded-[50%] w-[6px] h-[6px] bg-[var(--brand-1)]"></div>
          <span className={`text-[var(--brand-1)] ${styles.gpu_store_level}`}>
            High
          </span>
        </div>
      );
    default:
      return (
        <div className="flex flex-row items-center gap-1">
          <div className="rounded-[50%] w-[6px] h-[6px] bg-[var(--red-1)]"></div>
          <span className={`text-[var(--red-1)] ${styles.gpu_store_level}`}>
            Unavailable
          </span>
        </div>
      );
  }
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- Keeps the existing product-card pricing branches intact; splitting the pricing matrix safely needs a separate focused refactor.
export default function StepOneProductOptions({
  productsLoading,
  products,
  deployObj,
  createInstanceInfo,
  params,
  deployFun,
  submitRequest,
}: any) {
  const buyableProducts = (products || []).filter(
    (ele: any) => ele?.originDatas[0]?.canBuy,
  );

  return (
    <div className={styles.productArea}>
      {!productsLoading && products && buyableProducts.length > 0 && (
        <div className={styles.productContainer}>
          {buyableProducts.map((item: any) => {
            const handleSelectProduct = () => {
              if (item.originDatas[0].usableNode) {
                deployFun(item);
              } else {
                submitRequest(item.productName, item.selectedGpuNum);
              }
            };

            return (
              // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- Product cards contain tooltip affordances, so they cannot be native buttons.
              <div
                role="button"
                tabIndex={0}
                key={item.originDatas[0].productId}
                className={`${styles.subItem} ${styles.productItem} cursor-pointer flex flex-col h-full w-full text-left
                        ${item.originDatas[0].usableNode ? styles.useableItem : styles.unuseableItem}`}
                style={{
                  backgroundColor: item.originDatas[0].usableNode
                    ? deployObj.productId === item.originDatas[0].productId
                      ? "var(--gray-3) !important"
                      : "var(--white)"
                    : "var(--gray-4)",
                  border:
                    deployObj.productId === item.originDatas[0].productId
                      ? "1px solid var(--dark-1)"
                      : "1px solid var(--gray-2)",
                  padding: 0,
                }}
                onClick={handleSelectProduct}
                onKeyDown={(event) => runOnKeyboard(event, handleSelectProduct)}
              >
                <div
                  className={`w-full h-full relative px-4 pt-3 pb-[6px] flex flex-col gap-[6px]
                            border-b border-b-[var(--gray-3)]`}
                >
                  {deployObj.productId === item.originDatas[0].productId && (
                    <SelectedCorner />
                  )}
                  <div className="inline-flex gap-1">
                    <span
                      className={`${styles.gpu_brand_text}
                            ${createInstanceInfo?.currProduct?.gpuSpecId === item.originDatas[0].gpuSpecId ? "!bg-[var(--gray-4)]" : ""}`}
                    >
                      {"NVIDIA"}
                    </span>
                    {item.cloudServiceType === "Center" && (
                      <div className={styles.secureTag}>Secure Cloud</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className="flex items-center gap-1">
                      <div className="font-h7 text-[var(--dark-1)]">
                        {item.productName}
                      </div>
                      {item.originDatas?.length > 0 &&
                        item.originDatas[0].gpuDesc && (
                          <Tooltip
                            title={
                              <div onClick={(e: any) => e.stopPropagation()}>
                                {item.originDatas[0].gpuDesc}
                              </div>
                            }
                          >
                            <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                          </Tooltip>
                        )}
                    </div>
                    <div className="flex flex-row items-center justify-between gap-1">
                      <div className="font-small-console text-[var(--dark-3-1)]">
                        {`Max CUDA ${item.originDatas[0].cudaVersion || "- -"}`}
                      </div>
                      {getStockNode(
                        item.originDatas[0]?.inventoryState || "none",
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between px-4 pt-2 pb-[6px] border-b border-b-[var(--gray-3)]">
                  <div>
                    <div className="flex items-center">
                      <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                      <div className="font-small-console text-[var(--dark-3-1)]">
                        {" VRAM"}
                      </div>
                    </div>
                    <div className="font-subtle-demibold text-[var(--dark-1)]">
                      {`${item.originDatas[0].gpuMemory || "- -"} GB`}
                    </div>
                  </div>
                  <div className="w-[1px] h-[38px] bg-[var(--gray-3)]"></div>
                  <div>
                    <div className="flex items-center">
                      <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                      <div className="font-small-console text-[var(--dark-3-1)]">
                        {" vCPU"}
                      </div>
                    </div>
                    <div className="font-subtle-demibold text-[var(--dark-1)]">
                      {item.originDatas[0].cpuNum || "- -"}
                    </div>
                  </div>
                  <div className="w-[1px] h-[38px] bg-[var(--gray-3)]"></div>
                  <div>
                    <div className="flex items-center">
                      <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                      <div className="font-small-console text-[var(--dark-3-1)]">
                        {" RAM"}
                      </div>
                    </div>
                    <div className="font-subtle-demibold text-[var(--dark-1)]">
                      {item.originDatas[0].memory || "- -"} GB
                    </div>
                  </div>
                </div>

                <div className="px-4 pt-2 pb-3 flex justify-between">
                  <div className={`${styles.onDemandTxt} flex`}>
                    {params.billingMethod === "onDemand"
                      ? "On Demand"
                      : params.billingMethod === "spot"
                        ? "Spot"
                        : ""}
                    {params.billingMethod === "monthly" &&
                      Number(
                        (
                          (Number(item.originDatas[0].monthlyPrice[0].price) /
                            Number(
                              item.originDatas[0].monthlyPrice[0]
                                .pricePrecision || 1,
                            ) /
                            10000 /
                            (Number(
                              item.priceInfos.instancePrice.discount || 1,
                            ) *
                              24 *
                              30)) *
                          10
                        ).toFixed(1),
                      ) < 10 && (
                        <span className="flex px-[6px] justify-center items-center bg-[var(--red-7)] text-[var(--red-2)] rounded-[4px] font-small-console">
                          {(
                            100 -
                            (Number(item.originDatas[0].monthlyPrice[0].price) /
                              Number(
                                item.originDatas[0].monthlyPrice[0]
                                  .pricePrecision || 1,
                              ) /
                              10000 /
                              (Number(
                                item.priceInfos.instancePrice.price || 1,
                              ) *
                                24 *
                                30)) *
                              100
                          ).toFixed(0)}
                          % OFF
                        </span>
                      )}
                    {params.billingMethod === "spot" &&
                      Number(
                        (
                          (Number(
                            item.originDatas[0].instanceSpotPrice?.discount ||
                              0,
                          ) /
                            (Number(item.originDatas[0].instancePrice.price) ||
                              1)) *
                          10
                        ).toFixed(1),
                      ) < 10 && (
                        <span className="flex ml-[8px] px-[6px] justify-center items-center bg-[var(--red-7)] text-[var(--red-2)] rounded-[4px] font-small-console">
                          {100 -
                            Number(
                              (
                                (Number(
                                  item.originDatas[0].instanceSpotPrice
                                    ?.discount || 0,
                                ) /
                                  (Number(
                                    item.originDatas[0].instancePrice.price,
                                  ) || 1)) *
                                100
                              ).toFixed(0),
                            )}
                          % OFF
                        </span>
                      )}
                  </div>
                  {params.billingMethod === "onDemand" ||
                  params.billingMethod === "spot" ? (
                    params.billingMethod === "onDemand" ? (
                      <span className={styles.priceAreaEn}>
                        {item.originDatas[0].instancePrice.price !==
                          item.originDatas[0].instancePrice.discount && (
                          <span className={styles.price}>
                            {item.priceInfos.instancePrice.price > 0
                              ? "$" +
                                (
                                  Math.round(
                                    Number(
                                      item.priceInfos.instancePrice.price,
                                    ) *
                                      item.selectedGpuNum *
                                      10000,
                                  ) / 10000
                                ).toFixed(commonTips.gpuPriceDot) +
                                `/${"hr"}`
                              : "-"}
                          </span>
                        )}
                        <span className="text-[var(--brand-1)] ml-[4px]">
                          {item.priceInfos.instancePrice.discount > 0
                            ? "$" +
                              (
                                Math.round(
                                  Number(
                                    item.priceInfos.instancePrice.discount,
                                  ) *
                                    item.selectedGpuNum *
                                    10000,
                                ) / 10000
                              ).toFixed(commonTips.gpuPriceDot) +
                              `/${"hr"}`
                            : "-"}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={styles.priceAreaEn}
                        style={{
                          display: "block",
                          alignItems: "center",
                        }}
                      >
                        {item.originDatas[0]?.instancePrice?.price !==
                          item.originDatas[0]?.instanceSpotPrice?.discount && (
                          <span className={styles.price}>
                            {(item.priceInfos?.instancePrice?.price || 0) > 0
                              ? "$" +
                                (
                                  Math.round(
                                    Number(
                                      item.priceInfos.instancePrice.price,
                                    ) *
                                      item.selectedGpuNum *
                                      10000,
                                  ) / 10000
                                ).toFixed(commonTips.gpuPriceDot) +
                                `/${"hr"}`
                              : "-"}
                          </span>
                        )}
                        <span className="text-[var(--brand-1)] ml-[4px]">
                          {item.priceInfos.instanceSpotPrice.discount > 0
                            ? "$" +
                              (
                                Math.round(
                                  Number(
                                    item.priceInfos.instanceSpotPrice.discount,
                                  ) *
                                    item.selectedGpuNum *
                                    10000,
                                ) / 10000
                              ).toFixed(commonTips.gpuPriceDot) +
                              `/${"hr"}`
                            : "-"}
                        </span>
                      </span>
                    )
                  ) : (
                    (item?.originDatas[0]?.monthlyPrice?.length || 0) > 0 && (
                      <span
                        className={styles.priceAreaEn}
                        style={{
                          display: "block",
                          alignItems: "center",
                          // minWidth: "165px",
                        }}
                      >
                        {
                          <span
                            className={styles.price}
                            style={{
                              marginLeft: "0px",
                              fontSize: "12px",
                            }}
                          >
                            {item.priceInfos.instancePrice.price > 0
                              ? "$" +
                                (
                                  Math.round(
                                    Number(
                                      item.priceInfos.instancePrice.price,
                                    ) *
                                      24 *
                                      30 *
                                      item.selectedGpuNum *
                                      10000,
                                  ) / 10000
                                ).toFixed(commonTips.gpuPriceDot) +
                                ``
                              : "-"}
                          </span>
                        }
                        <span
                          style={{
                            width: "100%",
                            // display: "flex",
                            // alignItems: "center",
                            marginLeft: "4px",
                            color: "var(--brand-1)",
                          }}
                        >
                          {Number(item.originDatas[0].monthlyPrice[0].price) > 0
                            ? "$" +
                              (
                                Math.round(
                                  (Number(
                                    item.originDatas[0].monthlyPrice[0].price,
                                  ) /
                                    Number(
                                      item.originDatas[0].monthlyPrice[0]
                                        .pricePrecision || 1,
                                    )) *
                                    item.selectedGpuNum,
                                ) / 10000
                              ).toFixed(commonTips.gpuPriceDot) +
                              `/${"month"}`
                            : "$" + "-" + `/${"month"}`}
                        </span>
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {productsLoading && <ContentSkeletonDeep />}
      {!productsLoading &&
        (!products ||
          (products || []).filter((ele: any) => ele?.originDatas[0]?.canBuy)
            .length === 0) && (
          <div>
            <DataEmpty />
          </div>
        )}
    </div>
  );
}
