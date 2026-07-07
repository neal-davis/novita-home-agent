import { render, screen } from "@testing-library/react";
import TodayUsageCard from "@/app/billing/coding-plan/components/TodayUsageCard";

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("TodayUsageCard", () => {
  it("renders skeletons while loading", () => {
    render(<TodayUsageCard data={null} isLoading />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("returns null when not loading and there is no data", () => {
    const { container } = render(
      <TodayUsageCard data={null} isLoading={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a positive change with a plus prefix", () => {
    render(
      <TodayUsageCard
        data={{ tokens: 2_500_000, changePercent: 12.34 } as any}
        isLoading={false}
      />,
    );
    expect(screen.getByText("2.5M")).toBeInTheDocument();
    expect(screen.getByText("+12.3%")).toBeInTheDocument();
  });

  it("renders a negative change without a plus prefix", () => {
    render(
      <TodayUsageCard
        data={{ tokens: 500, changePercent: -5 } as any}
        isLoading={false}
      />,
    );
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("-5.0%")).toBeInTheDocument();
  });
});
