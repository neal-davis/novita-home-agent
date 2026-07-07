import {
  MODEL_API_USAGE_KEY_SORT_FIELD,
  MODEL_API_USAGE_MODEL_SORT_FIELD,
  MODEL_API_USAGE_SCOPE_TYPE,
  MODEL_API_USAGE_SORT_DIRECTION,
  MODEL_API_USAGE_TIME_PRESET,
  ModelAPIUsageCostTrendResponse,
  ModelAPIUsageKeyRanksResponse,
  ModelAPIUsageModelRanksResponse,
  ModelAPIUsageQuery,
  ModelAPIUsageScope,
  ModelAPIUsageSortQuery,
  ModelAPIUsageSummaryResponse,
} from "@/api/model-api-usage";
import Big from "big.js";
import {
  UsageCostDataset,
  UsageKeyBreakdown,
  UsageMetrics,
  UsageModelBreakdown,
  UsageScopeOption,
  UsageScopeState,
  UsageSortState,
  UsageTimeRange,
} from "./types";

export type ModelSortColumn =
  | "requests"
  | "inputTokens"
  | "cacheTokens"
  | "outputTokens"
  | "cost";
export type KeySortColumn = "requests" | "totalTokens" | "cost";

// First 5 cover the 5 primary perceptual zones (red/blue/green/amber/purple)
// at maximum hue distance — ensures high-usage models are always visually distinct.
// Positions 6-13 fill remaining hue gaps for lower-usage models.
const MODEL_COLORS = [
  "#F44336", // red      0°   — most salient, grabs attention
  "#2196F3", // blue    207°  — maximally far from red
  "#4CAF50", // green   123°  — fills red↔blue midpoint
  "#FF8F00", // amber    38°  — distinct gold-orange, not confused with red
  "#9C27B0", // purple  291°  — fills blue↔red upper arc
  "#009688", // teal    174°  — green-leaning, clearly ≠ blue
  "#E91E8C", // pink    330°
  "#8BC34A", // lime     80°
  "#00BCD4", // cyan    188°
  "#3F51B5", // indigo  231°
  "#FF5722", // deep orange 14°
  "#795548", // brown
  "#607D8B", // blue-grey
];

export const TEAM_SCOPE: UsageScopeState = {
  type: "team",
  memberId: null,
  keyId: null,
  label: "Team",
};

export const EMPTY_USAGE_METRICS: UsageMetrics = {
  requests: 0,
  inputTokens: 0,
  cacheTokens: 0,
  outputTokens: 0,
};

export const TIME_RANGE_OPTIONS: Array<{
  value: Exclude<UsageTimeRange, "custom">;
  label: string;
}> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
];

export function isTodayRange(timeRange: UsageTimeRange) {
  return timeRange === "today";
}

export function toUsageNumber(value?: string | number | null) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

export function toUsageCostAmount(value?: string | number | null) {
  try {
    return new Big(value ?? 0).div(10000).round(4).toNumber();
  } catch {
    return 0;
  }
}

export function formatUsageNumber(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export function formatCurrency(value: number, currency = "USD") {
  const prefix = currency.toUpperCase() === "USD" ? "$" : `${currency} `;
  try {
    return `${prefix}${new Big(value || 0).round(4).toFixed(4)}`;
  } catch {
    return `${prefix}0.0000`;
  }
}

function parseBucketDate(value: string) {
  const trimmed = value.trim();
  const numericValue = Number(trimmed);

  if (/^\d{10}$/.test(trimmed) && Number.isFinite(numericValue)) {
    return new Date(numericValue * 1000);
  }

  if (/^\d{13}$/.test(trimmed) && Number.isFinite(numericValue)) {
    return new Date(numericValue);
  }

  return new Date(value);
}

export function formatBucketLabel(value?: string, granularity?: string) {
  if (!value) return "";

  const date = parseBucketDate(value);
  if (Number.isNaN(date.getTime())) return value;

  if (granularity?.toLowerCase().includes("hour")) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function queryDateToUnixTimestamp(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";

  const timestamp = Date.UTC(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    0,
  );

  return String(Math.floor(timestamp / 1000));
}

export function buildUsageQuery(
  scope: UsageScopeState,
  timeRange: UsageTimeRange,
  customStart: string,
  customEnd: string,
): ModelAPIUsageQuery {
  const query: ModelAPIUsageQuery = {
    "scope.scopeType": MODEL_API_USAGE_SCOPE_TYPE[scope.type],
  };

  if (scope.type === "member" && scope.memberId) {
    query["scope.memberId"] = scope.memberId;
  }

  if (scope.type === "key" && scope.keyId) {
    query["scope.keyId"] = scope.keyId;
  }

  if (timeRange === "custom") {
    query["time.timePreset"] = MODEL_API_USAGE_TIME_PRESET.custom;
  } else {
    query["time.timePreset"] = MODEL_API_USAGE_TIME_PRESET[timeRange];
  }

  if (customStart && customEnd) {
    query["time.startTime"] = queryDateToUnixTimestamp(customStart);
    query["time.endTime"] = queryDateToUnixTimestamp(customEnd, true);
  }

  return query;
}

export function buildModelRanksQuery(
  baseQuery: ModelAPIUsageQuery,
  sort: UsageSortState<ModelSortColumn> | null,
): ModelAPIUsageSortQuery {
  if (!sort) return { ...baseQuery };
  return {
    ...baseQuery,
    "sort.direction": MODEL_API_USAGE_SORT_DIRECTION[sort.direction],
    "sort.field": MODEL_API_USAGE_MODEL_SORT_FIELD[sort.column],
  };
}

export function buildKeyRanksQuery(
  baseQuery: ModelAPIUsageQuery,
  sort: UsageSortState<KeySortColumn> | null,
): ModelAPIUsageSortQuery {
  if (!sort) return { ...baseQuery };
  return {
    ...baseQuery,
    "sort.direction": MODEL_API_USAGE_SORT_DIRECTION[sort.direction],
    "sort.field": MODEL_API_USAGE_KEY_SORT_FIELD[sort.column],
  };
}

function getScopeLabel(scope: ModelAPIUsageScope) {
  if (scope.type === "USAGE_SCOPE_TYPE_KEY") {
    return scope.keyName || scope.keyMask || scope.keyId || "Unnamed key";
  }

  if (scope.type === "USAGE_SCOPE_TYPE_MEMBER") {
    return scope.memberName || scope.memberId || "Unnamed member";
  }

  return scope.memberName || "Team";
}

export function transformScopes(
  scopes: ModelAPIUsageScope[] = [],
): UsageScopeOption {
  const teamScope = scopes.find(
    (scope) => scope.type === "USAGE_SCOPE_TYPE_TEAM",
  );
  const membersById = new Map<
    string,
    UsageScopeState & {
      keys: UsageScopeState[];
    }
  >();

  scopes
    .filter((scope) => scope.type === "USAGE_SCOPE_TYPE_MEMBER")
    .forEach((scope) => {
      const memberId = scope.memberId || scope.memberName || "";
      if (!memberId) return;

      membersById.set(memberId, {
        type: "member",
        memberId,
        memberName: scope.memberName,
        keyId: null,
        label: getScopeLabel(scope),
        keyCount: scope.keyCount,
        keys: [],
      });
    });

  scopes
    .filter((scope) => scope.type === "USAGE_SCOPE_TYPE_KEY")
    .forEach((scope) => {
      const memberId = scope.memberId || scope.memberName || "";
      const keyId = scope.keyId || scope.keyName || scope.keyMask || "";
      if (!keyId) return;

      if (memberId && !membersById.has(memberId)) {
        membersById.set(memberId, {
          type: "member",
          memberId,
          memberName: scope.memberName,
          keyId: null,
          label: scope.memberName || memberId,
          keys: [],
        });
      }

      const keyScope: UsageScopeState = {
        type: "key",
        memberId: memberId || null,
        memberName: scope.memberName,
        keyId,
        keyName: scope.keyName,
        keyMask: scope.keyMask,
        label: getScopeLabel(scope),
      };

      if (memberId) {
        membersById.get(memberId)?.keys.push(keyScope);
      }
    });

  return {
    team: teamScope
      ? {
          type: "team",
          memberId: null,
          memberName: teamScope.memberName,
          keyId: null,
          label: getScopeLabel(teamScope),
          keyCount: teamScope.keyCount,
        }
      : TEAM_SCOPE,
    members: Array.from(membersById.values()),
  };
}

export function transformSummary(
  response?: ModelAPIUsageSummaryResponse,
): UsageMetrics {
  return {
    requests: toUsageNumber(response?.totalRequests),
    inputTokens: toUsageNumber(response?.inputTokens),
    cacheTokens: toUsageNumber(response?.cacheTokens),
    outputTokens: toUsageNumber(response?.outputTokens),
  };
}

function getBucketTimestamp(value?: string) {
  if (!value) return NaN;
  const date = parseBucketDate(value);
  return date.getTime();
}

function getQueryDateTimestamp(value: string, endOfDay = false) {
  const timestamp = queryDateToUnixTimestamp(value, endOfDay);
  return timestamp ? Number(timestamp) * 1000 : NaN;
}

export function transformCostTrend(
  response?: ModelAPIUsageCostTrendResponse,
  range?: {
    start: string;
    end: string;
  },
): {
  labels: string[];
  datasets: UsageCostDataset[];
} {
  const points = response?.points || [];
  const granularity = response?.meta?.granularity;
  const rangeStart = range?.start ? getQueryDateTimestamp(range.start) : NaN;
  const rangeEnd = range?.end ? getQueryDateTimestamp(range.end, true) : NaN;
  const visiblePoints =
    Number.isFinite(rangeStart) && Number.isFinite(rangeEnd)
      ? points.filter((point) => {
          const bucketStart = getBucketTimestamp(point.bucketStartTime);
          if (!Number.isFinite(bucketStart)) return true;

          return bucketStart >= rangeStart && bucketStart <= rangeEnd;
        })
      : points;
  const modelOrder: string[] = [];
  const modelNames = new Map<string, string>();
  const valuesByModel = new Map<string, number[]>();
  const labels = visiblePoints.map((point) =>
    formatBucketLabel(point.bucketStartTime, granularity),
  );

  visiblePoints.forEach((point, pointIndex) => {
    point.models?.forEach((model) => {
      const id = model.modelId || model.modelName || "unknown";
      if (!valuesByModel.has(id)) {
        modelOrder.push(id);
        modelNames.set(id, model.modelName || id);
        valuesByModel.set(id, Array(visiblePoints.length).fill(0));
      }

      valuesByModel.get(id)![pointIndex] = toUsageCostAmount(model.cost);
    });
  });

  const datasets = modelOrder.map((id, index) => ({
    id,
    name: modelNames.get(id) || id,
    color: MODEL_COLORS[index % MODEL_COLORS.length],
    data: valuesByModel.get(id) || [],
  }));

  if (visiblePoints.some((point) => toUsageCostAmount(point.othersCost) > 0)) {
    datasets.push({
      id: "others",
      name: "Others",
      color: "#E7E6E2",
      data: visiblePoints.map((point) => toUsageCostAmount(point.othersCost)),
    });
  }

  return { labels, datasets };
}

export function transformModelRanks(
  response?: ModelAPIUsageModelRanksResponse,
): UsageModelBreakdown[] {
  return (response?.models || []).map((model) => ({
    id: model.modelId || model.modelName || "",
    model: model.modelName || model.modelId || "Unknown model",
    requests: toUsageNumber(model.requests),
    inputTokens: toUsageNumber(model.inputTokens),
    cacheTokens: toUsageNumber(model.cacheTokens),
    outputTokens: toUsageNumber(model.outputTokens),
    cost: toUsageCostAmount(model.cost),
  }));
}

export function transformKeyRanks(
  response?: ModelAPIUsageKeyRanksResponse,
): UsageKeyBreakdown[] {
  return (response?.keys || []).map((key) => ({
    id: key.keyId || key.keyName || key.keyMask || "",
    name: key.keyName || key.keyMask || "Unknown key",
    mask: key.keyMask || "",
    memberId: key.memberId || "",
    member: key.memberName || key.memberId || "Unknown member",
    requests: toUsageNumber(key.requests),
    totalTokens: toUsageNumber(key.totalTokens),
    cost: toUsageCostAmount(key.cost),
  }));
}
