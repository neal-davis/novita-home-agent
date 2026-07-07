import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const getVoucherList = jest.fn();
jest.mock("@/api/user", () => ({
  getVoucherList: (...a: unknown[]) => getVoucherList(...a),
}));

const voucherModalProps: any = {};
jest.mock("@/app/billing/overview/components/voucher/VoucherModal", () => ({
  VoucherModal: (props: any) => {
    Object.assign(voucherModalProps, props);
    return props.open ? <div data-testid="voucher-modal" /> : null;
  },
}));

import Share from "@/app/referral/components/Share";

function renderShare(ids: string[] = []) {
  return render(
    <Share
      code="CODE"
      inviteCount={5}
      commissions={50000}
      registerCommissions={50000}
      voucherTemplateIds={ids}
    />,
  );
}

describe("referral Share", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(voucherModalProps)) delete voucherModalProps[k];
  });

  it("renders the reward total (commissions converted) and referral count", () => {
    renderShare();
    // (50000 + 50000) / 10000 = 10
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(getVoucherList).not.toHaveBeenCalled();
  });

  it("fetches vouchers when template ids are provided", async () => {
    getVoucherList.mockResolvedValueOnce({
      totalBalance: 1,
      data: [{ id: "v" }],
    });
    renderShare(["tpl-1"]);
    await waitFor(() => expect(getVoucherList).toHaveBeenCalledWith(["tpl-1"]));
  });

  it("opens the voucher modal when total reward is clicked", () => {
    renderShare();
    fireEvent.click(screen.getByText("$10"));
    expect(screen.getByTestId("voucher-modal")).toBeInTheDocument();
    expect(voucherModalProps.title).toBe("Total reward");
  });
});
