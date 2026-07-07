import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
  default: ({ onChange }: { onChange: (d: any) => void }) => (
    <button
      type="button"
      onClick={() =>
        onChange({ from: new Date("2026-01-01"), to: new Date("2026-01-31") })
      }
    >
      pick date
    </button>
  ),
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({
    onChange,
    total,
  }: {
    onChange: (page: number) => void;
    total: number;
  }) => (
    <button type="button" onClick={() => onChange(2)}>
      paginate total {total}
    </button>
  ),
}));

// Render Select as a minimal native dropdown so onValueChange is testable,
// without duplicating option label text into the document.
jest.mock("@/components/ui/select", () => {
  return {
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
        <option value="WaitingPay">WaitingPay</option>
      </select>
    ),
    SelectContent: () => null,
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectItem: () => null,
  };
});

const mockOrderList = orderList as jest.Mock;
const mockGetInvoice = getStripeInvoiceUrl as jest.Mock;

const orders = [
  {
    oid: "order-1",
    transactionDate: 1700000000,
    orderType: "recharge",
    note: "Top up",
    channel: "Stripe",
    status: "Success",
    payCount: 100,
    price: 0,
    taxAmount: 5,
    grossAmount: 105,
    invoiceAddress: "addr",
  },
  {
    oid: "order-2",
    transactionDate: 1700000000,
    orderType: "refund",
    note: "Refund note",
    channel: "Stripe",
    status: "Failed",
    payCount: -50,
    price: 0,
    taxAmount: 0,
    grossAmount: -50,
    invoiceAddress: "",
  },
];

describe("BillingHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission = true;
    mockOrderList.mockResolvedValue({ orders, total: 2 });
    mockGetInvoice.mockResolvedValue({ invoiceUrl: "https://invoice" });
    window.open = jest.fn();
  });

  it("renders rows from orderList and shows recharge/refund types and statuses", async () => {
    render(<BillingHistory />);

    expect(await screen.findByText("order-1")).toBeInTheDocument();
    const table = document.querySelector("table") as HTMLElement;
    expect(screen.getByText("order-2")).toBeInTheDocument();
    expect(within(table).getByText("Recharge")).toBeInTheDocument();
    expect(within(table).getByText("Refund")).toBeInTheDocument();
    expect(screen.getByText("Payment successful")).toBeInTheDocument();
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
    // Pagination shows when loaded with data
    expect(screen.getByText(/paginate total 2/)).toBeInTheDocument();
  });

  it("formats negative amounts with a leading minus", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-1");
    // refund row renders a negative amount in red with a leading minus
    const negative = screen.getAllByText(
      (_content, el) => el?.tagName === "SPAN" && el.textContent === "-$50.00",
    );
    expect(negative.length).toBeGreaterThan(0);
    expect(negative[0]).toHaveStyle({ color: "var(--red-1)" });
    // positive amount
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  it("shows a Download receipt link only when invoiceAddress exists and opens invoice", async () => {
    render(<BillingHistory />);
    const download = await screen.findByText("Download");
    // Only one Download link (order-2 has no invoiceAddress)
    expect(screen.getAllByText("Download")).toHaveLength(1);

    fireEvent.click(download);
    await waitFor(() => {
      expect(mockGetInvoice).toHaveBeenCalledWith("order-1");
      expect(window.open).toHaveBeenCalledWith("https://invoice", "_blank");
    });
  });

  it("does not fetch when the user lacks permission", async () => {
    mockHasPermission = false;
    render(<BillingHistory />);
    await waitFor(() => {
      expect(mockOrderList).not.toHaveBeenCalled();
    });
  });

  it("refetches with date range filter and resets to page 1", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-1");
    mockOrderList.mockClear();

    fireEvent.click(screen.getByText("pick date"));

    await waitFor(() => {
      expect(mockOrderList).toHaveBeenCalled();
    });
    const arg = mockOrderList.mock.calls[0][0];
    expect(arg.startTime).toBeDefined();
    expect(arg.endTime).toBeDefined();
    expect(arg.pageIndex).toBe(1);
  });

  it("changes page through pagination", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-1");
    mockOrderList.mockClear();

    fireEvent.click(screen.getByText(/paginate total 2/));
    await waitFor(() => {
      expect(mockOrderList).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 2 }),
      );
    });
  });

  it("filters by transaction type via select", async () => {
    render(<BillingHistory />);
    await screen.findByText("order-1");
    mockOrderList.mockClear();

    const typeSelect = screen.getAllByLabelText("select-all")[0];
    fireEvent.change(typeSelect, { target: { value: "refund" } });

    await waitFor(() => {
      expect(mockOrderList).toHaveBeenCalledWith(
        expect.objectContaining({ orderType: "refund" }),
      );
    });
  });

  it("hides pagination when there is no data", async () => {
    mockOrderList.mockResolvedValue({ orders: [], total: 0 });
    render(<BillingHistory />);
    await waitFor(() => {
      expect(mockOrderList).toHaveBeenCalled();
    });
    expect(screen.queryByText(/paginate total/)).not.toBeInTheDocument();
  });
});
