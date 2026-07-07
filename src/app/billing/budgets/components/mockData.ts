// Mock data for development - TODO: Remove in production
export const USE_MOCK_DATA = false;

export interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  budget: number;
  used: number;
  budget_type: string; // "Unlimited" | "One-time" | "Recurring"
  nextReset?: string;
}

export interface MockBudget {
  id: string;
  member: string;
  phone?: string;
  role: string;
  remarkName: string;
  status: string;
  budgetLimit: number;
  used: number;
  remaining: number;
  nextReset: string;
  budgetType: string;
  apiKeys?: ApiKey[];
}

export const mockBudgets: MockBudget[] = [
  {
    id: "1",
    member: "admin@example.com",
    phone: "13800138000",
    role: "owner",
    remarkName: "Admin User",
    status: "Active",
    budgetLimit: 0,
    used: 1250.5,
    remaining: 0,
    nextReset: "",
    budgetType: "Unlimited",
    apiKeys: [
      {
        id: "key-1",
        name: "Production API Key",
        createdAt: "2024-01-15",
        budget: 500,
        used: 320.25,
        budget_type: "Recurring",
        nextReset: "2026-04-01",
      },
      {
        id: "key-2",
        name: "Development API Key",
        createdAt: "2024-02-20",
        budget: 0,
        used: 45.8,
        budget_type: "Unlimited",
      },
    ],
  },
  {
    id: "2",
    member: "developer@example.com",
    phone: "13900139000",
    role: "developer",
    remarkName: "Dev User",
    status: "Active",
    budgetLimit: 1000,
    used: 650.75,
    remaining: 349.25,
    nextReset: "2026-04-01",
    budgetType: "Recurring",
    apiKeys: [
      {
        id: "key-3",
        name: "Test API Key",
        createdAt: "2024-03-10",
        budget: 200,
        used: 150.5,
        budget_type: "One-time",
      },
    ],
  },
  {
    id: "3",
    member: "billing@example.com",
    role: "billing",
    remarkName: "Billing Manager",
    status: "Invite Pending",
    budgetLimit: 2000,
    used: 1800,
    remaining: 200,
    nextReset: "",
    budgetType: "One-time",
  },
  {
    id: "4",
    member: "basic@example.com",
    phone: "13700137000",
    role: "basic",
    remarkName: "",
    status: "Left Team",
    budgetLimit: 500,
    used: 500,
    remaining: 0,
    nextReset: "2026-04-01",
    budgetType: "Recurring",
    apiKeys: [
      {
        id: "key-4",
        name: "Backup Key",
        createdAt: "2024-01-05",
        budget: 100,
        used: 100,
        budget_type: "One-time",
      },
      {
        id: "key-5",
        name: "Secondary Key",
        createdAt: "2024-02-15",
        budget: 0,
        used: 25.3,
        budget_type: "Unlimited",
      },
    ],
  },
  {
    id: "5",
    member: "canceled@example.com",
    phone: "13600136000",
    role: "developer",
    remarkName: "Canceled User",
    status: "Invite Canceled",
    budgetLimit: 300,
    used: 0,
    remaining: 300,
    nextReset: "",
    budgetType: "One-time",
  },
  {
    id: "6",
    member: "expired@example.com",
    role: "basic",
    remarkName: "Expired Invite",
    status: "Invite Expired",
    budgetLimit: 200,
    used: 0,
    remaining: 200,
    nextReset: "2026-04-01",
    budgetType: "Recurring",
  },
];

// Budget type options
export const BUDGET_TYPES = {
  UNLIMITED: "Unlimited",
  FIXED: "One-time",
  MONTHLY: "Recurring",
} as const;

// Frontend display labels
const BUDGET_TYPE_LABELS: Record<string, string> = {
  [BUDGET_TYPES.UNLIMITED]: "Unlimited",
  [BUDGET_TYPES.FIXED]: "One-time",
  [BUDGET_TYPES.MONTHLY]: "Recurring (Monthly)",
};

// Budget type descriptions for tooltip
export const BUDGET_TYPE_DESCRIPTIONS: Record<string, string> = {
  [BUDGET_TYPES.UNLIMITED]:
    "No spending limit. Members can use resources without restriction.",
  [BUDGET_TYPES.FIXED]:
    "Set a total spending limit that does not reset automatically.",
  [BUDGET_TYPES.MONTHLY]:
    "Set a monthly spending limit that resets at the start of each calendar month.",
};
