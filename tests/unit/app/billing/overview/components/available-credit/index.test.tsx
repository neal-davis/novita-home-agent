import { render, screen, waitFor } from "@testing-library/react";
import AvailableCredit from "@/app/billing/overview/components/available-credit/index";

const mockDispatch = jest.fn();
let mockBalanceDetail: any;

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (sel: (s: any) => unknown) =>
    sel({ billing: { balanceDetail: mockBalanceDetail } }),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: () => ({ type: "fetchBalanceDetail" }),
}));

jest.mock(
  "@/app/billing/overview/components/available-credit/CreditRow",
  () => ({
    __esModule: true,
    default: ({ label, value }: any) => (
      <div>
        row {label}: {value}
      </div>
    ),
  }),
);

describe("AvailableCredit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders skeleton and dispatches fetch when status is null", async () => {
    mockBalanceDetail = { status: null };
    render(<AvailableCredit />);
    // No data rows while loading
    expect(screen.queryByText("Available Credit")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it("renders the credit summary on success", () => {
    mockBalanceDetail = {
      status: "success",
      availableCredit: "120.50",
      accountBalance: "100.00",
      pendingCharges: "0",
      creditLimit: "0",
      outstandingInvoices: "0",
    };
    render(<AvailableCredit />);
    expect(screen.getByText("Available Credit")).toBeInTheDocument();
    expect(screen.getByText("$ 120.50")).toBeInTheDocument();
    expect(screen.getByText("row Account balance: 100.00")).toBeInTheDocument();
    // no other rows -> no description
    expect(
      screen.queryByText(/remaining amount you can use/),
    ).not.toBeInTheDocument();
  });

  it("renders optional rows and the description when other values present", () => {
    mockBalanceDetail = {
      status: "success",
      availableCredit: "120.50",
      accountBalance: "100.00",
      pendingCharges: "5",
      creditLimit: "200",
      outstandingInvoices: "15",
    };
    render(<AvailableCredit />);
    expect(screen.getByText("row Pending charges: 5")).toBeInTheDocument();
    expect(screen.getByText("row Credit limit: 200")).toBeInTheDocument();
    expect(
      screen.getByText("row Outstanding invoices: 15"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/remaining amount you can use/),
    ).toBeInTheDocument();
  });
});
