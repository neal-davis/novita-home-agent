import Cookies from "js-cookie";
import { request, requestInServerEnv } from "./api";

export function getLLMDedicatedEndpointList(params: {
  pageSize: number;
  pageNum: number;
  sortKey: string;
  filter: {
    id?: string;
    status?: string;
    endpointName?: string;
  };
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint",
    query: {
      pageSize: params.pageSize,
      pageNum: params.pageNum,
      sortKey: params.sortKey,
      ...(params.filter.id ? { "filter.id": params.filter.id } : {}),
      ...(params.filter.status
        ? { "filter.status": params.filter.status }
        : {}),
      ...(params.filter.endpointName
        ? { "filter.query": params.filter.endpointName }
        : {}),
    },
    signal: params.signal,
  });
}

export async function getLLMDedicatedEndpointByIdInServerEnv(
  id: string,
  token: string,
) {
  const res = await requestInServerEnv({
    method: "GET",
    url: `/api/v1/llm/dedicated/endpoint?pageSize=1&pageNum=1&sortKey=newest&filter.id=${id}`,
    token,
  });
  return res?.endpoints?.[0] || null;
}

export async function getLLMDedicatedEndpointById(params: {
  id: string;
  signal?: AbortSignal;
}): Promise<LLMDedicatedEndpoint | null> {
  const res = await request({
    url: "/api/v1/llm/dedicated/endpoint",
    query: {
      pageSize: 1,
      pageNum: 1,
      sortKey: "newest",
      "filter.id": params.id,
    },
    signal: params.signal,
  });
  return res?.endpoints?.[0] || null;
}

export function createLLMDedicatedEndpoint(params: {
  name: string;
  resources: LLMDedicatedEndpointResources;
  scalingPolicy: LLMDedicatedEndpointScalingPolicy;
  engine: LLMDedicatedEndpointEngine;
  baseModel: {
    provider: string;
    modelId: string;
    revision?: string;
    token: string;
  };
  loras: LLMDedicatedEndpointLora[];
  isSuffixDecodingEnable?: boolean;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint",
    method: "POST",
    data: {
      endpoint: params,
    },
    signal: params.signal,
  });
}

export function updateLLMDedicatedEndpoint(params: {
  id: string;
  updateData: {
    name?: string;
    baseModel?: {
      provider: string;
      modelId: string;
      revision?: string;
      token?: string;
    };
    scalingPolicy?: LLMDedicatedEndpointScalingPolicy;
    engine?: LLMDedicatedEndpointEngine;
    lora?: {
      data: LLMDedicatedEndpointLora[];
    };
    resources?: LLMDedicatedEndpointResources;
    isSuffixDecodingEnable?: boolean;
  };
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint",
    method: "PUT",
    data: params,
    signal: params.signal,
  });
}

export function stopLLMDedicatedEndpoint(params: {
  id: string;
  force?: boolean;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint/stop",
    method: "PUT",
    data: {
      id: params.id,
      ...(params.force ? { force: true } : {}),
    },
    signal: params.signal,
  });
}

export function restartLLMDedicatedEndpoint(params: {
  id: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint/recovery",
    method: "PUT",
    data: {
      id: params.id,
    },
    signal: params.signal,
  });
}

export function deleteLLMDedicatedEndpoint(params: {
  id: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/endpoint",
    method: "DELETE",
    query: {
      id: params.id,
    },
    signal: params.signal,
  });
}

export function getLLMDedicatedSpec(params: {
  gpuName?: string;
  signal?: AbortSignal;
}): Promise<{ specs: LLMDedicatedSpec[] }> {
  const token = typeof window !== "undefined" ? Cookies.get("token") : "";
  const url = token
    ? "/api/v1/llm/dedicated/auth/spec"
    : "/api/v1/llm/dedicated/spec";

  return request({
    url,
    query: {
      ...(params.gpuName ? { "filter.gpuName": params.gpuName } : {}),
    },
    signal: params.signal,
  });
}

export function getHfModel(params: {
  modelId: string;
  token?: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/huggingface/model",
    query: {
      ...(params.modelId ? { modelId: params.modelId } : {}),
      ...(params.token ? { token: params.token } : {}),
      limit: 30,
    },
    signal: params.signal,
  });
}

// Check if a HuggingFace base model is valid
export function checkHfBaseModel(params: {
  modelId: string;
  token?: string;
  revision?: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/huggingface/model/check",
    query: {
      ...(params.modelId ? { modelId: params.modelId } : {}),
      ...(params.token ? { token: params.token } : {}),
      ...(params.revision ? { revision: params.revision } : {}),
    },
    signal: params.signal,
    ignoreMsg: true,
  });
}

// Check if LoRA adapters are compatible with a base model
export interface CheckLoraAdapterResult {
  loraAdapter: string;
  isValid: boolean;
  errorMsg: string;
}

export interface CheckLoraAdaptersResponse {
  results: CheckLoraAdapterResult[];
}

export function checkLoraAdapters(params: {
  baseModel: string;
  hfToken?: string;
  loraAdapters: string[];
  signal?: AbortSignal;
}): Promise<CheckLoraAdaptersResponse> {
  return request({
    url: "/cluster/api/v1/check-lora-adapters",
    method: "POST",
    data: {
      baseModel: params.baseModel,
      ...(params.hfToken ? { hfToken: params.hfToken } : {}),
      loraAdapters: params.loraAdapters,
    },
    signal: params.signal,
    ignoreMsg: true,
  });
}

export function getReadmeContent() {
  return request({
    url: "/v1/product/content-blocks?keys=LLM_DE_LIST_README&keys=LLM_DE_CREATE_README&keys=LLM_DE_DETAIL_README",
  });
}

export function getModelReadmeContent(modelId: string) {
  const normalizedModelId = modelId.replaceAll("/", "-");
  return request({
    url: `/v1/product/content-blocks?keys=HOW_TO_USE_README_${normalizedModelId}&keys=MODEL_CARD_README_${normalizedModelId}&keys=PROMPTING_README_${normalizedModelId}&keys=APPLICATIONS_README_${normalizedModelId}`,
  });
}

export function getModelDetailConfigs(modelId: string) {
  return request({
    url: `/api/model-detail-configs`,
    query: {
      modelId: modelId,
    },
  });
}

export async function getModelDetailConfigsInServerEnv(modelId: string) {
  const { STRAPI_BASE_URL } = await import("@/constants/urls");
  const fetchUrl = `${STRAPI_BASE_URL}/model-detail-configs`;

  try {
    const response = await fetch(fetchUrl, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });

    if (response.status === 404) {
      return {
        code: 404,
        reason: "UNKNOWN_ERROR",
      };
    }

    const data = await response.json();

    const normalizedModelId = modelId.replaceAll("-", "/");

    const matchedConfig = data?.data?.find((config: any) => {
      const configData = config.attributes || config;
      const normalizedApiModelId = configData?.modelId?.replaceAll("-", "/");
      return normalizedApiModelId === normalizedModelId;
    });

    return {
      ...data,
      matchedConfig: matchedConfig
        ? matchedConfig.attributes || matchedConfig
        : null,
    };
  } catch (error) {
    console.error("🌐 [API] Fetch error:", error);
    throw error;
  }
}

export function getLLMDedicatedEngineVersions(params: {
  engineType: string;
  signal?: AbortSignal;
}) {
  return request({
    url: "/api/v1/llm/dedicated/engine/versions",
    query: { engineType: params.engineType },
    signal: params.signal,
  });
}

export function getRecommendedEndpointConfig(params: {
  modelId: string;
  hfToken?: string;
  loras?: {
    modelId: string;
    name: string;
    provider: "huggingface";
  }[];
  source?: string;
  signal?: AbortSignal;
}): Promise<RecommendedEndpointConfig> {
  return request({
    url: "/api/v1/llm/dedicated/recommended-endpoint-specs",
    method: "POST",
    data: {
      modelId: params.modelId,
      ...(params.hfToken ? { hfToken: params.hfToken } : {}),
      ...(params.loras?.length ? { loras: params.loras } : {}),
      ...(params.source ? { source: params.source } : {}),
    },
    signal: params.signal,
    ignoreMsg: true,
  });
}

export function getLLMDedicatedUserInfo() {
  return request({
    url: "/api/v1/llm/dedicated/user/info",
  });
}

export interface ChangeHistoryChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface ChangeHistoryRecord {
  id: number;
  endpointId: string;
  operationType: string;
  title: string;
  changes: ChangeHistoryChange[];
  createdAt: number;
  userName: string;
}

export interface ChangeHistoryResponse {
  records: ChangeHistoryRecord[];
  total: number;
}

export function getLLMDedicatedEndpointChangeHistory(params: {
  endpointId: string;
  pageNum: number;
  pageSize: number;
  sortKey?: string;
  signal?: AbortSignal;
}): Promise<ChangeHistoryResponse> {
  return request({
    url: "/api/v1/llm/dedicated/endpoint/change-history",
    query: {
      endpointId: params.endpointId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      ...(params.sortKey ? { sortKey: params.sortKey } : {}),
    },
    signal: params.signal,
  });
}

export interface MetricsDataPoint {
  timestamp: number;
  value: number;
}

export type MetricName =
  | "processed_requests_total"
  | "processed_requests_success"
  | "ttft_p50"
  | "ttft_p95"
  | "ttft_p99"
  | "tpot_p50"
  | "tpot_p95"
  | "tpot_p99"
  | "request_latency_p50"
  | "request_latency_p95"
  | "request_latency_p99"
  | "throughput_input"
  | "throughput_output"
  | "throughput_total"
  | "concurrent_requests"
  | "concurrent_requests_max"
  | "replicas_active"
  | "replicas_min"
  | "replicas_max";

export interface MetricsResponse {
  dataPoints: MetricsDataPoint[];
}

export function getLLMDedicatedEndpointMetrics(params: {
  endpointId: string;
  metricName: MetricName;
  startTime: string;
  endTime: string;
  signal?: AbortSignal;
}): Promise<MetricsResponse> {
  return request({
    url: "/api/v1/llm/dedicated/endpoint/metrics",
    query: {
      endpointId: params.endpointId,
      metricName: params.metricName,
      startTime: params.startTime,
      endTime: params.endTime,
    },
    signal: params.signal,
  });
}

export interface Metrics24hResponse {
  totalRequests24h: number;
  avgTtft24h: number;
  avgThroughputTokensPerSec24h: number;
}

export function getLLMDedicatedEndpointMetrics24h(params: {
  endpointId: string;
  signal?: AbortSignal;
}): Promise<Metrics24hResponse> {
  return request({
    url: "/api/v1/llm/dedicated/endpoint/metrics24h",
    query: {
      endpointId: params.endpointId,
    },
    signal: params.signal,
  });
}
