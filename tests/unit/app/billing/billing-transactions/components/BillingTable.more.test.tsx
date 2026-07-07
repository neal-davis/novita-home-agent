import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BillingHistory } from "@/app/billing/billing-transactions/components/BillingTable";
import { orderList, getStripeInvoiceUrl } from "@/api/buy";

jest.mock("@/api/buy", () => ({
  orderList: jest.fn(),
  getStripeInvoiceUrl: jest.fn(),
}));

let mockHasPermission = true;
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockHasPermission,
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: () => <button type="button">pick date</button>,
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ onChange, total }: any) => (
    <button type="button" onClick={() => onChange(2)}>
      paginate total {total}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, value }: any) => (
    <select
      aria-label={`select-${value}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="all">all</option>
      <option value="recharge">recharge</option>
      <option value="refund">refund</option>
      <option value="Stripe">Stripe</option>
      <option value="Corporate Transfer">Corporate Transfer</option>
      <option value="WaitingPay">WaitingPay</option>
      <option value="Success">Success</option>
    </select>
  ),
  SelectContent: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectItem: () => null,
}));

const mockOrderList = orderList as jest.Mock;
const mockGetInvoice = getStripeInvoiceUrl as jest.Mock;

const orders = [
  {
    oid: "order-paying",
    transactionDate: 1700000000,
    orderType: "recharge",
    note: "Pending",
    channel: "Stripe",
    status: "Paying",
    payCount: 100,
    grossAmount: 100,
    invoiceAddress: "",
  },
  {
    oid: "order-expired",
    transactionDate: 1700000000,
    orderType: "recharge",
    note: "Old",
    channel: "Stripe",
    status: "Expired",
    payCount: 100,
    grossAmount: 100,
    invoiceAddress: "",
  },
];

describe("BillingHistory extra branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission = true;
    mockOrderList.mockResolvedValue({ orders, total: 2 });
    mockGetInvoice.mockResolvedValue({ invoiceUrl: "https://invoice" });
  });

  it("maps Paying and Expired statuses to their display labels", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-paying");
    expect(screen.getByText("Paying")).toBeInTheDocument();
    expect(screen.getByText("Payment closed")).toBeInTheDocument();
  });

  it("filters by payment method via the second select", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-paying");
    mockOrderList.mockClear();

    const paymentSelect = screen.getAllByLabelText("select-all")[1];
    fireEvent.change(paymentSelect, { target: { value: "Stripe" } });

    await waitFor(() =>
      expect(mockOrderList).toHaveBeenCalledWith(
        expect.objectContaining({ channel: "Stripe" }),
      ),
    );
  });

  it("clears the payment method filter when set back to all", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-paying");
    const paymentSelect = screen.getAllByLabelText("select-all")[1];
    fireEvent.change(paymentSelect, { target: { value: "Stripe" } });
    await waitFor(() =>
      expect(mockOrderList).toHaveBeenLastCalledWith(
        expect.objectContaining({ channel: "Stripe" }),
      ),
    );
    // back to all -> channel undefined
    const refreshed = screen.getAllByLabelText("select-Stripe")[0];
    fireEvent.change(refreshed, { target: { value: "all" } });
    await waitFor(() =>
      expect(mockOrderList).toHaveBeenLastCalledWith(
        expect.objectContaining({ channel: undefined }),
      ),
    );
  });

  it("filters by status via the third select", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-paying");
    mockOrderList.mockClear();

    const statusSelect = screen.getAllByLabelText("select-all")[2];
    fireEvent.change(statusSelect, { target: { value: "Success" } });

    await waitFor(() =>
      expect(mockOrderList).toHaveBeenCalledWith(
        expect.objectContaining({ status: "Success" }),
      ),
    );
  });
});
