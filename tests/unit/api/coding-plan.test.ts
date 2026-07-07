jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { TEST_SERVICE_BASE_URL, withEnv } from "../helpers/env";
import { request } from "@/api/api";
import {
  calculateChangePercent,
  calculateDayOfCycle,
  calculateTotalDays,
  cancelSubscription,
  divideBy10000,
  fillDailyUsageForCycle,
  formatCoefficient,
  formatTimestamp,
  formatTimestampForChart,
  getBasicModelList,
  getBasicResourcePackSpecsList,
  getCurrentCycleEnd,
  getCurrentCycleStart,
  getDailyUsage,
  getDeductionDetail,
  getEmptyDailyUsageForCurrentMonth,
  getResourcePackInviteConfig,
  getResourcePackInviteInfo,
  getResourcePackOrderList,
  getResourcePackSpecsList,
  getResourcePackUserList,
  getTopModels,
  purchaseResourcePack,
  purchaseResourcePackByBalance,
  resetMockCache,
  resubscribe,
  upgradeResourcePack,
} from "@/api/coding-plan";

const mockRequest = request as jest.Mock;
const mockFetch = global.fetch as jest.Mock;
let mockConsoleError: jest.SpyInstance;

function jsonFetchResponse(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("coding plan API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    mockRequest.mockResolvedValue({});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  it("fetches basic resource pack specs and normalizes malformed responses", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(jsonFetchResponse({ list: [{ id: 1 }] }));

      await expect(getBasicResourcePackSpecsList()).resolves.toEqual([
        { id: 1 },
      ]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVICE_BASE_URL}/v1/product/resource-pack-specs/list`,
        expect.objectContaining({
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          next: { revalidate: 60 },
        }),
      );

      mockFetch.mockResolvedValueOnce(jsonFetchResponse({ list: null }));
      await expect(getBasicResourcePackSpecsList()).resolves.toEqual([]);

      mockFetch.mockRejectedValueOnce(new Error("network"));
      await expect(getBasicResourcePackSpecsList()).resolves.toEqual([]);
    });
  });

  it("fetches the basic model list and normalizes malformed responses", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(
        jsonFetchResponse({ data: [{ name: "m1" }] }),
      );

      await expect(getBasicModelList()).resolves.toEqual([{ name: "m1" }]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVICE_BASE_URL}/v1/product/model/list`,
        expect.objectContaining({
          cache: "no-store",
          mode: "cors",
        }),
      );

      mockFetch.mockResolvedValueOnce(jsonFetchResponse({ data: {} }));
      await expect(getBasicModelList()).resolves.toEqual([]);
    });
  });

  it("builds resource pack listing, purchase and upgrade requests", () => {
    const signal = new AbortController().signal;

    getResourcePackSpecsList({ tier: "pro" }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      query: { tier: "pro" },
      signal,
      url: "/v1/product/resource-pack-specs/list",
    });

    getResourcePackUserList({ status: 1 }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      query: { status: 1 },
      signal,
      url: "/v1/asset/resource-pack/user/list",
    });

    getResourcePackOrderList({ pkgSpecsIds: ["10", "20"] }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      signal,
      url: "/v3/stripe/subscription/list?packSpecIds=10&packSpecIds=20",
    });

    purchaseResourcePackByBalance({ packSpecId: 10 }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { packSpecId: 10 },
      method: "POST",
      signal,
      url: "/v1/billing/resource-pack/order",
    });

    purchaseResourcePack(
      { packSpecId: 10, returnUrl: "/return", tier: "pro" },
      signal,
    );
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { packSpecId: 10, returnUrl: "/return", tier: "pro" },
      method: "POST",
      signal,
      url: "/v3/stripe/subscription/checkout",
    });

    upgradeResourcePack({
      instanceId: "instance-1",
      newTier: "team",
      returnUrl: "/return",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: {
        instanceId: "instance-1",
        newTier: "team",
        returnUrl: "/return",
      },
      method: "POST",
      url: "/v3/stripe/subscription/upgrade",
    });
  });

  it("builds usage, deduction, subscription and referral requests", () => {
    getDailyUsage();
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      url: "/v1/asset/resource-pack/daily-usage",
    });

    getTopModels();
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      url: "/v1/asset/resource-pack/top-models",
    });

    getDeductionDetail({ instanceId: "rp-1", page: 1, size: 20 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: { instanceId: "rp-1", page: 1, size: 20 },
      url: "/v1/asset/resource-pack/deduction/detail",
    });

    cancelSubscription("sub-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "DELETE",
      url: "/v3/stripe/subscription/sub-1",
    });

    resubscribe("sub-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { instanceId: "sub-1" },
      method: "POST",
      url: "/v3/stripe/subscription/reactivate",
    });

    getResourcePackInviteConfig();
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      url: "/v1/activity/resource-pack/invite-config",
    });

    getResourcePackInviteInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      url: "/v1/activity/resource-pack/invite-info",
    });
  });

  it("resets mock cache without affecting real request mode", () => {
    resetMockCache();

    expect(mockRequest).not.toHaveBeenCalled();
  });
});

describe("coding plan data utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-20T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("formats token units, coefficients and UTC timestamps", () => {
    expect(divideBy10000("5250")).toBe(0.525);
    expect(formatCoefficient("5250")).toBe("0.525");
    expect(formatTimestamp("1704110400")).toBe("Jan 1, 12:00:00");
    expect(formatTimestampForChart("1704110400")).toBe("Jan 1");
  });

  it("calculates the active natural-month cycle from effective time", () => {
    const effectiveTime = "1704412800";

    expect(getCurrentCycleStart(effectiveTime).toISOString()).toBe(
      "2024-06-05T00:00:00.000Z",
    );
    expect(getCurrentCycleEnd(effectiveTime).toISOString()).toBe(
      "2024-07-05T00:00:00.000Z",
    );
    expect(calculateDayOfCycle(effectiveTime)).toBe(16);
    expect(calculateTotalDays(effectiveTime)).toBe(30);
  });

  it("uses the previous month cycle start before the cycle day", () => {
    jest.setSystemTime(new Date("2024-06-03T12:00:00.000Z"));

    expect(getCurrentCycleStart("1704412800").toISOString()).toBe(
      "2024-05-05T00:00:00.000Z",
    );
    expect(calculateTotalDays("1704412800")).toBe(31);
  });

  it("fills missing daily usage entries for the whole cycle", () => {
    const filled = fillDailyUsageForCycle(
      [
        { deductAmount: "20000", timestamp: "1717545600" },
        { deductAmount: "34999", timestamp: "1717718400" },
      ],
      "1704412800",
    );

    expect(filled).toHaveLength(30);
    expect(filled.slice(0, 4)).toEqual([
      { timestamp: 1717545600, tokens: 2 },
      { timestamp: 1717632000, tokens: 0 },
      { timestamp: 1717718400, tokens: 3 },
      { timestamp: 1717804800, tokens: 0 },
    ]);
  });

  it("creates empty current-month usage placeholders", () => {
    jest.setSystemTime(new Date("2024-02-10T12:00:00.000Z"));

    const empty = getEmptyDailyUsageForCurrentMonth();

    expect(empty).toHaveLength(29);
    expect(empty[0]).toEqual({ timestamp: 1706745600, tokens: 0 });
    expect(empty[28]).toEqual({ timestamp: 1709164800, tokens: 0 });
  });

  it("calculates usage change percent from the two newest entries", () => {
    expect(calculateChangePercent([])).toBe(0);
    expect(
      calculateChangePercent([{ deductAmount: "10000", timestamp: "1" }]),
    ).toBe(0);
    expect(
      calculateChangePercent([
        { deductAmount: "10000", timestamp: "2" },
        { deductAmount: "0", timestamp: "1" },
      ]),
    ).toBe(100);
    expect(
      calculateChangePercent([
        { deductAmount: "10000", timestamp: "1" },
        { deductAmount: "30000", timestamp: "2" },
      ]),
    ).toBe(200);
  });
});
