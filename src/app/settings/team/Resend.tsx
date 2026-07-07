import { useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendInvite } from "@/api/team";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
type IProps = {
  copy?: unknown;
  open: boolean;
  inviteID: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
export default function Resend({
  copy,
  open,
  inviteID,
  onOpenChange,
  onSuccess,
}: IProps) {
  const [resending, setResending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[690px]">
        <div className="flex flex-col gap-4">
          <p className="font-body-medium">
            {
              "An invitation has already been sent and is still active. Sending another will replace the existing one."
            }
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_RESEND_EMAIL_CANCEL}
          >
            {"Cancel"}
          </Button>
          <Button
            variant="secondary"
            disabled={resending}
            onClick={() => {
              analytics.trackClick(
                CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_RESEND_EMAIL_CONFIRM,
              );
              setResending(true);
              resendInvite(inviteID)
                .then((res) => {
                  if (res.invite_url) {
                    navigator.clipboard.writeText(res.invite_url);
                  }
                  setResending(false);
                  onOpenChange(false);
                  onSuccess();
                  message.success("Invitation email sent successfully!");
                })
                .catch(() => {
                  setResending(false);
                  message.error("Failed to resend invitation");
                });
            }}
          >
            {"Resend Invitation"}
            {resending && <Loader2 size={14} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
