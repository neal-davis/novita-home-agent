"use client";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function DelKeyModal({
  visible,
  copy,
  setVisible,
  onConfirm,
  loading,
}: {
  visible: boolean;
  copy?: unknown;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm?: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={visible} onOpenChange={() => setVisible(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Delete API key"}</DialogTitle>
        </DialogHeader>
        <div>{"Are you sure to delete this API key?"}</div>
        <DialogFooter>
          <Button
            size="sl"
            variant="outline"
            onClick={() => {
              setVisible(false);
            }}
            id={CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_REMOVE_KEY_CANCEL}
          >
            {"Cancel"}
          </Button>
          <Button
            size="sl"
            variant="secondary"
            style={{ marginLeft: "var(--spacing-button) !important" }}
            disabled={loading}
            onClick={() => {
              onConfirm && onConfirm();
            }}
            id={CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_REMOVE_KEY_CONFIRM}
          >
            {"Confirm"}
            {loading && <Loader2 size={16} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
