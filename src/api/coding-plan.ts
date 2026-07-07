import { request } from "./api";

export async function getBasicResourcePackSpecsList() {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/resource-pack-specs/list`;
    const result = await fetch(url, {
      mode: "cors",
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const res = await result.json();
    return Array.isArray(res.list) ? res.list : [];
  } catch (error) {
    console.error("Error fetching LLM models:", error);
    return [];
  }
}
export async function getBasicModelList() {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/model/list`;
    const result = await fetch(url, {
      mode: "cors",
      next: { revalidate: 60 },
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const res = await result.json();
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching LLM models:", error);
    return [];
  }
}

export function getResourcePackSpecsList(params?: any, signal?: AbortSignal) {
  return request({
    url: "/v1/product/resource-pack-specs/list",
    query: params,
    signal: signal,
  });
}

// Get current effective resource pack list
export function getResourcePackUserList(params?: any, signal?: AbortSignal) {
  return request({
    url: "/v1/asset/resource-pack/user/list",
    query: params,
    signal: signal,
  });
}

// Query user resource pack order
export function getResourcePackOrderList(params: any, signal?: AbortSignal) {
  return request({
    url:
      "/v3/stripe/subscription/list?" +
      (params.pkgSpecsIds || [])
        .map((id: string) => `packSpecIds=${id}`)
        .join("&"),
    signal: signal,
  });
}

// Purchase resource pack
export function purchaseResourcePackByBalance(
  params: any,
  signal?: AbortSignal,
) {
  return request({
    url: "/v1/billing/resource-pack/order",
    method: "POST",
    data: params,
    signal: signal,
  });
}

// Purchase resource pack
export function purchaseResourcePack(
  params: PurchaseResourcePackRequest,
  signal?: AbortSignal,
) {
  return request({
    url: "/v3/stripe/subscription/checkout",
    method: "POST",
    data: params,
    signal: signal,
  });
}

// Upgrade resource pack
export function upgradeResourcePack(params: UpgradeResourcePackRequest) {
  return request({
    url: "/v3/stripe/subscription/upgrade",
    method: "POST",
    data: {
      ...params,
    },
  });
}

// ============================================
// API Response Types (match backend exactly)
// ============================================

export interface PurchaseResourcePackRequest {
  /**
   * Subscription package ID
   */
  packSpecId: number;
  /**
   * After purchase redirect address
   */
  returnUrl: string;
  /**
   * Subscription level
   */
  tier: string;
  /**
   * After successful purchase redirect address
   */
  successUrl?: string;
  /**
   * After failed purchase redirect address
   */
  failedUrl?: string;
}

export interface UpgradeResourcePackRequest {
  /**
   * Instance ID
   */
  instanceId: string;
  /**
   * Callback address
   */
  returnUrl: string;
  /**
   * Resource pack level
   */
  newTier: string;
  /**
   * After successful purchase redirect address
   */
  successUrl?: string;
  /**
   * After failed purchase redirect address
   */
  failedUrl?: string;
}

export interface ResourcePackTierInfo {
  tier: string;
  quota: string;
  price: string;
  discountPrice: string;
  labelList?: string[];
}

export interface ResourcePackApiItem {
  resoucepkgName: string;
  llmName: string[];
  remainingTokens: string;
  effectiveTime: string;
  expireTime: string;
  buyTime: string;
  status: 1 | 2 | 3;
  pkgSpecId: number;
  billingCycle: "cycle-based" | "decrement-based";
  instanceId: string;
  isCancel: 0 | 1;
  expireReason?: number;
  tokensSize: string;
  tierInfo: ResourcePackTierInfo;
}

export interface ResourcePackListApiResponse {
  respacklist: ResourcePackApiItem[];
}

// ============ Mock Mode Flag ============
// Set to true to use mock data, false to use real API
export const USE_MOCK_DATA = false;
const MOCK_DELAY_MS = 600;

// Helper to add delay for mock responses
const withMockDelay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY_MS));

// ============ API Response Types ============

// /v1/asset/resource-pack/daily-usage
export interface PackSummary {
  instanceId: string;
  pkgName: string;
  tier: string;
  quota: string;
  usedQuota: string;
  effectiveTime: string;
  expiryTime: string;
  billingCycle: string;
  pkgSpecsId: string;
  isCancel: boolean;
}

export interface DailyUsageItem {
  timestamp: string;
  deductAmount: string;
}

export interface DailyUsageResponse {
  packSummary: PackSummary;
  dailyUsageList: DailyUsageItem[];
}

// /v1/asset/resource-pack/top-models
export interface ModelUsageItem {
  rank: number;
  modelName: string;
  tokens: string;
}

export interface TopModelsResponse {
  modelUsageList: ModelUsageItem[];
}

// /v1/asset/resource-pack/deduction/detail
export interface DeductionDetailItem {
  id?: string;
  bizName: string;
  productName: string;
  instanceId: string;
  deductAmount: string;
  beforeQuota: string;
  afterQuota: string;
  billingCycle: "cycle-based" | "decrement-based";
  inputTokens: string;
  outputTokens: string;
  cacheReadTokens: string;
  cacheWriteTokens: string;
  cacheWrite1hourTokens: string;
  inputTokensCoefficient: string;
  outputTokensCoefficient: string;
  cacheReadTokensCoefficient: string;
  cacheWriteTokensCoefficient: string;
  cacheWrite1hourTokensCoefficient: string;
  reductStartTime: string;
  reductEndTime: string;
  tokenSize: string;
}

export interface DeductionDetailResponse {
  detaillist: DeductionDetailItem[];
  hasNext: boolean;
  lastId: number;
  lastStartTime: number;
}

export interface DeductionDetailParams {
  page: number;
  size: number;
  instanceId?: string;
  lastId?: string;
  lastStartTime?: string;
}

// ============ Mock Data Generators ============

function generateMockDailyUsageResponse(): DailyUsageResponse {
  const now = new Date();
  const dayInSeconds = 86400;

  // Use natural month cycle: cycle starts on day 5 of each month
  const mockCycleDay = 5;
  let cycleStart = new Date(now.getFullYear(), now.getMonth(), mockCycleDay);

  // If we haven't reached the cycle day this month, use last month's cycle start
  if (now < cycleStart) {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, mockCycleDay);
  }

  // Next cycle starts on the same day next month
  const cycleEnd = new Date(
    cycleStart.getFullYear(),
    cycleStart.getMonth() + 1,
    cycleStart.getDate(),
  );

  const cycleStartTime = Math.floor(cycleStart.getTime() / 1000);
  const cycleEndTime = Math.floor(cycleEnd.getTime() / 1000);

  // Calculate how many days have passed since cycle start
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysPassed =
    Math.floor(
      (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  // Generate daily usage from cycle start to today
  // Heatmap tiers (after /10000): 0-10Mt, 10-50Mt, >50Mt
  // Before /10000: 0-100B, 100B-500B, >500B
  const dailyUsageList: DailyUsageItem[] = [];
  for (let i = 0; i < daysPassed; i++) {
    const dayStart = cycleStartTime + i * dayInSeconds;

    // Distribute across tiers: ~40% tier1, ~35% tier2, ~25% tier3
    const rand = Math.random();
    let usage: number;
    if (rand < 0.4) {
      // Tier 1: 0-10Mt (0-100B before /10000)
      usage = Math.floor(Math.random() * 100_000_000_000);
    } else if (rand < 0.75) {
      // Tier 2: 10-50Mt (100B-500B before /10000)
      usage = Math.floor(Math.random() * 400_000_000_000) + 100_000_000_000;
    } else {
      // Tier 3: >50Mt (500B-800B before /10000)
      usage = Math.floor(Math.random() * 300_000_000_000) + 500_000_000_000;
    }

    dailyUsageList.push({
      timestamp: String(dayStart),
      deductAmount: String(usage),
    });
  }

  return {
    packSummary: {
      instanceId: "rp-mock-instance-001",
      pkgName: "Coding Plan",
      tier: "Pro",
      quota: "2000000000000", // 200M tokens (after /10000)
      usedQuota: "1250000000000", // 125M tokens used
      effectiveTime: String(cycleStartTime),
      expiryTime: String(cycleEndTime),
      billingCycle: "cycle-based",
      pkgSpecsId: "5",
      isCancel: false,
    },
    dailyUsageList,
  };
}

function generateMockTopModelsResponse(): TopModelsResponse {
  const models = [
    { name: "anthropic/claude-3.5-sonnet", tokens: "452000000000" },
    { name: "openai/gpt-4o", tokens: "321000000000" },
    { name: "anthropic/claude-3-opus", tokens: "185000000000" },
    { name: "openai/gpt-4-turbo", tokens: "123000000000" },
    { name: "anthropic/claude-3-haiku", tokens: "89000000000" },
    { name: "deepseek/deepseek-v3", tokens: "52000000000" },
    { name: "qwen/qwen-2.5-72b", tokens: "28000000000" },
    { name: "meta/llama-3.1-70b", tokens: "15000000000" },
    { name: "mistral/mistral-large", tokens: "8900000000" },
    { name: "google/gemini-1.5-pro", tokens: "4500000000" },
  ];

  return {
    modelUsageList: models.map((model, index) => ({
      rank: index + 1,
      modelName: model.name,
      tokens: model.tokens,
    })),
  };
}

// Store for pagination simulation
let mockDetailCache: DeductionDetailItem[] | null = null;

function generateMockDeductionDetails(count: number): DeductionDetailItem[] {
  const now = Math.floor(Date.now() / 1000);
  const models = [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "anthropic/claude-3-opus",
    "deepseek/deepseek-v3",
    "qwen/qwen-2.5-72b",
    "minimax/minimax-m2",
  ];

  const details: DeductionDetailItem[] = [];
  for (let i = 0; i < count; i++) {
    const startTime = now - i * 300 - Math.floor(Math.random() * 300); // ~5 min intervals
    const endTime = startTime + 300;
    const model = models[Math.floor(Math.random() * models.length)];

    // Random token counts
    const inputTokens = Math.floor(Math.random() * 500) + 50;
    const outputTokens = Math.floor(Math.random() * 300) + 30;
    const cacheReadTokens = Math.floor(Math.random() * 1000);
    const cacheWriteTokens = Math.floor(Math.random() * 200);
    const cacheWrite1hourTokens = Math.floor(Math.random() * 150);

    // Coefficients (will be divided by 10000 in display)
    const inputCoeff = 10000; // 1.0x
    const outputCoeff = 40000; // 4.0x
    const cacheReadCoeff = 1000; // 0.1x
    const cacheWriteCoeff = 12500; // 1.25x
    const cacheWrite1hourCoeff = 5000; // 0.5x

    // Calculate deduct amount (raw * coefficient, then sum)
    const deductAmount =
      inputTokens * inputCoeff +
      outputTokens * outputCoeff +
      cacheReadTokens * cacheReadCoeff +
      cacheWriteTokens * cacheWriteCoeff +
      cacheWrite1hourTokens * cacheWrite1hourCoeff;

    details.push({
      id: String(1000 - i),
      bizName: "Coding Plan",
      productName: model,
      instanceId: "rp-mock-instance-001",
      deductAmount: String(deductAmount),
      beforeQuota: String(2000000000000 - i * 10000000),
      afterQuota: String(2000000000000 - (i + 1) * 10000000),
      billingCycle: "cycle-based",
      inputTokens: String(inputTokens),
      outputTokens: String(outputTokens),
      cacheReadTokens: String(cacheReadTokens),
      cacheWriteTokens: String(cacheWriteTokens),
      cacheWrite1hourTokens: String(cacheWrite1hourTokens),
      reductStartTime: String(startTime),
      reductEndTime: String(endTime),
      inputTokensCoefficient: String(inputCoeff),
      outputTokensCoefficient: String(outputCoeff),
      cacheReadTokensCoefficient: String(cacheReadCoeff),
      cacheWriteTokensCoefficient: String(cacheWriteCoeff),
      cacheWrite1hourTokensCoefficient: String(cacheWrite1hourCoeff),
      tokenSize: "0",
    });
  }

  return details;
}

function getMockDeductionDetailResponse(
  params: DeductionDetailParams,
): DeductionDetailResponse {
  // Generate cache if not exists
  if (!mockDetailCache) {
    mockDetailCache = generateMockDeductionDetails(156); // Total mock records
  }

  const size = params.size || 10;
  let startIndex = 0;

  // Find start index based on cursor
  if (params.lastId && params.lastStartTime) {
    const lastId = Number(params.lastId);
    startIndex = mockDetailCache.findIndex((item) => Number(item.id) < lastId);
    if (startIndex === -1) startIndex = mockDetailCache.length;
  }

  const pageData = mockDetailCache.slice(startIndex, startIndex + size);
  const hasNext = startIndex + size < mockDetailCache.length;

  const lastItem = pageData[pageData.length - 1];

  return {
    detaillist: pageData,
    hasNext,
    lastId: lastItem ? Number(lastItem.id) : 0,
    lastStartTime: lastItem ? Number(lastItem.reductStartTime) : 0,
  };
}

// ============ API Functions ============

export function getDailyUsage(): Promise<DailyUsageResponse> {
  if (USE_MOCK_DATA) {
    return withMockDelay(generateMockDailyUsageResponse());
  }
  return request({
    url: "/v1/asset/resource-pack/daily-usage",
    method: "GET",
  });
}

export function getTopModels(): Promise<TopModelsResponse> {
  if (USE_MOCK_DATA) {
    return withMockDelay(generateMockTopModelsResponse());
  }
  return request({
    url: "/v1/asset/resource-pack/top-models",
    method: "GET",
  });
}

export function getDeductionDetail(
  params: DeductionDetailParams,
): Promise<DeductionDetailResponse> {
  if (USE_MOCK_DATA) {
    return withMockDelay(getMockDeductionDetailResponse(params));
  }
  return request({
    url: "/v1/asset/resource-pack/deduction/detail",
    method: "GET",
    query: params,
  });
}

// Reset mock cache (useful for testing refresh)
export function resetMockCache(): void {
  mockDetailCache = null;
}

// ============ Data Transformation Utilities ============

const COEFFICIENT_DIVISOR = 10000;

/**
 * Divides a string number by 10000 for display
 */
export function divideBy10000(value: string): number {
  return Number(value) / COEFFICIENT_DIVISOR;
}

/**
 * Formats a coefficient for display (e.g., "5250" -> "0.5250x")
 */
export function formatCoefficient(value: string): string {
  const num = divideBy10000(value);
  return num.toString();
}

/**
 * Converts Unix timestamp (seconds) to formatted date string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

/**
 * Cancel subscription for a resource pack (Stripe)
 * @param instanceId - Resource pack instance ID
 */
export function cancelSubscription(instanceId: string): Promise<void> {
  return request({
    url: `/v3/stripe/subscription/${instanceId}`,
    method: "DELETE",
  });
}
/**
 * Converts Unix timestamp (seconds) to date string for chart (e.g., "Feb 5")
 */
export function formatTimestampForChart(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Reactivate subscription for a resource pack (Stripe)
 * @param instanceId - Resource pack instance ID
 */
export function resubscribe(instanceId: string): Promise<void> {
  return request({
    url: "/v3/stripe/subscription/reactivate",
    method: "POST",
    data: {
      instanceId,
    },
  });
}

/**
 * Get resource pack invite configuration
 */
export function getResourcePackInviteConfig(): Promise<{
  percent: number;
}> {
  return request({
    url: "/v1/activity/resource-pack/invite-config",
    method: "GET",
  });
}

/**
 * Get resource pack referral invitation code
 */
export function getResourcePackInviteInfo(): Promise<{
  inviteCode: string;
}> {
  return request({
    url: "/v1/activity/resource-pack/invite-info",
    method: "GET",
  });
}
/**
 * Gets the current cycle's start date based on natural month rules
 * The cycle starts on the same day of month as effectiveTime
 */
export function getCurrentCycleStart(effectiveTime: string): Date {
  const effectiveDate = new Date(Number(effectiveTime) * 1000);
  const cycleDay = effectiveDate.getUTCDate(); // Day of month when cycle starts (UTC)
  const now = new Date();

  // Start with current month's cycle start (UTC)
  let cycleStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), cycleDay),
  );

  // If we haven't reached the cycle day this month, use last month's cycle start
  if (now < cycleStart) {
    cycleStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, cycleDay),
    );
  }

  return cycleStart;
}

/**
 * Gets the current cycle's end date (start of next cycle)
 */
export function getCurrentCycleEnd(effectiveTime: string): Date {
  const cycleStart = getCurrentCycleStart(effectiveTime);
  // Next cycle starts on the same day next month (UTC)
  return new Date(
    Date.UTC(
      cycleStart.getUTCFullYear(),
      cycleStart.getUTCMonth() + 1,
      cycleStart.getUTCDate(),
    ),
  );
}

/**
 * Calculates the day of cycle based on effective time and current time
 */
export function calculateDayOfCycle(effectiveTime: string): number {
  const cycleStart = getCurrentCycleStart(effectiveTime);
  // Use UTC midnight for consistent day calculation
  const now = new Date();
  const nowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const cycleStartUTC = Date.UTC(
    cycleStart.getUTCFullYear(),
    cycleStart.getUTCMonth(),
    cycleStart.getUTCDate(),
  );
  const diffTime = nowUTC - cycleStartUTC;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1 is the first day
}

/**
 * Calculates total days in current cycle (natural month)
 */
export function calculateTotalDays(effectiveTime: string): number {
  const cycleStart = getCurrentCycleStart(effectiveTime);
  const cycleEnd = getCurrentCycleEnd(effectiveTime);
  // Both cycleStart and cycleEnd are already UTC dates
  const diffTime = cycleEnd.getTime() - cycleStart.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Fills in missing days in daily usage list for the current cycle
 * Days without data get tokens = 0 (including future days until cycle end)
 * Returns timestamp as Unix seconds (UTC midnight of each day)
 */
export function fillDailyUsageForCycle(
  dailyUsageList: DailyUsageItem[],
  effectiveTime: string,
): { timestamp: number; tokens: number }[] {
  const cycleStart = getCurrentCycleStart(effectiveTime);
  const cycleEnd = getCurrentCycleEnd(effectiveTime);
  // cycleEnd is the start of next cycle, so we need to go up to the day before
  const lastDayOfCycle = new Date(cycleEnd);
  lastDayOfCycle.setUTCDate(lastDayOfCycle.getUTCDate() - 1);

  // Create a map of existing data by date string (UTC)
  const usageMap = new Map<string, number>();
  dailyUsageList.forEach((item) => {
    const date = new Date(Number(item.timestamp) * 1000);
    const dateStr = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
    usageMap.set(dateStr, Math.round(divideBy10000(item.deductAmount)));
  });

  // Generate all days from cycle start to cycle end (UTC)
  const result: { timestamp: number; tokens: number }[] = [];
  const currentDate = new Date(cycleStart);

  while (currentDate <= lastDayOfCycle) {
    const dateStr = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}-${currentDate.getUTCDate()}`;

    result.push({
      timestamp: Math.floor(currentDate.getTime() / 1000),
      tokens: usageMap.get(dateStr) || 0,
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return result;
}

/**
 * Generates empty daily usage data for the current month
 * Used as placeholder before API data is loaded
 * Returns timestamp as Unix seconds (UTC midnight of each day)
 */
export function getEmptyDailyUsageForCurrentMonth(): {
  timestamp: number;
  tokens: number;
}[] {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  // Get the number of days in current month (UTC)
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const result: { timestamp: number; tokens: number }[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month, day));
    result.push({
      timestamp: Math.floor(date.getTime() / 1000),
      tokens: 0,
    });
  }

  return result;
}

/**
 * Calculates change percent between today and yesterday usage
 * Returns 0 if it's the first day of the cycle
 */
export function calculateChangePercent(
  dailyUsageList: DailyUsageItem[],
): number {
  if (dailyUsageList.length < 2) {
    return 0;
  }

  // Sort by timestamp descending (most recent first)
  const sorted = [...dailyUsageList].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const todayUsage = divideBy10000(sorted[0].deductAmount);
  const yesterdayUsage = divideBy10000(sorted[1].deductAmount);

  if (yesterdayUsage === 0) {
    return todayUsage > 0 ? 100 : 0;
  }

  return ((todayUsage - yesterdayUsage) / yesterdayUsage) * 100;
}
