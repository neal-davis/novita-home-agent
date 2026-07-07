"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Button as UIButton,
  type ButtonProps as UIButtonProps,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LegacyButtonProps = Omit<UIButtonProps, "type" | "size" | "danger"> & {
  type?: "primary" | "default" | "dashed" | "link" | "text";
  htmlType?: "button" | "submit" | "reset";
  loading?: boolean;
  icon?: React.ReactNode;
  shape?: "default" | "circle" | "round";
  danger?: boolean;
  block?: boolean;
  ghost?: boolean;
};

function mapVariant(
  type: LegacyButtonProps["type"],
  danger?: boolean,
): UIButtonProps["variant"] {
  if (danger) {
    return "warn";
  }

  switch (type) {
    case "primary":
      return "default";
    case "link":
    case "text":
      return "link";
    case "dashed":
    case "default":
    default:
      return "outline";
  }
}

export const LegacyButton = React.forwardRef<
  HTMLButtonElement,
  LegacyButtonProps
>(
  (
    {
      children,
      className,
      type,
      htmlType = "button",
      loading,
      disabled,
      icon,
      shape,
      danger,
      block,
      ghost,
      variant,
      ...props
    },
    ref,
  ) => {
    return (
      <UIButton
        ref={ref}
        type={htmlType}
        variant={variant ?? (ghost ? "ghost" : mapVariant(type, danger))}
        disabled={disabled || loading}
        className={cn(
          block && "w-full",
          shape === "circle" && "h-8 w-8 rounded-full p-0",
          shape === "round" && "rounded-full",
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon}
        {children}
      </UIButton>
    );
  },
);

LegacyButton.displayName = "LegacyButton";
