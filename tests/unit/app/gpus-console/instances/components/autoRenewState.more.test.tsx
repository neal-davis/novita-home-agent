import { render, screen } from "@testing-library/react";
import AutoRenewState from "@/app/gpus-console/instances/components/autoRenewState";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span data-testid="tooltip" data-title={title}>
      {children}
    </span>
  ),
}));

describe("AutoRenewState more branches", () => {
  it("uses the healthy background color when more than 3 days remain", () => {
    const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    render(
      <AutoRenewState
        instanceInfo={{ autoRenew: true, autoRenewMonth: 2, endTime: future }}
      />,
    );
    const label = screen.getByText("Auto-renew: On (2 months)");
    expect(label).toHaveStyle({ backgroundColor: "var(--brand-2)" });
  });

  it("uses the warning background color when less than 3 days remain", () => {
    const soon = Math.floor(Date.now() / 1000) + 60 * 60 * 12; // 12h
    render(
      <AutoRenewState
        instanceInfo={{ autoRenew: true, autoRenewMonth: 1, endTime: soon }}
      />,
    );
    const label = screen.getByText("Auto-renew: On (1 month)");
    expect(label).toHaveStyle({ backgroundColor: "var(--orange-6)" });
  });

  it("uses the neutral background and shows no warning icon when off without an errorCode", () => {
    render(<AutoRenewState instanceInfo={{ autoRenew: false }} />);
    const label = screen.getByText("Auto-renew: Off");
    expect(label).toHaveStyle({ backgroundColor: "var(--gray-3)" });
    // only the state label exists; no error tooltip is rendered
    expect(screen.queryAllByTestId("tooltip")).toHaveLength(0);
  });

  it("renders no warning icon for an unrecognized errorCode", () => {
    render(
      <AutoRenewState instanceInfo={{ autoRenew: false, errorCode: 99 }} />,
    );
    expect(screen.getByText("Auto-renew: Off")).toBeInTheDocument();
    expect(screen.queryAllByTestId("tooltip")).toHaveLength(0);
  });
});
