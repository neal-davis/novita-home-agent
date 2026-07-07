import { render, screen } from "@testing-library/react";
import { SlaMetrics } from "@/components/ai-elements/sla-metrics";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

describe("SlaMetrics", () => {
  it("returns null when ttft is missing or non-positive", () => {
    const { container, rerender } = render(<SlaMetrics />);
    expect(container.firstChild).toBeNull();
    rerender(<SlaMetrics ttft_ms={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("formats sub-second ttft as milliseconds", () => {
    render(<SlaMetrics ttft_ms={500} />);
    expect(screen.getByText("TTFT: 500ms")).toBeInTheDocument();
  });

  it("formats ttft >= 1000ms as seconds", () => {
    render(<SlaMetrics ttft_ms={1500} />);
    expect(screen.getByText("TTFT: 1.50s")).toBeInTheDocument();
  });

  it("shows the speed metric when tps is positive", () => {
    render(<SlaMetrics ttft_ms={200} tps={42.5} />);
    expect(screen.getByText("SPEED: 42.50 tokens/s")).toBeInTheDocument();
  });

  it("hides the speed metric when tps is zero", () => {
    render(<SlaMetrics ttft_ms={200} tps={0} />);
    expect(screen.queryByText(/SPEED/)).not.toBeInTheDocument();
  });
});
