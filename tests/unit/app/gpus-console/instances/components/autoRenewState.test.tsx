import { render, screen } from "@testing-library/react";
import AutoRenewState from "@/app/gpus-console/instances/components/autoRenewState";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span data-testid="tooltip" data-title={title}>
      {children}
    </span>
  ),
}));

describe("AutoRenewState", () => {
  it("renders the off state when auto-renew is disabled", () => {
    render(<AutoRenewState instanceInfo={{ autoRenew: false }} />);
    expect(screen.getByText("Auto-renew: Off")).toBeInTheDocument();
  });

  it("renders the on state with a plural-month label and a healthy tooltip", () => {
    const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    render(
      <AutoRenewState
        instanceInfo={{ autoRenew: true, autoRenewMonth: 3, endTime: future }}
      />,
    );
    expect(screen.getByText("Auto-renew: On (3 months)")).toBeInTheDocument();
    const tip = screen.getAllByTestId("tooltip")[0];
    expect(tip.getAttribute("data-title")).toMatch(/More than 3 days left/);
  });

  it("renders a near-expiry tooltip when less than 3 days remain", () => {
    const soon = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
    render(
      <AutoRenewState
        instanceInfo={{ autoRenew: true, autoRenewMonth: 1, endTime: soon }}
      />,
    );
    expect(screen.getByText("Auto-renew: On (1 month)")).toBeInTheDocument();
    const tip = screen.getAllByTestId("tooltip")[0];
    expect(tip.getAttribute("data-title")).toMatch(/Less than 3 days left/);
  });

  it("shows the payment-method warning icon for errorCode 1", () => {
    const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    render(
      <AutoRenewState
        instanceInfo={{
          autoRenew: true,
          autoRenewMonth: 2,
          endTime: future,
          errorCode: 1,
        }}
      />,
    );
    const tips = screen.getAllByTestId("tooltip");
    expect(
      tips.some((t) =>
        (t.getAttribute("data-title") || "").includes(
          "no valid payment method",
        ),
      ),
    ).toBe(true);
  });

  it("shows the insufficient-budget warning for errorCode 2", () => {
    render(
      <AutoRenewState instanceInfo={{ autoRenew: false, errorCode: 2 }} />,
    );
    const tips = screen.getAllByTestId("tooltip");
    expect(
      tips.some(
        (t) => t.getAttribute("data-title") === "Budget is insufficient.",
      ),
    ).toBe(true);
  });
});
