export type UsageTimeRange = "today" | "7d" | "30d" | "custom";

export type UsageRole = "admin" | "member";

export type UsageScopeType = "team" | "member" | "key";

export type UsageScopeState = {
  type: UsageScopeType;
  memberId: string | null;
  memberName?: string;
  keyId: string | null;
  keyName?: string;
  keyMask?: string;
  label: string;
  keyCount?: number;
};

export type UsageSortDirection = "asc" | "desc";

export type UsageSortState<T extends string> = {
  column: T;
  direction: UsageSortDirection;
};

export type UsageCostDataset = {
  id: string;
  name: string;
  color: string;
  data: number[];
};

export type UsageRequestDataset = {
  label: string;
  color: string;
  data: number[];
};

export type UsageMetrics = {
  requests: number;
  inputTokens: number;
  cacheTokens: number;
  outputTokens: number;
};

export type UsageModelBreakdown = {
  id: string;
  model: string;
  requests: number;
  inputTokens: number;
  cacheTokens: number;
  outputTokens: number;
  cost: number;
};

export type UsageKeyBreakdown = {
  id: string;
  name: string;
  mask: string;
  memberId: string;
  member: string;
  requests: number;
  totalTokens: number;
  cost: number;
};

export type UsageBudgetType = "Recurring" | "One Time" | "Unlimited";

export type UsageBudget = {
  type: UsageBudgetType;
  limit: number | null;
  used: number;
  period: string | null;
};

export type UsageTooltipLine =
  | string
  | {
      label: string;
      value?: string;
      detail?: string;
      color?: string;
      emphasized?: boolean;
    };

export type UsageTooltip = {
  x: number;
  y: number;
  title?: string;
  lines: UsageTooltipLine[];
} | null;

export type UsageScopeOption = {
  team: UsageScopeState;
  members: Array<
    UsageScopeState & {
      keys: UsageScopeState[];
    }
  >;
};
