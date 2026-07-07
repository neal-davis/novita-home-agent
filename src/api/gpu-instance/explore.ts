import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// get base query options data for filter
export function reqMarketQueryOptions(params: any) {
  let url = "/market/query_options";
  if (params.auth) {
    url = "/market/auth/query_options";
  }
  delete params.auth;
  return request({
    url: url,
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// get products by filter params
export function reqMarketProducts(params: any, signal?: AbortSignal) {
  let url = "/market/products";
  if (params.auth) {
    url = "/market/auth/products";
  }
  return request({
    url: url,
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
    signal,
  });
}
export function reqMarketProductDetail() {
  return request({
    url: "/market/product",
    method: "GET",
    base_url: BASE_API_URL,
    query: {
      productId: "64",
    },
  });
}

// get products pricing
export function reqGetProductPricing(params: any) {
  return request({
    url: "/market/product/pricing",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// get products monthly pricing
export function reqGetProductMonthlyPricing(params: any) {
  return request({
    url: "/gpu/instance/calcMonthAmount",
    method: "POST",
    base_url: service_base_url + "/api/v1",
    data: {
      ...params,
    },
  });
}
// get products expand amount
export function reqGetProductExpandAmount(params: any) {
  return request({
    url: "/gpu/instance/calcExpandAmount",
    method: "POST",
    base_url: service_base_url + "/api/v1",
    data: {
      ...params,
    },
  });
}

// get products by filter params
export function reqGetSavingPlanTemplates(params: any) {
  return request({
    url: "/wallet/saving_plan_template",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// get public images by filter params
export function reqGpuPublicImages(params: any) {
  return request({
    url: "/gpu/public/images",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// create instance
export function reqCreateGpuInstance(params: any) {
  delete params.priceInfos;
  delete params.imageObj;
  delete params.currProduct;
  return request({
    url: "/gpu/instance",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
      entrypoint: params.entrypoint?.trim() || "",
    },
  });
}

// upload request
export function reqUploadUserRequestProduct(params: any) {
  return request({
    url: "/anycross/trigger/callback/MGRmOGM2ZWZmZWY3OWRlZWMxZGMzYzU1OGY1MDNhNzRm",
    method: "POST",
    base_url: service_base_url,
    data: {
      ...params,
    },
  });
}
export function reqCollectUserCompany(params: any) {
  return request({
    url: "/user/company",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}

// get market node by filter params
export function reqGetMarketNode(params: any, signal?: AbortSignal) {
  let url = "/market/products/node";
  if (params.auth) {
    url = "/market/auth/products/node";
  }
  return request({
    url: url,
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
    signal,
  });
}
