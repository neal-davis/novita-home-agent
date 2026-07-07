import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";
const BASE_API_URL_NOAPI = service_base_url + "/v1";

// add imageAuth
export function reqAddImageAuth(params: any) {
  return request({
    url: "/gpu/image/repository/auth",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqGetUserSecrets(params: any) {
  return request({
    url: "/user/secrets",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqCreateUserSecret(params: any) {
  return request({
    url: "/user/secret",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqGetUserSettings(params: any) {
  return request({
    url: "/user/settings",
    method: "GET",
    base_url: BASE_API_URL_NOAPI,
    query: params
  });
}
export function reqUpdateUserSettings(params: any) {
  return request({
    url: "/user/settings",
    method: "POST",
    base_url: BASE_API_URL_NOAPI,
    data: {
      ...params,
    },
  });
}
export function reqDeleteUserSecret(params: any) {
  return request({
    url: "/user/secret/delete",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqRepository(params: any) {
  return request({
    url: "/gpu/image/repository",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqGetImageAuths(params: any) {
  return request({
    url: "/gpu/image/repository/auths",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqDeleteImageAuth(params: any) {
  return request({
    url: "/gpu/image/repository/auth/delete",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqUserSSHKeySave(params: any) {
  return request({
    url: "/user/sshkey/save",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqGetSSHKey() {
  return request({
    url: "/user/sshkey",
    method: "GET",
    base_url: BASE_API_URL,
  });
}
export function reqChangePassword(params: any) {
  return request({
    url: "/user/change_password",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}