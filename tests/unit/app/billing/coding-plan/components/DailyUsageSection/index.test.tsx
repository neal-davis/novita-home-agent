import { render, screen, fireEvent } from "@testing-library/react";
import DailyUsageSection from "@/app/billing/coding-plan/components/DailyUsageSection";

jest.mock(
  "@/app/billing/coding-plan/components/DailyUsageSection/UsageHeatmap",
  () => ({
    __esModule: true,
    default: () => <div data-testid="heatmap" />,
  }),
);

jest.mock(
  "@/app/billing/coding-plan/components/DailyUsageSection/UsageBarChart",
  () => ({
    __esModule: true,
    default: () => <div data-testid="barchart" />,
  }),
);

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, onValueChange }: any) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange("chart")}>
        to chart
      </button>
      <button type="button" onClick={() => onValueChange("heatmap")}>
        to heatmap
      </button>
    </div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <div>{children}</div>,
}));

describe("DailyUsageSection", () => {
  it("defaults to the heatmap tab", () => {
    render(<DailyUsageSection data={[]} isLoading={false} />);
    expect(screen.getByTestId("heatmap")).toBeInTheDocument();
    expect(screen.queryByTestId("barchart")).not.toBeInTheDocument();
  });

  it("switches to the chart tab and back", () => {
    render(<DailyUsageSection data={[]} isLoading={false} />);
    fireEvent.click(screen.getByText("to chart"));
    expect(screen.getByTestId("barchart")).toBeInTheDocument();

    fireEvent.click(screen.getByText("to heatmap"));
    expect(screen.getByTestId("heatmap")).toBeInTheDocument();
  });
});
