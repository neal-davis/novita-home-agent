import { render, screen } from "@testing-library/react";

// dealMoneyWithPrecision returns a non-number string -> triggers the null
// fallback branches for all computed prices even though hasGpu is true.
jest.mock("@/lib/utils/money", () => ({
  dealMoneyWithPrecision: () => "not-a-number",
}));

import PricePreviewPanel from "@/app/models-console/llm-dedicated-endpoints/components/PricePreviewPanel";

const base = {
  gpuName: "A100",
  gpuPrice: 0.001,
  gpuPricePrecision: 4,
  gpuCount: 2,
  minReplicas: 1,
  maxReplicas: 4,
  autoscalingEnabled: true,
};

describe("PricePreviewPanel (more branches)", () => {
  it("desktop: falls back to dashes when price helper returns non-number even with a GPU", () => {
    render(<PricePreviewPanel {...base} />);
    // hasGpu true so GPU type row shows the GPU, but prices are null -> dashes
    expect(screen.getByText("A100 × 2")).toBeInTheDocument();
    // monthlyEstimate null -> "$" followed by nothing; min/max show dash
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("mobile: falls back to dashes for hourly min/max when helper returns non-number", () => {
    render(<PricePreviewPanel {...base} isMobile />);
    expect(screen.getByText("EST. MONTHLY (IF 1 REPLICA)")).toBeInTheDocument();
    expect(screen.getByText("Min: -")).toBeInTheDocument();
    expect(screen.getByText("Max: -")).toBeInTheDocument();
  });
});
