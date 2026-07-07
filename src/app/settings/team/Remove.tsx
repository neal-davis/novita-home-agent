import { useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeTeamMember } from "@/api/team";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
type IProps = {
  copy?: unknown;
  open: boolean;
  memID: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
export default function Remove({
  copy,
  open,
  memID,
  onOpenChange,
  onSuccess,
}: IProps) {
  const [removing, setRemoving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[690px]">
        <div className="flex flex-col gap-4">
          <p className="font-body-medium">
            {"Are you sure you want to remove this member?"}
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_REMOVE_CANCEL}
          >
            {"Cancel"}
          </Button>
          <Button
            variant="warn"
            disabled={removing}
            onClick={() => {
              analytics.trackClick(
                CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_REMOVE_CONFIRM,
              );
              setRemoving(true);
              removeTeamMember(memID)
                .then(() => {
                  setRemoving(false);
                  onOpenChange(false);
                  onSuccess();
                  message.success("Member removed");
                })
                .catch(() => {
                  setRemoving(false);
                  message.error("Failed to remove member");
                });
            }}
          >
            {"Remove"}
            {removing && <Loader2 size={14} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
