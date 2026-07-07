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
import APIKeyTable from "@/app/billing/billing-details/components/APIKeyTable";
import { getBillListByAPIKey } from "@/api/billing";
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
  getBillListByAPIKey: jest.fn(),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ user: { uuid: "u", email: "e", allTeamMembers: [] } }),
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

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

// Controllable date picker: distinct buttons emit specific ranges to hit each
// validation branch in the effect.
jest.mock("@/components/ui/standard/date-range-picker-utc-common", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onChange({ from: new Date("2025-12-01"), to: new Date("2025-12-10") })
        }
      >
        before-min-start
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({ from: new Date("2026-02-10"), to: new Date("2025-12-20") })
        }
      >
        end-before-min
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({ from: new Date("2026-03-10"), to: new Date("2026-03-01") })
        }
      >
        start-after-end
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({ from: new Date("2026-01-01"), to: new Date("2026-03-15") })
        }
      >
        over-31-days
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({ from: new Date("2026-02-01"), to: new Date("2026-02-05") })
        }
      >
        valid-range
      </button>
      <button
        type="button"
        onClick={() => onChange({ from: undefined, to: undefined })}
      >
        clear date
      </button>
    </div>
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
      <button type="button" onClick={() => onValueChange("gen_api")}>
        choose gen_api
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

const getBillListByAPIKeyMock = jest.mocked(getBillListByAPIKey);

const bill = {
  apikeyName: "k1",
  apikeyMask: "sk-1",
  productName: "model-alpha",
  billingMethod: 5, // batch -> exercises "(batch)" suffix
  category: "llm",
  billNum0: 10,
  billNum1: 20,
  basePrice0: 30000,
  basePrice1: 40000,
  discountPrice0: 25000,
  discountPrice1: 35000,
  pricePrecision: 10000,
  amount: 123456,
  voucherAmount: 23456,
  payAmount: 100000,
  requestCount: 7,
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-01T01:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  getBillListByAPIKeyMock.mockResolvedValue({ bills: [bill] } as any);
});

describe("APIKeyTable date-validation branches", () => {
  it("errors when start time is earlier than 2026-01-01", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "before-min-start" }));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "The query time range cannot be earlier than 2026-01-01",
      ),
    );
  });

  it("errors when end time is earlier than 2026-01-01", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "end-before-min" }));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "The query time range cannot be earlier than 2026-01-01",
      ),
    );
  });

  it("errors when start is after end", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "start-after-end" }));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "The start time cannot be later than the end time",
      ),
    );
  });

  it("errors when range exceeds 31 days", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "over-31-days" }));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "The query time range cannot exceed 31 days",
      ),
    );
  });

  it("re-fetches on a valid range change", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");
    getBillListByAPIKeyMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "valid-range" }));
    await waitFor(() => expect(getBillListByAPIKeyMock).toHaveBeenCalled());
  });

  it("clears the bill list when the range is emptied", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "clear date" }));
    expect(await screen.findByText("No billing data")).toBeInTheDocument();
  });
});

describe("APIKeyTable param + pagination branches", () => {
  it("passes productName when searching and category when filtering", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");

    fireEvent.click(screen.getByRole("button", { name: "search Model Name" }));
    await waitFor(() =>
      expect(getBillListByAPIKeyMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ productName: "searched Model Name" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "choose gen_api" }));
    await waitFor(() =>
      expect(getBillListByAPIKeyMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "gen_api" }),
        expect.any(AbortSignal),
      ),
    );
  });

  it("pseudo-paginates without a re-fetch on page change", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");
    const before = getBillListByAPIKeyMock.mock.calls.length;

    jest.useFakeTimers();
    fireEvent.click(screen.getByTestId("pagination"));
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(getBillListByAPIKeyMock.mock.calls.length).toBe(before);
    jest.useRealTimers();
  });
});

describe("APIKeyTable error + render branches", () => {
  it("clears loading on a non-abort fetch error and shows empty state", async () => {
    getBillListByAPIKeyMock.mockRejectedValue(new Error("boom"));
    render(<APIKeyTable pageSize={10} />);

    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("renders the batch suffix on the model name", async () => {
    render(<APIKeyTable pageSize={10} />);
    expect(await screen.findByText("model-alpha(batch)")).toBeInTheDocument();
  });

  it("renders dashes for non-llm token/price columns", async () => {
    getBillListByAPIKeyMock.mockResolvedValue({
      bills: [{ ...bill, category: "gen_api", billNum: 5, billNumUnit: "img" }],
    } as any);
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha(batch)");
    // non-llm rows render "-" for token columns
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});
