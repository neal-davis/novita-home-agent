import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import ChangeHistory from "@/app/models-console/llm-dedicated-endpoints/components/detail/ChangeHistory";

function rec(id: number, over: Record<string, unknown> = {}) {
  return {
    id: `r${id}`,
    operationType: "CONFIG",
    title: `Change ${id}`,
    changes: [],
    createdAt: 1700000000, // seconds
    userName: "alice",
    ...over,
  };
}

describe("ChangeHistory", () => {
  it("renders loading spinner state", () => {
    const { container } = render(
      <ChangeHistory
        records={[]}
        total={0}
        isLoading
        isLoadingMore={false}
        onLoadMore={jest.fn()}
      />,
    );
    expect(screen.getByText("Change History")).toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <ChangeHistory
        records={[]}
        total={0}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={jest.fn()}
      />,
    );
    expect(screen.getByText("No change history yet")).toBeInTheDocument();
  });

  it("renders records with title and author, formatting changes when present", () => {
    render(
      <ChangeHistory
        records={[
          rec(1, {
            changes: [{ field: "minReplicas", oldValue: 1, newValue: 2 }],
          }),
        ]}
        total={1}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={jest.fn()}
      />,
    );
    expect(screen.getByText("Change 1")).toBeInTheDocument();
    expect(screen.getByText("minReplicas: 1 → 2")).toBeInTheDocument();
    expect(screen.getByText("by alice")).toBeInTheDocument();
  });

  it("limits to PAGE_SIZE(5) and shows 'Show all' toggle", () => {
    const records = Array.from({ length: 7 }, (_, i) => rec(i));
    render(
      <ChangeHistory
        records={records}
        total={7}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={jest.fn()}
      />,
    );
    expect(screen.getByText("Show all (7 records)")).toBeInTheDocument();
    expect(screen.getAllByText("Change 0").length).toBeGreaterThan(0);
    expect(screen.queryByText("Change 6")).not.toBeInTheDocument();
  });

  it("expanding calls onLoadMore when records incomplete and reveals more", async () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const records = Array.from({ length: 6 }, (_, i) => rec(i));
    render(
      <ChangeHistory
        records={records}
        total={10}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={onLoadMore}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Show all (10 records)"));
    });
    expect(onLoadMore).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByText("Show less")).toBeInTheDocument(),
    );
  });

  it("does not call onLoadMore when all records already loaded", async () => {
    const onLoadMore = jest.fn().mockResolvedValue(undefined);
    const records = Array.from({ length: 7 }, (_, i) => rec(i));
    render(
      <ChangeHistory
        records={records}
        total={7}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={onLoadMore}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Show all (7 records)"));
    });
    expect(onLoadMore).not.toHaveBeenCalled();
    expect(screen.getAllByText("Change 6").length).toBeGreaterThan(0);
  });

  it("disables toggle button while loading more", () => {
    const records = Array.from({ length: 7 }, (_, i) => rec(i));
    const { container } = render(
      <ChangeHistory
        records={records}
        total={10}
        isLoading={false}
        isLoadingMore
        onLoadMore={jest.fn()}
      />,
    );
    const toggle = container.querySelector("button[disabled]");
    expect(toggle).toBeInTheDocument();
  });

  it("falls back to default style for unknown operation type", () => {
    render(
      <ChangeHistory
        records={[rec(1, { operationType: "UNKNOWN" })]}
        total={1}
        isLoading={false}
        isLoadingMore={false}
        onLoadMore={jest.fn()}
      />,
    );
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
