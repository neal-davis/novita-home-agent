import { BadgePercent, CalendarCheck, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./section.module.scss";
import { scrollGpuConsoleToBottomAfterCommit } from "../../utils/scroll";

function BillingCommitmentOptionSkeleton({
  icon,
  variant,
}: {
  icon: ReactNode;
  variant: "simple" | "spot";
}) {
  return (
    <div
      className="flex w-[33%] items-start rounded-[8px] border-[1px] border-[var(--gray-2)] bg-[var(--white)] p-4 pointer-events-none select-none"
      aria-hidden
    >
      <div className="flex min-w-0 w-full flex-row items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gray-3)]">
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          {variant === "spot" ? (
            <>
              <Skeleton className="h-[var(--h7-line-height)] w-[45%] max-w-[160px] shrink-0 rounded-[4px] bg-[var(--gray-4)]" />
              <div className="flex flex-col gap-[calc(var(--small-line-height)-var(--small-font-size))]">
                <Skeleton className="h-[var(--small-font-size)] max-h-[var(--small-font-size)] w-full shrink-0 rounded-[2px] bg-[var(--gray-4)] leading-none" />
                <Skeleton className="h-[var(--small-font-size)] max-h-[var(--small-font-size)] w-[90%] shrink-0 rounded-[2px] bg-[var(--gray-4)] leading-none" />
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-[var(--h7-line-height)] w-[45%] max-w-[160px] shrink-0 rounded-[4px] bg-[var(--gray-4)]" />
              <div className="flex flex-col gap-[calc(var(--small-line-height)-var(--small-font-size))]">
                <Skeleton className="h-[var(--small-font-size)] max-h-[var(--small-font-size)] w-full shrink-0 rounded-[2px] bg-[var(--gray-4)] leading-none" />
                <Skeleton className="h-[var(--small-font-size)] max-h-[var(--small-font-size)] w-[90%] shrink-0 rounded-[2px] bg-[var(--gray-4)] leading-none" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommitmentOptions({
  applicationDetailLoading,
  currentApplication,
  productInfo,
  initParams,
  setInitParams,
  changeMonthlyPrice,
  sectionRoot,
}: {
  applicationDetailLoading: boolean;
  currentApplication: any;
  productInfo: any;
  initParams: any;
  setInitParams: (params: any) => void;
  changeMonthlyPrice: (value: any) => void;
  sectionRoot: HTMLElement | null;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-[8px] bg-[var(--gray-3)]">
      <div className="flex items-center gap-2">
        <div className="w-[3px] h-[14px] bg-[var(--brand-0)]"></div>
        <div className="font-h6 text-[var(--black)]">{"Commitment"}</div>
      </div>
      <div className="flex flex-row gap-3">
        {applicationDetailLoading ? (
          <>
            <BillingCommitmentOptionSkeleton
              icon={<Timer className="h-5 w-5 text-[var(--dark-3-1)]" />}
              variant="simple"
            />
            <BillingCommitmentOptionSkeleton
              icon={
                <CalendarCheck className="h-5 w-5 text-[var(--dark-3-1)]" />
              }
              variant="simple"
            />
            <BillingCommitmentOptionSkeleton
              icon={<BadgePercent className="h-5 w-5 text-[var(--dark-3-1)]" />}
              variant="spot"
            />
          </>
        ) : (
          <>
            <RadioGroup
              disabled={!currentApplication?.Id}
              value={initParams.billingMode}
              onValueChange={(value) => {
                setInitParams({ ...initParams, billingMode: value });
                scrollGpuConsoleToBottomAfterCommit(sectionRoot);
              }}
              className="flex items-start justify-between p-4 gap-2 border-[1px] border-[var(--gray-2)]
        rounded-[8px] bg-[var(--white)] w-[33%] gap-4 cursor-pointer"
              onClick={() => {
                setInitParams({
                  ...initParams,
                  billingMode: "onDemand",
                });
                scrollGpuConsoleToBottomAfterCommit(sectionRoot);
              }}
            >
              <div className="flex flex-row items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gray-3)]">
                  <Timer className="h-5 w-5 text-[var(--dark-3-1)]" />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <div className="font-h7 text-[var(--black)]">
                    {"On Demand"}
                  </div>
                  <div className="font-small-console text-[var(--dark-2)]">
                    {"Pay as you go,with costs based on actual usage time."}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <RadioGroupItem value="onDemand"></RadioGroupItem>
              </div>
            </RadioGroup>
            {productInfo?.monthlyPrice?.length > 0 && (
              <RadioGroup
                disabled={!currentApplication?.Id}
                value={initParams.billingMode}
                onValueChange={(value) => {
                  const initParamsCopy = { ...initParams };
                  setInitParams({
                    ...initParamsCopy,
                    billingMode: value,
                    month: 1,
                  });
                  if (initParamsCopy.billingMode !== "monthly") {
                    changeMonthlyPrice(1);
                  }
                  scrollGpuConsoleToBottomAfterCommit(sectionRoot);
                }}
                className="flex items-start justify-between p-4 gap-2 border-[1px] border-[var(--gray-2)]
        rounded-[8px] bg-[var(--white)] w-[33%] gap-4 cursor-pointer"
                onClick={() => {
                  if (initParams.billingMode !== "monthly") {
                    const initParamsCopy = { ...initParams };
                    setInitParams({
                      ...initParamsCopy,
                      billingMode: "monthly",
                      month: 1,
                    });
                    changeMonthlyPrice(1);
                    scrollGpuConsoleToBottomAfterCommit(sectionRoot);
                  }
                }}
              >
                <div className="flex flex-row items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gray-3)]">
                    <CalendarCheck className="h-5 w-5 text-[var(--dark-3-1)]" />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="font-h7 text-[var(--black)]">
                      {"Subscription"}
                    </div>
                    <div className="font-small-console text-[var(--dark-2)]">
                      {
                        "Pay a one-time fixed fee for a long-term commitment to reserve stable, dedicated resources."
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <RadioGroupItem value="monthly"></RadioGroupItem>
                </div>
              </RadioGroup>
            )}
            {productInfo?.instanceSpotPrice && (
              <RadioGroup
                disabled={!currentApplication?.Id}
                value={initParams.billingMode}
                onValueChange={(value) => {
                  setInitParams({
                    ...initParams,
                    billingMode: value,
                  });
                  scrollGpuConsoleToBottomAfterCommit(sectionRoot);
                }}
                className="flex items-start justify-between p-4 gap-2 border-[1px] border-[var(--gray-2)]
        rounded-[8px] bg-[var(--white)] w-[33%] gap-4 cursor-pointer"
                onClick={() => {
                  setInitParams({
                    ...initParams,
                    billingMode: "spot",
                  });
                  scrollGpuConsoleToBottomAfterCommit(sectionRoot);
                }}
              >
                <div className="flex flex-row items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gray-3)]">
                    <BadgePercent className="h-5 w-5 text-[var(--dark-3-1)]" />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="flex flex-row items-center gap-2">
                      <div className="font-h7 text-[var(--black)]">
                        {"Spot"}
                      </div>
                      <div
                        className={`rounded-[4px] border-[1px] border-[#FFE4E6] bg-[#FFF1F2] px-2 text-[#FF2056] ${styles.spot_tag}`}
                      >
                        {"50% Off, Interruptible"}
                      </div>
                    </div>
                    <div className="font-small-console text-[var(--dark-2)]">
                      {
                        "Spot instances offer low prices but may be interrupted at any time."
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <RadioGroupItem value="spot"></RadioGroupItem>
                </div>
              </RadioGroup>
            )}
          </>
        )}
      </div>
    </div>
  );
}
