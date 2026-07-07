"use client";
import { useCallback } from "react";
import { usePermission } from "@/lib/hooks/usePermission";
import { useAppSelector } from "@/store";
import Image from "next/image";
import styles from "./style.module.css";
const settingsTeamRoles = {
  all: "All",
  owner: "Owner",
  admin: "Admin",
  developer: "Developer",
  basic: "Basic",
  billing: "Billing",
};
export default function PermissionWrapper({
  children,
  resourceGroup,
  resource,
  action,
  loginRequired = true,
}: {
  children: React.ReactNode;
  resourceGroup: string;
  resource: string;
  action: string;
  loginRequired?: boolean;
}) {
  const hasPermission = usePermission({
    resource_group: resourceGroup,
    resource: resource,
    action: action,
  });
  const uuid = useAppSelector((state) => state.user.uuid) || "";
  const role = useAppSelector((state) => state.user.currentTeam?.role) || "";
  const roleDisplay =
    settingsTeamRoles[role as keyof typeof settingsTeamRoles] || " ";
  const showDescription = useCallback((text: string, emphasis?: string) => {
    if (!emphasis) return text;
    const parts = text.split(emphasis);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="font-bold">{emphasis}</span>
            )}
          </span>
        ))}
      </>
    );
  }, []);
  if (!uuid && loginRequired === false) {
    return children;
  }
  if (!uuid) {
    return <></>;
  }
  if (!hasPermission) {
    return (
      <div className="flex justify-center items-center w-full h-[500px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/no-permission.svg"
            alt="no permission"
            width={96}
            height={96}
          />
          <div className={styles.no_permission_text}>
            {showDescription(
              "You are currently assigned the {{role}} role, which does not have permission to perform this action. Please contact your team administrator for access.".replace(
                "{{role}}",
                roleDisplay,
              ),
              roleDisplay,
            )}
          </div>
        </div>
      </div>
    );
  }
  return children;
}
