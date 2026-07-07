import { request } from "./api";

export function getQuotaList(params: {
  modal: "llm" | "image" | "video";
  quotaObject?: string;
  signal?: AbortSignal;
}) {
  if (!params.modal) {
    return Promise.resolve([]);
  }
  return request({
    url: "/v1/user/quota/list",
    query: {
      modal: params.modal,
      ...(params.quotaObject ? { quotaObject: params.quotaObject } : {}),
    },
    signal: params.signal,
  });
}

export function applyAdjustQuota(params: {
  uuid: string;
  quotaObject: string;
  quotaType: string;
  currentLimit: number;
  requestLimit: number;
  contactEmail: string;
  requestReason: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/v1/user/quota/adjust",
    method: "POST",
    data: params,
    signal: params.signal,
  });
}
