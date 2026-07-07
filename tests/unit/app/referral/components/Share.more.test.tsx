import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

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
      inviteCount={1}
      commissions={0}
      registerCommissions={0}
      voucherTemplateIds={ids}
    />,
  );
}

describe("referral Share (more)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(voucherModalProps)) delete voucherModalProps[k];
  });

  it("does not store voucher data when totalBalance is missing", async () => {
    getVoucherList.mockResolvedValueOnce({
      totalBalance: 0,
      data: [{ id: "v" }],
    });
    renderShare(["tpl-1"]);
    await waitFor(() => expect(getVoucherList).toHaveBeenCalledWith(["tpl-1"]));
    // modal data stays empty because the totalBalance guard rejected the result
    expect(voucherModalProps.data).toEqual([]);
  });

  it("closes the voucher modal through the onClose handler", () => {
    renderShare();
    // open it
    fireEvent.click(screen.getByText("$0"));
    expect(screen.getByTestId("voucher-modal")).toBeInTheDocument();
    // invoking onClose flips openVoucher back to false
    act(() => voucherModalProps.onClose());
    expect(screen.queryByTestId("voucher-modal")).not.toBeInTheDocument();
  });
});
