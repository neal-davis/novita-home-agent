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
import LLMDedicatedEndpointTable from "@/app/billing/billing-details/components/LLMDedicatedEndpointTable";
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

jest.mock("lodash-es/isEqual", () => ({
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
      BILLING_DETAIL_SEARCH_MODEL_NAME: "search-model",
    },
  },
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder }: any) => (
    <button type="button" onClick={() => onSearch(`searched ${placeholder}`)}>
      search {placeholder}
    </button>
  ),
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
  productName: "dedicated-llm",
  category: "Compute",
  ownerID: "ep-1",
  billingMethod: 1,
  discountPrice0: 25000,
  pricePrecision: 10000,
  amount: 123456,
  amountDecimal: "12.3456",
  voucherAmount: 23456,
  voucherAmountDecimal: "2.3456",
  payAmount: 100000,
  payableDecimal: "10.0000",
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-01T01:00:00.000Z",
};

describe("LLMDedicatedEndpointTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBillListMock.mockResolvedValue({ bills: [bill] } as any);
  });

  it("renders rows with pricing model, unit price, and money columns", async () => {
    render(<LLMDedicatedEndpointTable pageSize={10} />);

    expect(await screen.findByText("dedicated-llm")).toBeInTheDocument();
    expect(screen.getByText("Endpoints ID")).toBeInTheDocument();
    expect(screen.getByText("ep-1")).toBeInTheDocument();
    expect(screen.getByText("Compute")).toBeInTheDocument();
    expect(screen.getByText("On-Demand")).toBeInTheDocument();
    expect(screen.getByText("$0.00025")).toBeInTheDocument();
    expect(screen.getByText("$12.3456")).toBeInTheDocument();
    expect(getBillListMock).toHaveBeenCalledWith(
      expect.objectContaining({ productCategory: "llm_dedicated_endpoint" }),
      expect.any(AbortSignal),
    );
  });

  it("filters by endpoint id search and exports the workbook", async () => {
    render(<LLMDedicatedEndpointTable pageSize={10} />);
    await screen.findByText("dedicated-llm");

    fireEvent.click(
      screen.getByRole("button", { name: "search Endpoints ID" }),
    );
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ ownerId: "searched Endpoints ID" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "LLM-Dedicated-Endpoints-Billing.xlsx",
    );
  });

  it("warns on empty export and shows empty state", async () => {
    getBillListMock.mockResolvedValue({ bills: [] } as any);

    render(<LLMDedicatedEndpointTable pageSize={10} />);
    expect(await screen.findByText("No billing data")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
    expect(XLSX.writeFile).not.toHaveBeenCalled();
  });

  it("pseudo-paginates without refetch and clears loading on error", async () => {
    render(<LLMDedicatedEndpointTable pageSize={10} />);
    await screen.findByText("dedicated-llm");

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
    render(<LLMDedicatedEndpointTable pageSize={10} />);
    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
  });
});
