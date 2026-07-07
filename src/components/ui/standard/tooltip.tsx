"use client";

import { Children, isValidElement, type ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_TOOLTIP_Z_INDEX = 10003;

type AppTooltipProps = {
  children: ReactNode;
  title?: ReactNode;
  content?: ReactNode;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  className?: string;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  overlayInnerStyle?: React.CSSProperties;
  zIndex?: number;
  open?: boolean;
  color?: string;
};

function normalizePlacement(placement: AppTooltipProps["placement"]) {
  if (placement?.startsWith("top")) {
    return "top";
  }
  if (placement?.startsWith("bottom")) {
    return "bottom";
  }
  if (placement === "left" || placement === "right") {
    return placement;
  }
  return "top";
}

export function AppTooltip({
  children,
  title,
  content,
  mouseEnterDelay,
  overlayClassName,
  overlayStyle,
  overlayInnerStyle,
  placement = "top",
  zIndex,
}: AppTooltipProps) {
  const tooltipContent = title ?? content;
  const trigger =
    Children.count(children) === 1 && isValidElement(children) ? (
      children
    ) : (
      <span className="inline-flex">{children}</span>
    );

  if (!tooltipContent) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={(mouseEnterDelay ?? 0) * 1000}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          className={overlayClassName}
          side={normalizePlacement(placement)}
          style={{
            zIndex: zIndex ?? DEFAULT_TOOLTIP_Z_INDEX,
            ...overlayStyle,
            ...overlayInnerStyle,
          }}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
