import {
  ModelAPIRequestLogItem,
  ModelAPIRequestLogsQuery,
} from "@/api/model-api-logs";
import { ModelAPIUsageScope } from "@/api/model-api-usage";
import {
  LogsScopeOption,
  LogsScopeState,
  LogsTimeRange,
  RequestLogsCursor,
} from "./types";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const REQUEST_LOGS_PAGE_SIZE = 50;

export function getTeamScope(): LogsScopeState {
  return {
    type: "team",
    memberId: null,
    keyId: null,
    label: "Team",
  };
}

export const TIME_RANGE_OPTIONS: Array<{
  value: Exclude<LogsTimeRange, "custom">;
  durationMs: number;
}> = [
  { value: "15m", durationMs: 15 * MINUTE_MS },
  { value: "1h", durationMs: HOUR_MS },
  { value: "4h", durationMs: 4 * HOUR_MS },
  { value: "24h", durationMs: DAY_MS },
  { value: "7d", durationMs: 7 * DAY_MS },
];

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultCustomRange() {
  const end = new Date();
  const start = new Date(end.getTime() - DAY_MS);

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  };
}

function parseCustomDate(value: string) {
  const timestamp = new Date(`${value}T00:00:00`).getTime();

  return Number.isFinite(timestamp) ? timestamp : NaN;
}

function getTimeRangeBounds(
  timeRange: LogsTimeRange,
  customStart: string,
  customEnd: string,
) {
  const now = Date.now();

  if (timeRange !== "custom") {
    const option = TIME_RANGE_OPTIONS.find((item) => item.value === timeRange);
    const durationMs = option?.durationMs ?? DAY_MS;

    return {
      startTime: now - durationMs,
      endTime: now,
    };
  }

  const startTime = parseCustomDate(customStart);
  const endTime = parseCustomDate(customEnd) + DAY_MS;

  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    startTime >= endTime
  ) {
    return null;
  }

  return { startTime, endTime };
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
): LogsScopeOption {
  const teamScope = scopes.find(
    (scope) => scope.type === "USAGE_SCOPE_TYPE_TEAM",
  );
  const membersById = new Map<
    string,
    LogsScopeState & {
      keys: LogsScopeState[];
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

      const keyScope: LogsScopeState = {
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
      : getTeamScope(),
    members: Array.from(membersById.values()),
  };
}

function getSearchQuery(searchText: string) {
  const value = searchText.trim();
  const lowerValue = value.toLowerCase();

  if (!value) return {};
  if (lowerValue.startsWith("req")) return { request_id: value };
  if (lowerValue.startsWith("trc") || lowerValue.startsWith("trace")) {
    return { trace_id: value };
  }
  if (lowerValue.startsWith("sess") || lowerValue.startsWith("session")) {
    return { session_id: value };
  }
  if (lowerValue.startsWith("key")) return { user_key_id: value };

  return { query: value };
}

export function buildRequestLogsQuery({
  scope,
  timeRange,
  customStart,
  customEnd,
  searchText,
  cursor,
}: {
  scope: LogsScopeState;
  timeRange: LogsTimeRange;
  customStart: string;
  customEnd: string;
  searchText: string;
  cursor?: RequestLogsCursor | null;
}): ModelAPIRequestLogsQuery | null {
  const bounds = getTimeRangeBounds(timeRange, customStart, customEnd);
  if (!bounds) return null;

  const query: ModelAPIRequestLogsQuery = {
    start_time: bounds.startTime,
    end_time: bounds.endTime,
    page_size: REQUEST_LOGS_PAGE_SIZE,
    ...getSearchQuery(searchText),
  };

  if (scope.type === "member" && scope.memberId) {
    query.member_id = scope.memberId;
  }

  if (scope.type === "key" && scope.keyId) {
    query.user_key_id = scope.keyId;
    if (scope.memberId) query.member_id = scope.memberId;
  }

  if (cursor) {
    query.cursor_record_at = cursor.recordAt;
    query.cursor_trace_id = cursor.traceId;
  }

  return query;
}

export function toNumber(value?: number | string | null) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatCompactNumber(value?: number | string | null) {
  const numericValue = toNumber(value);

  if (numericValue >= 1e9) return `${(numericValue / 1e9).toFixed(1)}B`;
  if (numericValue >= 1e6) return `${(numericValue / 1e6).toFixed(1)}M`;
  if (numericValue >= 1e3) return `${(numericValue / 1e3).toFixed(1)}K`;

  return String(numericValue);
}

export function formatFullNumber(value?: number | string | null) {
  return new Intl.NumberFormat("en-US").format(toNumber(value));
}

export function displayMetric(
  value?: number | string | null,
  options: { dashWhenZero?: boolean } = {},
) {
  const numericValue = toNumber(value);

  if (options.dashWhenZero && numericValue === 0) return "-";

  return formatCompactNumber(numericValue);
}

export function formatTimestamp(value?: number | string | null) {
  const timestamp = toNumber(value);
  if (!timestamp) return "-";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function getStatusKind(statusCode?: number | string | null) {
  const code = toNumber(statusCode);

  if (code >= 200 && code < 300) return "success";
  if (code === 499) return "timeout";
  if (code >= 500) return "server-error";
  if (code >= 400) return "client-error";

  return "unknown";
}

export function getStatusText(item: ModelAPIRequestLogItem) {
  const code = toNumber(item.status_code);
  if (!code) return "-";

  return item.status_reason ? `${code} ${item.status_reason}` : String(code);
}

export function getRequestLogKey(item: ModelAPIRequestLogItem, index: number) {
  return [
    item.record_at,
    item.trace_id,
    item.request_id,
    item.session_id,
    index,
  ]
    .filter(Boolean)
    .join("-");
}
