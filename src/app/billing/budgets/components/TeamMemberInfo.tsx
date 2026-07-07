"use client";

import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { getBudgetList } from "@/api/team";
import { TeamRole } from "@/store/slice/userSlice";
import { RolePermission } from "@/app/components/Permission";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BudgetListResponse {
  member_count: string;
  budget_count: string;
  budgets: any[];
}

export default function TeamMemberInfo() {
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [budgetData, setBudgetData] = useState<BudgetListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch budget data when component mounts
  useEffect(() => {
    if (currentTeam) {
      setLoading(true);
      getBudgetList()
        .then((response) => {
          if (response) {
            setBudgetData(response);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch budget data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentTeam]);

  // Get statistics from API response
  const totalMembers = budgetData?.member_count
    ? parseInt(budgetData.member_count)
    : 0;
  const membersWithBudget = budgetData?.budget_count
    ? parseInt(budgetData.budget_count)
    : 0;

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-semibold text-[var(--dark-1)] leading-6">
          {/* Show different title based on user role */}
          <RolePermission
            roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
          >
            Team Member Budgets
          </RolePermission>
          <RolePermission roles={[TeamRole.developer, TeamRole.basic]}>
            Team Information
          </RolePermission>
        </h3>
      </div>

      {/* Description - only show for admin, owner, billing roles */}
      <RolePermission
        roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
      >
        <p className="text-sm text-[var(--dark-3)] mb-6 leading-5">
          You can set individual budget limits for each team member to control
          their total spending on the platform.
        </p>
      </RolePermission>

      {/* Team Member Info */}
      <div>
        {/* Team */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-[var(--dark-2)] font-medium">Team</span>
          <span className="font-miletus text-sm font-medium leading-5 text-[var(--black)]">
            {currentTeam?.name || "Loading..."}
          </span>
        </div>

        {/* Team ID */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-[var(--dark-2)] font-medium">
            Team ID
          </span>
          {currentTeam?.id ? (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="font-tt-interfaces text-sm font-medium leading-5 text-[var(--black)] truncate max-w-[120px] text-right cursor-default">
                    {currentTeam.id}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="end">
                  <p className="break-all">{currentTeam.id}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="font-tt-interfaces text-sm font-medium leading-5 text-[var(--black)] truncate max-w-[120px] text-right">
              Loading...
            </span>
          )}
        </div>

        {/* Role */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-[var(--dark-2)] font-medium">Role</span>
          <span className="font-miletus text-sm font-medium leading-5 text-[var(--black)]">
            {currentTeam?.role || "Loading..."}
          </span>
        </div>

        {/* Alias */}
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-[var(--dark-2)] font-medium">
            Alias
          </span>
          <span className="font-miletus text-sm font-medium leading-5 text-[var(--black)]">
            {currentTeam?.alias || "-"}
          </span>
        </div>

        {/* Go to Team Setting - only show for admin, owner, billing roles */}
        <RolePermission
          roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
        >
          <div className="flex justify-between items-center py-2">
            <Link
              href={NOVITA_URL.SETTINGS_TEAM}
              className="text-sm text-[var(--brand-1)] underline cursor-pointer"
            >
              Go to Team Setting
            </Link>
          </div>
        </RolePermission>

        {/* Divider before Total Members - only show for admin, owner, billing roles */}
        <RolePermission
          roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
        >
          <div className="h-px bg-[var(--gray-2)] my-6"></div>
        </RolePermission>

        {/* Total Members - only show for admin, owner, billing roles */}
        <RolePermission
          roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
        >
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[var(--dark-2)] font-medium">
              Total Members
            </span>
            <span className="text-sm text-[var(--brand-1)]">
              {loading ? "Loading..." : totalMembers}
            </span>
          </div>
        </RolePermission>

        {/* Members with Budget - only show for admin, owner, billing roles */}
        <RolePermission
          roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
        >
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[var(--dark-2)] font-medium">
              Members with Budget
            </span>
            <span className="text-sm text-[var(--brand-1)]">
              {loading ? "Loading..." : `${membersWithBudget}/${totalMembers}`}
            </span>
          </div>
        </RolePermission>
      </div>
    </div>
  );
}
