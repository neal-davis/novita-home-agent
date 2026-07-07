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
import GPUInstanceTable from "@/app/billing/billing-details/components/GPUInstanceTable";
import GPUInstanceTableMonthly from "@/app/billing/billing-details/components/GPUInstanceTableMonthly";
import NetworkStorageTable from "@/app/billing/billing-details/components/NetworkStorageTable";
import NetworkStorageTableMonthly from "@/app/billing/billing-details/components/NetworkStorageTableMonthly";
import ImageDedicatedEndpointTable from "@/app/billing/billing-details/components/ImageDedicatedEndpointTable";
import LLMDedicatedEndpointTable from "@/app/billing/billing-details/components/LLMDedicatedEndpointTable";
import Sandbox from "@/app/billing/billing-details/components/Sandbox";
import SummaryTable from "@/app/billing/billing-details/components/SummaryTable";
import SummaryTableMonthly from "@/app/billing/billing-details/components/SummaryTableMonthly";
import GenAPITable from "@/app/billing/billing-details/components/GenAPITable";
import ServerlessTable from "@/app/billing/billing-details/components/ServerlessTable";
import { getBillList, getBillListMonthly } from "@/api/billing";
import { message } from "@/components/ui/standard/notify";

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
  getBillList: jest.fn(),
  getBillListMonthly: jest.fn(),
  getBillCategory: jest.fn(),
}));

const userState = {
  user: {
    allTeamMembers: [] as any[],
    email: "self@example.com",
    uuid: "user-self",
  },
};

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) => selector(userState),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock("lodash-es/isEqual", () => ({
  __esModule: true,
  default: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
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
  CLICK_BTN_IDs: { BILLING: new Proxy({}, { get: (_t, p) => String(p) }) },
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

// Date picker emits a valid range to exercise the fetch param branches.
jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          from: new Date("2026-02-01T00:00:00.000Z"),
          to: new Date("2026-02-05T00:00:00.000Z"),
        })
      }
    >
      pick date
    </button>
  ),
}));

jest.mock("@/app/billing/billing-details/components/DateToggleGroup", () => ({
  __esModule: true,
  default: ({ onCycleChange }: any) => (
    <button type="button" onClick={() => onCycleChange("Week")}>
      group by
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

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange("All")}>
        choose all
      </button>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <span>{children}</span>,
  HoverCardContent: ({ children }: any) => <span>{children}</span>,
  HoverCardTrigger: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/app/components/Table/MemberCell", () => ({
  __esModule: true,
  default: ({ memberID, uuid }: any) => (
    <span data-testid="member-cell">
      {memberID}:{uuid}
    </span>
  ),
}));

const getBillListMock = jest.mocked(getBillList);
const getBillListMonthlyMock = jest.mocked(getBillListMonthly);
const getBillCategoryMock = jest.mocked(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@/api/billing").getBillCategory,
);

const bill = {
  amount: 123456,
  basePrice0: 30000,
  basePrice1: 40000,
  billNum0: 10,
  billNum1: 20,
  billingMethod: 1,
  category: "llm",
  discountPrice0: 25000,
  discountPrice1: 35000,
  endTime: "2026-01-01T01:00:00.000Z",
  ownerID: "endpoint-1",
  payAmount: 100000,
  pricePrecision: 10000,
  productName: "model-alpha",
  productCategory: "GPU",
  requestCount: 7,
  startTime: "2026-01-01T00:00:00.000Z",
  voucherAmount: 23456,
  unitPrice: 5000,
  basePrice: 5000,
  billNum: 3,
};

const monthlyBill = {
  amount: 456789,
  basePrice: 880000,
  billNum: 2,
  cycle: "2026-01",
  endTime: 1767225600,
  ownerID: "instance-monthly-1",
  payAmount: 400000,
  pricePrecision: 10000,
  productCategory: "GPU Instance",
  productName: "dedicated endpoint",
  startTime: 1767139200,
  storageDays: 31,
  tradeMode: "monthly",
  tradeType: "monthly_new_buy",
  voucherAmount: 56789,
  memberId: "m-1",
  userId: "user-b",
};

beforeEach(() => {
  jest.clearAllMocks();
  userState.user = {
    allTeamMembers: [],
    email: "self@example.com",
    uuid: "user-self",
  };
  getBillListMock.mockResolvedValue({ bills: [bill] } as any);
  getBillListMonthlyMock.mockResolvedValue({ bills: [monthlyBill] } as any);
  (getBillCategoryMock as jest.Mock).mockResolvedValue({
    data: ["Vision", "Compute"],
  } as any);
});

// On-demand tables backed by getBillList.
const onDemandTables: Array<[string, React.ComponentType<any>]> = [
  ["GPUInstanceTable", GPUInstanceTable],
  ["NetworkStorageTable", NetworkStorageTable],
  ["LLMDedicatedEndpointTable", LLMDedicatedEndpointTable],
  ["Sandbox", Sandbox],
  ["SummaryTable", SummaryTable],
  ["GenAPITable", GenAPITable],
  ["ServerlessTable", ServerlessTable],
];

describe.each(onDemandTables)(
  "%s shared interaction branches",
  (_name, Comp) => {
    it("re-fetches with a valid picked date range", async () => {
      render(<Comp pageSize={10} />);
      await screen.findByTestId("pagination");
      getBillListMock.mockClear();

      fireEvent.click(screen.getByRole("button", { name: "pick date" }));
      await waitFor(() =>
        expect(getBillListMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ startTime: expect.any(String) }),
          expect.any(AbortSignal),
        ),
      );
    });

    it("pseudo-paginates without re-fetching on page change", async () => {
      render(<Comp pageSize={10} />);
      await screen.findByTestId("pagination");
      const before = getBillListMock.mock.calls.length;

      jest.useFakeTimers();
      fireEvent.click(screen.getByTestId("pagination"));
      act(() => {
        jest.advanceTimersByTime(250);
      });
      expect(getBillListMock.mock.calls.length).toBe(before);
      jest.useRealTimers();
    });

    it("clears loading on a non-abort fetch error", async () => {
      getBillListMock.mockRejectedValue(new Error("boom"));
      render(<Comp pageSize={10} />);

      await waitFor(() =>
        expect(screen.getByText("No billing data")).toBeInTheDocument(),
      );
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  },
);

// Monthly tables backed by getBillListMonthly.
const monthlyTables: Array<[string, React.ComponentType<any>]> = [
  ["GPUInstanceTableMonthly", GPUInstanceTableMonthly],
  ["NetworkStorageTableMonthly", NetworkStorageTableMonthly],
  ["ImageDedicatedEndpointTable", ImageDedicatedEndpointTable],
  ["SummaryTableMonthly", SummaryTableMonthly],
];

describe.each(monthlyTables)(
  "%s shared interaction branches",
  (_name, Comp) => {
    it("re-fetches with a valid picked date range", async () => {
      render(<Comp pageSize={10} />);
      await screen.findByTestId("pagination");
      getBillListMonthlyMock.mockClear();

      fireEvent.click(screen.getByRole("button", { name: "pick date" }));
      await waitFor(() =>
        expect(getBillListMonthlyMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ startTime: expect.any(String) }),
          expect.any(AbortSignal),
        ),
      );
    });

    it("pseudo-paginates without re-fetching on page change", async () => {
      render(<Comp pageSize={10} />);
      await screen.findByTestId("pagination");
      const before = getBillListMonthlyMock.mock.calls.length;

      jest.useFakeTimers();
      fireEvent.click(screen.getByTestId("pagination"));
      act(() => {
        jest.advanceTimersByTime(250);
      });
      expect(getBillListMonthlyMock.mock.calls.length).toBe(before);
      jest.useRealTimers();
    });

    it("clears loading on a non-abort fetch error", async () => {
      getBillListMonthlyMock.mockRejectedValue(new Error("boom"));
      render(<Comp pageSize={10} />);

      await waitFor(() =>
        expect(screen.getByText("No billing data")).toBeInTheDocument(),
      );
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
  },
);
