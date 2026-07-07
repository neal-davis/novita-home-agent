import { request, requestInServerEnv } from "./api";

export function getRolePermissions() {
  return request({
    url: "/v1/user/team/role-permissions",
  });
}

export function getRolePermissionsInServerEnv({ token }: { token: string }) {
  return requestInServerEnv({
    url: "/v1/user/team/role-permissions",
    token,
  });
}
