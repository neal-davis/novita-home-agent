import { fireEvent, render, screen } from "@testing-library/react";
import UsageDetailsTable from "@/app/billing/coding-plan/components/UsageDetailsTable/index";
import type { UsageDetail } from "@/app/billing/coding-plan/types";

jest.mock("@/api/coding-plan", () => ({
  formatTimestamp: (t: string) => `T(${t})`,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: ({ title }: any) => <div>{title}</div>,
}));

// Stub the tooltip children to keep assertions focused on the table itself.
jest.mock(
  "@/app/billing/coding-plan/components/UsageDetailsTable/RawUsageTooltip",
  () => ({ __esModule: true, default: () => <span>raw</span> }),
);
jest.mock(
  "@/app/billing/coding-plan/components/UsageDetailsTable/BillingMultiplierTooltip",
  () => ({ __esModule: true, default: () => <span>multiplier</span> }),
);
jest.mock(
  "@/app/billing/coding-plan/components/UsageDetailsTable/BilledTokensTooltip",
  () => ({ __esModule: true, default: () => <span>billed</span> }),
);

const makeRow = (id: string): UsageDetail => ({
  id,
  startTime: "100",
  endTime: "200",
  modelId: `model-${id}`,
  deductAmount: 1000,
  rawUsage: {
    inputTokens: 1,
    outputTokens: 2,
    cacheReadTokens: 3,
    cacheWriteTokens: 4,
    cacheWrite1hourTokens: 5,
  },
  billingMultiplier: {
    input: 1,
    output: 1,
    cacheRead: 1,
    cacheWrite: 1,
    cacheWrite1hour: 1,
  },
});

describe("UsageDetailsTable", () => {
  const noop = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders the empty state when there is no data and not loading", () => {
    render(
      <UsageDetailsTable
        data={[]}
        hasNext={false}
        hasPrev={false}
        onNextPage={noop}
        onPrevPage={noop}
      />,
    );
    expect(screen.getByText("No usage data")).toBeInTheDocument();
  });

  it("renders rows with formatted time range and model id", () => {
    render(
      <UsageDetailsTable
        data={[makeRow("1")]}
        hasNext={false}
        hasPrev={false}
        onNextPage={noop}
        onPrevPage={noop}
      />,
    );
    expect(screen.getByText("T(100) ~ T(200)")).toBeInTheDocument();
    expect(screen.getByText("model-1")).toBeInTheDocument();
    expect(screen.getByText("raw")).toBeInTheDocument();
    expect(screen.getByText("multiplier")).toBeInTheDocument();
    expect(screen.getByText("billed")).toBeInTheDocument();
  });

  it("shows pagination controls and triggers callbacks", () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    render(
      <UsageDetailsTable
        data={[makeRow("1")]}
        hasNext
        hasPrev
        onNextPage={onNext}
        onPrevPage={onPrev}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Previous"));
    expect(onNext).toHaveBeenCalled();
    expect(onPrev).toHaveBeenCalled();
  });

  it("disables paging buttons when there is no next/prev", () => {
    render(
      <UsageDetailsTable
        data={[makeRow("1")]}
        hasNext={false}
        hasPrev
        onNextPage={noop}
        onPrevPage={noop}
      />,
    );
    expect(screen.getByText("Next").closest("button")).toBeDisabled();
    expect(screen.getByText("Previous").closest("button")).toBeEnabled();
  });
});
