import { render, screen } from "@testing-library/react";
import MetricBar from "@/app/gpus-console/instances/components/metricBar";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span data-testid="tooltip" data-title={title}>
      {children}
    </span>
  ),
}));

describe("MetricBar", () => {
  it("renders each metric name and clamped percentage", () => {
    render(
      <MetricBar
        data={[
          { name: "CPU", value: 42.5 },
          { name: "Mem", value: 150 },
        ]}
      />,
    );
    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText(/42\.50%/)).toBeInTheDocument();
    // value above 100 is clamped to 100
    expect(screen.getByText(/100\.00%/)).toBeInTheDocument();
  });

  it("renders a tooltip and description when provided", () => {
    render(
      <MetricBar
        data={[{ name: "GPU0", value: 30, tooltip: "GPU ID", desc: "avg" }]}
      />,
    );
    expect(screen.getByTestId("tooltip")).toHaveAttribute(
      "data-title",
      "GPU ID",
    );
    expect(screen.getByText(/\(avg\)/)).toBeInTheDocument();
  });

  it("defaults missing values to zero", () => {
    render(<MetricBar data={[{ name: "Empty" }]} />);
    expect(screen.getByText(/0\.00%/)).toBeInTheDocument();
  });
});
