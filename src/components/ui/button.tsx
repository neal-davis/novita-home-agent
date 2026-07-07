"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useIsInConsole } from "@/hooks/useIsInConsole";
import { cn } from "@/lib/utils";

import styles from "./button.module.scss";

const buttonVariants = cva(
  "select-none inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--dark-1)] text-white shadow-none hover:bg-[var(--element-low-em)] hover:text-white",
        outline:
          "border-[1px] border-border-dark-1 text-accent-foreground bg-background hover:bg-accent-hover",
        noborderoutline:
          "border-none text-accent-foreground bg-background hover:bg-accent-hover",
        secondary:
          "border border-[var(--border-strong)] bg-white text-[var(--dark-1)] shadow-none hover:border-[var(--element-high-em)] hover:bg-[var(--element-high-em)] hover:text-[var(--white)]",
        tertiary:
          "bg-tertiary text-tertiary-foreground hover:bg-tertiary-hover",
        ghost:
          "border border-input hover:bg-accent-hover hover:text-accent-foreground",
        noborderghost:
          "border-none text-groupbtn-foreground hover:bg-accent-hover hover:text-accent-foreground",
        link: "text-text-1 underline-offset-4 focus-visible:ring-0 hover:bg-[var(--element-low-em)] hover:text-white",
        text: `${styles.text} font-subtle underline transition-none`,
        warn: "bg-warn text-warn-foreground hover:bg-warn-hover",
        green: "bg-green text-green-foreground hover:bg-green-hover",
        disabled:
          "bg-primary-disabled text-primary-foreground cursor-not-allowed opacity-50",
      },
      size: {
        default: "h-9 px-4 py-[6px] font-paragraph-14",
        sm: "h-6 px-2 font-small-console",
        sl: "h-8 px-4 font-subtle",
        lg: "h-10 px-6 font-body",
        icon: "w-8 h-8",
        link: "px-4 py-[6px] font-paragraph-15",
      },
      page: {
        web: "",
        console: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    compoundVariants: [
      // Text variant styles
      {
        variant: "text",
        page: "web",
        class: "text-text-1",
      },
      {
        variant: "text",
        page: "console",
        class: "text-text-1",
      },

      // Console size overrides (completely different size system)
      {
        size: "default",
        page: "console",
        class: "h-8 px-3 py-[6px]",
      },
      {
        size: "sm",
        page: "console",
        class: "h-6 px-2 py-1",
      },
      {
        size: "sl",
        page: "console",
        class: "h-7 px-[10px] py-1",
      },
      {
        size: "lg",
        page: "console",
        class: "h-9 px-4 py-3",
      },
    ],
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, page, asChild = false, onClick, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isInConsole = useIsInConsole();
    let pageType = page;
    if (!pageType) {
      pageType = isInConsole ? "console" : "web";
    }
    const isDisabled = props.disabled;

    return (
      <Comp
        aria-disabled={asChild && isDisabled ? true : undefined}
        className={cn(
          styles.btn,
          buttonVariants({ variant, size, page: pageType, className }),
        )}
        data-disabled={isDisabled ? true : undefined}
        onClick={onClick}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

const ButtonArrow = ({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) => (
  <span
    style={{ fontSize: 16, ...style }}
    className={cn(
      styles.btnArrow,
      "iconfont icon-right-arrow text-common-dark-1",
      className,
    )}
  ></span>
);

export { Button, ButtonArrow, buttonVariants };
