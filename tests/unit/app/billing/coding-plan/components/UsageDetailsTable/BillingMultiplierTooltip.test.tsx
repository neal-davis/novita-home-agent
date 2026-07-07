import { render, screen } from "@testing-library/react";
import BillingMultiplierTooltip from "@/app/billing/coding-plan/components/UsageDetailsTable/BillingMultiplierTooltip";

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <div>{children}</div>,
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
}));

describe("BillingMultiplierTooltip", () => {
  it("renders Details trigger and each coefficient", () => {
    render(
      <BillingMultiplierTooltip
        inputCoefficient={1}
        outputCoefficient={5}
        cacheReadCoefficient={0.1}
        cacheWriteCoefficient={1.25}
        cacheWrite1hourCoefficient={2}
      />,
    );
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0.1")).toBeInTheDocument();
    expect(screen.getByText("1.25")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
