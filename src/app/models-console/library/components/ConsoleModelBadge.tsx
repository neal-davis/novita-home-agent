"use client";

import type { ModelBadge } from "@/lib/model-library/badges";
import { cn } from "@/lib/utils";

interface ConsoleModelBadgeProps {
  badge: ModelBadge;
  className?: string;
}

const baseBadgeClassName =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-4 px-space-4 font-miletus text-paragraph-12 leading-none";

const badgeColorClassName: Record<ModelBadge["kind"], string> = {
  custom: "bg-brand-1 text-white",
  deprecated: "bg-status-neutral-bg text-status-neutral",
  discount: "bg-brand-1 text-white",
  free: "bg-brand-1 text-white",
  hot: "bg-brand-1 text-white",
  new: "bg-brand-1 text-white",
};

export function ConsoleModelBadge({
  badge,
  className,
}: ConsoleModelBadgeProps) {
  return (
    <span
      className={cn(
        baseBadgeClassName,
        badgeColorClassName[badge.kind],
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
