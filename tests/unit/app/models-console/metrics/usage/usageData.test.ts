import {
  EMPTY_USAGE_METRICS,
  TEAM_SCOPE,
  buildKeyRanksQuery,
  buildModelRanksQuery,
  buildUsageQuery,
  formatBucketLabel,
  formatCurrency,
  formatUsageNumber,
  isTodayRange,
  toUsageCostAmount,
  toUsageNumber,
  transformCostTrend,
  transformKeyRanks,
  transformModelRanks,
  transformScopes,
  transformSummary,
} from "@/app/models-console/metrics/usage/usageData";

describe("model console usage data helpers", () => {
  it("normalizes numeric usage values and display formatting", () => {
    expect(isTodayRange("today")).toBe(true);
    expect(isTodayRange("7d")).toBe(false);
    expect(toUsageNumber("12")).toBe(12);
    expect(toUsageNumber("bad")).toBe(0);
    expect(toUsageCostAmount("12345")).toBe(1.2345);
    expect(toUsageCostAmount("bad")).toBe(0);
    expect(formatUsageNumber(1_500_000_000)).toBe("1.5B");
    expect(formatUsageNumber(1_500_000)).toBe("1.5M");
    expect(formatUsageNumber(1_500)).toBe("1.5K");
    expect(formatUsageNumber(42)).toBe("42");
    expect(formatCurrency(1.23456)).toBe("$1.2346");
    expect(formatCurrency(1.2, "EUR")).toBe("EUR 1.2000");
  });

  it("formats bucket labels for unix timestamps and invalid values", () => {
    expect(formatBucketLabel("1704067200", "day")).toBe("Jan 1");
    expect(formatBucketLabel("1704067200000", "hour")).toBe("00:00");
    expect(formatBucketLabel("not-a-date", "day")).toBe("not-a-date");
    expect(formatBucketLabel()).toBe("");
  });

  it("builds usage and sorted rank queries", () => {
    expect(
      buildUsageQuery(
        { type: "team", memberId: null, keyId: null, label: "Team" },
        "7d",
        "",
        "",
      ),
    ).toEqual({
      "scope.scopeType": 1,
      "time.timePreset": 2,
    });

    const customQuery = buildUsageQuery(
      {
        type: "key",
        memberId: "member-1",
        keyId: "key-1",
        label: "Key",
      },
      "custom",
      "2026-01-01",
      "2026-01-02",
    );
    expect(customQuery).toMatchObject({
      "scope.scopeType": 3,
      "scope.keyId": "key-1",
      "time.timePreset": 5,
      "time.startTime": "1767225600",
      "time.endTime": "1767398399",
    });

    expect(
      buildModelRanksQuery(customQuery, {
        column: "cost",
        direction: "desc",
      }),
    ).toMatchObject({
      "sort.direction": 2,
      "sort.field": 1,
    });

    expect(
      buildKeyRanksQuery(customQuery, {
        column: "totalTokens",
        direction: "asc",
      }),
    ).toMatchObject({
      "sort.direction": 1,
      "sort.field": 6,
    });
  });

  it("transforms scope responses into team/member/key hierarchy", () => {
    expect(transformScopes()).toEqual({
      team: TEAM_SCOPE,
      members: [],
    });

    expect(
      transformScopes([
        {
          type: "USAGE_SCOPE_TYPE_TEAM",
          memberName: "Workspace",
          keyCount: 3,
        },
        {
          type: "USAGE_SCOPE_TYPE_MEMBER",
          memberId: "member-1",
          memberName: "Alice",
          keyCount: 2,
        },
        {
          type: "USAGE_SCOPE_TYPE_KEY",
          memberId: "member-1",
          memberName: "Alice",
          keyId: "key-1",
          keyName: "Production",
          keyMask: "sk-***",
        },
        {
          type: "USAGE_SCOPE_TYPE_KEY",
          memberId: "member-2",
          memberName: "Bob",
          keyId: "key-2",
        },
      ] as any),
    ).toEqual({
      team: {
        type: "team",
        memberId: null,
        memberName: "Workspace",
        keyId: null,
        label: "Workspace",
        keyCount: 3,
      },
      members: [
        {
          type: "member",
          memberId: "member-1",
          memberName: "Alice",
          keyId: null,
          label: "Alice",
          keyCount: 2,
          keys: [
            {
              type: "key",
              memberId: "member-1",
              memberName: "Alice",
              keyId: "key-1",
              keyName: "Production",
              keyMask: "sk-***",
              label: "Production",
            },
          ],
        },
        {
          type: "member",
          memberId: "member-2",
          memberName: "Bob",
          keyId: null,
          label: "Bob",
          keys: [
            {
              type: "key",
              memberId: "member-2",
              memberName: "Bob",
              keyId: "key-2",
              label: "key-2",
            },
          ],
        },
      ],
    });
  });

  it("transforms summary and cost trend responses", () => {
    expect(transformSummary()).toEqual(EMPTY_USAGE_METRICS);
    expect(
      transformSummary({
        totalRequests: "10",
        inputTokens: "20",
        cacheTokens: "30",
        outputTokens: "40",
      } as any),
    ).toEqual({
      requests: 10,
      inputTokens: 20,
      cacheTokens: 30,
      outputTokens: 40,
    });

    expect(
      transformCostTrend(
        {
          meta: { granularity: "day" },
          points: [
            {
              bucketStartTime: "1767225600",
              othersCost: "5000",
              models: [
                {
                  modelId: "model-a",
                  modelName: "Model A",
                  cost: "10000",
                },
              ],
            },
            {
              bucketStartTime: "1767312000",
              othersCost: "0",
              models: [
                {
                  modelId: "model-a",
                  modelName: "Model A",
                  cost: "20000",
                },
                {
                  modelId: "model-b",
                  modelName: "Model B",
                  cost: "30000",
                },
              ],
            },
          ],
        } as any,
        { start: "2026-01-01", end: "2026-01-02" },
      ),
    ).toEqual({
      labels: ["Jan 1", "Jan 2"],
      datasets: [
        {
          id: "model-a",
          name: "Model A",
          color: "#F44336",
          data: [1, 2],
        },
        {
          id: "model-b",
          name: "Model B",
          color: "#2196F3",
          data: [0, 3],
        },
        {
          id: "others",
          name: "Others",
          color: "#E7E6E2",
          data: [0.5, 0],
        },
      ],
    });
  });

  it("transforms model and key rank responses", () => {
    expect(
      transformModelRanks({
        models: [
          {
            modelId: "model-a",
            modelName: "Model A",
            requests: "10",
            inputTokens: "20",
            cacheTokens: "30",
            outputTokens: "40",
            cost: "12345",
          },
        ],
      } as any),
    ).toEqual([
      {
        id: "model-a",
        model: "Model A",
        requests: 10,
        inputTokens: 20,
        cacheTokens: 30,
        outputTokens: 40,
        cost: 1.2345,
      },
    ]);

    expect(
      transformKeyRanks({
        keys: [
          {
            keyId: "key-1",
            keyName: "Production",
            keyMask: "sk-***",
            memberId: "member-1",
            memberName: "Alice",
            requests: "10",
            totalTokens: "90",
            cost: "10000",
          },
        ],
      } as any),
    ).toEqual([
      {
        id: "key-1",
        name: "Production",
        mask: "sk-***",
        memberId: "member-1",
        member: "Alice",
        requests: 10,
        totalTokens: 90,
        cost: 1,
      },
    ]);
  });
});
