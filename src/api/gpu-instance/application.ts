import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// Get Application Templates
export function reqGetApplicationTemplates(params: any) {
  return request({
    url: "/applications",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// Get Application Detail
export function reqGetApplicationDetail(params: {
  templateId: string;
  configType: string;
  signal?: AbortSignal;
}) {
  const { signal, ...query } = params;
  return request({
    url: "/application/detail",
    method: "GET",
    base_url: BASE_API_URL,
    query,
    signal,
  });
}
