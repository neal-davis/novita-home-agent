// Cycle usage data
export interface CycleUsage {
  used: number;
  total: number;
  dayOfCycle: number;
  totalDays: number;
  packageName: string;
  instanceId: string;
  isCanceled: boolean;
  expiryTime: string; // Unix timestamp in seconds
}

// Today's usage data
export interface TodayUsage {
  tokens: number;
  changePercent: number;
}

// Daily usage data point
export interface DailyUsage {
  timestamp: number; // Unix timestamp in seconds (UTC midnight)
  tokens: number;
}

// Model ranking item
export interface ModelRanking {
  rank: number;
  modelId: string;
  tokens: number;
}

// Billing multiplier breakdown
export interface BillingMultiplier {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cacheWrite1hour: number;
}

export interface RawUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  cacheWrite1hourTokens: number;
}

// Usage detail record
export interface UsageDetail {
  id: string;
  startTime: string;
  endTime: string;
  modelId: string;
  deductAmount: number;
  rawUsage: RawUsage;
  billingMultiplier: BillingMultiplier;
}

// Status type for progress indicator
export type UsageStatus = "safe" | "notice" | "warning";

// Helper function to determine status based on usage percentage
export function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 90) return "warning";
  if (percentage >= 70) return "notice";
  return "safe";
}

// Format timestamp to MM-DD date string (UTC)
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}-${day}`;
}

// Format large numbers to human readable format
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) {
    return `${(tokens / 1_000_000_000).toFixed(1)}B`;
  }
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}
