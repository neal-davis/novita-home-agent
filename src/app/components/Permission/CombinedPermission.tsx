"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import { usePermission } from "@/lib/hooks/usePermission";

interface CombinedPermissionProps {
  children: ReactNode;
  resourceGroup?: string;
  resource?: string;
  action?: string;
  roles?: TeamRole[];
  fallback?: ReactNode;
  hideOnNoPermission?: boolean;
  requireAll?: boolean; // true: need all permissions, false: need any permission
}

export default function CombinedPermission({
  children,
  resourceGroup,
  resource,
  action,
  roles,
  fallback = null,
  hideOnNoPermission = true,
  requireAll = false,
}: CombinedPermissionProps) {
  const uuid = useAppSelector((state) => state.user.uuid);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const userRole = currentTeam?.role as TeamRole;

  // Always call usePermission hook at the top level
  const hasResourcePermission = usePermission({
    resource_group: resourceGroup || "",
    resource: resource || "",
    action: action || "",
  });

  // If no user is logged in, show fallback or nothing
  if (!uuid) {
    return fallback;
  }

  // If no team context, show children (individual user)
  if (!currentTeam) {
    return <>{children}</>;
  }

  let hasRolePermission = true;

  // Check role-based permission
  if (roles && roles.length > 0) {
    hasRolePermission = roles.includes(userRole);
  }

  // Determine final permission based on requireAll flag
  let hasPermission: boolean;
  if (requireAll) {
    hasPermission = hasRolePermission && hasResourcePermission;
  } else {
    hasPermission = hasRolePermission || hasResourcePermission;
  }

  if (!hasPermission) {
    return hideOnNoPermission ? null : fallback;
  }

  return <>{children}</>;
}
