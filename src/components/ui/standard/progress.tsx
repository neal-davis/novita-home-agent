"use client";

import { cn } from "@/lib/utils";

type ProgressStatus = "active" | "exception" | "success";

function normalizePercent(percent?: number) {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, Number(percent)));
}

export function ProgressBar({
  percent,
  status = "active",
  showInfo = true,
  className,
}: {
  percent?: number;
  status?: ProgressStatus;
  showInfo?: boolean;
  className?: string;
}) {
  const normalizedPercent = normalizePercent(percent);
  const indicatorColor =
    status === "exception" ? "bg-[var(--red-1)]" : "bg-[var(--brand-0)]";

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--gray-1)]">
        <div
          className={cn("h-full rounded-full transition-all", indicatorColor)}
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>
      {showInfo ? (
        <span className="min-w-10 text-right text-xs text-[var(--dark-2)]">
          {normalizedPercent.toFixed(1)}%
        </span>
      ) : null}
    </div>
  );
}

export function ProgressCircle({
  percent,
  size = 16,
  strokeWidth = 3,
  trailColor = "var(--gray-1)",
  strokeColor = "var(--brand-0)",
  className,
}: {
  percent?: number;
  size?: number;
  strokeWidth?: number;
  trailColor?: string;
  strokeColor?: string;
  className?: string;
}) {
  const normalizedPercent = normalizePercent(percent);
  const radius = Math.max(0, (size - strokeWidth) / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalizedPercent / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 -rotate-90", className)}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trailColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}
