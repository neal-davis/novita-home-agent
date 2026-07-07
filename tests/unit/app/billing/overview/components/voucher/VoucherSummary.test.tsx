import { fireEvent, render, screen } from "@testing-library/react";

import { VoucherSummary } from "../../../../../../../src/app/billing/overview/components/voucher/VoucherSummary";
import type { VoucherItem } from "../../../../../../../src/app/billing/overview/components/voucher/constants";

const makeVoucher = (
  id: string,
  status: VoucherItem["status"],
  balance: number,
): VoucherItem => ({
  id,
  name: `V${id}`,
  status,
  effectDate: "1",
  expiryDate: "2",
  balance,
  originalValue: balance,
  businessTypes: ["all"],
});

const vouchers: VoucherItem[] = [
  {
    id: "voucher-1",
    name: "First voucher",
    status: "valid",
    effectDate: "1700000000",
    expiryDate: "1800000000",
    balance: 100000,
    originalValue: 100000,
    businessTypes: ["all"],
  },
  {
    id: "voucher-2",
    name: "Second voucher",
    status: "valid",
    effectDate: "1700000000",
    expiryDate: "1800000000",
    balance: 50000,
    originalValue: 50000,
    businessTypes: ["model_api"],
  },
  {
    id: "voucher-3",
    name: "Expired voucher",
    status: "expired",
    effectDate: "1700000000",
    expiryDate: "1700000001",
    balance: 80000,
    originalValue: 80000,
    businessTypes: ["gpu_instance"],
  },
];

describe("VoucherSummary", () => {
  it("renders skeleton placeholders while loading", () => {
    render(<VoucherSummary data={[]} loading onRedeemClick={jest.fn()} />);

    expect(screen.getByText("Vouchers")).toBeInTheDocument();
    expect(screen.queryByText("No active vouchers")).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no valid vouchers", () => {
    render(
      <VoucherSummary
        data={[makeVoucher("1", "used", 100000)]}
        loading={false}
        onRedeemClick={jest.fn()}
      />,
    );

    expect(screen.getByText("No active vouchers")).toBeInTheDocument();
  });

  it("summarizes count and total balance of valid vouchers", () => {
    render(
      <VoucherSummary
        data={vouchers}
        loading={false}
        onRedeemClick={jest.fn()}
      />,
    );

    expect(screen.getByText("2 valid")).toBeInTheDocument();
    expect(screen.getByText("$15.0000 available")).toBeInTheDocument();
  });

  it("fires onRedeemClick when Redeem is clicked", () => {
    const onRedeemClick = jest.fn();

    render(
      <VoucherSummary
        data={vouchers}
        loading={false}
        onRedeemClick={onRedeemClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Redeem" }));

    expect(onRedeemClick).toHaveBeenCalledTimes(1);
  });
});
