"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getModelAPIUsageCostTrend,
  getModelAPIUsageKeyRanks,
  getModelAPIUsageModelRanks,
  getModelAPIUsageScopes,
  getModelAPIUsageSummary,
  ModelAPIUsageMeta,
} from "@/api/model-api-usage";
import { getBudgetList, getKeyBudgetList } from "@/api/team";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import {
  EMPTY_USAGE_METRICS,
  KeySortColumn,
  ModelSortColumn,
  buildKeyRanksQuery,
  buildModelRanksQuery,
  buildUsageQuery,
  transformCostTrend,
  transformKeyRanks,
  transformModelRanks,
  transformScopes,
  transformSummary,
} from "./usageData";
import {
  UsageBudget,
  UsageBudgetType,
  UsageCostDataset,
  UsageKeyBreakdown,
  UsageMetrics,
  UsageModelBreakdown,
  UsageScopeOption,
  UsageScopeState,
  UsageSortState,
  UsageTimeRange,
} from "./types";

type UsageDataState = {
  metrics: UsageMetrics;
  costLabels: string[];
  costDatasets: UsageCostDataset[];
  modelRows: UsageModelBreakdown[];
  keyRows: UsageKeyBreakdown[];
  meta?: ModelAPIUsageMeta;
  loading: boolean;
  error: string | null;
};

type BudgetRecord = Record<string, unknown>;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isInvalidCustomRange(start: string, end: string) {
  if (!start || !end) return true;

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  return (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    startTime > endTime
  );
}

function asRecord(value: unknown): BudgetRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as BudgetRecord)
    : null;
}

function asRecordArray(value: unknown): BudgetRecord[] {
  return Array.isArray(value)
    ? value
        .map(asRecord)
        .filter((record): record is BudgetRecord => Boolean(record))
    : [];
}

function getString(record: BudgetRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => item != null);
  return value == null ? "" : String(value);
}

function getNumberValue(value: unknown) {
  if (typeof value === "number" || typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeBudgetAmount(value: unknown) {
  const rawValue = getNumberValue(value);
  const amount = dealMoneyWithPrecision(rawValue, 1, 4);
  return amount === "-" ? rawValue : amount;
}

function normalizeBudgetType(value: unknown): UsageBudgetType {
  const text = value == null ? "" : String(value).toLowerCase();

  if (text.includes("recurring")) return "Recurring";
  if (text.includes("one")) return "One Time";
  return "Unlimited";
}

function transformBudgetRecord(
  record: BudgetRecord | null,
): UsageBudget | null {
  if (!record) return null;

  const type = normalizeBudgetType(
    record.budget_type ?? record.budgetType ?? record.type,
  );
  const limit =
    type === "Unlimited"
      ? null
      : normalizeBudgetAmount(
          record.budget_limit ??
            record.budgetLimit ??
            record.budget ??
            record.limit,
        );

  return {
    type,
    limit,
    used: normalizeBudgetAmount(
      record.used ?? record.used_budget ?? record.usedBudget ?? record.cost,
    ),
    period:
      getString(record, ["cycle", "period", "billing_cycle", "billingCycle"]) ||
      null,
  };
}

function getBudgetRecords(response: unknown) {
  const root = asRecord(response);
  const data = asRecord(root?.data);

  return [
    ...asRecordArray(root?.budgets),
    ...asRecordArray(root?.budgetList),
    ...asRecordArray(data?.budgets),
    ...asRecordArray(data?.budgetList),
  ];
}

function findMemberBudgetRecord(
  records: BudgetRecord[],
  scope: UsageScopeState,
) {
  return (
    records.find((record) => {
      const memberId = getString(record, [
        "member_id",
        "memberId",
        "user_id",
        "userId",
        "id",
      ]);
      return Boolean(scope.memberId && memberId === scope.memberId);
    }) ||
    records.find((record) => {
      const memberName = getString(record, [
        "member_name",
        "memberName",
        "remark_name",
        "remarkName",
        "email",
      ]);
      return Boolean(
        scope.memberName &&
          memberName &&
          memberName.toLowerCase() === scope.memberName.toLowerCase(),
      );
    }) ||
    null
  );
}

export function useModelAPIUsageScopes() {
  const [scopeOptions, setScopeOptions] = useState<UsageScopeOption>(() =>
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

export function useModelAPIUsage({
  scope,
  timeRange,
  customStart,
  customEnd,
  modelSort,
  keySort,
  includeKeyRanks,
}: {
  scope: UsageScopeState;
  timeRange: UsageTimeRange;
  customStart: string;
  customEnd: string;
  modelSort: UsageSortState<ModelSortColumn> | null;
  keySort: UsageSortState<KeySortColumn> | null;
  includeKeyRanks: boolean;
}) {
  const baseQuery = useMemo(
    () => buildUsageQuery(scope, timeRange, customStart, customEnd),
    [customEnd, customStart, scope, timeRange],
  );
  const [state, setState] = useState<UsageDataState>({
    metrics: EMPTY_USAGE_METRICS,
    costLabels: [],
    costDatasets: [],
    modelRows: [],
    keyRows: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (
      timeRange === "custom" &&
      isInvalidCustomRange(customStart, customEnd)
    ) {
      return;
    }

    const abortController = new AbortController();
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    const modelRanksQuery = buildModelRanksQuery(baseQuery, modelSort);
    const keyRanksQuery = buildKeyRanksQuery(baseQuery, keySort);

    Promise.all([
      getModelAPIUsageSummary(baseQuery, abortController.signal),
      getModelAPIUsageCostTrend(baseQuery, abortController.signal),
      getModelAPIUsageModelRanks(modelRanksQuery, abortController.signal),
      includeKeyRanks
        ? getModelAPIUsageKeyRanks(keyRanksQuery, abortController.signal)
        : Promise.resolve({ keys: [], meta: undefined }),
    ])
      .then(([summary, costTrend, modelRanks, keyRanks]) => {
        const trend = transformCostTrend(costTrend, {
          start: customStart,
          end: customEnd,
        });

        setState({
          metrics: transformSummary(summary),
          costLabels: trend.labels,
          costDatasets: trend.datasets,
          modelRows: transformModelRanks(modelRanks),
          keyRows: transformKeyRanks(keyRanks),
          meta:
            summary.meta || costTrend.meta || modelRanks.meta || keyRanks.meta,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: "Failed to load usage data",
        }));
      });

    return () => abortController.abort();
  }, [
    baseQuery,
    customEnd,
    customStart,
    includeKeyRanks,
    keySort,
    modelSort,
    timeRange,
  ]);

  return state;
}

export function useUsageQuota(scope: UsageScopeState) {
  const [state, setState] = useState<{
    quota: UsageBudget | null;
    loading: boolean;
    error: string | null;
  }>({
    quota: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let ignore = false;

    if (scope.type === "team") {
      setState({ quota: null, loading: false, error: null });
      return undefined;
    }

    async function loadQuota() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        let quota: UsageBudget | null = null;

        if (scope.type === "key") {
          if (scope.memberId) {
            const keyBudgets = await getKeyBudgetList(scope.memberId);
            const selectedKeyBudget = keyBudgets.find(
              (item) =>
                (scope.keyId && item.key_id === scope.keyId) ||
                (scope.keyName && item.key_name === scope.keyName),
            );
            quota = transformBudgetRecord(
              selectedKeyBudget
                ? {
                    budget_type: selectedKeyBudget.budget_type,
                    budget_limit: selectedKeyBudget.budget_limit,
                    used: selectedKeyBudget.used,
                    cycle: selectedKeyBudget.cycle,
                  }
                : null,
            );
          }
        } else {
          const response = await getBudgetList();
          quota = transformBudgetRecord(
            findMemberBudgetRecord(getBudgetRecords(response), scope),
          );
        }

        if (!ignore) {
          setState({ quota, loading: false, error: null });
        }
      } catch {
        if (!ignore) {
          setState({
            quota: null,
            loading: false,
            error: "Failed to load quota data",
          });
        }
      }
    }

    loadQuota();

    return () => {
      ignore = true;
    };
  }, [scope]);

  return state;
}
