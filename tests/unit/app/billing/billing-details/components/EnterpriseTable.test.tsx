import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EnterpriseTable from "@/app/billing/billing-details/components/EnterpriseTable";
import { getEnterpriseBillList } from "@/api/billing";

dayjs.extend(utc);

jest.mock("@/api/billing", () => ({ getEnterpriseBillList: jest.fn() }));

jest.mock("lodash/isEqual", () => ({
  __esModule: true,
  default: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
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

const getEnterpriseBillListMock = jest.mocked(getEnterpriseBillList);

const bill = {
  productName: "saving-plan-model",
  startTime: "1767225600",
  discountPrice0: 30000,
  pricePrecision: 10000,
  committedUsage: 12345,
  amount: 123456,
  amountDecimal: "12.3456",
  voucherAmount: 23456,
  voucherAmountDecimal: "2.3456",
  payAmount: 100000,
  payableDecimal: "10.0000",
};

describe("EnterpriseTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getEnterpriseBillListMock.mockResolvedValue({ bills: [bill] } as any);
  });

  it("renders saving plan rows with pricing model, committed usage, billable usage and money", async () => {
    render(<EnterpriseTable pageSize={10} />);

    expect(await screen.findByText("saving-plan-model")).toBeInTheDocument();
    expect(screen.getByText("LLM Saving Plan")).toBeInTheDocument();
    expect(screen.getByText("Committed Usage (TPM)")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("12,345 TPM × 1440 minutes")).toBeInTheDocument();
    expect(screen.getByText("$0.0003")).toBeInTheDocument();
    expect(screen.getByText("$12.3456")).toBeInTheDocument();
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(getEnterpriseBillListMock).toHaveBeenCalledWith(
      expect.objectContaining({ productCategory: "token_saving_plan" }),
      expect.any(AbortSignal),
    );
  });

  it("refetches when the date range changes", async () => {
    render(<EnterpriseTable pageSize={10} />);
    await screen.findByText("saving-plan-model");

    fireEvent.click(screen.getByRole("button", { name: "pick date" }));
    await waitFor(() =>
      expect(getEnterpriseBillListMock).toHaveBeenCalledTimes(2),
    );
  });

  it("renders empty state and hides pagination on empty response", async () => {
    getEnterpriseBillListMock.mockResolvedValue({ bills: [] } as any);

    render(<EnterpriseTable pageSize={10} />);
    expect(await screen.findByText("No billing data")).toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  it("clears loading on non-abort fetch error", async () => {
    getEnterpriseBillListMock.mockRejectedValue(new Error("down"));
    render(<EnterpriseTable pageSize={10} />);
    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
  });
});
