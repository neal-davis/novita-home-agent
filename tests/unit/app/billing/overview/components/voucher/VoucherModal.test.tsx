import { render, screen } from "@testing-library/react";
import { VoucherModal } from "@/app/billing/overview/components/voucher/VoucherModal";
import type { VoucherItem } from "@/app/billing/overview/components/voucher/constants";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogClose: () => <button type="button">close</button>,
  DialogContentInner: ({ children }: any) => <div>{children}</div>,
}));

const voucher: VoucherItem = {
  id: "v1",
  name: "Welcome Voucher",
  status: "valid",
  effectDate: "1700000000",
  expiryDate: "1800000000",
  balance: 100000,
  originalValue: 200000,
  businessTypes: ["model_api"],
};

describe("VoucherModal", () => {
  it("does not render when closed", () => {
    render(
      <VoucherModal
        open={false}
        onClose={jest.fn()}
        data={[voucher]}
        title="Vouchers"
        loading={false}
      />,
    );
    expect(screen.queryByText("Vouchers")).not.toBeInTheDocument();
  });

  it("renders the title and voucher rows", () => {
    render(
      <VoucherModal
        open
        onClose={jest.fn()}
        data={[voucher]}
        title="All Vouchers"
        loading={false}
      />,
    );
    expect(screen.getByText("All Vouchers")).toBeInTheDocument();
    expect(screen.getByText("Welcome Voucher")).toBeInTheDocument();
    expect(screen.getByText("Model API")).toBeInTheDocument();
    // balance/total formatted
    expect(
      screen.getByText(
        (_c, el) =>
          el?.textContent === "$10.0000 / $20.0000" && el.tagName === "TD",
      ),
    ).toBeInTheDocument();
  });

  it("renders without rows while loading", () => {
    render(
      <VoucherModal
        open
        onClose={jest.fn()}
        data={[voucher]}
        title="Vouchers"
        loading
      />,
    );
    expect(screen.queryByText("Welcome Voucher")).not.toBeInTheDocument();
  });
});
