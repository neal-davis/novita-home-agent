import { request, service_base_url } from "../api";

const BASE_API_URL = service_base_url + "/api/v1";
const BASE_WITHOUT_API_URL = service_base_url + "/v1";

export enum ENDPOINT_STATE {
  INITIALIZING = "initializing",
  SERVING = "serving",
  STOPPED = "stopped",
  FAILED = "failed",
  TERMINATING = "terminating",
  RUNNING = "running",
  ERROR = "error",
  UNKNOWN = "unknown",
}

export enum WORKER_STATE {
  PENDING = "pending",
  CREATING = "creating",
  RUNNING = "running",
  PAUSED = "paused",
  UNPAUSED = "unpaused",
  STOPPED = "stopped",
  FAILED = "failed",
  UNSCHEDULING = "unscheduling",
  TERMINATING = "terminating",
  ERROR = "error",
  EXITED = "exited",
  PULLING = "pulling",
  STOPPING = "stopping",
  STARTING = "starting",
  UNKNOWN = "unknown",
}

export type Worker = {
  id: string;
  state: WORKER_STATE;
  logAddress: string;
  metrics?: string;
  healthy: boolean;
};

export type EndpointImage = {
  credential: string;
  startCmd: string;
  imageAddr: string;
};

export enum SCALE_POLICY {
  QUEUE_DELAY = "queue",
  REQUEST_COUNT = "concurrency",
}

export enum ENDPOINT_TYPE {
  SYNC = "sync",
  ASYNC = "async",
}

export enum STORAGE_TYPE {
  NETWORK = "network",
  LOCAL = "local",
}

export type EndpointStorage = {
  id: string;
  type: STORAGE_TYPE;
  size: number; // GB
  mountPath: string;
};

export type EndpointProduct = {
  id: string;
  name: string;
};

export type WorkerConfig = {
  min: number;
  max: number;
  freeTimeout: number;
  maxConcurrent: number;
  gpuNum: number;
  cudaVersion: string;
  requestTimeout: number;
};

type HealthyState = {
  failureThreshold: number;
  initialDelay: number;
  path: string;
  period: number;
  successThreshold: number;
  timeout: number;
};

export type Endpoint = {
  id: string;
  name: string;
  url: string;
  appName: string;
  state: ENDPOINT_STATE;
  clusterID: string;
  clusterIDs: string[];
  healthy: HealthyState;
  error?: string;
  image: EndpointImage;
  port: number;
  product: EndpointProduct;
  scalePolicy: { type: SCALE_POLICY; value: number };
  rootfsSize: number; // OS root storage size
  storage: EndpointStorage[];
  workers: Worker[];
  envs?: { key: string; value: string }[];
  logs: string;
  log?: string;
  metrics?: string;
  workerConfig: WorkerConfig;
  creator: string;
  createdAt: string;
  type?: string;
};

export type CreateEndpointParams = {
  name: string;
  appName: string;
  region: string;
  networkStorageId: string;
  networkStorageMountPath: string;
  productId: string;
  minWorker: number;
  maxWorker: number;
  idleTimeout: number;
  maxConcurrency: number;
  gpusPerWorker: number;
  cudaVersion: string;
  scalePolicy: string;
  queueDelayTime: number;
  maxReqCount: number;
  requestTimeout: number;
  imageAddr: string;
  imageCredential: string;
  startCmd: string;
  localDiskSize: number;
  localMountPath: string;
  isLocalMount: boolean;
  osDiskSize: number;
  httpPort: number;
  clusterIDs: string[];
  clusterID: string;
  healthCheckPath: string;
  envs: { key: string; value: string }[];
  type: ENDPOINT_TYPE;
};

export type EditEndpointParams = {
  id: string;
  name?: string;
  clusterID?: string;
  clusterIDs?: string[];
  minWorker?: number;
  maxWorker?: number;
  idleTimeout?: number;
  maxConcurrency?: number;
  gpusPerWorker?: number;
  scalePolicy?: SCALE_POLICY;
  queueDelayTime?: number;
  maxReqCount?: number;
  requestTimeout: number;
  healthCheckPath?: string;
  envs?: { key: string; value: string }[];
  httpPort?: number;
  startCmd?: string;
  imageCredential?: string;
  imageAddr?: string;
  networkStorageMountPath?: string;
  networkStorageId?: string;
  localDiskSize?: number;
  localMountPath?: string;
  cudaVersion?: string;
};

function convertEndpointState(state: string): ENDPOINT_STATE {
  switch (state) {
    case "initializing":
      return ENDPOINT_STATE.INITIALIZING;
    case "serving":
      return ENDPOINT_STATE.SERVING;
    case "stopped":
      return ENDPOINT_STATE.STOPPED;
    case "failed":
      return ENDPOINT_STATE.FAILED;
    case "terminating":
      return ENDPOINT_STATE.TERMINATING;
    case "running":
      return ENDPOINT_STATE.RUNNING;
    case "error":
      return ENDPOINT_STATE.ERROR;
    default:
      return ENDPOINT_STATE.UNKNOWN;
  }
}

function convertWorkerState(state: string): WORKER_STATE {
  switch (state) {
    case "pending":
      return WORKER_STATE.PENDING;
    case "creating":
      return WORKER_STATE.CREATING;
    case "running":
      return WORKER_STATE.RUNNING;
    case "paused":
      return WORKER_STATE.PAUSED;
    case "unpaused":
      return WORKER_STATE.RUNNING;
    case "stopped":
      return WORKER_STATE.STOPPED;
    case "failed":
      return WORKER_STATE.FAILED;
    case "unscheduling":
      return WORKER_STATE.UNSCHEDULING;
    case "terminating":
      return WORKER_STATE.TERMINATING;
    case "error":
      return WORKER_STATE.ERROR;
    case "exited":
      return WORKER_STATE.EXITED;
    case "pulling":
      return WORKER_STATE.PULLING;
    case "stopping":
      return WORKER_STATE.STOPPING;
    case "starting":
      return WORKER_STATE.STARTING;
    case "unknown":
    default:
      return WORKER_STATE.UNKNOWN;
  }
}

function convertEndpoint(endpoint: any): Endpoint {
  return {
    id: endpoint.id,
    name: endpoint.name,
    appName: endpoint.appName,
    creator: endpoint.creator,
    createdAt: endpoint.createdAt,
    state: convertEndpointState(endpoint.state.state),
    clusterID: endpoint.clusterID,
    clusterIDs: endpoint.clusterIDs,
    healthy: endpoint.healthy,
    type: endpoint.type,
    error: endpoint.state.error,
    envs: endpoint.envs,
    url: endpoint.url,
    product: endpoint.products[0],
    image: {
      credential: endpoint.image.authId,
      startCmd: endpoint.image.command,
      imageAddr: endpoint.image.image,
    },
    port: endpoint.ports?.[0]?.port,
    scalePolicy: {
      type: endpoint.policy.type,
      value: endpoint.policy.value,
    },
    rootfsSize: endpoint.rootfsSize,
    storage: endpoint.volumeMounts,
    workers: endpoint.workers
      .filter((worker: any) => worker?.state?.state !== "removed")
      .map((worker: any) => {
        return {
          id: worker.id,
          state: convertWorkerState(worker.state.state),
          logAddress: worker.log,
          metrics: worker.metrics,
          healthy: worker.healthy,
        };
      }),
    workerConfig: {
      min: endpoint.workerConfig.minNum,
      max: endpoint.workerConfig.maxNum,
      freeTimeout: endpoint.workerConfig.freeTimeout,
      maxConcurrent: endpoint.workerConfig.maxConcurrent,
      requestTimeout: endpoint.workerConfig.requestTimeout,
      gpuNum: endpoint.workerConfig.gpuNum,
      cudaVersion: endpoint.workerConfig.cudaVersion,
    },
    logs: endpoint.logs,
    log: endpoint.log,
    metrics: endpoint.metrics,
  };
}

export function getEndpointsWithTotal({
  filter,
}: {
  filter?: {
    creators?: string;
    pageSize?: number;
    pageNum?: number;
    searchMsg?: string;
  };
}): Promise<{ endpoints: Endpoint[]; total: number }> {
  return request({
    url: "/endpoints",
    method: "GET",
    base_url: BASE_API_URL,
    query: {
      ...filter,
      pageSize: filter?.pageSize || 1000,
      pageNum: filter?.pageNum || 1,
      searchMsg: filter?.searchMsg || "",
    },
  }).then((res) => {
    return {
      endpoints: res.endpoints.map(convertEndpoint),
      total: res.total,
    };
  });
}

export function getEndpoints({
  filter,
}: {
  filter?: {
    creators?: string;
    pageSize?: number;
    pageNum?: number;
    searchMsg?: string;
  };
}): Promise<Endpoint[]> {
  return request({
    url: "/endpoints",
    method: "GET",
    base_url: BASE_API_URL,
    query: {
      ...filter,
      pageSize: filter?.pageSize || 1000,
      pageNum: filter?.pageNum || 1,
      searchMsg: filter?.searchMsg || "",
    },
  }).then((res) => {
    return res.endpoints.map(convertEndpoint);
  });
}

export function getEndpoint(id: string): Promise<Endpoint> {
  return request({
    url: `/endpoint/${id}`,
    method: "GET",
    base_url: BASE_API_URL,
  }).then((res) => convertEndpoint(res));
}

export function createEndpoint(params: CreateEndpointParams): Promise<void> {
  const createParams: any = {
    name: params.name,
    appName: params.appName,
    type: params.type,
    workerConfig: {
      minNum: params.minWorker,
      maxNum: params.maxWorker,
      freeTimeout: params.idleTimeout,
      maxConcurrent: params.maxConcurrency,
      requestTimeout: params.requestTimeout,
      gpuNum: params.gpusPerWorker,
      cudaVersion: params.cudaVersion,
    },
    ports: [{ port: params.httpPort }],
    policy: {
      type: params.scalePolicy,
      value:
        params.scalePolicy === "queue"
          ? params.queueDelayTime
          : params.maxReqCount,
    },
    image: {
      image: params.imageAddr,
      command: params.startCmd,
      authId: params.imageCredential,
    },
    products: [{ id: params.productId }],
    rootfsSize: params.osDiskSize,
    volumeMounts:
      params.localDiskSize && params.isLocalMount
        ? [
            {
              type: STORAGE_TYPE.LOCAL,
              size: params.localDiskSize,
              mountPath: params.localMountPath,
            },
          ]
        : [],
    clusterIDs: params.clusterIDs,
    envs: params.envs,
    healthy: {
      path: params.healthCheckPath,
    },
  };

  if (params.networkStorageId && params.networkStorageMountPath) {
    createParams.volumeMounts.push({
      id: params.networkStorageId,
      type: STORAGE_TYPE.NETWORK,
      mountPath: params.networkStorageMountPath,
    });
    if (params.clusterID && params.clusterIDs.length <= 0) {
      createParams.clusterIDs = [params.clusterID];
    }
  }
  if (
    createParams.clusterIDs &&
    createParams.clusterIDs.length > 0 &&
    createParams.clusterIDs.includes("")
  ) {
    createParams.clusterIDs = [];
  }

  return request({
    url: "/endpoint",
    method: "POST",
    base_url: BASE_API_URL,
    data: { endpoint: createParams },
  }).then((res) => res.id);
}

export function updateEndpoint(
  id: string,
  params: EditEndpointParams,
): Promise<void> {
  const createParams: any = {
    name: params.name,
    clusterIDs: params.clusterID ? [params.clusterID] : [],
    workerConfig: {
      minNum: params.minWorker,
      maxNum: params.maxWorker,
      freeTimeout: params.idleTimeout,
      maxConcurrent: params.maxConcurrency,
      requestTimeout: params.requestTimeout,
      gpuNum: params.gpusPerWorker,
      cudaVersion: params.cudaVersion,
    },
    ports: [{ port: params.httpPort }],
    volumeMounts: params.localDiskSize
      ? [
          {
            type: STORAGE_TYPE.LOCAL,
            size: params.localDiskSize,
            mountPath: params.localMountPath,
          },
        ]
      : [],
    policy: {
      type: params.scalePolicy,
      value:
        params.scalePolicy === "queue"
          ? params.queueDelayTime
          : params.maxReqCount,
    },
    image: {
      image: params.imageAddr,
      command: params.startCmd,
      authId: params.imageCredential,
    },
    envs: params.envs,
    healthy: {
      path: params.healthCheckPath,
    },
  };
  if (params.networkStorageId && params.networkStorageMountPath) {
    createParams.volumeMounts.push({
      id: params.networkStorageId,
      type: STORAGE_TYPE.NETWORK,
      mountPath: params.networkStorageMountPath,
    });
    if (
      params.clusterID &&
      params.clusterIDs &&
      params.clusterIDs.length <= 0
    ) {
      createParams.clusterIDs = [params.clusterID];
    }
  }
  if (
    createParams.clusterIDs &&
    createParams.clusterIDs.length > 0 &&
    createParams.clusterIDs.includes("")
  ) {
    createParams.clusterIDs = [];
  }

  return request({
    url: `/endpoint/${id}`,
    method: "PUT",
    base_url: BASE_API_URL,
    data: createParams,
  }).catch((error) => {
    console.log(error);
    throw error;
  });
}

export function deleteEndpoint(id: string): Promise<void> {
  return request({
    url: `/endpoint?id=${id}`,
    method: "DELETE",
    base_url: BASE_API_URL,
  });
}

export type GPUInfoItem = {
  id: string;
  gpu_size: string;
  gpu_name: string;
  models: string;
  price: number;
  discount: number;
  clusterIDs: string[];
};

export type CreateConstraints = {
  cudaVersionList: string[];
  freeLocalVolumeSize?: number;
  freeRootfsSize?: number;
  maxConcurrencyNum?: number;
  maxFreeTimeout?: number;
  maxLocalVolumeSize?: number;
  maxQueueWaitTime?: number;
  maxRequestNum?: number;
  maxRootfsSize?: number;
  maxWorkerNum?: number;
  minConcurrencyNum?: number;
  minFreeTimeout?: number;
  minLocalVolumeSize?: number;
  minQueueWaitTime?: number;
  minRequestNum?: number;
  minRootfsSize?: number;
  minWorkerNum?: number;
  minRequestTimeout?: number;
  maxRequestTimeout?: number;
  minAsyncRequestNum?: number;
  maxAsyncRequestNum?: number;
};

export function getServerlessProductPrice(): Promise<any> {
  return request({
    url: "/product/price",
    method: "GET",
    base_url: BASE_WITHOUT_API_URL,
    query: {
      businessType: "serverless",
      productId: "serverless-local",
    },
  });
}

export function getCreateEndpointConstraints(): Promise<CreateConstraints> {
  return request({
    url: "/endpoint/limit",
    method: "GET",
    base_url: BASE_API_URL,
  });
}

type endpointSpecsReq = {
  auth?: boolean;
  "filter.id"?: string;
  "filter.name"?: string;
  "filter.gpu_name"?: string;
  "pagination.page_num"?: number;
  "pagination.page_size"?: number;
};

export function getEndpointSpecs(
  params?: endpointSpecsReq,
): Promise<GPUInfoItem[]> {
  let url = "/serverless/market/specs";
  if (params?.auth) {
    url = "/serverless/auth/market/specs";
  }
  delete params?.auth;
  return request({
    url,
    method: "GET",
    base_url: BASE_API_URL,
    query: params,
  }).then((res) => {
    return res.specs.map((spec: any) => ({
      id: spec.id,
      gpu_size: spec.gpu_size,
      cpuNum: spec.cpuNum,
      memory: spec.memory,
      gpu_name: spec.gpu_name,
      models: spec.models,
      price: spec.price / 1000000,
      discount: spec.discount / 1000000,
      clusterIDs: spec.clusterIDs || [],
      max_cuda: spec.max_cuda,
      vram: spec.vram,
      vcpu: spec.vcpu,
      ram: spec.ram,
      level: spec.level,
    }));
  });
}
