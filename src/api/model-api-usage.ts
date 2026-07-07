import { request } from "./api";

export type ModelAPIUsageMeta = {
  isLive?: boolean;
  delayMinutes?: number;
  costSource?: string;
  currency?: string;
  timezone?: string;
  granularity?: string;
};

export type ModelAPIUsageScopeType =
  | "USAGE_SCOPE_TYPE_TEAM"
  | "USAGE_SCOPE_TYPE_MEMBER"
  | "USAGE_SCOPE_TYPE_KEY";

export type ModelAPIUsageScope = {
  type?: ModelAPIUsageScopeType;
  memberId?: string;
  memberName?: string;
  keyId?: string;
  keyName?: string;
  keyMask?: string;
  keyCount?: number;
};

export type ModelAPIUsageScopeResponse = {
  scopes?: ModelAPIUsageScope[];
};

export type ModelAPIUsageQuery = {
  "scope.keyId"?: string;
  "scope.memberId"?: string;
  "scope.scopeType"?: number;
  "time.endTime"?: string;
  "time.startTime"?: string;
  "time.timePreset"?: number;
};

export type ModelAPIUsageSortQuery = ModelAPIUsageQuery & {
  "sort.direction"?: number;
  "sort.field"?: number;
};

export type ModelAPIUsageSummaryResponse = {
  totalRequests?: string;
  inputTokens?: string;
  cacheTokens?: string;
  outputTokens?: string;
  meta?: ModelAPIUsageMeta;
};

export type ModelAPIUsageCostTrendPoint = {
  bucketStartTime?: string;
  bucketEndTime?: string;
  models?: Array<{
    modelId?: string;
    modelName?: string;
    cost?: string;
  }>;
  othersCost?: string;
  totalCost?: string;
};

export type ModelAPIUsageCostTrendResponse = {
  points?: ModelAPIUsageCostTrendPoint[];
  meta?: ModelAPIUsageMeta;
};

export type ModelAPIUsageModelRank = {
  modelId?: string;
  modelName?: string;
  requests?: string;
  inputTokens?: string;
  cacheTokens?: string;
  outputTokens?: string;
  cost?: string;
};

export type ModelAPIUsageModelRanksResponse = {
  models?: ModelAPIUsageModelRank[];
  meta?: ModelAPIUsageMeta;
};

export type ModelAPIUsageKeyRank = {
  keyId?: string;
  keyName?: string;
  keyMask?: string;
  memberId?: string;
  memberName?: string;
  requests?: string;
  totalTokens?: string;
  cost?: string;
};

export type ModelAPIUsageKeyRanksResponse = {
  keys?: ModelAPIUsageKeyRank[];
  meta?: ModelAPIUsageMeta;
};

export const MODEL_API_USAGE_SCOPE_TYPE = {
  team: 1,
  member: 2,
  key: 3,
} as const;

export const MODEL_API_USAGE_TIME_PRESET = {
  today: 1,
  "7d": 2,
  "30d": 3,
  "90d": 4,
  custom: 5,
} as const;

export const MODEL_API_USAGE_SORT_DIRECTION = {
  asc: 1,
  desc: 2,
} as const;

export const MODEL_API_USAGE_MODEL_SORT_FIELD = {
  cost: 1,
  requests: 2,
  inputTokens: 3,
  cacheTokens: 4,
  outputTokens: 5,
} as const;

export const MODEL_API_USAGE_KEY_SORT_FIELD = {
  cost: 1,
  requests: 2,
  totalTokens: 6,
} as const;

export function getModelAPIUsageScopes(
  signal?: AbortSignal,
): Promise<ModelAPIUsageScopeResponse> {
  return request({
    url: "/v1/billing/model-api/usage/scopes",
    method: "GET",
    signal,
  });
}

export function getModelAPIUsageSummary(
  query: ModelAPIUsageQuery,
  signal?: AbortSignal,
): Promise<ModelAPIUsageSummaryResponse> {
  return request({
    url: "/v1/billing/model-api/usage/summary",
    method: "GET",
    query,
    signal,
  });
}

export function getModelAPIUsageCostTrend(
  query: ModelAPIUsageQuery,
  signal?: AbortSignal,
): Promise<ModelAPIUsageCostTrendResponse> {
  return request({
    url: "/v1/billing/model-api/usage/cost-trend",
    method: "GET",
    query,
    signal,
  });
}

export function getModelAPIUsageModelRanks(
  query: ModelAPIUsageSortQuery,
  signal?: AbortSignal,
): Promise<ModelAPIUsageModelRanksResponse> {
  return request({
    url: "/v1/billing/model-api/usage/model-ranks",
    method: "GET",
    query,
    signal,
  });
}

export function getModelAPIUsageKeyRanks(
  query: ModelAPIUsageSortQuery,
  signal?: AbortSignal,
): Promise<ModelAPIUsageKeyRanksResponse> {
  return request({
    url: "/v1/billing/model-api/usage/key-ranks",
    method: "GET",
    query,
    signal,
  });
}
