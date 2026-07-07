import { fireEvent, render, screen, within } from "@testing-library/react";
import Voucher from "@/app/billing/overview/components/voucher/index";
import type { VoucherItem } from "@/app/billing/overview/components/voucher/constants";

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>no vouchers</div>,
}));

jest.mock(
  "@/app/billing/overview/components/voucher/VoucherRedeemModal",
  () => ({
    VoucherRedeemModal: ({ open }: any) =>
      open ? <div role="dialog">redeem modal</div> : null,
  }),
);

jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, value }: any) => (
    <select
      aria-label="status"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="all">All</option>
      <option value="valid">Valid</option>
      <option value="used">Used</option>
      <option value="expired">Expired</option>
    </select>
  ),
  SelectContent: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectItem: () => null,
}));

const makeVoucher = (
  id: string,
  status: VoucherItem["status"],
): VoucherItem => ({
  id,
  name: `Voucher ${id}`,
  status,
  effectDate: "1700000000",
  expiryDate: "1800000000",
  balance: 100000,
  originalValue: 200000,
  businessTypes: ["all"],
});

const sixVouchers = [
  makeVoucher("1", "valid"),
  makeVoucher("2", "valid"),
  makeVoucher("3", "used"),
  makeVoucher("4", "expired"),
  makeVoucher("5", "valid"),
  makeVoucher("6", "used"),
];

describe("Voucher", () => {
  const baseProps = {
    redeemOpen: false,
    onRedeemClose: jest.fn(),
    onRedeemSuccess: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders a loading spinner while loading", () => {
    const { container } = render(<Voucher {...baseProps} data={[]} loading />);
    expect(screen.getByText("Voucher Details")).toBeInTheDocument();
    // table body not rendered while loading
    expect(screen.queryByText("no vouchers")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders empty state when no vouchers", () => {
    render(<Voucher {...baseProps} data={[]} loading={false} />);
    expect(screen.getByText("no vouchers")).toBeInTheDocument();
  });

  it("shows the bind-card promo when no card and eligible", () => {
    const onAddCard = jest.fn();
    render(
      <Voucher
        {...baseProps}
        data={[]}
        loading={false}
        hasCard={false}
        welcomeVoucherEligible
        onAddCard={onAddCard}
      />,
    );
    expect(
      screen.getByText("Bind a card to receive your $1 Model API Voucher"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Bind Card"));
    expect(onAddCard).toHaveBeenCalled();
    expect(screen.queryByText("no vouchers")).not.toBeInTheDocument();
  });

  it("falls back to plain empty state when no card but not eligible", () => {
    render(
      <Voucher
        {...baseProps}
        data={[]}
        loading={false}
        hasCard={false}
        welcomeVoucherEligible={false}
      />,
    );
    expect(screen.getByText("no vouchers")).toBeInTheDocument();
    expect(screen.queryByText("Bind Card")).not.toBeInTheDocument();
  });

  it("renders voucher rows with formatted balance and status", () => {
    render(
      <Voucher
        {...baseProps}
        data={[makeVoucher("1", "valid")]}
        loading={false}
      />,
    );
    expect(screen.getByText("Voucher 1")).toBeInTheDocument();
    // balance 100000/10000=10, original 200000/10000=20 (toFixed(4), split nodes)
    expect(
      screen.getByText(
        (_c, el) =>
          el?.textContent === "$10.0000 / $20.0000" && el.tagName === "TD",
      ),
    ).toBeInTheDocument();
    const table = document.querySelector("table") as HTMLElement;
    expect(within(table).getByText("Valid")).toBeInTheDocument();
  });

  it("limits to 5 rows and shows a View all toggle", () => {
    render(<Voucher {...baseProps} data={sixVouchers} loading={false} />);
    expect(screen.getByText("Voucher 5")).toBeInTheDocument();
    expect(screen.queryByText("Voucher 6")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/View all 6 vouchers/));
    expect(screen.getByText("Voucher 6")).toBeInTheDocument();
    expect(screen.getByText("Collapse")).toBeInTheDocument();
  });

  it("filters by status", () => {
    render(<Voucher {...baseProps} data={sixVouchers} loading={false} />);
    fireEvent.change(screen.getByLabelText("status"), {
      target: { value: "expired" },
    });
    expect(screen.getByText("Voucher 4")).toBeInTheDocument();
    expect(screen.queryByText("Voucher 1")).not.toBeInTheDocument();
  });

  it("renders the redeem modal when redeemOpen", () => {
    render(<Voucher {...baseProps} data={[]} loading={false} redeemOpen />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
