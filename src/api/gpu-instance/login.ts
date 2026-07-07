import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// get base query options data for filter
export function reqGetUserToken(params: any) {
  return request({
    url: "/user/token",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}

// user registry
export function reqRegistryUser(params: any) {
  return request({
    url: "/user/register",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
