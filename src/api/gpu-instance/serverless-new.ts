import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export function reqGetApplicationTemplates(params: any) {
  return request({
    url: "/application/gpu",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
