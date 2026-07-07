import { request } from "./api";

export type ModelAPIRequestLogsQuery = {
  start_time: number;
  end_time: number;
  member_id?: string;
  user_key_id?: string;
  request_id?: string;
  trace_id?: string;
  query?: string;
  session_id?: string;
  page_size?: number;
  cursor_record_at?: number;
  cursor_trace_id?: string;
};

export type ModelAPIRequestLogItem = {
  record_at?: number | string;
  request_id?: string;
  trace_id?: string;
  user_key_id?: string;
  member_id?: string;
  model_name?: string;
  input_tokens?: number | string;
  cache_tokens?: number | string;
  output_tokens?: number | string;
  ttft_ms?: number | string;
  duration_ms?: number | string;
  status_code?: number | string;
  status_reason?: string;
  err_response?: string;
  session_id?: string;
};

export type ModelAPIRequestLogsResponse = {
  items?: ModelAPIRequestLogItem[];
  next_cursor_record_at?: number | string;
  next_cursor_trace_id?: string;
  has_more?: boolean;
  latest_record_at?: number | string;
  latest_trace_id?: string;
};

type ModelAPIRequestLogRawItem = ModelAPIRequestLogItem & {
  recordAt?: number | string;
  requestId?: string;
  traceId?: string;
  userKeyId?: string;
  memberId?: string;
  modelName?: string;
  inputTokens?: number | string;
  cacheTokens?: number | string;
  outputTokens?: number | string;
  ttftMs?: number | string;
  durationMs?: number | string;
  statusCode?: number | string;
  statusReason?: string;
  errResponse?: string;
  sessionId?: string;
};

type ModelAPIRequestLogsRawResponse = ModelAPIRequestLogsResponse & {
  items?: ModelAPIRequestLogRawItem[];
  nextCursorRecordAt?: number | string;
  nextCursorTraceId?: string;
  hasMore?: boolean;
  latestRecordAt?: number | string;
  latestTraceId?: string;
};

function normalizeRequestLogItem(
  item: ModelAPIRequestLogRawItem,
): ModelAPIRequestLogItem {
  return {
    record_at: item.record_at ?? item.recordAt,
    request_id: item.request_id ?? item.requestId,
    trace_id: item.trace_id ?? item.traceId,
    user_key_id: item.user_key_id ?? item.userKeyId,
    member_id: item.member_id ?? item.memberId,
    model_name: item.model_name ?? item.modelName,
    input_tokens: item.input_tokens ?? item.inputTokens,
    cache_tokens: item.cache_tokens ?? item.cacheTokens,
    output_tokens: item.output_tokens ?? item.outputTokens,
    ttft_ms: item.ttft_ms ?? item.ttftMs,
    duration_ms: item.duration_ms ?? item.durationMs,
    status_code: item.status_code ?? item.statusCode,
    status_reason: item.status_reason ?? item.statusReason,
    err_response: item.err_response ?? item.errResponse,
    session_id: item.session_id ?? item.sessionId,
  };
}

function normalizeRequestLogsResponse(
  response: ModelAPIRequestLogsRawResponse,
): ModelAPIRequestLogsResponse {
  return {
    items: response.items?.map(normalizeRequestLogItem),
    next_cursor_record_at:
      response.next_cursor_record_at ?? response.nextCursorRecordAt,
    next_cursor_trace_id:
      response.next_cursor_trace_id ?? response.nextCursorTraceId,
    has_more: response.has_more ?? response.hasMore,
    latest_record_at: response.latest_record_at ?? response.latestRecordAt,
    latest_trace_id: response.latest_trace_id ?? response.latestTraceId,
  };
}

export function getModelAPIRequestLogs(
  query: ModelAPIRequestLogsQuery,
  signal?: AbortSignal,
): Promise<ModelAPIRequestLogsResponse> {
  return request({
    url: "/v1/logs/llm/request-logs",
    method: "GET",
    query,
    signal,
    ignoreMsg: true,
  }).then(normalizeRequestLogsResponse);
}
