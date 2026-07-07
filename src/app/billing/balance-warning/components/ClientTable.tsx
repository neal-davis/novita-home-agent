"use client";

import { Table } from "../../components/table/Table";
import { useCallback, useEffect, useState } from "react";
import { ConfigModal } from "./ConfigModal";
import styles from "./style.module.scss";
import {
  addBlanceWarning,
  deleteBlanceWarning,
  GetBalanceWarning,
  updateBlanceWarning,
} from "@/api/billing";
import { message } from "@/components/ui/standard/notify";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { ConsoleNotice } from "../../components/notice/consoleNotice";
import { ConsoleButton } from "@/app/user/components/console-button";
import { Ellipsis as EllipsisOutlined } from "lucide-react";
import { HoverCardTrigger } from "@/components/ui/hover-card";
import { HoverCard } from "@/components/ui/hover-card";
import { HoverCardContent } from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useAppSelector } from "@/store";
import { selectTeamMembers } from "@/store/slice/userSlice";

const NoticeMethodsMap: Record<string, string> = {
  sms: "SMS",
  email: "Email",
  in_app: "Inbox",
};

export function ClientTable() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"add" | "edit">("add");
  const [editData, setEditData] = useState<any>({});
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: 0,
  });

  // Members popover state
  const [membersPopoverOpen, setMembersPopoverOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Get team members data
  const allTeamMembers = useAppSelector(selectTeamMembers);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);

  // balance warning permission
  const hasBalanceWarningPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.warning,
    action: PERMISSION.ACTION.all,
  });

  const fetchWarningList = useCallback(() => {
    setLoading(true);
    GetBalanceWarning()
      .then((res) => {
        if (Array.isArray(res.warnings)) {
          setData(res.warnings);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!hasBalanceWarningPermission) {
      showPermissionMessage();
      return;
    }
    fetchWarningList();
  }, [fetchWarningList, hasBalanceWarningPermission]);

  return (
    <div className="flex flex-col gap-6">
      <Dialog
        open={confirmModal.open}
        onOpenChange={(v) => {
          setConfirmModal((pre) => ({
            ...pre,
            open: v,
          }));
        }}
      >
        <ConsoleNotice
          title="Informational Notes"
          description="When your account balance falls below the warning threshold you set, you will receive an email notification to ensure uninterrupted service operation. Notifications will be sent at most once per natural day (00:00-24:00, UTC+0) until the account balance exceeds the specified threshold."
        />
        <ConsoleButton
          size="sl"
          onClick={() => {
            setType("add");
            setOpen(true);
          }}
          className="w-[144px]"
          id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_ADD}
        >
          Add Alerts
        </ConsoleButton>

        <Table
          loading={loading}
          rowKey="amount"
          columns={[
            {
              title: "Warning Amount",
              dataIndex: "threshold",
              render(v) {
                return `$${v}`;
              },
            },
            // Only show Members column for team accounts
            ...(currentTeam
              ? [
                  {
                    title: "Members",
                    dataIndex: "member_ids",
                    render(v: any, record: any) {
                      const uniqueMemberIds = Array.from(
                        new Set(record.member_ids || []),
                      );
                      const memberCount = uniqueMemberIds.length;
                      return (
                        <Popover
                          open={
                            membersPopoverOpen &&
                            selectedRecord?.id === record.id
                          }
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedRecord(record);
                              setMembersPopoverOpen(true);
                            } else {
                              setMembersPopoverOpen(false);
                              setSelectedRecord(null);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <span
                              className="text-sm cursor-pointer hover:text-blue-600"
                              style={{
                                fontFamily: "var(--font-miletus)",
                                fontSize: "14px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: "20px",
                                textDecorationLine: "underline",
                                textDecorationStyle: "dotted",
                                textDecorationSkipInk: "auto",
                                textDecorationThickness: "auto",
                                textUnderlineOffset: "auto",
                                textUnderlinePosition: "from-font",
                              }}
                            >
                              {memberCount}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="start">
                            <div className="max-h-60 overflow-y-auto">
                              {allTeamMembers.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                  Loading team members...
                                </div>
                              ) : (
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                      </th>
                                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Alias
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(uniqueMemberIds as string[]).map(
                                      (memberId: string) => {
                                        const member = allTeamMembers.find(
                                          (m) => m.memberIds.includes(memberId),
                                        );

                                        return (
                                          <tr
                                            key={memberId}
                                            className="border-b border-gray-100"
                                          >
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {member?.email || "-"}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                              {member?.alias || "-"}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    },
                  },
                ]
              : []),
            {
              title: "Notification Method",
              dataIndex: "notification_methods",
              render(v) {
                if (Array.isArray(v)) {
                  return v
                    .map((item) =>
                      NoticeMethodsMap[item] ? NoticeMethodsMap[item] : v,
                    )
                    .join("、");
                }
              },
            },
            {
              title: "Status",
              dataIndex: "state",
              render(v) {
                return v ? "Enable" : "Disable";
              },
            },
            {
              title: "Operation",
              dataIndex: "operation",
              align: "right",
              render(_, record: any) {
                return (
                  <div className={styles.operate}>
                    <HoverCard openDelay={150}>
                      <HoverCardTrigger>
                        <EllipsisOutlined />
                      </HoverCardTrigger>
                      <HoverCardContent className="p-[6px] w-[180px]">
                        <div
                          className={styles.operate_item}
                          onClick={() => {
                            setType("edit");
                            setOpen(true);
                            setEditData(record);
                          }}
                          id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_EDIT}
                        >
                          Edit
                        </div>
                        <div
                          className={styles.operate_item}
                          onClick={() => {
                            setConfirmModal({
                              open: true,
                              id: record.id,
                            });
                          }}
                          id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_REMOVE}
                        >
                          Remove
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                );
              },
            },
          ]}
          data={data}
        />
        <ConfigModal
          key={`${type}-${open}-${JSON.stringify(editData)}`}
          open={open}
          type={type}
          onClose={() => {
            setOpen(false);
          }}
          defaultValues={editData}
          onConfirm={(params) => {
            if (type === "add") {
              addBlanceWarning({
                ...params,
              }).then(() => {
                message.success("success");
                fetchWarningList();
                setOpen(false);
              });
            } else if (type === "edit") {
              updateBlanceWarning({
                ...editData,
                ...params,
              }).then(() => {
                message.success("success");
                fetchWarningList();
                setOpen(false);
              });
            }
          }}
        />
        <DialogContent>
          <DialogTitle>Confirmation of operation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this alert?
          </DialogDescription>
          <DialogFooter>
            <ConsoleButton
              size="sl"
              onClick={() => {
                deleteBlanceWarning(confirmModal.id).then(() => {
                  message.success("Delete successfully");
                  setConfirmModal({
                    open: false,
                    id: 0,
                  });
                  fetchWarningList();
                });
              }}
              id={CLICK_BTN_IDs.BILLING.LOW_BALANCE_ALERT_REMOVE_CONFIRM}
            >
              Confirm
            </ConsoleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
