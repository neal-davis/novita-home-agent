import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutomaticPaymentModal from "@/app/billing/overview/components/automatic-payments/AutomaticPaymentModal";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const getInputs = () => screen.getAllByRole("spinbutton") as HTMLInputElement[];

describe("AutomaticPaymentModal", () => {
  it("does not render when closed", () => {
    render(
      <AutomaticPaymentModal
        open={false}
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.queryByText("Auto Recharge")).not.toBeInTheDocument();
  });

  it("renders with default threshold and amount values", () => {
    render(
      <AutomaticPaymentModal
        open
        defaultThreshold="100"
        defaultTopUp="200"
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    const [threshold, amount] = getInputs();
    expect(threshold.value).toBe("100");
    expect(amount.value).toBe("200");
    expect(screen.getByText("Save Setting")).toBeInTheDocument();
  });

  it("disables Save when validation fails (threshold below minimum)", () => {
    render(
      <AutomaticPaymentModal
        open
        defaultThreshold="2"
        defaultTopUp="200"
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Save Setting/ })).toBeDisabled();
  });

  it("disables Save when amount is less than threshold + 50", () => {
    render(
      <AutomaticPaymentModal
        open
        defaultThreshold="100"
        defaultTopUp="120"
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Save Setting/ })).toBeDisabled();
  });

  it("enables Save for valid input and calls onSave then closes", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    render(
      <AutomaticPaymentModal
        open
        defaultThreshold="100"
        defaultTopUp="200"
        max_threshold={1000}
        max_amount={5000}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />,
    );
    const saveBtn = screen.getByRole("button", { name: /Save Setting/ });
    expect(saveBtn).toBeEnabled();

    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("100", "200");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("revalidates when inputs change", () => {
    render(
      <AutomaticPaymentModal
        open
        defaultThreshold="100"
        defaultTopUp="200"
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    const [threshold] = getInputs();
    // set threshold too high -> invalid -> Save disabled
    fireEvent.change(threshold, { target: { value: "999999" } });
    expect(screen.getByRole("button", { name: /Save Setting/ })).toBeDisabled();
  });

  it("cancel closes the dialog", () => {
    const onOpenChange = jest.fn();
    render(
      <AutomaticPaymentModal
        open
        onOpenChange={onOpenChange}
        onSave={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
