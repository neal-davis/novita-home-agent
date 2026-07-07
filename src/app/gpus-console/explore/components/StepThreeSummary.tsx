import MonthlyPrice from "@/app/gpus-console/instances/components/monthlyPrice";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { dealParamsText } from "@/lib/utils/utils";
import styles from "./stepThree.module.scss";

const commonTips = {
  gpuPriceDot: 2,
  storagePriceDot: 3,
};

export default function StepThreeSummary({
  createInstanceInfo,
  monthlyPrice,
  getGPUCost,
  getGPUSpotCost,
}: {
  createInstanceInfo: any;
  monthlyPrice: any;
  getGPUCost: () => any;
  getGPUSpotCost: () => any;
}) {
  return (
    <div className="flex mt-[16px] gap-[12px]">
      <div
        className="p-[16px] flex-1 rounded-[6px] border border-[var(--gray-2)] bg-[var(--white)]"
        style={{
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="mb-[20px] flex justify-between items-center">
          <div className="font-body-medium text-[var(--black)]">
            Instance Summary
          </div>
          {createInstanceInfo.billingMode === "monthly" && (
            <Tooltip
              title={<MonthlyPrice monthlyPriceInfo={monthlyPrice} />}
              placement="topRight"
              overlayStyle={{ maxWidth: "none" }}
            >
              <span
                className="font-subtle"
                style={{ color: "var(--brand-0)", cursor: "pointer" }}
              >
                {"Details"}
              </span>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center justify-between mb-[8px]">
          <span className="font-menu-medium text-[var(--black)]">
            {"Billing Method"}
          </span>
          <span className="font-subtle text-[var(--black)]">
            {createInstanceInfo.billingMode === "onDemand"
              ? "On-Demand"
              : createInstanceInfo.billingMode === "spot"
                ? "Spot"
                : `Subscription /${createInstanceInfo.month} ${createInstanceInfo.month > 1 ? "Months" : "Month"}`}
          </span>
        </div>
        <div
          className="h-[1px] mb-[8px]"
          style={{ borderTop: "1px dashed var(--dark-3)" }}
        ></div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-menu-medium text-[var(--black)]">
            {createInstanceInfo?.gpuNum}x {createInstanceInfo?.productName}
            {" GPU Cost"}
          </span>
          {createInstanceInfo.billingMode === "onDemand" && (
            <div className="flex items-center justify-end gap-[2px]">
              {Number(
                createInstanceInfo?.priceInfos?.instancePrice?.price || 0,
              ) >
                Number(
                  createInstanceInfo?.priceInfos?.instancePrice?.discount || 0,
                ) && (
                <span className="font-subtle text-[var(--dark-3-1)] line-through">
                  $
                  {(
                    Math.round(
                      Number(
                        createInstanceInfo?.priceInfos?.instancePrice?.price ||
                          0,
                      ) *
                        Number(createInstanceInfo?.gpuNum || 0) *
                        10000,
                    ) / 10000
                  ).toFixed(commonTips.gpuPriceDot) + ` /${"hr"}`}
                </span>
              )}
              <span className="font-body-medium text-[var(--red-2)]">
                ${getGPUCost()}
              </span>
            </div>
          )}
          {createInstanceInfo.billingMode === "spot" && (
            <div className="flex items-center justify-end gap-[2px]">
              {Number(
                createInstanceInfo?.priceInfos?.instancePrice?.price || 0,
              ) >
                Number(
                  createInstanceInfo?.priceInfos?.instanceSpotPrice?.discount ||
                    0,
                ) && (
                <span className="font-subtle text-[var(--dark-3-1)] line-through">
                  $
                  {(
                    Math.round(
                      Number(
                        createInstanceInfo?.priceInfos?.instancePrice?.price ||
                          0,
                      ) *
                        Number(createInstanceInfo?.gpuNum || 0) *
                        10000,
                    ) / 10000
                  ).toFixed(commonTips.gpuPriceDot) + ` /${"hr"}`}
                </span>
              )}
              <span className="font-body-medium text-[var(--red-2)]">
                ${getGPUSpotCost()}
              </span>
            </div>
          )}
          {createInstanceInfo.billingMode === "monthly" && (
            <div className="flex items-center justify-end gap-1">
              {Number(
                createInstanceInfo?.priceInfos?.instancePrice?.price || 0,
              ) *
                24 *
                30 *
                Number(createInstanceInfo?.gpuNum || 0) *
                Number(createInstanceInfo?.month || 0) >
                Number(monthlyPrice?.instanceAmount || 0) / 10000 && (
                <span className="font-subtle text-[var(--dark-3-1)] line-through">
                  $
                  {(
                    Math.round(
                      Number(
                        createInstanceInfo?.priceInfos?.instancePrice?.price ||
                          0,
                      ) *
                        24 *
                        30 *
                        Number(createInstanceInfo?.month || 0) *
                        Number(createInstanceInfo?.gpuNum || 0) *
                        10000,
                    ) / 10000
                  ).toFixed(commonTips.gpuPriceDot)}
                </span>
              )}
              <span className="font-body-medium text-[var(--red-2)]">
                $
                {`${(Number(monthlyPrice?.instanceAmount || 0) / 10000).toFixed(
                  commonTips.gpuPriceDot,
                )}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-menu-medium text-[var(--black)]">
            {"Total Disk"}:{" "}
            {Number(createInstanceInfo.rootfsSize) +
              (createInstanceInfo.mountLocal
                ? Number(
                    (
                      createInstanceInfo?.volumeMounts?.find(
                        (item: any) => item.type === "local",
                      ) || { size: 0 }
                    ).size || 0,
                  )
                : 0)}{" "}
            GB
          </span>
          <span className="font-body-medium text-[var(--black)]">
            {"$"}
            {(
              Math.round(
                (Number(createInstanceInfo.rootfsSize) +
                  (createInstanceInfo.mountLocal
                    ? Number(
                        (
                          createInstanceInfo?.volumeMounts?.find(
                            (item: any) => item.type === "local",
                          ) || { size: 0 }
                        ).size || 0,
                      )
                    : 0) >
                Number(createInstanceInfo?.freeStorage || 0)
                  ? Number(createInstanceInfo.rootfsSize) +
                    (createInstanceInfo.mountLocal
                      ? Number(
                          (
                            createInstanceInfo?.volumeMounts?.find(
                              (item: any) => item.type === "local",
                            ) || { size: 0 }
                          ).size || 0,
                        )
                      : 0) -
                    Number(createInstanceInfo?.freeStorage || 0)
                  : 0) *
                  (Number(
                    createInstanceInfo?.currProduct?.storagePrice?.discount ||
                      0,
                  ) || 0),
              ) / 100000
            ).toFixed(commonTips.storagePriceDot)}{" "}
            {" per day"}{" "}
          </span>
        </div>
        {createInstanceInfo.autoRenew && (
          <div className="flex items-start gap-1 mt-2 px-1 py-2 rounded-[4px] bg-[var(--yellow-6)]">
            <span
              className="iconfont icon-badge-alert"
              style={{
                color: "var(--yellow-1)",
                fontSize: "16px",
                marginTop: "-4px",
              }}
            />
            <span className="font-subtle text-[var(--yellow-1)]">
              Auto-renew enabled (Period:{" "}
              {`${createInstanceInfo.autoRenewMonth} ${createInstanceInfo.autoRenewMonth > 1 ? "months" : "month"}`}
              ) | Charge order: Coupons→Balance→Auto top-up.
            </span>
          </div>
        )}
      </div>
      <div
        className="p-[16px] flex-1 rounded-[6px] border border-[var(--gray-2)] bg-[var(--white)]"
        style={{
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="font-body-medium text-[var(--black)] mb-[20px]">
          Pricing Summary
        </div>
        <div className="font-subtle text-[var(--black)] mb-[12px]">
          {createInstanceInfo?.gpuNum}x {createInstanceInfo?.productName}
        </div>
        <div
          className="font-subtle text-[var(--black)] mb-[12px]"
          style={{ wordBreak: "break-all" }}
        >
          {createInstanceInfo?.imageUrl}
        </div>
        <div className="font-subtle text-[var(--black)]">
          {dealParamsText("${0} vCPU", {
            0: createInstanceInfo?.cpuNum || "/",
          })}
          , {createInstanceInfo?.memory} GB {"RAM"}
        </div>
      </div>
    </div>
  );
}
