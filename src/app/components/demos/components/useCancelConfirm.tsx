"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" closeable={!loading}>
        <DialogHeader>
          <DialogTitle className="text-left">
            Canceling still incurs full charges
          </DialogTitle>
          <DialogDescription
            className="text-left font-subtle"
            style={{ color: "var(--dark-3)" }}
          >
            Canceling the task will stop further processing, but you will still
            be fully charged once the generation has started. Please make sure
            you want to cancel before proceeding.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function useCancelConfirm() {
  const [open, setOpen] = React.useState(false);
  const [handleConfirm, setHandleConfirm] = React.useState<() => void>(
    () => {},
  );

  const showCancelConfirm = (confirmHandler: () => void) => {
    setHandleConfirm(() => confirmHandler);
    setOpen(true);
  };

  const cancelConfirmView = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleConfirm}
    />
  );

  return {
    showCancelConfirm,
    cancelConfirmView,
  };
}
