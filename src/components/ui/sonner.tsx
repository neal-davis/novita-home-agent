"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset={{ top: 72 }}
      mobileOffset={{ top: 64 }}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[var(--text-success)]" />
        ),
        info: <InfoIcon className="size-4 text-[var(--text-link)]" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-[var(--text-warning)]" />
        ),
        error: <OctagonXIcon className="size-4 text-[var(--text-error)]" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-[var(--text-2)]" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "!left-0 !right-0 !mx-auto !w-fit min-h-11 max-w-[min(520px,calc(100vw-32px))] rounded-[var(--radius-8-medium)] border-l-4 border-[var(--border-default)] bg-[var(--fill-white)] px-4 py-3 shadow-[0_12px_32px_var(--alpha-dark-15)]",
          title: "font-paragraph-14-medium text-[var(--text-1)]",
          description: "font-paragraph-13 text-[var(--text-3)]",
          icon: "mt-0.5",
          success:
            "border-l-[var(--border-success)] bg-[linear-gradient(90deg,var(--green-50),var(--fill-white)_44%)]",
          info: "border-l-[var(--blue-600)] bg-[linear-gradient(90deg,var(--blue-100),var(--fill-white)_44%)]",
          warning:
            "border-l-[var(--border-warning)] bg-[linear-gradient(90deg,var(--orange-50),var(--fill-white)_44%)]",
          error:
            "border-l-[var(--border-error)] bg-[linear-gradient(90deg,var(--red-50),var(--fill-white)_44%)]",
          loading: "border-l-[var(--border-1)]",
        },
      }}
      style={
        {
          "--width": "min(520px, calc(100vw - 32px))",
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
