"use client";
function createCopyTeamRoles() {
  return {
    all: "All",
    owner: "Owner",
    admin: "Admin",
    developer: "Developer",
    basic: "Basic",
    billing: "Billing",
  };
}
function createCopyTeamEditFormRoleCards() {
  return {
    admin:
      "Can edit all Novita AI settings, make purchases, update billing, manage memberships, and revoke access for other Super Administrators.",
    developer:
      "Can access the full account, except for membership management and billing.",
    basic:
      "Can only access resources they have personally created and cannot view or manage resources created by other team members.",
    billing:
      "Can manage all billing-related functions, including handling payments, reviewing invoices, and managing subscriptions.",
  };
}
import { useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilLine, Check, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTeamName as doSetTeamName } from "@/api/team";
import { fetchUserInfo, TeamRole } from "@/store/slice/userSlice";
import Upgrade from "./Upgrade";
import MemberList from "./MemberList";
import { PERMISSION } from "@/constants/constants";
import { usePermission } from "@/lib/hooks/usePermission";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
export const genRoleCards = (copy?: unknown) => [
  {
    value: TeamRole.admin,
    title: createCopyTeamRoles()[TeamRole.admin],
    desc: createCopyTeamEditFormRoleCards()[TeamRole.admin],
  },
  {
    value: TeamRole.developer,
    title: createCopyTeamRoles()[TeamRole.developer],
    desc: createCopyTeamEditFormRoleCards()[TeamRole.developer],
  },
  {
    value: TeamRole.basic,
    title: createCopyTeamRoles()[TeamRole.basic],
    desc: createCopyTeamEditFormRoleCards()[TeamRole.basic],
  },
  {
    value: TeamRole.billing,
    title: createCopyTeamRoles()[TeamRole.billing],
    desc: createCopyTeamEditFormRoleCards()[TeamRole.billing],
  },
];
export default function Team({ copy }: { copy?: unknown }) {
  const [newTeamName, setNewTeamName] = useState("");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [isUpdatingTeamName, setIsUpdatingTeamName] = useState(false);
  const dispatch = useAppDispatch();
  const uuid = useAppSelector((state) => state.user.uuid);
  const curTeam = useAppSelector((state) => state.user.currentTeam);
  const teamOwnerUuid = useAppSelector((state) => state.user.teamOwnerUuid);
  const memberPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.team,
    resource: PERMISSION.RESOURCE.member,
    action: PERMISSION.ACTION.all,
  });
  const [memberCount, setMemberCount] = useState<number | string>("-");
  return (
    <div className="flex flex-col gap-5">
      {curTeam === null &&
        (uuid ? (
          <Upgrade copy={copy} />
        ) : (
          <>
            <Skeleton className="h-[150px] bg-[var(--gray-2)] rounded-sm animate-pulse" />
            <Skeleton className="h-[400px] bg-[var(--gray-2)] rounded-sm animate-pulse" />
          </>
        ))}
      {curTeam && (
        <>
          <div className="flex flex-col gap-0 w-full">
            {/* Right side - Team Info */}
            {/* Left side - Member List Table */}
            <div className="w-full">
              <div
                className="w-full bg-[var(--white)] rounded-[6px] mb-4"
                style={{
                  border: "1px solid var(--gray-2)",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="font-h6 text-[var(--black)]">
                      {"Team Information"}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <span className="font-subtle text-[var(--dark-2)] mr-1">
                        {"Team"}
                      </span>
                      <div>
                        {isEditingTeamName ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              type="text"
                              value={editingTeamName}
                              onChange={(e) =>
                                setEditingTeamName(e.target.value)
                              }
                            />
                            <Button
                              variant="secondary"
                              disabled={isUpdatingTeamName}
                              onClick={async () => {
                                analytics.trackClick(
                                  CLICK_BTN_IDs.SETTINGS
                                    .TEAM_EDIT_TEAM_NAME_SAVE,
                                );
                                try {
                                  setIsUpdatingTeamName(true);
                                  await doSetTeamName(editingTeamName);
                                  setIsUpdatingTeamName(false);
                                  setIsEditingTeamName(false);
                                  setNewTeamName(editingTeamName);
                                  dispatch(fetchUserInfo() as any);
                                } catch (error) {
                                  message.error("Set team name failed");
                                  setIsUpdatingTeamName(false);
                                }
                              }}
                            >
                              {isUpdatingTeamName ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditingTeamName(false);
                                setNewTeamName("");
                                analytics.trackClick(
                                  CLICK_BTN_IDs.SETTINGS
                                    .TEAM_EDIT_TEAM_NAME_CANCEL,
                                );
                              }}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <p className="font-subtle-medium text-[var(--black)]">
                              {newTeamName || curTeam?.name}
                            </p>
                            {(curTeam?.role === TeamRole.admin ||
                              curTeam?.role === TeamRole.owner) && (
                              <Button
                                variant="text"
                                size="link"
                                onClick={() => {
                                  setIsEditingTeamName(true);
                                  setEditingTeamName(curTeam?.name || "");
                                  analytics.trackClick(
                                    CLICK_BTN_IDs.SETTINGS.TEAM_EDIT_TEAM_NAME,
                                  );
                                }}
                              >
                                <PencilLine size={16} />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="mx-1 bg-[var(--gray-2)] h-[10px] w-[1px]" />
                      <span className="font-subtle text-[var(--dark-2)] mr-1">
                        {"Team Owner UUID"}
                      </span>
                      <span className="font-subtle-medium text-[var(--black)]">
                        {teamOwnerUuid}
                      </span>
                      <CopyBtn
                        onCopySuccess={() =>
                          message.success("Team Owner UUID copied")
                        }
                        content={teamOwnerUuid || ""}
                        size={16}
                        className="mt-[-6px] h-4 !text-[var(--dark-2)]"
                      />
                      {memberPermission && (
                        <>
                          <span className="mx-1 bg-[var(--gray-2)] h-[10px] w-[1px]" />
                          <span className="font-subtle text-[var(--dark-2)] mr-1">
                            {"Team Member"}
                          </span>
                          <span className="font-subtle-medium text-[var(--black)]">
                            {memberCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <MemberList setMemberCount={setMemberCount} copy={copy} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
