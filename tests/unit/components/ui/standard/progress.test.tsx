import { render, screen } from "@testing-library/react";
import { ProgressBar, ProgressCircle } from "@/components/ui/standard/progress";

describe("ProgressBar", () => {
  it("renders the percentage info by default", () => {
    render(<ProgressBar percent={42} />);
    expect(screen.getByText("42.0%")).toBeInTheDocument();
  });

  it("clamps percent above 100 and below 0", () => {
    const { rerender } = render(<ProgressBar percent={150} />);
    expect(screen.getByText("100.0%")).toBeInTheDocument();
    rerender(<ProgressBar percent={-20} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("treats a non-finite percent as 0", () => {
    render(<ProgressBar percent={NaN} />);
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("hides info text when showInfo is false", () => {
    render(<ProgressBar percent={50} showInfo={false} />);
    expect(screen.queryByText("50.0%")).not.toBeInTheDocument();
  });

  it("uses the exception color for the exception status", () => {
    const { container } = render(
      <ProgressBar percent={30} status="exception" />,
    );
    expect(
      container.querySelector(".bg-\\[var\\(--red-1\\)\\]"),
    ).toBeInTheDocument();
  });

  it("sets the indicator width from the percent", () => {
    const { container } = render(<ProgressBar percent={25} showInfo={false} />);
    const indicator = container.querySelector(
      ".bg-\\[var\\(--brand-0\\)\\]",
    ) as HTMLElement;
    expect(indicator.style.width).toBe("25%");
  });
});

describe("ProgressCircle", () => {
  it("renders an svg sized by the size prop", () => {
    const { container } = render(<ProgressCircle percent={50} size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("computes a smaller dash offset for higher percent (more filled)", () => {
    const { container: low } = render(<ProgressCircle percent={0} />);
    const { container: high } = render(<ProgressCircle percent={100} />);
    const lowOffset = Number(
      low.querySelectorAll("circle")[1].getAttribute("stroke-dashoffset"),
    );
    const highOffset = Number(
      high.querySelectorAll("circle")[1].getAttribute("stroke-dashoffset"),
    );
    expect(highOffset).toBeLessThan(lowOffset);
  });
});
