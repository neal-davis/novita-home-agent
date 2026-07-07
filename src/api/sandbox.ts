import { request, service_base_url } from "./api";
// const BASE_API_URL = service_base_url + "/api/v1";

// get base query options data for filter
export function reqSandboxPrice(params: any) {
  return request({
    url: "/v1/product/agent-sandbox/price",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxStoragePrice(params: any) {
  return request({
    url: "/v1/product/batch-price",
    method: "POST",
    data: params,
    base_url: service_base_url,
  });
}

export function reqSandboxRunningCount(params: any) {
  return request({
    url: "/v1/billing/sandbox/running-count",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxStats(params: any) {
  return request({
    url: "/v1/billing/sandbox/stats",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxUsage(params: any) {
  return request({
    url: "/v1/billing/sandbox/usage",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxStorageStats(params: any) {
  return request({
    url: "/v1/billing/sandbox/storage/stats",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxStorageRealTime() {
  return request({
    url: "/v1/billing/sandbox/storage/real-time",
    method: "GET",
    base_url: service_base_url,
    query: {},
  });
}

const my_service_base_url = process.env.NEXT_PUBLIC_BASE_URL || "";
const sandbox_base_url =
  my_service_base_url.indexOf("dev") <= -1
    ? "https://api.sandbox.novita.ai"
    : "https://api.sandbox-dev.novita.ai";

export function reqSandboxList(params: any) {
  return request({
    url: "/v1/sandboxes",
    method: "GET",
    base_url: sandbox_base_url,
    query: params,
  });
}
export function reqSandboxTemplateList(params: {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}) {
  console.log("sandbox_base_url: ", sandbox_base_url);
  return request({
    url: "/v1/templates",
    method: "GET",
    base_url: sandbox_base_url,
    query: params,
  });
}
export function reqOfficialTemplateList(params: any) {
  return request({
    url: "/v1/templates/official",
    method: "GET",
    base_url: sandbox_base_url,
    query: params,
  });
}
export function reqGetSandboxQuotaList(params: any) {
  return request({
    url: "/v1/sandbox/user/tier",
    method: "GET",
    base_url: sandbox_base_url,
    query: params,
  });
}
export function reqGetSandboxQuotaLevel(params: any) {
  return request({
    url: "/v1/user/sandbox-quota-level",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}

export function reqSandboxMetrics(params: any) {
  return request({
    url: "/v1/metrics/sandbox",
    method: "GET",
    base_url: service_base_url,
    query: params,
  });
}
