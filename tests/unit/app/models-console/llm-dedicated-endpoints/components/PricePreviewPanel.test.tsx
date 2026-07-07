import { fireEvent, render, screen } from "@testing-library/react";
import PricePreviewPanel from "@/app/models-console/llm-dedicated-endpoints/components/PricePreviewPanel";

jest.mock("@/lib/utils/money", () => ({
  // echo back the rounded computed value so we can assert formatting
  dealMoneyWithPrecision: (v: number) => Math.round(v * 1000) / 1000,
}));

const base = {
  gpuName: "A100",
  gpuPrice: 0.001, // per second
  gpuPricePrecision: 4,
  gpuCount: 2,
  minReplicas: 1,
  maxReplicas: 4,
  autoscalingEnabled: true,
};

describe("PricePreviewPanel", () => {
  it("renders placeholders when no GPU selected", () => {
    render(<PricePreviewPanel {...base} gpuName="" />);
    expect(screen.getByText("Select a GPU to see cost")).toBeInTheDocument();
    // GPU type row shows dash
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders desktop cost details when GPU selected", () => {
    render(<PricePreviewPanel {...base} />);
    expect(screen.getByText("Cost Estimation")).toBeInTheDocument();
    expect(screen.getByText("A100 × 2")).toBeInTheDocument();
    // gpu unit price: 0.001*3600=3.6 -> $3.600/GPU/hr
    expect(screen.getByText("$3.600/GPU/hr")).toBeInTheDocument();
  });

  it("uses minReplicas when autoscaling enabled", () => {
    render(<PricePreviewPanel {...base} minReplicas={2} />);
    expect(screen.getByText("2 replica")).toBeInTheDocument();
  });

  it("forces 1 replica when autoscaling disabled", () => {
    render(
      <PricePreviewPanel
        {...base}
        autoscalingEnabled={false}
        minReplicas={5}
      />,
    );
    expect(screen.getByText("1 replica")).toBeInTheDocument();
  });

  it("fires onSubmit when Create Endpoint clicked", () => {
    const onSubmit = jest.fn();
    render(<PricePreviewPanel {...base} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Create Endpoint" }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows loading text and disables button while loading", () => {
    render(<PricePreviewPanel {...base} isLoading loadingText="Creating..." />);
    const btn = screen.getByRole("button", { name: "Creating..." });
    expect(btn).toBeDisabled();
  });

  it("renders compact mobile layout", () => {
    render(<PricePreviewPanel {...base} isMobile />);
    expect(screen.getByText("EST. MONTHLY (IF 1 REPLICA)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Endpoint" }),
    ).toBeInTheDocument();
  });

  it("mobile shows Select GPU when none chosen", () => {
    render(<PricePreviewPanel {...base} gpuName="" isMobile />);
    expect(screen.getByText("Select GPU")).toBeInTheDocument();
  });
});
