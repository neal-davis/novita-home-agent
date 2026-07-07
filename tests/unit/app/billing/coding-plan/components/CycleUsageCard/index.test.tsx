import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CycleUsageCard from "@/app/billing/coding-plan/components/CycleUsageCard/index";
import type { CycleUsage } from "@/app/billing/coding-plan/types";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

const baseData: CycleUsage = {
  used: 5_000_000,
  total: 10_000_000,
  dayOfCycle: 5,
  totalDays: 30,
  packageName: "Pro Plan",
  instanceId: "inst-1",
  isCanceled: false,
  expiryTime: "1700000000",
};

describe("CycleUsageCard", () => {
  it("renders a loading skeleton when isLoading", () => {
    const { container } = render(
      <CycleUsageCard
        data={null}
        isLoading
        isRefreshing={false}
        handleRefresh={jest.fn()}
      />,
    );
    // skeleton card renders without any usage text
    expect(screen.queryByText("Cycle usage")).not.toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders nothing when not loading and no data", () => {
    const { container } = render(
      <CycleUsageCard
        data={null}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders usage, package name, percentage and day-of-cycle", () => {
    render(
      <CycleUsageCard
        data={baseData}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={jest.fn()}
      />,
    );
    expect(screen.getByText("Cycle usage")).toBeInTheDocument();
    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    expect(screen.getByText("5.0M")).toBeInTheDocument();
    expect(screen.getByText("/ 10.0M tokens")).toBeInTheDocument();
    expect(screen.getByText("Day 5 of 30")).toBeInTheDocument();
    expect(screen.getByText("50.0% Used")).toBeInTheDocument();
    // safe status -> no Notice/Warning label
    expect(screen.queryByText("Warning")).not.toBeInTheDocument();
  });

  it("shows a Warning label when usage is at/over 90%", () => {
    render(
      <CycleUsageCard
        data={{ ...baseData, used: 9_500_000, total: 10_000_000 }}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={jest.fn()}
      />,
    );
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("invokes handleRefresh when the refresh button is clicked", () => {
    const handleRefresh = jest.fn();
    render(
      <CycleUsageCard
        data={baseData}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={handleRefresh}
      />,
    );
    // refresh is the only button with no text - find via the cancel control set
    const buttons = screen.getAllByRole("button");
    // The refresh button is icon-only; click each and ensure refresh fires.
    fireEvent.click(buttons[buttons.length - 1]);
    expect(handleRefresh).toHaveBeenCalled();
  });

  it("opens the cancel dialog and confirms cancellation", async () => {
    const onCancel = jest.fn().mockResolvedValue(undefined);
    render(
      <CycleUsageCard
        data={baseData}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={jest.fn()}
        onCancelSubscription={onCancel}
      />,
    );
    fireEvent.click(screen.getByText("Cancel Subscription"));
    expect(
      screen.getByText("Cancel Pro Plan auto-renewal"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith("inst-1");
    });
  });

  it("shows resubscribe control and calls onResubscribe when canceled", async () => {
    const onResubscribe = jest.fn().mockResolvedValue(undefined);
    render(
      <CycleUsageCard
        data={{ ...baseData, isCanceled: true }}
        isLoading={false}
        isRefreshing={false}
        handleRefresh={jest.fn()}
        onResubscribe={onResubscribe}
      />,
    );
    expect(screen.getByText("Restart auto-renewal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Restart auto-renewal"));
    await waitFor(() => {
      expect(onResubscribe).toHaveBeenCalledWith("inst-1");
    });
  });
});
