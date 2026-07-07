"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    description?: React.ReactNode;
  }
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      description,
      ...props
    },
    ref,
  ) => {
    if (description && orientation === "horizontal") {
      return (
        <div className="relative flex items-center w-full">
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn("shrink-0 bg-border", "h-[1px] w-full", className)}
            {...props}
          />
          {description && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                {description}
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
