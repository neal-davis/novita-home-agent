import { fireEvent, render, screen } from "@testing-library/react";
import { VoucherRedeemModal } from "@/app/billing/overview/components/voucher/VoucherRedeemModal";
import { useVoucherRedeem } from "@/app/billing/overview/components/voucher/useVoucherRedeem";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/billing/overview/components/voucher/useVoucherRedeem", () => ({
  useVoucherRedeem: jest.fn(),
}));

const mockUseVoucherRedeem = useVoucherRedeem as jest.Mock;

const baseHook = (overrides: any = {}) => ({
  code: "",
  error: "",
  loading: false,
  redeemed: false,
  redeemResult: null,
  handleCodeChange: jest.fn(),
  handleRedeem: jest.fn(),
  reset: jest.fn(),
  ...overrides,
});

describe("VoucherRedeemModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    mockUseVoucherRedeem.mockReturnValue(baseHook());
    render(<VoucherRedeemModal open={false} onClose={jest.fn()} />);
    expect(screen.queryByText("Voucher Code Redeem")).not.toBeInTheDocument();
  });

  it("renders the input view and triggers redeem on click", () => {
    const handleRedeem = jest.fn();
    mockUseVoucherRedeem.mockReturnValue(baseHook({ handleRedeem }));
    render(<VoucherRedeemModal open onClose={jest.fn()} />);

    expect(screen.getByText("Voucher Code Redeem")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Redeem/ }));
    expect(handleRedeem).toHaveBeenCalled();
  });

  it("calls handleCodeChange on input and redeem on Enter key", () => {
    const handleCodeChange = jest.fn();
    const handleRedeem = jest.fn();
    mockUseVoucherRedeem.mockReturnValue(
      baseHook({ handleCodeChange, handleRedeem }),
    );
    render(<VoucherRedeemModal open onClose={jest.fn()} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "ABC" } });
    expect(handleCodeChange).toHaveBeenCalledWith("ABC");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleRedeem).toHaveBeenCalled();
  });

  it("shows an error message when present", () => {
    mockUseVoucherRedeem.mockReturnValue(baseHook({ error: "Bad code" }));
    render(<VoucherRedeemModal open onClose={jest.fn()} />);
    expect(screen.getByText("Bad code")).toBeInTheDocument();
  });

  it("renders the success view with formatted result fields", () => {
    mockUseVoucherRedeem.mockReturnValue(
      baseHook({
        redeemed: true,
        redeemResult: {
          templateId: "t-1",
          amount: "100000",
          endTime: "1700000000",
          businessTypes: ["all"],
        },
      }),
    );
    render(<VoucherRedeemModal open onClose={jest.fn()} />);
    expect(
      screen.getByText("Voucher Redeemed Successfully!"),
    ).toBeInTheDocument();
    // 100000 / 10000 = 10 -> toFixed(4)
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("calls onSuccess + reset + onClose when closing after a redeem", () => {
    const reset = jest.fn();
    const onClose = jest.fn();
    const onSuccess = jest.fn();
    mockUseVoucherRedeem.mockReturnValue(
      baseHook({
        redeemed: true,
        redeemResult: {
          templateId: "t",
          amount: "0",
          endTime: "",
          businessTypes: [],
        },
        reset,
      }),
    );
    render(<VoucherRedeemModal open onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onSuccess).toHaveBeenCalled();
    expect(reset).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
