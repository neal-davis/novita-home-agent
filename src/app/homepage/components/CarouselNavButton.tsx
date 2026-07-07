"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselNavButtonProps {
  direction: "previous" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}

export default function CarouselNavButton({
  direction,
  label,
  disabled,
  onClick,
  className,
}: CarouselNavButtonProps) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded-[2px] border border-element-mid-em text-element-mid-em transition-colors",
        "hover:border-[var(--black)] hover:bg-[var(--black)] hover:text-[var(--white)]",
        "disabled:cursor-default disabled:border-element-disabled disabled:text-element-disabled disabled:hover:border-element-disabled disabled:hover:bg-transparent disabled:hover:text-element-disabled",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
