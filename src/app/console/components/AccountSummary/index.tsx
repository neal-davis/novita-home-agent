import { Button, ButtonArrow } from "@/components/ui/button";
import ConsumeMonthlyChart from "../Billing/ConsumeMonthlyChart";
import { ChevronRightIcon } from "lucide-react";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { useVoucherModal } from "@/hooks/useVoucherModal";
import { getUserKey } from "@/api/user";
import { TeamRole } from "@/store/slice/userSlice";

export default function AccountSummary() {
  const { availableCredit } = useAppSelector(
    (state) => state.billing.balanceDetail,
  );
  const [keyLength, setKeyLength] = useState(0);

  const router = useRouter();

  const { voucherNum, InjectModalElement, handleVoucherModalOpen } =
    useVoucherModal();

  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const isBasicRole = currentTeam?.role === TeamRole.basic;

  useEffect(() => {
    getUserKey().then((res) => {
      if (Array.isArray(res.keys)) {
        setKeyLength(res.keys.length);
      }
    });
  }, []);

  return (
    <div>
      <h2 className="font-h5 text-common-dark-1">
        <span className="font-semibold">Account Summary</span>
      </h2>
      <div className="text-sm text-common-dark-2 mt-1">
        Track your balance, spending, and API keys at a glance.
      </div>
      <div className="mt-4 flex gap-3">
        <div className="shink-0 flex flex-col w-[340px] box-border gap-2">
          <div className="flex-1 border border-common-gray-2 rounded-md">
            <div className="flex flex-col p-4 gap-2 flex-1">
              <h3 className="font-medium">Available Credit</h3>
              <div className="flex justify-between">
                <div className="min-w-[130px] flex flex-col gap-1">
                  <div className="font-small-console text-common-dark-1">
                    Credit
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body-medium text-[var(--brand-0)]">
                      ${availableCredit ?? 0}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        router.push(NOVITA_URL.BILLING_OVERVIEW);
                        analytics.trackClick(
                          CLICK_BTN_IDs.MAIN_CONSOLE
                            .ACCOUNT_SUMMARY_VIEW_BALANCE,
                        );
                      }}
                    >
                      <span>View</span>
                      <ChevronRightIcon size={12} />
                    </Button>
                  </div>
                </div>
                <div className="min-w-[130px] flex flex-col gap-1">
                  <div className="font-small-console text-common-dark-1">
                    Available Vouchers
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body-medium text-[var(--brand-0)]">
                      {voucherNum?.num ?? 0}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        handleVoucherModalOpen();
                        analytics.trackClick(
                          CLICK_BTN_IDs.MAIN_CONSOLE
                            .ACCOUNT_SUMMARY_VIEW_VOUCHER,
                        );
                      }}
                    >
                      <span>View</span>
                      <ChevronRightIcon size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-2 p-4 border border-common-gray-2 rounded-md">
            <h3 className="font-medium">API Keys</h3>
            <div className="font-small-console">All keys</div>
            <div className="flex items-center gap-2">
              <span className="font-body-medium text-[var(--brand-0)]">
                {keyLength}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1"
                onClick={() => {
                  router.push(NOVITA_URL.KEYS);
                  analytics.trackClick(
                    CLICK_BTN_IDs.MAIN_CONSOLE.ACCOUNT_SUMMARY_VIEW_API_KEYS,
                  );
                }}
              >
                <span>View</span>
                <ChevronRightIcon size={12} />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3 border border-common-gray-2 rounded-md p-4">
          <div className="items-center justify-between flex">
            <div className="font-paragraph-14 text-text-1">Monthly Spend</div>
            <Button
              asChild
              size="sm"
              variant="text"
              className="no-underline"
              onClick={() => {
                router.push(NOVITA_URL.BILLING_OVERVIEW);
                analytics.trackClick(
                  CLICK_BTN_IDs.MAIN_CONSOLE.ACCOUNT_SUMMARY_VIEW_MONTHLY_SPEND,
                );
              }}
            >
              <div className="group flex items-center cursor-pointer">
                <span className="text-text-1 uppercase group-hover:underline">
                  Go to Billing
                </span>
                <ButtonArrow
                  style={{
                    fontSize: 16,
                    color: "inherit",
                  }}
                />
              </div>
            </Button>
          </div>
          <div className="flex-1 relative">
            <div
              className="w-full h-full"
              style={
                isBasicRole
                  ? { filter: "blur(8px)", opacity: 0.5, pointerEvents: "none" }
                  : {}
              }
            >
              <ConsumeMonthlyChart />
            </div>
            {isBasicRole && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 10V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V10M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16ZM5 10H19C20.1046 10 21 10.8954 21 12V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V12C3 10.8954 3.89543 10 5 10Z"
                      stroke="#4F4E4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-body-medium text-common-dark-2">
                    No permission
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {InjectModalElement}
    </div>
  );
}
