import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export function reqGpuImages(params: any) {
  return request({
    url: "/gpu/images",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
export function reqDeleteUserImage(imageID: string) {
  return request({
    url: "/gpu/image/" + imageID,
    method: "DELETE",
    base_url: BASE_API_URL,
  });
}
export function reqUpdateUserImage(imageID: string, req: any) {
  return request({
    url: "/gpu/image/" + imageID,
    method: "PUT",
    base_url: BASE_API_URL,
    data: {
      name: req.name,
    },
  });
}
export function reqGpuImagePrewarm(params: any) {
  return request({
    url: "/image/prewarm",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
export function reqAddGpuImagePrewarm(params: any) {
  return request({
    url: "/image/prewarm",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqDeleteGpuImagePrewarm(params: any) {
  return request({
    url: "/image/prewarm/delete",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqEditGpuImagePrewarm(params: any) {
  return request({
    url: "/image/prewarm/edit",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqGpuImagePrewarmQuota(params: any) {
  return request({
    url: "/image/prewarm/quota",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
