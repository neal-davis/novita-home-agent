import { fireEvent, render, screen } from "@testing-library/react";
import UsageHeatmap from "@/app/billing/coding-plan/components/DailyUsageSection/UsageHeatmap";

const data = [
  { timestamp: 1700000000, tokens: 5_000_000 }, // 0-10Mt -> brand-3
  { timestamp: 1700086400, tokens: 20_000_000 }, // 10-50Mt -> #6DE4A9
  { timestamp: 1700172800, tokens: 80_000_000 }, // > 50Mt -> brand-1
];

describe("UsageHeatmap", () => {
  it("renders a cell per data point plus the legend", () => {
    const { container } = render(<UsageHeatmap data={data} />);
    // 3 data cells + 3 legend swatches = 6 colored boxes
    const cells = container.querySelectorAll(".w-8.h-8");
    expect(cells.length).toBe(6);
    expect(screen.getByText("> 50Mt")).toBeInTheDocument();
    expect(screen.getByText("10-50Mt")).toBeInTheDocument();
    expect(screen.getByText("0-10Mt")).toBeInTheDocument();
  });

  it("colors cells based on token thresholds", () => {
    const { container } = render(<UsageHeatmap data={data} />);
    const grid = container.querySelector(".grid") as HTMLElement;
    const cells = grid.querySelectorAll("div");
    expect(cells[0]).toHaveStyle({ backgroundColor: "var(--brand-3)" });
    expect(cells[1]).toHaveStyle({ backgroundColor: "#6DE4A9" });
    expect(cells[2]).toHaveStyle({ backgroundColor: "var(--brand-1)" });
  });

  it("shows a tooltip with date and tokens on hover and hides on leave", () => {
    const { container } = render(<UsageHeatmap data={data} />);
    const grid = container.querySelector(".grid") as HTMLElement;
    const firstCell = grid.querySelectorAll("div")[0];

    fireEvent.mouseEnter(firstCell);
    expect(screen.getByText("5.0M tokens")).toBeInTheDocument();
    expect(screen.getByText("11-14")).toBeInTheDocument();

    fireEvent.mouseLeave(firstCell);
    expect(screen.queryByText("5.0M tokens")).not.toBeInTheDocument();
  });
});
