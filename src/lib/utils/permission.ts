import { reduxStore } from "@/store";
import { setInfoDialog } from "@/store/slice/configSlice";
import { TeamRole } from "@/store/slice/userSlice";
const settingsTeamRoles = {
  all: "All",
  owner: "Owner",
  admin: "Admin",
  developer: "Developer",
  basic: "Basic",
  billing: "Billing",
};
export interface Permission {
  resource_group: string;
  resource: string;
  action: string;
}
export interface CurrentTeam {
  id: string;
  name: string;
  role: TeamRole;
}
export function checkPermission(
  permissions: Record<string, Permission[]>,
  requiredPermission: Permission,
  uuid: string,
  currentTeam: CurrentTeam | null,
) {
  if (!uuid) {
    return false;
  }
  if (!currentTeam) {
    return true;
  }
  const role = currentTeam.role;
  const rolePermissions = permissions[role];
  if (!rolePermissions) {
    return false;
  }
  return rolePermissions.some((acl) => {
    return (
      acl.resource_group === requiredPermission.resource_group &&
      (acl.resource === requiredPermission.resource || acl.resource === "*") &&
      (acl.action === requiredPermission.action || acl.action === "*")
    );
  });
}
function createBoolObj(resource_groups: Array<string>, boolRet: boolean) {
  if (!resource_groups || resource_groups.length <= 0) {
    return [];
  }
  const retObj: {
    [x: string]: boolean;
  } = {};
  resource_groups.forEach((resource_group: string) => {
    retObj[resource_group] = boolRet;
  });
  return retObj;
}
export function hasPermission(requiredPermission: Permission) {
  const state = reduxStore.store?.getState();
  const permissions: Record<string, Permission[]> =
    state?.config?.permissionsConfig;
  const uuid = state?.user?.uuid || "";
  const currentTeam = state?.user?.currentTeam || null;
  return checkPermission(permissions, requiredPermission, uuid, currentTeam);
}
export function showPermissionMessage(confirmRedirect?: string) {
  const dispatch = reduxStore.store?.dispatch;
  const state = reduxStore.store?.getState();
  const role = state?.user?.currentTeam?.role || " ";
  const roleDisplay =
    settingsTeamRoles[role as keyof typeof settingsTeamRoles] || " ";
  if (dispatch) {
    dispatch(
      setInfoDialog({
        title: "Permission Required",
        description:
          "You are currently assigned the {{role}} role, which does not have permission to perform this action. Please contact your team administrator for access.".replace(
            "{{role}}",
            roleDisplay,
          ),
        confirmRedirect: confirmRedirect || "",
        emphasisContent: roleDisplay,
      }),
    );
  }
}
export function checkGroupPermissions(resource_groups: Array<string>) {
  const state = reduxStore.store?.getState();
  const permissions: Record<string, Permission[]> =
    state?.config?.permissionsConfig;
  const currentTeam = state?.user?.currentTeam || null;
  const role = currentTeam?.role || "";
  let retObj: any = {};
  if (!role) {
    retObj = createBoolObj(resource_groups, true);
    return retObj;
  }
  const rolePermissions = permissions[role];
  if (!rolePermissions) {
    retObj = createBoolObj(resource_groups, true);
    return retObj;
  }
  resource_groups.forEach((resource_group: string) => {
    const exists = rolePermissions.some((acl) => {
      return acl.resource_group === resource_group;
    });
    retObj[resource_group] = exists;
  });
  return retObj;
}
