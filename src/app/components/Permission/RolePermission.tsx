"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";

interface RolePermissionProps {
  children: ReactNode;
  roles: TeamRole[];
  fallback?: ReactNode;
  hideOnNoPermission?: boolean;
}

export default function RolePermission({
  children,
  roles,
  fallback = null,
  hideOnNoPermission = true,
}: RolePermissionProps) {
  const uuid = useAppSelector((state) => state.user.uuid);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const userRole = currentTeam?.role as TeamRole;

  // If no user is logged in, show fallback or nothing
  if (!uuid) {
    return fallback;
  }

  // If no team context, show children (individual user)
  if (!currentTeam) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRolePermission = roles.includes(userRole);

  if (!hasRolePermission) {
    return hideOnNoPermission ? null : fallback;
  }

  return <>{children}</>;
}
