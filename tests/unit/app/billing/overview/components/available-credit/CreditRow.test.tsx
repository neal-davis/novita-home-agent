import { render, screen } from "@testing-library/react";
import CreditRow from "@/app/billing/overview/components/available-credit/CreditRow";

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

describe("CreditRow", () => {
  it("renders the label and a $-prefixed value", () => {
    render(<CreditRow label="Account balance" value="100.00" />);
    expect(screen.getByText("Account balance")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("renders the tooltip content when provided", () => {
    render(
      <CreditRow label="Credit limit" value="200" tooltip="Some help text" />,
    );
    expect(screen.getByText("Some help text")).toBeInTheDocument();
  });

  it("renders '-' for a zero warning row", () => {
    render(<CreditRow label="Outstanding" value="0" isWarning />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders the $value for a non-zero warning row", () => {
    render(<CreditRow label="Outstanding" value="15" isWarning />);
    expect(screen.getByText("$15")).toBeInTheDocument();
  });
});
