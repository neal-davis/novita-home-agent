import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import dayjs from "dayjs";

export default function AutoRenewState({
  instanceInfo,
}: {
  instanceInfo: any;
}) {
  function getBgColor(instanceInfo: any) {
    if (!instanceInfo?.autoRenew) {
      return "var(--gray-3)";
    } else {
      return dayjs(new Date(Number(instanceInfo.endTime) * 1000))
        .add(-3, "day")
        .isBefore(dayjs())
        ? "var(--orange-6)"
        : "var(--brand-2)";
    }
  }
  return (
    <>
      {instanceInfo?.autoRenew ? (
        <Tooltip
          title={
            dayjs(new Date(Number(instanceInfo.endTime) * 1000))
              .add(-3, "day")
              .isBefore(dayjs())
              ? "Less than 3 days left. Please renew soon."
              : "More than 3 days left. Please check renewal."
          }
        >
          <span
            className="inline-flex font-small rounded-[4px] text-[var(--dark-1)] py-[4px] px-[10px]"
            style={{
              backgroundColor: getBgColor(instanceInfo),
            }}
          >
            {instanceInfo?.autoRenew
              ? `Auto-renew: On (${instanceInfo?.autoRenewMonth} ${instanceInfo?.autoRenewMonth > 1 ? "months" : "month"})`
              : "Auto-renew: Off"}
          </span>
        </Tooltip>
      ) : (
        <span
          className="inline-flex font-small rounded-[4px] text-[var(--dark-1)] py-[4px] px-[10px]"
          style={{
            backgroundColor: getBgColor(instanceInfo),
          }}
        >
          {instanceInfo?.autoRenew
            ? `Auto-renew: On (${instanceInfo?.autoRenewMonth} ${instanceInfo?.autoRenewMonth > 1 ? "months" : "month"})`
            : "Auto-renew: Off"}
        </span>
      )}
      {(instanceInfo?.errorCode === 1 || instanceInfo?.errorCode === 2) && (
        <Tooltip
          title={
            instanceInfo?.errorCode === 1
              ? "Auto-renew is enabled but no valid payment method is detected. Renewal will fail and switch to pay-as-you-go. Please add a payment method."
              : "Budget is insufficient."
          }
          placement="top"
        >
          <span
            className="ml-[4px] iconfont icon-badge-alert"
            style={{
              color: "var(--red-2)",
              fontSize: "14px",
            }}
          ></span>
        </Tooltip>
      )}
    </>
  );
}
