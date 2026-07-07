import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export function reqResetEmail(params: any) {
  return request({
    url: "/user/reset_password_by_email",
    method: "POST",
    base_url: BASE_API_URL,
    query: params,
  });
}

export function reqResetPwd(params: any) {
  return request({
    url: "/user/reset_password_by_token",
    method: "POST",
    base_url: BASE_API_URL,
    query: params,
  });
}
