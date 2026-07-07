import { useCallback, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelInvite } from "@/api/team";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
type IProps = {
  copy?: unknown;
  open: boolean;
  inviteID: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
export default function Cancel({
  copy,
  open,
  inviteID,
  onOpenChange,
  onSuccess,
}: IProps) {
  const [canceling, setCanceling] = useState(false);
  const handleCancel = useCallback(() => {
    setCanceling(true);
    cancelInvite(inviteID)
      .then(() => {
        setCanceling(false);
        onOpenChange(false);
        onSuccess();
        message.success("Invitation canceled");
      })
      .catch(() => {
        setCanceling(false);
        message.error("Failed to cancel invitation");
      });
  }, [inviteID, onOpenChange, onSuccess]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[690px]">
        <div className="flex flex-col gap-4">
          <p className="font-body-medium">
            {"Are you sure you want to cancel this invitation?"}
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_CANCEL_INVITE_CANCEL}
          >
            {"No"}
          </Button>
          <Button
            variant="secondary"
            disabled={canceling}
            onClick={handleCancel}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_CANCEL_INVITE_CONFIRM}
          >
            {"Confirm"}
            {canceling && <Loader2 size={14} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
