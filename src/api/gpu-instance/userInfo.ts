import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";
const BASE_API_URL_NOAPI = service_base_url + "/v1";

export function reqUserInfo(params: any) {
  return request({
    url: "/user/info",
    method: "GET",
    base_url: BASE_API_URL_NOAPI,
    query: params
  });
}
export function reqEmailLogin(params: any) {
  return request({
    url: "/user/email_login",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}

export function reqUpdateUserInfo(params: any) {
  return request({
    url: "/user/userinfo/update",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
