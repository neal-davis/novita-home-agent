import { fireEvent, render, screen } from "@testing-library/react";
import AutoRenewInstanceBat from "@/app/gpus-console/instances/components/autoRenewInstanceBat";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange("6")}>
        pick 6 months
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  TableBody: ({ children }: any) => <>{children}</>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));
jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="auto renew"
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));
jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({ open, onConfirm }: any) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        confirm dialog ok
      </button>
    ) : null,
}));

describe("AutoRenewInstanceBat modal", () => {
  it("shows the scope count and hides the duration row until enabled", () => {
    render(
      <AutoRenewInstanceBat
        instanceIds={["a", "b", "c"]}
        finishForm={jest.fn()}
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("Renewal duration")).not.toBeInTheDocument();
  });

  it("reveals the renewal-duration selector when auto-renew is on", () => {
    render(<AutoRenewInstanceBat instanceIds={["a"]} finishForm={jest.fn()} />);
    fireEvent.click(screen.getByLabelText("auto renew"));
    expect(screen.getByText("Renewal duration")).toBeInTheDocument();
  });

  it("confirms the bulk auto-renew operation with chosen params", () => {
    const finishForm = jest.fn();
    render(
      <AutoRenewInstanceBat instanceIds={["a", "b"]} finishForm={finishForm} />,
    );
    fireEvent.click(screen.getByLabelText("auto renew"));
    fireEvent.click(screen.getByRole("button", { name: "pick 6 months" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm dialog ok" }));

    expect(finishForm).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        autoRenew: true,
        autoRenewMonth: 6,
        instanceIds: ["a", "b"],
      }),
    );
  });

  it("renders a processing button when btnLoading is set", () => {
    render(
      <AutoRenewInstanceBat
        instanceIds={["a"]}
        btnLoading
        finishForm={jest.fn()}
      />,
    );
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("cancels via the cancel button", () => {
    const finishForm = jest.fn();
    render(
      <AutoRenewInstanceBat instanceIds={["a"]} finishForm={finishForm} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false, expect.any(Object));
  });
});
