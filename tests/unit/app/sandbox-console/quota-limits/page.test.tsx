import { render, screen } from "@testing-library/react";
import Page from "@/app/sandbox-console/quota-limits/page";

jest.mock("@/app/quota-limits/components/SandboxQuotaLimits", () => ({
  __esModule: true,
  default: () => <div data-testid="quota-limits">quota limits</div>,
}));

describe("sandbox-console quota-limits page", () => {
  it("renders the SandboxQuotaLimits component", () => {
    render(<Page />);
    expect(screen.getByTestId("quota-limits")).toBeInTheDocument();
    expect(screen.getByText("quota limits")).toBeInTheDocument();
  });
});
