import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import SummaryTable from "@/app/billing/billing-details/components/SummaryTable";
import { getBillList } from "@/api/billing";
import { message } from "@/components/ui/standard/notify";
import * as XLSX from "xlsx";

dayjs.extend(utc);

jest.mock("xlsx", () => ({
  utils: {
    book_append_sheet: jest.fn(),
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn(() => ({})),
  },
  writeFile: jest.fn(),
}));

jest.mock("@/api/billing", () => ({ getBillList: jest.fn() }));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn() },
}));

jest.mock("lodash/isEqual", () => ({
  __esModule: true,
  default: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    BILLING: {
      BILLING_DETAIL_EXPORT_EXCEL: "export",
      BILLING_DETAIL_PICK_DATE: "pick-date",
      BILLING_DETAIL_SELECTED_TIME_GROUP: "select-group",
    },
  },
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children, loading }: any) => (
    <div data-loading={String(loading)}>{children}</div>
  ),
  TableHeader: ({ children }: any) => <>{children}</>,
  TableRow: ({ children }: any) => <div role="row">{children}</div>,
  TableHead: ({ children }: any) => <div role="columnheader">{children}</div>,
  TableBody: ({ children }: any) => <>{children}</>,
  TableCell: ({ children }: any) => <div role="cell">{children}</div>,
  TableSpinner: () => <div data-testid="spinner">loading...</div>,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No billing data</div>,
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ total, pageSize, onChange }: any) => (
    <button type="button" data-testid="pagination" onClick={() => onChange(2)}>
      total {total} pageSize {pageSize}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          from: new Date("2026-02-01T00:00:00.000Z"),
          to: new Date("2026-02-03T00:00:00.000Z"),
        })
      }
    >
      pick date
    </button>
  ),
}));

jest.mock("@/app/billing/billing-details/components/DateToggleGroup", () => ({
  __esModule: true,
  default: ({ onCycleChange, selected }: any) => (
    <button type="button" onClick={() => onCycleChange("Week")}>
      group by {selected}
    </button>
  ),
}));

jest.mock("@/app/user/components/console-button", () => ({
  ConsoleButton: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const getBillListMock = jest.mocked(getBillList);

const bill = {
  amount: 123456,
  amountDecimal: "12.3456",
  voucherAmount: 23456,
  voucherAmountDecimal: "2.3456",
  payAmount: 100000,
  payableDecimal: "10.0000",
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-01T01:00:00.000Z",
};

describe("SummaryTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBillListMock.mockResolvedValue({ bills: [bill] } as any);
  });

  it("renders summary money columns and requests the summary category", async () => {
    render(<SummaryTable pageSize={10} />);

    expect(await screen.findByText("$12.3456")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("Voucher Discount")).toBeInTheDocument();
    expect(screen.getByText("$2.3456")).toBeInTheDocument();
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent(
      "total 1 pageSize 10",
    );
    expect(getBillListMock).toHaveBeenCalledWith(
      expect.objectContaining({ productCategory: "summary" }),
      expect.any(AbortSignal),
    );
  });

  it("refetches on group change and exports the summary workbook", async () => {
    render(<SummaryTable pageSize={10} />);
    await screen.findByText("$12.3456");

    fireEvent.click(screen.getByRole("button", { name: /group by/ }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ cycleType: "Week" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Summary-Ondemand-Billing.xlsx",
    );
  });

  it("warns on empty export and renders empty state", async () => {
    getBillListMock.mockResolvedValue({ bills: [] } as any);

    render(<SummaryTable pageSize={10} />);
    expect(await screen.findByText("No billing data")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
    expect(XLSX.writeFile).not.toHaveBeenCalled();
  });

  it("pseudo-paginates without refetch", async () => {
    render(<SummaryTable pageSize={10} />);
    await screen.findByText("$12.3456");

    jest.useFakeTimers();
    fireEvent.click(screen.getByTestId("pagination"));
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(getBillListMock).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("clears loading on non-abort fetch error", async () => {
    getBillListMock.mockRejectedValue(new Error("down"));
    render(<SummaryTable pageSize={10} />);
    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
  });
});
