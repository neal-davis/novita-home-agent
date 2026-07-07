import React, { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Tooltip.module.scss";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  trigger?: "hover" | "click" | "manual";
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  disabled?: boolean;
  maxWidth?: number | string;
}

export default function Tooltip({
  content,
  children,
  placement = "top",
  className,
  contentClassName,
  trigger = "hover",
  visible,
  onVisibleChange,
  disabled = false,
  maxWidth,
}: TooltipProps) {
  const [internalVisible, setInternalVisible] = useState(false);

  const isVisible = visible !== undefined ? visible : internalVisible;

  const handleMouseEnter = () => {
    if (disabled || trigger !== "hover") return;
    setInternalVisible(true);
    onVisibleChange?.(true);
  };

  const handleMouseLeave = () => {
    if (disabled || trigger !== "hover") return;
    setInternalVisible(false);
    onVisibleChange?.(false);
  };

  const handleClick = () => {
    if (disabled || trigger !== "click") return;
    const newVisible = !isVisible;
    setInternalVisible(newVisible);
    onVisibleChange?.(newVisible);
  };

  const getTooltipPosition = () => {
    switch (placement) {
      case "top":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-[2px]";
      case "bottom":
        return "top-full left-1/2 transform -translate-x-1/2 mt-1";
      case "left":
        return "right-full top-1/2 transform -translate-y-1/2 mr-1";
      case "right":
        return "left-full top-1/2 transform -translate-y-1/2 ml-1";
      default:
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-[2px]";
    }
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && content && (
        <div
          className={cn(
            "absolute whitespace-nowrap border shadow-md",
            getTooltipPosition(),
            styles.tooltip_content,
            contentClassName,
          )}
          style={maxWidth ? { maxWidth, whiteSpace: "pre-wrap" } : undefined}
        >
          {content}
        </div>
      )}
    </div>
  );
}
