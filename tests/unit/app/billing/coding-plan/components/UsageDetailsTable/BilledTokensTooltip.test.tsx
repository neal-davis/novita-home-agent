import { render, screen } from "@testing-library/react";
import BilledTokensTooltip from "@/app/billing/coding-plan/components/UsageDetailsTable/BilledTokensTooltip";

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <div>{children}</div>,
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/api/coding-plan", () => ({
  divideBy10000: (v: number) => v / 10000,
}));

describe("BilledTokensTooltip", () => {
  it("renders the deduct amount and per-category deducted tokens", () => {
    render(
      <BilledTokensTooltip
        deductAmount={12345}
        inputTokens={1000}
        outputTokens={2000}
        cacheReadTokens={500}
        cacheWriteTokens={100}
        cacheWrite1hourTokens={10}
        inputCoefficient={1}
        outputCoefficient={5}
        cacheReadCoefficient={0.1}
        cacheWriteCoefficient={2}
        cacheWrite1hourCoefficient={3}
      />,
    );
    // deductAmount displayed as-is, locale formatted
    expect(screen.getByText("12,345")).toBeInTheDocument();
    // input deducted = 1000*1 = 1000
    expect(screen.getByText("1,000")).toBeInTheDocument();
    // output deducted = 2000*5 = 10000
    expect(screen.getByText("10,000")).toBeInTheDocument();
    // cacheRead deducted = round(500*0.1) = 50
    expect(screen.getByText("50")).toBeInTheDocument();
    // cacheWrite deducted = 100*2 = 200
    expect(screen.getByText("200")).toBeInTheDocument();
    // cacheWrite1hour deducted = 10*3 = 30
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});
