"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogDescription>
            Your current configuration will not be saved. Are you sure you want
            to cancel?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue editing
          </Button>
          <Button
            variant="secondary"
            className="bg-[var(--red-3)] hover:bg-[var(--red-2)]"
            onClick={onConfirm}
          >
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
