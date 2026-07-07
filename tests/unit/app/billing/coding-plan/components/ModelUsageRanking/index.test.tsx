import { render, screen } from "@testing-library/react";
import ModelUsageRanking from "@/app/billing/coding-plan/components/ModelUsageRanking";

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("ModelUsageRanking", () => {
  it("renders skeleton rows while loading", () => {
    render(<ModelUsageRanking data={[]} isLoading />);
    expect(screen.getAllByTestId("skeleton").length).toBe(10); // 5 rows x 2 cells
  });

  it("renders ranked model rows with formatted tokens", () => {
    render(
      <ModelUsageRanking
        isLoading={false}
        data={[
          { rank: 1, modelId: "model-a", tokens: 1_200_000 } as any,
          { rank: 2, modelId: "model-b", tokens: 800 } as any,
        ]}
      />,
    );
    expect(screen.getByText("model-a")).toBeInTheDocument();
    expect(screen.getByText("1.2M")).toBeInTheDocument();
    expect(screen.getByText("model-b")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
  });
});
