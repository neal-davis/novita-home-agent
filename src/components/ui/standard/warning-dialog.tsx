"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type WarningDialogProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function WarningDialog({
  open,
  title,
  description,
  onOpenChange,
}: WarningDialogProps) {
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
          <AlertDialogAction
            className="h-8 rounded-[6px] bg-[var(--brand-0)] text-[var(--black)] hover:bg-[var(--brand-0)]"
            onClick={() => onOpenChange(false)}
          >
            {"OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
