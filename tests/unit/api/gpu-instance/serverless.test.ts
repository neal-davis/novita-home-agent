jest.mock("@/api/api", () => ({
  request: jest.fn(),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import {
  createEndpoint,
  deleteEndpoint,
  ENDPOINT_STATE,
  ENDPOINT_TYPE,
  getCreateEndpointConstraints,
  getEndpoint,
  getEndpoints,
  getEndpointsWithTotal,
  getEndpointSpecs,
  getServerlessProductPrice,
  SCALE_POLICY,
  STORAGE_TYPE,
  updateEndpoint,
  WORKER_STATE,
} from "@/api/gpu-instance/serverless";

const mockRequest = request as jest.Mock;

const rawEndpoint = {
  appName: "app",
  clusterID: "cluster-a",
  clusterIDs: ["cluster-a"],
  createdAt: "2024-01-01",
  creator: "user-1",
  envs: [{ key: "A", value: "1" }],
  healthy: { path: "/health" },
  id: "endpoint-1",
  image: {
    authId: "auth-1",
    command: "npm start",
    image: "repo/image:tag",
  },
  log: "log",
  logs: "logs",
  metrics: "metrics",
  name: "Endpoint",
  policy: { type: SCALE_POLICY.QUEUE_DELAY, value: 30 },
  ports: [{ port: 8080 }],
  products: [{ id: "product-1", name: "A100" }],
  rootfsSize: 50,
  state: { error: "none", state: "serving" },
  type: ENDPOINT_TYPE.SYNC,
  url: "https://endpoint.example.test",
  volumeMounts: [{ mountPath: "/data", size: 100, type: STORAGE_TYPE.LOCAL }],
  workerConfig: {
    cudaVersion: "12.1",
    freeTimeout: 60,
    gpuNum: 1,
    maxConcurrent: 4,
    maxNum: 3,
    minNum: 1,
    requestTimeout: 120,
  },
  workers: [
    {
      healthy: true,
      id: "worker-1",
      log: "worker-log",
      metrics: "worker-metrics",
      state: { state: "unpaused" },
    },
    {
      healthy: false,
      id: "worker-removed",
      log: "removed-log",
      state: { state: "removed" },
    },
    {
      healthy: false,
      id: "worker-unknown",
      log: "unknown-log",
      state: { state: "unexpected" },
    },
  ],
};

const createParams = {
  appName: "app",
  clusterID: "cluster-fallback",
  clusterIDs: [],
  cudaVersion: "12.1",
  envs: [{ key: "ENV", value: "1" }],
  gpusPerWorker: 1,
  healthCheckPath: "/health",
  httpPort: 8080,
  idleTimeout: 60,
  imageAddr: "repo/image:tag",
  imageCredential: "auth-1",
  isLocalMount: true,
  localDiskSize: 50,
  localMountPath: "/local",
  maxConcurrency: 4,
  maxReqCount: 10,
  maxWorker: 3,
  minWorker: 1,
  name: "Endpoint",
  networkStorageId: "network-1",
  networkStorageMountPath: "/network",
  osDiskSize: 100,
  productId: "product-1",
  queueDelayTime: 30,
  region: "us",
  requestTimeout: 120,
  scalePolicy: SCALE_POLICY.QUEUE_DELAY,
  startCmd: "npm start",
  type: ENDPOINT_TYPE.ASYNC,
};

describe("gpu instance serverless API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({});
  });

  it("converts endpoint list responses and applies default filters", async () => {
    mockRequest.mockResolvedValueOnce({ endpoints: [rawEndpoint], total: 1 });

    await expect(
      getEndpointsWithTotal({ filter: { creators: "user-1" } }),
    ).resolves.toEqual({
      endpoints: [
        expect.objectContaining({
          id: "endpoint-1",
          image: {
            credential: "auth-1",
            imageAddr: "repo/image:tag",
            startCmd: "npm start",
          },
          port: 8080,
          state: ENDPOINT_STATE.SERVING,
          workers: [
            expect.objectContaining({
              id: "worker-1",
              state: WORKER_STATE.RUNNING,
            }),
            expect.objectContaining({
              id: "worker-unknown",
              state: WORKER_STATE.UNKNOWN,
            }),
          ],
        }),
      ],
      total: 1,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "GET",
      query: {
        creators: "user-1",
        pageNum: 1,
        pageSize: 1000,
        searchMsg: "",
      },
      url: "/endpoints",
    });
  });

  it("converts getEndpoints and getEndpoint responses", async () => {
    mockRequest.mockResolvedValueOnce({ endpoints: [rawEndpoint] });
    await expect(getEndpoints({})).resolves.toHaveLength(1);

    mockRequest.mockResolvedValueOnce({
      ...rawEndpoint,
      state: { state: "missing-state" },
      workers: [],
    });
    await expect(getEndpoint("endpoint-1")).resolves.toMatchObject({
      id: "endpoint-1",
      state: ENDPOINT_STATE.UNKNOWN,
      workers: [],
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "GET",
      url: "/endpoint/endpoint-1",
    });
  });

  it("builds create endpoint payloads with local and network storage", async () => {
    mockRequest.mockResolvedValueOnce({ id: "created-endpoint" });

    await expect(createEndpoint(createParams)).resolves.toBe(
      "created-endpoint",
    );

    expect(mockRequest).toHaveBeenCalledWith({
      base_url: "https://service.example.test/api/v1",
      data: {
        endpoint: expect.objectContaining({
          clusterIDs: ["cluster-fallback"],
          image: {
            authId: "auth-1",
            command: "npm start",
            image: "repo/image:tag",
          },
          policy: {
            type: SCALE_POLICY.QUEUE_DELAY,
            value: 30,
          },
          products: [{ id: "product-1" }],
          volumeMounts: [
            {
              mountPath: "/local",
              size: 50,
              type: STORAGE_TYPE.LOCAL,
            },
            {
              id: "network-1",
              mountPath: "/network",
              type: STORAGE_TYPE.NETWORK,
            },
          ],
          workerConfig: expect.objectContaining({
            maxConcurrent: 4,
            requestTimeout: 120,
          }),
        }),
      },
      method: "POST",
      url: "/endpoint",
    });
  });

  it("builds update, delete, price and constraint requests", async () => {
    await updateEndpoint("endpoint-1", {
      ...createParams,
      clusterIDs: [],
      id: "endpoint-1",
      scalePolicy: SCALE_POLICY.REQUEST_COUNT,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      data: expect.objectContaining({
        clusterIDs: ["cluster-fallback"],
        policy: {
          type: SCALE_POLICY.REQUEST_COUNT,
          value: 10,
        },
      }),
      method: "PUT",
      url: "/endpoint/endpoint-1",
    });

    deleteEndpoint("endpoint-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "DELETE",
      url: "/endpoint?id=endpoint-1",
    });

    getServerlessProductPrice();
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/v1",
      method: "GET",
      query: {
        businessType: "serverless",
        productId: "serverless-local",
      },
      url: "/product/price",
    });

    getCreateEndpointConstraints();
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "GET",
      url: "/endpoint/limit",
    });
  });

  it("fetches endpoint specs and converts price units", async () => {
    mockRequest.mockResolvedValueOnce({
      specs: [
        {
          clusterIDs: ["cluster-a"],
          cpuNum: 8,
          discount: 1500000,
          gpu_name: "A100",
          gpu_size: "80G",
          id: "spec-1",
          level: "pro",
          max_cuda: "12.1",
          memory: 64,
          models: "llm",
          price: 3000000,
          ram: 64,
          vcpu: 8,
          vram: 80,
        },
      ],
    });

    const params = { "filter.name": "A100", auth: true } as any;

    await expect(getEndpointSpecs(params)).resolves.toEqual([
      expect.objectContaining({
        clusterIDs: ["cluster-a"],
        discount: 1.5,
        id: "spec-1",
        price: 3,
      }),
    ]);
    expect(mockRequest).toHaveBeenCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "GET",
      query: { "filter.name": "A100" },
      url: "/serverless/auth/market/specs",
    });
    expect(params).toEqual({ "filter.name": "A100" });
  });
});
