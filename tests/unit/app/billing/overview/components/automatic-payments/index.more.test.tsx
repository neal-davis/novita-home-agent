import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutomaticPayments from "@/app/billing/overview/components/automatic-payments/index";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/billing/overview/components/payment-methods", () => ({
  PaymentMethods: () => <div>payment methods</div>,
}));

jest.mock(
  "@/app/billing/overview/components/automatic-payments/AutomaticPaymentModal",
  () =>
    function MockModal({ open, onOpenChange, onSave }: any) {
      if (!open) return null;
      return (
        <div role="dialog" aria-label="auto payment modal">
          <button type="button" onClick={() => onSave("50", "200")}>
            save setting
          </button>
          <button type="button" onClick={() => onOpenChange(false)}>
            close modal
          </button>
        </div>
      );
    },
);

const makeAutoPaymentData = (overrides: any = {}) => ({
  isLoading: false,
  rechargeSetting: {
    amount: "100",
    threshold: "20",
    isAutoRecharge: false,
    ...overrides.rechargeSetting,
  },
  setAutoRechargeConfig: jest.fn().mockResolvedValue(undefined),
  fetchAutoRecharge: jest.fn(),
  ...overrides,
});

const withCard = { cardsInfo: [{ id: "card-1" }] } as any;
const noCard = { cardsInfo: [] } as any;

describe("AutomaticPayments extra branches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("warns from Modify/Set up when there is no payment method", () => {
    render(
      <AutomaticPayments
        paymentMethodData={noCard}
        autoPaymentData={makeAutoPaymentData()}
        compact
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Set up" }));
    expect(message.warning).toHaveBeenCalledWith(
      "Please add a payment method for Auto Recharge first.",
    );
  });

  it("reverts and errors when turning OFF fails", async () => {
    const data = makeAutoPaymentData({
      rechargeSetting: { amount: "100", threshold: "20", isAutoRecharge: true },
      setAutoRechargeConfig: jest.fn().mockRejectedValue(new Error("x")),
    });
    render(
      <AutomaticPayments paymentMethodData={withCard} autoPaymentData={data} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Failed to update Auto Recharge setting.",
      ),
    );
  });

  it("errors when saving settings fails while opening", async () => {
    const data = makeAutoPaymentData({
      setAutoRechargeConfig: jest.fn().mockRejectedValue(new Error("x")),
    });
    render(
      <AutomaticPayments paymentMethodData={withCard} autoPaymentData={data} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByText("save setting"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Failed to update Auto Recharge settings",
      ),
    );
  });

  it("cancels the opening operation when the dialog is closed", async () => {
    const data = makeAutoPaymentData();
    render(
      <AutomaticPayments paymentMethodData={withCard} autoPaymentData={data} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByText("close modal"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    // switch stays OFF because we never committed the enable
    expect(screen.getByText("Auto Recharge is OFF")).toBeInTheDocument();
  });

  it("no-ops the switch when setAutoRechargeConfig is unavailable", () => {
    render(
      <AutomaticPayments
        paymentMethodData={withCard}
        autoPaymentData={
          makeAutoPaymentData({ setAutoRechargeConfig: undefined }) as any
        }
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(message.error).not.toHaveBeenCalled();
  });
});
