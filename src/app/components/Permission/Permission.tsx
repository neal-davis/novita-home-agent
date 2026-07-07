"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import { usePermission } from "@/lib/hooks/usePermission";

interface PermissionProps {
  children: ReactNode;
  resourceGroup?: string;
  resource?: string;
  action?: string;
  roles?: TeamRole[];
  fallback?: ReactNode;
  hideOnNoPermission?: boolean;
}

export default function Permission({
  children,
  resourceGroup,
  resource,
  action,
  roles,
  fallback = null,
  hideOnNoPermission = true,
}: PermissionProps) {
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

  // Check role-based permission
  if (roles && roles.length > 0) {
    const hasRolePermission = roles.includes(userRole);
    if (!hasRolePermission) {
      return hideOnNoPermission ? null : fallback;
    }
  }

  // Check resource-based permission (if provided)
  if (resourceGroup && resource && action) {
    if (!hasResourcePermission) {
      return hideOnNoPermission ? null : fallback;
    }
  }

  // If all checks pass, show children
  return <>{children}</>;
}
