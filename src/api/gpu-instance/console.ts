import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export function reqNotices(params: any) {
  return request({
    url: "/notices",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqNoticeRead(params: any) {
  return request({
    url: "/notice/read",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
