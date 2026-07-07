import Modal from "@/app/components/Modal/Modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ConsoleButton } from "@/app/user/components/console-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { cn } from "@/lib/utils";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { MultiTeamMemberSelector } from "@/app/components/TeamMemberSelector/MultiTeamMemberSelector";
import { useAppSelector } from "@/store";
import { selectTeamMembers } from "@/store/slice/userSlice";
import styles from "./ConfigModal.module.scss";

export function ConfigModal({
  open,
  onClose,
  type,
  defaultValues,
  onConfirm,
}: {
  open?: boolean;
  onClose?: () => void;
  onConfirm?: (params: any) => void;
  type: "add" | "edit";
  defaultValues?: any;
}) {
  const [threshold, setThreshold] = useState<string | undefined>(undefined);
  const [state, setState] = useState<boolean>(true);
  const [notificationMembers, setNotificationMembers] = useState<string[]>([]);
  const [notificationMemberIds, setNotificationMemberIds] = useState<string[]>(
    [],
  );
  const [notificationMethods, setNotificationMethods] = useState<string[]>([
    "email",
  ]);

  const allTeamMembers = useAppSelector(selectTeamMembers);

  const balanceDetail: any = useAppSelector(
    (state) => state.billing?.balanceDetail,
  );

  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const currentUserEmail = useAppSelector((state) => state.user.email);

  const toggleNotificationMethod = (method: string, checked: boolean) => {
    setNotificationMethods((prev) =>
      checked
        ? Array.from(new Set([...prev, method]))
        : prev.filter((item) => item !== method),
    );
  };

  useEffect(() => {
    if (!open) return;
    if (type === "edit") {
      setThreshold(defaultValues.threshold);
      setState(defaultValues.state);

      const methods = defaultValues.notification_methods || ["email"];
      setNotificationMethods(methods);

      const memberIds = defaultValues.member_ids || [];

      // Only process members if we have both memberIds and allTeamMembers
      if (memberIds.length > 0 && allTeamMembers.length > 0) {
        const emails = allTeamMembers
          .filter((member) =>
            member.memberIds.some((memberId) => memberIds.includes(memberId)),
          )
          .map((member) => member.email);
        setNotificationMembers(emails);
        setNotificationMemberIds(memberIds);
      } else if (memberIds.length > 0 && allTeamMembers.length === 0) {
        // If we have memberIds but no team members yet, wait for team members to load
        return;
      } else {
        setNotificationMembers(defaultValues.notificationMembers || []);
        setNotificationMemberIds([]);
      }
    } else {
      setThreshold(undefined);
      setState(true);
      setNotificationMethods(["email"]);

      // Default select Owner for add mode
      if (allTeamMembers.length > 0) {
        const ownerMember = allTeamMembers.find(
          (member) =>
            member.role === "owner" || member.email === currentUserEmail,
        );
        if (ownerMember) {
          setNotificationMembers([ownerMember.email]);
          setNotificationMemberIds(ownerMember.memberIds);
        } else {
          setNotificationMembers([]);
          setNotificationMemberIds([]);
        }
      } else {
        setNotificationMembers([]);
        setNotificationMemberIds([]);
      }
    }
  }, [defaultValues, type, open, allTeamMembers, currentUserEmail]);

  return (
    <Modal
      title={type === "add" ? "Add Alert" : "Edit Alert"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="h-[1px] w-[calc(100%+48px)] bg-[var(--gray-3)] ml-[-24px] mr-[-24px] mt-3"></div>
      <div className="text-sm text-common-dark-3 mt-4">
        The warning amount must be between $1 and $10,000,000, and the interval
        between amounts with an active warning status must be at least $5.
      </div>
      <div className="flex flex-col gap-4 pt-6 pb-4">
        {Number(balanceDetail?.creditLimit || 0) > 0 && (
          <div className={styles.alert}>
            <span className="iconfont icon-badge-help w-[14px] h-5 text-[14px] mt-[-2px]"></span>
            <span className="font-subtle text-[var(--dark-1)]">
              {
                "Balance alerts are triggered based on your Available Credit, which includes your account balance and remaining credit limit."
              }
            </span>
          </div>
        )}
        <div className="flex items-center justify-between w-full h-[40px]">
          <Label>Warning Amount</Label>
          <Input
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
            }}
            className="w-[280px] h-8"
            placeholder="Enter Amount"
          />
        </div>
        {Number(balanceDetail?.creditLimit || 0) > 0 && (
          <div className="flex items-center justify-between w-full mt-[-12px]">
            <Label></Label>
            <div className="flex items-center gap-1 w-[280px] text-left">
              <span className="font-small text-[var(--dark-2)]">
                {`Your current credit limit is: $${Number(balanceDetail?.creditLimit || 0)}`}
              </span>
              <Tooltip title="The maximum postpaid amount approved based on your account’s credit profile, allowing you to consume first and pay later.">
                <span className="iconfont icon-badge-alert w-[14px] h-5 text-[var(--dark-2)] text-[14px] mt-[-2px]"></span>
              </Tooltip>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between w-full h-[40px]">
          <Label>Notification Method</Label>
          <div className="flex h-8 w-[280px] items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--dark-1)]">
              <Checkbox
                checked={notificationMethods.includes("email")}
                onCheckedChange={(checked) =>
                  toggleNotificationMethod("email", Boolean(checked))
                }
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--dark-1)]">
              <Checkbox
                checked={notificationMethods.includes("in_app")}
                onCheckedChange={(checked) =>
                  toggleNotificationMethod("in_app", Boolean(checked))
                }
              />
              <span>Inbox</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between w-full h-[40px]">
          <Label>Enable Status</Label>
          <Switch
            checked={state}
            className={cn(state && "!bg-black")}
            onCheckedChange={() => {
              setState(!state);
              analytics.trackClick(
                state
                  ? CLICK_BTN_IDs.BILLING
                      .LOW_BALANCE_ALERT_CONFIG_FORM_ENABLE_SWITCH_OFF
                  : CLICK_BTN_IDs.BILLING
                      .LOW_BALANCE_ALERT_CONFIG_FORM_ENABLE_SWITCH_ON,
              );
            }}
          />
        </div>
        {currentTeam && (
          <div className="flex items-center justify-between w-full h-[40px]">
            <Label>Notification Members</Label>
            <MultiTeamMemberSelector
              selectedMembers={notificationMembers}
              onMembersChange={(emails: string[], memberIds: string[]) => {
                setNotificationMembers(emails);
                setNotificationMemberIds(memberIds);
              }}
              className="w-[280px]"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          size="sl"
          variant="outline"
          onClick={onClose}
          id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_CONFIG_FORM_CANCEL}
        >
          Cancel
        </Button>
        <ConsoleButton
          size="sl"
          id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_CONFIG_FORM_SUBMIT}
          onClick={() => {
            if (!threshold) {
              message.warning("Please enter the warning amount");
              return;
            }
            // threshold must be an integer
            if (!/^\d+$/.test(threshold)) {
              message.warning("Threshold must be an integer");
              return;
            }
            if (Number(threshold) < 1 || Number(threshold) > 10000000) {
              message.warning("Threshold must be between 1 and 10000000");
              return;
            }
            if (!notificationMethods || notificationMethods.length === 0) {
              message.warning("Please select at least one notification method");
              return;
            }
            const params = {
              threshold,
              state,
              notification_methods: notificationMethods,
              ...(currentTeam && {
                member_ids: [...new Set(notificationMemberIds)],
              }),
            };

            onConfirm?.(params);
          }}
        >
          Confirm
        </ConsoleButton>
      </div>
    </Modal>
  );
}
