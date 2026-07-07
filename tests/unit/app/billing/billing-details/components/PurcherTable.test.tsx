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
import PurcherTable from "@/app/billing/billing-details/components/PurcherTable";
import { getBillListByMember } from "@/api/billing";
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

jest.mock("@/api/billing", () => ({
  getBillListByMember: jest.fn(),
}));

const mockStoreState = {
  user: {
    uuid: "user-self",
    email: "self@example.com",
    allTeamMembers: [
      {
        memberId: "member-1",
        userId: "user-b",
        alias: "Ops Owner",
        email: "ops@example.com",
        phone: "",
      },
    ],
  },
};

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector(mockStoreState),
}));

jest.mock("@/app/components/Table/MemberCell", () => ({
  __esModule: true,
  default: ({ memberID, uuid }: { memberID?: string; uuid?: string }) => (
    <div>
      <span>Ops Owner</span>
      <span>ops@example.com</span>
      <span data-testid="member-ids">
        {memberID}:{uuid}
      </span>
    </div>
  ),
}));

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
    <button
      type="button"
      data-selected={selected}
      onClick={() => onCycleChange("Week")}
    >
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

const getBillListByMemberMock = jest.mocked(getBillListByMember);

const memberBill = {
  memberId: "member-1",
  userId: "user-b",
  productName: "creator-product",
  amount: 123456,
  amountDecimal: "12.3456",
  voucherAmount: 23456,
  voucherAmountDecimal: "2.3456",
  payAmount: 100000,
  payableDecimal: "10.0000",
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-31T00:00:00.000Z",
};

describe("PurcherTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBillListByMemberMock.mockResolvedValue({ bills: [memberBill] } as any);
  });

  it("renders creator billing rows with member email and formatted money", async () => {
    render(<PurcherTable pageSize={10} />);

    expect(await screen.findByText("creator-product")).toBeInTheDocument();
    expect(screen.getByText("Creator Account")).toBeInTheDocument();
    expect(screen.getByText("Ops Owner")).toBeInTheDocument();
    expect(screen.getByText("ops@example.com")).toBeInTheDocument();
    expect(screen.getByText("$12.3456")).toBeInTheDocument();
    expect(screen.getByText("$2.3456")).toBeInTheDocument();
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent(
      "total 1 pageSize 10",
    );
    expect(getBillListByMemberMock).toHaveBeenCalledWith(
      expect.objectContaining({ cycleType: "Month" }),
      expect.any(AbortSignal),
    );
  });

  it("exports the creator workbook and resolves the email via getCreator", async () => {
    render(<PurcherTable pageSize={10} />);
    await screen.findByText("creator-product");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          "Creator Account": "ops@example.com",
          "Product Name": "creator-product",
        }),
      ]),
      expect.any(Object),
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Creator-Ondemand-Billing.xlsx",
    );
  });

  it("warns when exporting with no data and shows the empty state", async () => {
    getBillListByMemberMock.mockResolvedValue({ bills: [] } as any);

    render(<PurcherTable pageSize={10} />);

    expect(await screen.findByText("No billing data")).toBeInTheDocument();
    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
    expect(XLSX.writeFile).not.toHaveBeenCalled();
  });

  it("refetches on date change and pseudo-paginates on page change", async () => {
    render(<PurcherTable pageSize={10} />);
    await screen.findByText("creator-product");

    fireEvent.click(screen.getByRole("button", { name: "pick date" }));
    await waitFor(() =>
      expect(getBillListByMemberMock).toHaveBeenCalledTimes(2),
    );

    jest.useFakeTimers();
    fireEvent.click(screen.getByTestId("pagination"));
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(getBillListByMemberMock).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it("clears loading on non-abort fetch error", async () => {
    getBillListByMemberMock.mockRejectedValue(new Error("boom"));

    render(<PurcherTable pageSize={10} />);

    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });
});
