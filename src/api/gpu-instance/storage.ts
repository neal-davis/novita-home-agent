import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export type Storage = {
  storageId: string;
  storageName: string;
  storageSize: number;
  clusterId: string;
  clusterName: string;
  price: string;
};

// get storage list by params
export function reqGetStorage(params: any): Promise<{ data: Storage[] }> {
  return request({
    url: "/networkstorages/list",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}
// create storage
export function reqCreateNetworkStorage(params: any) {
  return request({
    url: "/networkstorage/create",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// update storage
export function reqUpdateNetworkStorage(params: any) {
  return request({
    url: "/networkstorage/update",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
// delete storage
export function reqDeleteNetworkStorage(params: any) {
  return request({
    url: "/networkstorage/delete",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}

// get storage baseinfo
export function reqGpuStorageBaseInfo(params: any) {
  return request({
    url: "/gpu/storage/base_info",
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  });
}

// pricing page -- get storage info
export function reqHomeProductsStorage() {
  return request({
    url: "/home/products/storage",
    method: "GET",
    base_url: BASE_API_URL,
  });
}
