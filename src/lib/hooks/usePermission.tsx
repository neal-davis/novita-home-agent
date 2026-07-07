"use client";

import { useAppSelector } from "@/store";
import { checkPermission, Permission } from "@/lib/utils/permission";

export function usePermission(requiredPermission: Permission) {
  const permissions: Record<string, Permission[]> = useAppSelector(
    (state) => state.config.permissionsConfig,
  );
  const uuid = useAppSelector((state) => state.user.uuid) || "";
  const currentTeam = useAppSelector((state) => state.user.currentTeam) || null;
  return checkPermission(permissions, requiredPermission, uuid, currentTeam);
}
