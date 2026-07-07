import { useState, useEffect, useCallback } from "react";
import { message } from "@/components/ui/standard/notify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TeamRole } from "@/store/slice/userSlice";
import { editTeamMember } from "@/api/team";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { genRoleCards } from "./index";
import Permissions from "./Permissions";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
type IProps = {
  copy?: unknown;
  open: boolean;
  memID: string;
  oriRole: TeamRole;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};
export default function Edit({
  copy,
  open,
  memID,
  oriRole,
  onOpenChange,
  onSuccess,
}: IProps) {
  const [role, setRole] = useState<TeamRole>(oriRole);
  const [saving, setSaving] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  useEffect(() => {
    setRole(oriRole);
  }, [oriRole]);
  const roleCards = genRoleCards(copy);
  const handleSave = useCallback(() => {
    setSaving(true);
    editTeamMember(memID, role)
      .then(() => {
        setSaving(false);
        onOpenChange(false);
        onSuccess();
      })
      .catch(() => {
        setSaving(false);
        message.error("Failed to update role");
      });
  }, [memID, role, onOpenChange, onSuccess]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[690px]">
        <DialogHeader>
          <DialogTitle>{"Edit"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="font-subtle" style={{ color: "var(--dark-2)" }}>
            {
              'Assign access permissions to members by selecting roles. The budget for each new member is unlimited by default. If you need to adjust it, please go to the "Budgets" page.'
            }
            &nbsp;
            <Button
              variant="text"
              size="link"
              onClick={() => setOpenPermissions(true)}
            >
              {"View permission details"}
            </Button>
          </p>
          <RadioGroup
            value={role}
            onValueChange={(value) => setRole(value as TeamRole)}
          >
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {roleCards.map((role) => (
                <div
                  className="flex flex-col items-start gap-2 py-4 px-5 cursor-pointer border rounded-lg"
                  onClick={() => setRole(role.value)}
                  key={role.value}
                >
                  <p className="font-h6 flex items-center gap-2">
                    <RadioGroupItem value={role.value} />
                    <span>{role.title}</span>
                  </p>
                  <p className="font-small-console">{role.desc}</p>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_CANCEL}
          >
            {"Cancel"}
          </Button>
          <Button
            variant="secondary"
            disabled={saving}
            onClick={handleSave}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_SAVE}
          >
            {"Save"}
            {saving && <Loader2 size={14} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
      <Permissions
        open={openPermissions}
        onOpenChange={setOpenPermissions}
        copy={copy}
      />
    </Dialog>
  );
}
