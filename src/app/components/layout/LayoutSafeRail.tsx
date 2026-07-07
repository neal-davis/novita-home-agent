import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marketing hero / wide-art rail: centered, capped at `--layout-safe-max`,
 * wider than nav (`--layout-nav-max`). Horizontal padding matches
 * `--spacing-layout-x` + xl inset used across dedicated-endpoint-style pages.
 */
export function LayoutSafeRail({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-layout-safe px-[var(--spacing-layout-x)] xl:px-[124px]",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
