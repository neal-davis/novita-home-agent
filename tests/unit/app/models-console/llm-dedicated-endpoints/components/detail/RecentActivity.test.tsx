import { render, screen, fireEvent } from "@testing-library/react";
import RecentActivity from "@/app/models-console/llm-dedicated-endpoints/components/detail/RecentActivity";

jest.mock("@/lib/utils/date", () => ({
  formatRelativeTime: () => "2h ago",
}));

function rec(id: number, over: Record<string, unknown> = {}) {
  return {
    id: `r${id}`,
    operationType: "CONFIG",
    title: `Activity ${id}`,
    changes: [],
    createdAt: 1700000000,
    ...over,
  };
}

describe("RecentActivity", () => {
  it("renders loading state", () => {
    const { container } = render(<RecentActivity records={[]} isLoading />);
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<RecentActivity records={[]} isLoading={false} />);
    expect(screen.getByText("No recent activity")).toBeInTheDocument();
  });

  it("renders records with formatted changes and relative time", () => {
    render(
      <RecentActivity
        records={[
          rec(1, { changes: [{ field: "f", oldValue: "a", newValue: "b" }] }),
        ]}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Activity 1")).toBeInTheDocument();
    expect(screen.getByText("f: a → b")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("falls back to title as detail when no changes", () => {
    render(<RecentActivity records={[rec(2)]} isLoading={false} />);
    // title appears in both header and detail position
    expect(screen.getAllByText("Activity 2").length).toBe(2);
  });

  it("View all shows only when records exist and fires callback", () => {
    const onViewAll = jest.fn();
    render(
      <RecentActivity
        records={[rec(1)]}
        isLoading={false}
        onViewAll={onViewAll}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "View all" }));
    expect(onViewAll).toHaveBeenCalled();
  });

  it("hides View all when no records", () => {
    render(
      <RecentActivity records={[]} isLoading={false} onViewAll={jest.fn()} />,
    );
    expect(
      screen.queryByRole("button", { name: "View all" }),
    ).not.toBeInTheDocument();
  });
});
