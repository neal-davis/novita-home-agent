import { render, screen } from "@testing-library/react";
import RawUsageTooltip from "@/app/billing/coding-plan/components/UsageDetailsTable/RawUsageTooltip";

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <div>{children}</div>,
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
}));

describe("RawUsageTooltip", () => {
  it("renders the summed total and per-category breakdown", () => {
    render(
      <RawUsageTooltip
        inputTokens={1000}
        outputTokens={2000}
        cacheReadTokens={300}
        cacheWriteTokens={40}
        cacheWrite1hourTokens={5}
      />,
    );
    // total = 3345
    expect(screen.getByText("3,345")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("2,000")).toBeInTheDocument();
    expect(screen.getByText("Uncached input")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();
  });
});
