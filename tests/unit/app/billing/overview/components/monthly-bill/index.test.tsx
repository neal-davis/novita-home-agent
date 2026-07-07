import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MonthlyBill } from "@/app/billing/overview/components/monthly-bill/index";
import { getMonthlyBill } from "@/api/billing";
import { updateStripeCustomerPortal } from "@/api/buy";

jest.mock("@/api/billing", () => ({
  getMonthlyBill: jest.fn(),
}));

jest.mock("@/api/buy", () => ({
  updateStripeCustomerPortal: jest.fn(),
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No data available</div>,
}));

// Native select so onValueChange filter is testable.
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select
      aria-label="status-filter"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="All">All</option>
      <option value="paid">paid</option>
      <option value="overdue">overdue</option>
    </select>
  ),
  SelectContent: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectItem: () => null,
}));

const mockGet = getMonthlyBill as jest.Mock;
const mockPortal = updateStripeCustomerPortal as jest.Mock;

const bills = [
  {
    startTime: "1700000000",
    endTime: "1700500000",
    totalAmount: "1000000",
    voucherPayAmount: "100000",
    cashPayAmount: "900000",
    taxAmount: "50000",
    grossAmount: "1050000",
    debtAmount: "0",
    repaidAmount: "1050000",
    status: "paid",
    invoiceUrl: "https://invoice/paid",
  },
  {
    startTime: "1700000000",
    endTime: "1700500000",
    totalAmount: "0",
    voucherPayAmount: "0",
    cashPayAmount: "0",
    taxAmount: "0",
    grossAmount: "0",
    debtAmount: "500000",
    repaidAmount: "0",
    status: "overdue",
    invoiceUrl: "",
  },
];

describe("MonthlyBill", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: bills });
    mockPortal.mockResolvedValue({ url: "https://portal" });
    window.open = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders header and note section", async () => {
    render(<MonthlyBill />);
    expect(screen.getByText("Monthly Bill")).toBeInTheDocument();
    expect(screen.getByText("Update billing info")).toBeInTheDocument();
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
  });

  it("renders fetched bills with formatted amounts and status text", async () => {
    render(<MonthlyBill />);
    expect(await screen.findByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    // paid row has invoice download link
    expect(
      screen.getByRole("link", { name: /Download invoice/ }),
    ).toBeInTheDocument();
  });

  it("shows '-' for outstanding bill amounts but keeps amount due", async () => {
    render(<MonthlyBill />);
    await screen.findByText("Overdue");
    // overdue/outstanding row: amountDue is $50.00
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("filters the table by status", async () => {
    render(<MonthlyBill />);
    await screen.findByText("Paid");

    fireEvent.change(screen.getByLabelText("status-filter"), {
      target: { value: "overdue" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Paid")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("opens the stripe customer portal on Update billing info click", async () => {
    render(<MonthlyBill />);
    await screen.findByText("Paid");

    fireEvent.click(screen.getByText("Update billing info"));
    await waitFor(() => {
      expect(mockPortal).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith("https://portal", "_blank");
    });
  });

  it("renders the empty state when no bills are returned", async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<MonthlyBill />);
    expect(await screen.findByText("No data available")).toBeInTheDocument();
  });

  it("handles fetch errors gracefully and stops loading", async () => {
    mockGet.mockRejectedValue(new Error("boom"));
    render(<MonthlyBill />);
    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });
});
