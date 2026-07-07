import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

// delete instance by instanceId
export function reqDeleteGpuInstance(instanceId: string) {
  return request({
    url: "/gpu/instance/" + instanceId,
    method: "DELETE",
    base_url: BASE_API_URL,
  });
}
// mount instance
export function reqInstanceMount(params: any) {
  return request({
    url: "/gpu/instanceMount",
    method: "POST",
    data: {
      ...params,
    },
    base_url: BASE_API_URL,
  });
}
// start instance by instanceId
export function reqStartGpuInstance(instanceId: string) {
  return request({
    url: "/gpu/instance/start/" + instanceId,
    method: "POST",
    base_url: BASE_API_URL,
  });
}
// restart instance by instanceId
export function reqRestartGpuInstance(instanceId: string) {
  return request({
    url: "/gpu/instance/restart/" + instanceId,
    method: "POST",
    base_url: BASE_API_URL,
  });
}
// migrate instance by instanceId
export function reqMigrateGpuInstance(instanceId: string, params: any) {
  return request({
    url: "/gpu/instance/migrate/" + instanceId,
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
    ignoreMsg: true,
  });
}
// set auto migrate
export function reqSetAutoMigrate(params: any) {
  return request({
    url: "/gpu/instance/setAutoMigrate",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// stop instance by instanceId
export function reqStopGpuInstance(instanceId: string) {
  return request({
    url: "/gpu/instance/stop/" + instanceId,
    method: "POST",
    base_url: BASE_API_URL,
  });
}
// save image instance by instanceId
export function reqSaveImageInstance(params: any) {
  return request({
    url: "/job/save/image",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// update instance name by instanceId
// export function reqUpdateGpuInstanceName(req: {instanceId: string, name: string}) {
//   return request({
//     url: "/gpu/instance/"+req.instanceId,
//     method: "POST",
//     base_url: BASE_API_URL,
//     data: {
//       mame: req.name,
//     },
//   });
// }
// get instances
export function reqGpuInstance(params: any) {
  return request({
    url: "/gpu/instances",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
// get metrics instance
export function reqMetricsGpuInstance(params: any) {
  return request({
    url: "/metrics/gpu/instance",
    method: "GET",
    base_url: service_base_url + "/v1",
    query: params,
  });
}

// get single instance
export function reqSingleGpuInstance(instanceId: string) {
  return request({
    url: "/gpu/instance/" + instanceId,
    method: "GET",
    base_url: BASE_API_URL,
    ignoreMsg: true,
  });
}
export function reqUpdateGpuInstanceName(req: {
  instanceId: string;
  name: string;
}) {
  return request({
    url: "/gpu/instance/" + req.instanceId,
    method: "PUT",
    base_url: BASE_API_URL,
    data: {
      name: req.name,
    },
  });
}

// renew instance
export function reqRenewInstance(params: any) {
  return request({
    url: "/gpu/instance/renewInstance",
    method: "POST",
    base_url: service_base_url + "/api/v1",
    data: {
      ...params,
    },
  });
}

// set auto renew
export function reqSetAutoRenew(params: any) {
  return request({
    url: "/gpu/instance/setAutoRenew",
    method: "POST",
    base_url: service_base_url + "/api/v1",
    data: {
      ...params,
    },
  });
}

// trans to monthly
export function reqTransToMonthlyInstance(params: any) {
  return request({
    url: "/gpu/instance/transToMonthlyInstance",
    method: "POST",
    base_url: service_base_url + "/api/v1",
    data: {
      ...params,
    },
  });
}

// upgrade instance
export function reqUpgradeInstance(instanceId: string, instanceParams: any) {
  return request({
    url: "/gpu/instance/" + instanceId + "/upgrade",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...instanceParams,
    },
  });
}
// edit instance
export function reqEditInstance(req: {
  instanceId: string;
  instanceParams: any;
}) {
  return request({
    url: "/gpu/instance/" + req.instanceId + "/edit",
    method: "PUT",
    base_url: BASE_API_URL,
    data: {
      ...req.instanceParams,
    },
  });
}

// start instance terminal
export function reqStartInstanceTerminal(instanceId: string) {
  return request({
    url: "/gpu/instance/" + instanceId + "/terminal",
    method: "POST",
    base_url: BASE_API_URL,
  });
}

// start instance terminal
export function reqStopInstanceTerminal(instanceId: string) {
  return request({
    url: "/gpu/instance/" + instanceId + "/terminal/stop",
    method: "POST",
    base_url: BASE_API_URL,
  });
}

// get instance mount list
export function reqInstanceMountList(params: any) {
  return request({
    url: "/gpu/instanceMountList",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
    ignoreMsg: true,
  });
}
