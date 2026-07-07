import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// get saving plans
export function reqGetSavingPlans(params: any) {
  return request({
    url: "/wallet/saving_plan",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqCreateSavingPlans(params: any) {
  return request({
    url: "/wallet/saving_plan",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
