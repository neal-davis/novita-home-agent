import { renderHook, waitFor } from "@testing-library/react";
import {
  getModelAPIUsageCostTrend,
  getModelAPIUsageKeyRanks,
  getModelAPIUsageModelRanks,
  getModelAPIUsageScopes,
  getModelAPIUsageSummary,
} from "@/api/model-api-usage";
import { getBudgetList, getKeyBudgetList } from "@/api/team";
import {
  useModelAPIUsage,
  useModelAPIUsageScopes,
  useUsageQuota,
} from "@/app/models-console/metrics/usage/useModelAPIUsage";

jest.mock("@/api/model-api-usage", () => ({
  MODEL_API_USAGE_KEY_SORT_FIELD: {
    cost: 1,
    requests: 2,
    totalTokens: 6,
  },
  MODEL_API_USAGE_MODEL_SORT_FIELD: {
    cacheTokens: 4,
    cost: 1,
    inputTokens: 3,
    outputTokens: 5,
    requests: 2,
  },
  MODEL_API_USAGE_SCOPE_TYPE: {
    key: 3,
    member: 2,
    team: 1,
  },
  MODEL_API_USAGE_SORT_DIRECTION: {
    asc: 1,
    desc: 2,
  },
  MODEL_API_USAGE_TIME_PRESET: {
    "7d": 2,
    "30d": 3,
    "90d": 4,
    custom: 5,
    today: 1,
  },
  getModelAPIUsageCostTrend: jest.fn(),
  getModelAPIUsageKeyRanks: jest.fn(),
  getModelAPIUsageModelRanks: jest.fn(),
  getModelAPIUsageScopes: jest.fn(),
  getModelAPIUsageSummary: jest.fn(),
}));

jest.mock("@/api/team", () => ({
  getBudgetList: jest.fn(),
  getKeyBudgetList: jest.fn(),
}));

const mockGetScopes = getModelAPIUsageScopes as jest.Mock;
const mockGetSummary = getModelAPIUsageSummary as jest.Mock;
const mockGetCostTrend = getModelAPIUsageCostTrend as jest.Mock;
const mockGetModelRanks = getModelAPIUsageModelRanks as jest.Mock;
const mockGetKeyRanks = getModelAPIUsageKeyRanks as jest.Mock;
const mockGetBudgetList = getBudgetList as jest.Mock;
const mockGetKeyBudgetList = getKeyBudgetList as jest.Mock;

const teamScope = {
  keyId: null,
  label: "Team",
  memberId: null,
  type: "team",
} as const;
const requestsAscSort = { column: "requests", direction: "asc" } as const;
const costDescSort = { column: "cost", direction: "desc" } as const;
const memberScope = {
  keyId: null,
  label: "Alice",
  memberId: "member-1",
  memberName: "Alice",
  type: "member",
} as const;
const keyScope = {
  keyId: "key-1",
  keyName: "Production",
  label: "Production",
  memberId: "member-1",
  type: "key",
} as const;

describe("model API usage hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads usage scopes and reports non-abort failures", async () => {
    mockGetScopes.mockResolvedValueOnce({
      scopes: [
        {
          keyCount: 2,
          memberName: "Workspace",
          type: "USAGE_SCOPE_TYPE_TEAM",
        },
      ],
    });

    const { result } = renderHook(() => useModelAPIUsageScopes());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.scopeOptions.team).toMatchObject({
      keyCount: 2,
      label: "Workspace",
    });
    expect(result.current.error).toBeNull();

    mockGetScopes.mockRejectedValueOnce(new Error("network"));
    const failed = renderHook(() => useModelAPIUsageScopes());

    await waitFor(() => expect(failed.result.current.loading).toBe(false));
    expect(failed.result.current.error).toBe("Failed to load scopes");
  });

  it("loads summary, trend, model ranks and optional key ranks", async () => {
    mockGetSummary.mockResolvedValueOnce({
      inputTokens: "20",
      meta: { nextPageToken: "summary-meta" },
      outputTokens: "30",
      totalRequests: "10",
    });
    mockGetCostTrend.mockResolvedValueOnce({
      meta: { granularity: "day" },
      points: [
        {
          bucketStartTime: "1767225600",
          models: [{ cost: "10000", modelId: "model-a", modelName: "A" }],
        },
      ],
    });
    mockGetModelRanks.mockResolvedValueOnce({
      models: [
        {
          cacheTokens: "3",
          cost: "10000",
          inputTokens: "20",
          modelId: "model-a",
          modelName: "A",
          outputTokens: "30",
          requests: "10",
        },
      ],
    });
    mockGetKeyRanks.mockResolvedValueOnce({
      keys: [
        {
          cost: "5000",
          keyId: "key-1",
          keyMask: "sk-***",
          keyName: "Production",
          memberId: "member-1",
          memberName: "Alice",
          requests: "4",
          totalTokens: "50",
        },
      ],
    });

    const { result } = renderHook(() =>
      useModelAPIUsage({
        customEnd: "",
        customStart: "",
        includeKeyRanks: true,
        keySort: costDescSort,
        modelSort: requestsAscSort,
        scope: teamScope,
        timeRange: "7d",
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        "scope.scopeType": 1,
        "time.timePreset": 2,
      }),
      expect.any(AbortSignal),
    );
    expect(mockGetModelRanks).toHaveBeenCalledWith(
      expect.objectContaining({
        "sort.direction": 1,
        "sort.field": 2,
      }),
      expect.any(AbortSignal),
    );
    expect(mockGetKeyRanks).toHaveBeenCalledWith(
      expect.objectContaining({
        "sort.direction": 2,
        "sort.field": 1,
      }),
      expect.any(AbortSignal),
    );
    expect(result.current.metrics).toMatchObject({
      inputTokens: 20,
      outputTokens: 30,
      requests: 10,
    });
    expect(result.current.costLabels).toEqual(["Jan 1"]);
    expect(result.current.modelRows[0]).toMatchObject({
      cost: 1,
      id: "model-a",
      requests: 10,
    });
    expect(result.current.keyRows[0]).toMatchObject({
      cost: 0.5,
      id: "key-1",
      member: "Alice",
    });
    expect(result.current.meta).toEqual({ nextPageToken: "summary-meta" });
    expect(result.current.error).toBeNull();
  });

  it("skips invalid custom ranges and stores usage load failures", async () => {
    renderHook(() =>
      useModelAPIUsage({
        customEnd: "2026-01-01",
        customStart: "2026-01-02",
        includeKeyRanks: false,
        keySort: null,
        modelSort: null,
        scope: teamScope,
        timeRange: "custom",
      }),
    );

    expect(mockGetSummary).not.toHaveBeenCalled();

    mockGetSummary.mockRejectedValueOnce(new Error("summary failed"));
    mockGetCostTrend.mockResolvedValueOnce({ points: [] });
    mockGetModelRanks.mockResolvedValueOnce({ models: [] });

    const failed = renderHook(() =>
      useModelAPIUsage({
        customEnd: "",
        customStart: "",
        includeKeyRanks: false,
        keySort: null,
        modelSort: null,
        scope: teamScope,
        timeRange: "today",
      }),
    );

    await waitFor(() => expect(failed.result.current.loading).toBe(false));
    expect(mockGetKeyRanks).not.toHaveBeenCalled();
    expect(failed.result.current.error).toBe("Failed to load usage data");
  });

  it("loads team, member and key quota data with normalized budget values", async () => {
    const teamQuota = renderHook(() => useUsageQuota(teamScope));

    await waitFor(() => expect(teamQuota.result.current.loading).toBe(false));
    expect(teamQuota.result.current.quota).toBeNull();

    mockGetBudgetList.mockResolvedValueOnce({
      data: {
        budgetList: [
          {
            budget_limit: "20000",
            budget_type: "recurring_monthly",
            cycle: "Monthly",
            member_id: "member-1",
            used_budget: "5000",
          },
        ],
      },
    });

    const memberQuota = renderHook(() => useUsageQuota(memberScope as any));

    await waitFor(() => expect(memberQuota.result.current.loading).toBe(false));
    expect(memberQuota.result.current.quota).toEqual({
      limit: 2,
      period: "Monthly",
      type: "Recurring",
      used: 0.5,
    });

    mockGetKeyBudgetList.mockResolvedValueOnce([
      {
        budget_limit: "10000",
        budget_type: "one_time",
        cycle: "One cycle",
        key_id: "key-1",
        key_name: "Production",
        used: "2500",
      },
    ]);

    const keyQuota = renderHook(() => useUsageQuota(keyScope as any));

    await waitFor(() => expect(keyQuota.result.current.loading).toBe(false));
    expect(keyQuota.result.current.quota).toEqual({
      limit: 1,
      period: "One cycle",
      type: "One Time",
      used: 0.25,
    });
  });

  it("reports quota load failures", async () => {
    mockGetBudgetList.mockRejectedValueOnce(new Error("quota failed"));

    const { result } = renderHook(() => useUsageQuota(memberScope as any));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({
      error: "Failed to load quota data",
      loading: false,
      quota: null,
    });
  });
});
