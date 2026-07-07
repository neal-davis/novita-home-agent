import { render, screen, waitFor } from "@testing-library/react";
import BillingOverviewClient from "@/app/billing/overview/components/BillingOverviewClient";
import { getVoucherList } from "@/api/user";

jest.mock("@/api/user", () => ({
  getVoucherList: jest.fn(),
}));

const mockReplace = jest.fn();
let mockSearchParams: URLSearchParams;
jest.mock("next/navigation", () => ({
  usePathname: () => "/billing/overview",
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/app/billing/lib/hooks/paymentMethods", () => ({
  usePaymentMethod: jest.fn(() => ({ cardsInfo: [], isLoading: false })),
}));

jest.mock("@/app/billing/lib/hooks/autoPayment", () => ({
  useAutoPayment: jest.fn(() => ({
    rechargeSetting: { amount: "0", threshold: "0", isAutoRecharge: false },
  })),
}));

jest.mock("@/app/billing/overview/components/available-credit", () => ({
  __esModule: true,
  default: () => <div>available credit</div>,
}));

jest.mock("@/app/billing/overview/components/voucher/VoucherSummary", () => ({
  VoucherSummary: ({ loading, data }: any) => (
    <div>
      voucher summary loading:{String(loading)} count:{data.length}
    </div>
  ),
}));

jest.mock("@/app/billing/overview/components/voucher", () => ({
  __esModule: true,
  default: ({ redeemOpen }: any) => (
    <div>voucher redeemOpen:{String(redeemOpen)}</div>
  ),
}));

jest.mock("@/app/billing/overview/components/top-up", () => ({
  Topup: () => <div>topup</div>,
}));

jest.mock("@/app/billing/overview/components/automatic-payments", () => ({
  __esModule: true,
  default: () => <div>automatic payments</div>,
}));

jest.mock("@/app/billing/overview/components/monthly-bill", () => ({
  MonthlyBill: () => <div>monthly bill</div>,
}));

const mockGetVoucher = getVoucherList as jest.Mock;

describe("BillingOverviewClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockGetVoucher.mockResolvedValue({
      totalBalance: 100,
      data: [{ id: "v1" }, { id: "v2" }],
    });
  });

  it("renders all sections and loads vouchers", async () => {
    render(<BillingOverviewClient />);
    expect(screen.getByText("Fund Your Account")).toBeInTheDocument();
    expect(screen.getByText("available credit")).toBeInTheDocument();
    expect(screen.getByText("topup")).toBeInTheDocument();
    expect(screen.getByText("automatic payments")).toBeInTheDocument();
    expect(screen.getByText("monthly bill")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/count:2/)).toBeInTheDocument();
    });
    expect(mockGetVoucher).toHaveBeenCalled();
  });

  it("does not auto-open redeem when no ?redeem param present", async () => {
    render(<BillingOverviewClient />);
    await waitFor(() => expect(mockGetVoucher).toHaveBeenCalled());
    expect(screen.getByText("voucher redeemOpen:false")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("opens the redeem modal and strips the query param when ?redeem=1", async () => {
    mockSearchParams = new URLSearchParams("redeem=1");
    render(<BillingOverviewClient />);
    await waitFor(() => {
      expect(screen.getByText("voucher redeemOpen:true")).toBeInTheDocument();
    });
    expect(mockReplace).toHaveBeenCalledWith("/billing/overview");
  });
});
