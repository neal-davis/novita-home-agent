import { request } from "../api";

export function getBareMetalList(params: {
  pageIndex: string;
  pageSize: string;
  displayName?: string;
}): Promise<{
  list: BaremetalGPUSchema[];
  total: string;
}> {
  const { displayName, ...query } = params;
  return request({
    url: "/v1/product/bare-metal/list",
    method: "GET",
    query: {
      ...query,
      ...(displayName?.trim() && { displayName }),
    },
  });
}

export function sendBareMetalRequest(info: any) {
  const dataTmp: any = {};
  Object.keys(info).forEach((key) => {
    dataTmp[key] = info[key]?.toString() || "";
  });
  return request({
    url: "/anycross/trigger/callback/MGM3YzNmMjYyZmMxZTRiM2ExMzliOWZhODAxODg4Njcx",
    method: "POST",
    data: {
      ...dataTmp,
    },
  });
}
