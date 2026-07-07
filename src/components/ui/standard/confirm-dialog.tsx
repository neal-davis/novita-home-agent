"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  confirmClassName?: string;
  cancelClassName?: string;
  variant?: "default" | "destructive";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName,
  cancelClassName,
  variant = "default",
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[520px] rounded-[var(--radius-dialog)] border-[var(--border)] bg-[var(--white)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[18px] font-semibold text-[var(--black)]">
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription asChild>
              <div className="text-sm text-[var(--dark-1)]">{description}</div>
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn(
              "h-8 rounded-[6px] border-[var(--gray-2)] text-[var(--dark-1)]",
              cancelClassName,
            )}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              "h-8 rounded-[6px] bg-[var(--brand-0)] text-[var(--black)] hover:bg-[var(--brand-0)]",
              variant === "destructive" &&
                "bg-[var(--red-1)] text-white hover:bg-[var(--red-1)]",
              confirmClassName,
            )}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
