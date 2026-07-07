import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface VoucherItem {
  id: string;
  name: string;
  status: "valid" | "used" | "expired";
  effectDate: string;
  expiryDate: string;
  balance: number;
  originalValue: number;
  businessTypes: string[];
}

export const ProductMap: Record<string, string> = {
  model_api: "Model API",
  all: "All Products",
  gpu_instance: "GPU Instance",
  serverless: "Serverless",
  cloud_sandbox: "Agent Sandbox",
};

export function formatUnix(unix: string): string {
  return unix
    ? dayjs.unix(Number(unix)).utc().format("YYYY/MM/DD HH:mm:ss")
    : "-";
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from current UTC time until unix expiry (rounded up). */
export function daysLeftFromUnix(unix: string): number {
  if (!unix) return 0;
  const diffMs = dayjs.unix(Number(unix)).utc().diff(dayjs.utc());
  return Math.ceil(diffMs / MS_PER_DAY);
}

/** True when unix expiry is before current UTC time. */
export function isExpiredUnix(unix: string): boolean {
  if (!unix) return true;
  return dayjs.unix(Number(unix)).utc().isBefore(dayjs.utc());
}

export function formatBusinessTypes(types: string[]): string {
  return types.map((t) => ProductMap[t] || t).join(", ");
}
