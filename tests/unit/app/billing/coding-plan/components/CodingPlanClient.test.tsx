import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CodingPlanClient from "@/app/billing/coding-plan/components/CodingPlanClient";
import {
  cancelSubscription,
  getDailyUsage,
  getDeductionDetail,
  getTopModels,
  resubscribe,
} from "@/api/coding-plan";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (asChild ? <>{children}</> : <button type="button">{children}</button>),
}));

jest.mock("@/app/coding-plan/components/planList", () => ({
  __esModule: true,
  default: ({
    targetUrl,
    showTitle,
  }: {
    targetUrl: string;
    showTitle: boolean;
  }) => (
    <div data-testid="plan-list" data-target-url={targetUrl}>
      showTitle:{String(showTitle)}
    </div>
  ),
}));

jest.mock("@/app/billing/coding-plan/components/CycleUsageCard", () => ({
  __esModule: true,
  default: ({
    data,
    isLoading,
    isRefreshing,
    handleRefresh,
    onCancelSubscription,
    onResubscribe,
  }: any) => (
    <section data-testid="cycle-card">
      <span>loading:{String(isLoading)}</span>
      <span>refreshing:{String(isRefreshing)}</span>
      <span>
        cycle:{data?.used ?? "none"}/{data?.total ?? "none"}
      </span>
      <span>canceled:{String(data?.isCanceled)}</span>
      <button type="button" onClick={handleRefresh}>
        refresh
      </button>
      <button
        type="button"
        onClick={() => onCancelSubscription(data.instanceId)}
      >
        cancel
      </button>
      <button type="button" onClick={() => onResubscribe(data.instanceId)}>
        resubscribe
      </button>
    </section>
  ),
}));

jest.mock("@/app/billing/coding-plan/components/TodayUsageCard", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <section data-testid="today-card">today:{data?.tokens ?? "none"}</section>
  ),
}));

jest.mock("@/app/billing/coding-plan/components/DailyUsageSection", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <section data-testid="daily-section">days:{data.length}</section>
  ),
}));

jest.mock("@/app/billing/coding-plan/components/ModelUsageRanking", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <section data-testid="model-ranking">models:{data.length}</section>
  ),
}));

jest.mock("@/app/billing/coding-plan/components/UsageDetailsTable", () => ({
  __esModule: true,
  default: ({
    data,
    hasNext,
    hasPrev,
    isLoading,
    onNextPage,
    onPrevPage,
  }: any) => (
    <section data-testid="details-table">
      <span>details:{data.length}</span>
      <span>hasNext:{String(hasNext)}</span>
      <span>hasPrev:{String(hasPrev)}</span>
      <span>detailsLoading:{String(isLoading)}</span>
      <button type="button" onClick={onNextPage} disabled={!hasNext}>
        next page
      </button>
      <button type="button" onClick={onPrevPage} disabled={!hasPrev}>
        prev page
      </button>
    </section>
  ),
}));

jest.mock("@/api/coding-plan", () => ({
  getDailyUsage: jest.fn(),
  getTopModels: jest.fn(),
  getDeductionDetail: jest.fn(),
  cancelSubscription: jest.fn(),
  resubscribe: jest.fn(),
  divideBy10000: (value: number | string) => Number(value) / 10000,
  calculateDayOfCycle: jest.fn(() => 5),
  calculateTotalDays: jest.fn(() => 30),
  calculateChangePercent: jest.fn(() => 25),
  fillDailyUsageForCycle: jest.fn((items) =>
    items.map((item: any) => ({
      date: item.timestamp,
      tokens: Number(item.deductAmount) / 10000,
    })),
  ),
  getEmptyDailyUsageForCurrentMonth: jest.fn(() => [
    { date: "empty", tokens: 0 },
  ]),
}));

const mockGetDailyUsage = getDailyUsage as jest.Mock;
const mockGetTopModels = getTopModels as jest.Mock;
const mockGetDeductionDetail = getDeductionDetail as jest.Mock;
const mockCancelSubscription = cancelSubscription as jest.Mock;
const mockResubscribe = resubscribe as jest.Mock;

function dailyUsageResponse(packSummary: Record<string, unknown> | null = {}) {
  return {
    packSummary:
      packSummary === null
        ? null
        : {
            usedQuota: 250000,
            quota: 1000000,
            effectiveTime: "1700000000",
            pkgName: "Pro",
            tier: "Monthly",
            instanceId: "pack-1",
            isCancel: false,
            expiryTime: "1800000000",
            ...packSummary,
          },
    dailyUsageList: [
      { timestamp: "1700000002", deductAmount: 30000 },
      { timestamp: "1700000001", deductAmount: 10000 },
    ],
  };
}

function topModelsResponse() {
  return {
    modelUsageList: [
      { rank: 1, modelName: "llama", tokens: "123" },
      { rank: 2, modelName: "qwen", tokens: "45" },
    ],
  };
}

function detailResponse(overrides: Record<string, unknown> = {}) {
  return {
    detaillist: [
      {
        id: "detail-1",
        reductStartTime: "1700000010",
        reductEndTime: "1700000020",
        productName: "llama",
        deductAmount: 44000,
        inputTokens: "10",
        outputTokens: "20",
        cacheReadTokens: "30",
        cacheWriteTokens: "40",
        cacheWrite1hourTokens: "50",
        inputTokensCoefficient: 10000,
        outputTokensCoefficient: 20000,
        cacheReadTokensCoefficient: 30000,
        cacheWriteTokensCoefficient: 40000,
        cacheWrite1hourTokensCoefficient: 50000,
      },
    ],
    hasNext: true,
    lastId: "cursor-1",
    lastStartTime: "1700000010",
    ...overrides,
  };
}

describe("CodingPlanClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDailyUsage.mockResolvedValue(dailyUsageResponse());
    mockGetTopModels.mockResolvedValue(topModelsResponse());
    mockGetDeductionDetail.mockResolvedValue(detailResponse());
    mockCancelSubscription.mockResolvedValue({});
    mockResubscribe.mockResolvedValue({});
  });

  it("loads and transforms coding plan usage data", async () => {
    render(<CodingPlanClient />);

    expect(screen.getByText("Usage Dashboard")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("cycle-card")).toHaveTextContent(
        "cycle:25/100",
      );
    });
    expect(screen.getByTestId("today-card")).toHaveTextContent("today:3");
    expect(screen.getByTestId("daily-section")).toHaveTextContent("days:2");
    expect(screen.getByTestId("model-ranking")).toHaveTextContent("models:2");
    expect(screen.getByTestId("details-table")).toHaveTextContent("details:1");
    expect(screen.getByTestId("details-table")).toHaveTextContent(
      "hasNext:true",
    );
    expect(mockGetDeductionDetail).toHaveBeenCalledWith({ page: 1, size: 10 });
  });

  it("refreshes after cancel and resubscribe actions", async () => {
    render(<CodingPlanClient />);
    await screen.findByText("cycle:25/100");

    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    await waitFor(() => {
      expect(mockCancelSubscription).toHaveBeenCalledWith("pack-1");
    });
    expect(mockGetDailyUsage).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "resubscribe" }));
    await waitFor(() => {
      expect(mockResubscribe).toHaveBeenCalledWith("pack-1");
    });
    expect(mockGetDailyUsage).toHaveBeenCalledTimes(3);
  });

  it("loads next and previous cursor pages", async () => {
    mockGetDeductionDetail
      .mockResolvedValueOnce(detailResponse())
      .mockResolvedValueOnce(
        detailResponse({
          lastId: "cursor-2",
          lastStartTime: "1700000020",
          hasNext: false,
        }),
      )
      .mockResolvedValueOnce(detailResponse({ hasNext: true }));

    render(<CodingPlanClient />);
    await screen.findByText("cycle:25/100");

    fireEvent.click(screen.getByRole("button", { name: "next page" }));
    await waitFor(() => {
      expect(mockGetDeductionDetail).toHaveBeenCalledWith({
        page: 1,
        size: 10,
        lastId: "cursor-1",
        lastStartTime: "1700000010",
      });
    });
    expect(screen.getByTestId("details-table")).toHaveTextContent(
      "hasPrev:true",
    );

    fireEvent.click(screen.getByRole("button", { name: "prev page" }));
    await waitFor(() => {
      expect(mockGetDeductionDetail).toHaveBeenLastCalledWith({
        page: 1,
        size: 10,
      });
    });
  });

  it("shows the plan chooser when no active pack exists", async () => {
    mockGetDailyUsage.mockResolvedValue(dailyUsageResponse(null));

    render(<CodingPlanClient />);

    await screen.findByText("Choose your plan");
    expect(screen.getByTestId("plan-list")).toHaveAttribute(
      "data-target-url",
      `${process.env.NEXT_PUBLIC_SITE_URL}/billing/coding-plan`,
    );
    expect(
      screen.getByRole("link", { name: "View all details" }),
    ).toHaveAttribute("href", "/coding-plan");
  });
});
