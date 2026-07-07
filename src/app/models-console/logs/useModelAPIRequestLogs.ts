"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getModelAPIRequestLogs,
  ModelAPIRequestLogItem,
} from "@/api/model-api-logs";
import { getModelAPIUsageScopes } from "@/api/model-api-usage";
import { buildRequestLogsQuery, transformScopes, toNumber } from "./logsData";
import {
  LogsScopeOption,
  LogsScopeState,
  LogsTimeRange,
  RequestLogsCursor,
} from "./types";

type RequestLogsState = {
  items: ModelAPIRequestLogItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: RequestLogsCursor | null;
  latestRecordAt: number | null;
  latestTraceId: string | null;
  lastFetchedAt: number | null;
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function normalizeCursor(
  recordAt?: number | string,
  traceId?: string,
): RequestLogsCursor | null {
  const numericRecordAt = toNumber(recordAt);

  if (!numericRecordAt || !traceId) return null;

  return {
    recordAt: numericRecordAt,
    traceId,
  };
}

function buildItemKey(item: ModelAPIRequestLogItem) {
  return [item.record_at, item.trace_id, item.request_id, item.session_id].join(
    "-",
  );
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }

  if (typeof error === "string") return error;

  return "Failed to load request logs";
}

export function useRequestLogScopes() {
  const [scopeOptions, setScopeOptions] = useState<LogsScopeOption>(() =>
    transformScopes(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    getModelAPIUsageScopes(abortController.signal)
      .then((response) => {
        setScopeOptions(transformScopes(response.scopes));
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError("Failed to load scopes");
      })
      .finally(() => {
        if (!abortController.signal.aborted) setLoading(false);
      });

    return () => abortController.abort();
  }, []);

  return { scopeOptions, loading, error };
}

export function useModelAPIRequestLogs({
  scope,
  timeRange,
  customStart,
  customEnd,
  searchText,
  liveTail,
}: {
  scope: LogsScopeState;
  timeRange: LogsTimeRange;
  customStart: string;
  customEnd: string;
  searchText: string;
  liveTail: boolean;
}) {
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<RequestLogsState>({
    items: [],
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
    nextCursor: null,
    latestRecordAt: null,
    latestTraceId: null,
    lastFetchedAt: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchLogs = useCallback(
    (mode: "replace" | "append", cursor: RequestLogsCursor | null = null) => {
      const query = buildRequestLogsQuery({
        scope,
        timeRange,
        customStart,
        customEnd,
        searchText,
        cursor,
      });

      if (!query) {
        setState((current) => ({
          ...current,
          loading: false,
          loadingMore: false,
          error: "Choose a valid time range",
        }));
        return;
      }

      abortRef.current?.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      setState((current) => ({
        ...current,
        loading: mode === "replace",
        loadingMore: mode === "append",
        error: null,
      }));

      getModelAPIRequestLogs(query, abortController.signal)
        .then((response) => {
          const nextItems = response.items || [];
          const nextCursor = normalizeCursor(
            response.next_cursor_record_at,
            response.next_cursor_trace_id,
          );

          setState((current) => ({
            items:
              mode === "append" ? [...current.items, ...nextItems] : nextItems,
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: Boolean(response.has_more && nextCursor),
            nextCursor,
            latestRecordAt: toNumber(response.latest_record_at) || null,
            latestTraceId: response.latest_trace_id || null,
            lastFetchedAt: Date.now(),
          }));
        })
        .catch((err) => {
          if (isAbortError(err)) return;

          setState((current) => ({
            ...current,
            loading: false,
            loadingMore: false,
            error: getErrorMessage(err),
          }));
        });
    },
    [customEnd, customStart, scope, searchText, timeRange],
  );

  // Live tail incremental refresh (Plan B): logs are newest-first, so pull the
  // newest page(s) and prepend only rows newer than what we already show,
  // keeping loaded pages + the "Load more" cursor intact. When an entire page
  // is new (a burst of >50 rows in one interval) we keep paging deeper until we
  // overlap the existing list, so no gap appears between new and old rows.
  const liveRefresh = useCallback(async () => {
    const baseQuery = buildRequestLogsQuery({
      scope,
      timeRange,
      customStart,
      customEnd,
      searchText,
    });
    if (!baseQuery) return;

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const seen = new Set(stateRef.current.items.map(buildItemKey));
    const fresh: ModelAPIRequestLogItem[] = [];
    let cursor: RequestLogsCursor | null = null;
    let latestRecordAt: number | null = null;
    let latestTraceId: string | null = null;
    const MAX_PAGES = 20; // safety cap: at most 1000 rows merged per tick

    try {
      for (let page = 0; page < MAX_PAGES; page += 1) {
        // Reuse the page-0 time bounds for deeper pages so the window doesn't
        // drift between requests.
        const query = cursor
          ? {
              ...baseQuery,
              cursor_record_at: cursor.recordAt,
              cursor_trace_id: cursor.traceId,
            }
          : baseQuery;

        const response = await getModelAPIRequestLogs(
          query,
          abortController.signal,
        );
        const items = response.items || [];

        if (page === 0) {
          latestRecordAt = toNumber(response.latest_record_at) || null;
          latestTraceId = response.latest_trace_id || null;
        }

        let hitSeen = false;
        for (const item of items) {
          if (seen.has(buildItemKey(item))) {
            hitSeen = true;
            break;
          }
          fresh.push(item);
        }

        const nextCursor = normalizeCursor(
          response.next_cursor_record_at,
          response.next_cursor_trace_id,
        );

        // Stop once we overlap the existing list, run out of pages, or the
        // backend can't page further.
        if (
          hitSeen ||
          items.length === 0 ||
          !response.has_more ||
          !nextCursor
        ) {
          break;
        }
        cursor = nextCursor;
      }
    } catch (err) {
      if (isAbortError(err)) return;
      // Background refresh: stay silent on transient errors, keep the list.
      return;
    }

    if (abortController.signal.aborted) return;

    setState((current) => {
      // Re-dedupe against the latest state in case it changed while awaiting.
      const currentSeen = new Set(current.items.map(buildItemKey));
      const merged = fresh.filter(
        (item) => !currentSeen.has(buildItemKey(item)),
      );

      return {
        ...current,
        items: merged.length ? [...merged, ...current.items] : current.items,
        latestRecordAt: latestRecordAt ?? current.latestRecordAt,
        latestTraceId: latestTraceId ?? current.latestTraceId,
        lastFetchedAt: Date.now(),
      };
    });
  }, [customEnd, customStart, scope, searchText, timeRange]);

  const refresh = useCallback(() => {
    fetchLogs("replace");
  }, [fetchLogs]);

  const loadMore = useCallback(() => {
    if (!state.nextCursor || state.loading || state.loadingMore) return;
    fetchLogs("append", state.nextCursor);
  }, [fetchLogs, state.loading, state.loadingMore, state.nextCursor]);

  useEffect(() => {
    refresh();

    return () => abortRef.current?.abort();
  }, [refresh]);

  useEffect(() => {
    if (!liveTail) return;

    const timer = window.setInterval(() => {
      // Skip while an initial load / "Load more" is in flight so we don't
      // abort it; the live refresh only merges in newer rows.
      if (stateRef.current.loading || stateRef.current.loadingMore) return;
      liveRefresh();
    }, 15_000);

    return () => window.clearInterval(timer);
  }, [liveRefresh, liveTail]);

  return {
    ...state,
    refresh,
    loadMore,
  };
}
