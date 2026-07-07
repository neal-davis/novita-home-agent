import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutomaticPayments from "@/app/billing/overview/components/automatic-payments/index";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/billing/overview/components/payment-methods", () => ({
  PaymentMethods: () => <div>payment methods</div>,
}));

// AutomaticPaymentModal: expose save/close triggers.
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

describe("AutomaticPayments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders OFF state copy when auto recharge disabled", () => {
    render(
      <AutomaticPayments
        paymentMethodData={withCard}
        autoPaymentData={makeAutoPaymentData()}
      />,
    );
    expect(screen.getByText("Auto Recharge")).toBeInTheDocument();
    expect(screen.getByText("Auto Recharge is OFF")).toBeInTheDocument();
  });

  it("renders ON state with threshold/amount copy and a Modify button", () => {
    render(
      <AutomaticPayments
        paymentMethodData={withCard}
        autoPaymentData={makeAutoPaymentData({
          rechargeSetting: {
            amount: "100",
            threshold: "20",
            isAutoRecharge: true,
          },
        })}
      />,
    );
    expect(screen.getByText("Auto Recharge is ON")).toBeInTheDocument();
    expect(
      screen.getByText(/falls below 20.*recharge.*back up to 100/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Modify" })).toBeInTheDocument();
  });

  it("warns when enabling without a payment method", async () => {
    render(
      <AutomaticPayments
        paymentMethodData={noCard}
        autoPaymentData={makeAutoPaymentData()}
      />,
    );
    // toggle switch on
    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith(
        "Please add a payment method for Auto Recharge first.",
      );
    });
  });

  it("opens the modal when turning auto recharge ON with a card", async () => {
    render(
      <AutomaticPayments
        paymentMethodData={withCard}
        autoPaymentData={makeAutoPaymentData()}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("turns auto recharge OFF immediately via API", async () => {
    const data = makeAutoPaymentData({
      rechargeSetting: {
        amount: "100",
        threshold: "20",
        isAutoRecharge: true,
      },
    });
    render(
      <AutomaticPayments paymentMethodData={withCard} autoPaymentData={data} />,
    );
    fireEvent.click(screen.getByRole("switch"));
    await waitFor(() => {
      expect(data.setAutoRechargeConfig).toHaveBeenCalledWith(
        expect.objectContaining({ isAutoRecharge: false }),
      );
    });
  });

  it("saves settings from the modal and shows success", async () => {
    const data = makeAutoPaymentData();
    render(
      <AutomaticPayments paymentMethodData={withCard} autoPaymentData={data} />,
    );
    // open modal by turning on
    fireEvent.click(screen.getByRole("switch"));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByText("save setting"));
    await waitFor(() => {
      expect(data.setAutoRechargeConfig).toHaveBeenCalledWith({
        threshold: "50",
        amount: "200",
        isAutoRecharge: true,
      });
      expect(message.success).toHaveBeenCalledWith(
        "Auto Recharge settings have been updated successfully",
      );
    });
  });

  it("renders compact view with payment methods", () => {
    render(
      <AutomaticPayments
        paymentMethodData={withCard}
        autoPaymentData={makeAutoPaymentData()}
        compact
      />,
    );
    expect(screen.getByText("Auto Recharge OFF")).toBeInTheDocument();
    expect(screen.getByText("payment methods")).toBeInTheDocument();
    expect(screen.getByText("Set up")).toBeInTheDocument();
  });
});
