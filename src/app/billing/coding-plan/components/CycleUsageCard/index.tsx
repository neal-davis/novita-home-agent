"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CycleUsage, getUsageStatus, formatTokens } from "../../types";
import { cn } from "@/lib/utils";
import { NOVITA_URL } from "@/constants/urls";

interface CycleUsageCardProps {
  className?: string;
  data: CycleUsage | null;
  isRefreshing: boolean;
  isLoading: boolean;
  handleRefresh: () => void;
  onCancelSubscription?: (instanceId: string) => Promise<void>;
  onResubscribe?: (instanceId: string) => Promise<void>;
}

function formatExpiryTime(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
      date.getUTCDate(),
    )}`,
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
      date.getUTCSeconds(),
    )}`,
  ].join(" ");
}

export default function CycleUsageCard({
  className,
  data,
  isRefreshing,
  isLoading,
  handleRefresh,
  onCancelSubscription,
  onResubscribe,
}: CycleUsageCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percentage = data ? (data.used / data.total) * 100 : 0;
  const status = data ? getUsageStatus(percentage) : "safe";

  const statusConfig: Record<
    string,
    {
      progressColor: string;
      label: string | null;
      labelBg?: string;
      labelColor?: string;
    }
  > = {
    safe: {
      progressColor: "var(--brand-1)",
      label: null,
    },
    notice: {
      progressColor: "var(--orange-2)",
      label: "Notice",
      labelBg: "var(--orange-7)",
      labelColor: "var(--orange-1)",
    },
    warning: {
      progressColor: "var(--red-1)",
      label: "Warning",
      labelBg: "var(--red-6)",
      labelColor: "var(--red-1)",
    },
  };

  const config = statusConfig[status];

  const handleCancelConfirm = async () => {
    if (!data) return;

    setIsSubmitting(true);
    try {
      await onCancelSubscription?.(data.instanceId);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Cancel subscription failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubscribeClick = async () => {
    if (!data) return;

    setIsSubmitting(true);
    try {
      await onResubscribe?.(data.instanceId);
    } catch (error) {
      console.error("Resubscribe failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-[var(--white)] border border-[var(--gray-2)] rounded-lg p-6",
          className,
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-9 w-48 mb-3" />
        <Skeleton className="h-2 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div
        className={cn(
          "bg-[var(--white)] border border-[var(--gray-2)] rounded-lg p-6",
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
          <div className="flex min-w-0 items-center gap-2 flex-wrap">
            <h3 className="font-h6 text-[var(--dark-1)] m-0">Cycle usage</h3>
            <span className="font-small-console h-6 px-2 py-0.5 bg-[var(--gray-3)] text-[var(--dark-3-1)] rounded-sm flex items-center">
              {data.packageName}
            </span>
            {data.isCanceled && (
              <span className="font-small-console-medium flex h-6 items-center rounded-sm bg-[var(--red-6)] px-2 py-0.5 text-[var(--red-1)]">
                <span className="mr-1">Until</span>
                {formatExpiryTime(data.expiryTime)}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-6 flex-wrap sm:justify-end">
            {data.isCanceled ? (
              <Button
                size="sl"
                disabled={isSubmitting}
                onClick={handleResubscribeClick}
                className="px-5"
              >
                Restart auto-renewal
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  size="sl"
                  disabled={isSubmitting}
                  className="h-auto px-0 py-0 font-paragraph-13 text-[var(--red-1)] underline underline-offset-4 decoration-current rounded-none"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Cancel Subscription
                </Button>
                <Button
                  variant="text"
                  size="sl"
                  rel="noopener noreferrer"
                  className="h-auto px-0 py-0 font-paragraph-13 text-[var(--dark-1)] underline underline-offset-4 decoration-current rounded-none"
                  asChild
                >
                  <Link href={NOVITA_URL.CODING_PLAN} target="_blank">
                    Change Plan
                  </Link>
                </Button>
              </>
            )}
            <Button
              variant="text"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2 py-2"
              aria-label="Refresh cycle usage"
            >
              <RefreshCw
                size={16}
                color="var(--dark-1)"
                className={`${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            {config.label && (
              <span
                className="font-small-console px-2 py-1 rounded font-medium"
                style={{
                  backgroundColor: config.labelBg,
                  color: config.labelColor,
                }}
              >
                {config.label}
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <span className="font-h4-large text-[var(--dark-1)]">
            {formatTokens(data.used)}
          </span>
          <span className="font-subtle-medium text-[var(--dark-3)] ml-1">
            / {formatTokens(data.total)} tokens
          </span>
        </div>

        <div className="h-2 bg-[var(--gray-3)] rounded overflow-hidden mb-3">
          <div
            className="h-full rounded transition-[width] duration-300 ease-out"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: config.progressColor,
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="font-subtle text-[var(--dark-3-1)]">
            Day {data.dayOfCycle} of {data.totalDays}
          </span>
          <span className="font-subtle text-[var(--dark-3-1)]">
            {percentage.toFixed(1)}% Used
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="pb-0">
            <DialogTitle className="font-body-medium">
              Cancel {data.packageName} auto-renewal
            </DialogTitle>
          </DialogHeader>
          <div>
            <p className="font-menu text-[var(--dark-3)]">
              If you confirm cancel your {data.packageName} auto-renewal, your
              Coding plan package will expire on{" "}
              {formatExpiryTime(data.expiryTime)}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sl"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              No
            </Button>
            <Button
              onClick={handleCancelConfirm}
              size="sl"
              disabled={isSubmitting}
              className="bg-[var(--red-1)] text-white hover:bg-[var(--red-2)]"
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
