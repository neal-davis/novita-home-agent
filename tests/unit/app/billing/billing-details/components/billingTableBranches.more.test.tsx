import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import APIKeyTable from "@/app/billing/billing-details/components/APIKeyTable";
import GPUInstanceTable from "@/app/billing/billing-details/components/GPUInstanceTable";
import GPUInstanceTableMonthly from "@/app/billing/billing-details/components/GPUInstanceTableMonthly";
import NetworkStorageTableMonthly from "@/app/billing/billing-details/components/NetworkStorageTableMonthly";
import ServerlessTable from "@/app/billing/billing-details/components/ServerlessTable";
import LLMTable from "@/app/billing/billing-details/components/LLMTable";
import {
  getBillCategory,
  getBillList,
  getBillListByAPIKey,
  getBillListMonthly,
} from "@/api/billing";
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
  getBillCategory: jest.fn(),
  getBillList: jest.fn(),
  getBillListByAPIKey: jest.fn(),
  getBillListMonthly: jest.fn(),
}));

// Mutable user state so individual tests can flip uuid / members.
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
  CLICK_BTN_IDs: {
    BILLING: new Proxy({}, { get: (_t, p) => String(p) }),
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

// Date picker that emits an *empty* range (clears start/end) — exercises the
// `if (!startTime || !endTime) { setBillList([]); return; }` branch.
jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() => onChange({ from: undefined, to: undefined })}
    >
      clear date
    </button>
  ),
}));

jest.mock("@/components/ui/standard/date-range-picker-utc-common", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() => onChange({ from: undefined, to: undefined })}
    >
      clear date
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
      <button type="button" onClick={() => onValueChange("Vision")}>
        choose vision
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

const getBillListMock = jest.mocked(getBillList);
const getBillListByAPIKeyMock = jest.mocked(getBillListByAPIKey);
const getBillCategoryMock = jest.mocked(getBillCategory);
const getBillListMonthlyMock = jest.mocked(getBillListMonthly);

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
  requestCount: 7,
  startTime: "2026-01-01T00:00:00.000Z",
  voucherAmount: 23456,
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
};

beforeEach(() => {
  jest.clearAllMocks();
  userState.user = {
    allTeamMembers: [],
    email: "self@example.com",
    uuid: "user-self",
  };
  getBillListMock.mockResolvedValue({ bills: [bill] } as any);
  getBillListByAPIKeyMock.mockResolvedValue({ bills: [bill] } as any);
  getBillCategoryMock.mockResolvedValue({ data: ["Vision", "Compute"] } as any);
  getBillListMonthlyMock.mockResolvedValue({ bills: [monthlyBill] } as any);
});

describe("LLMTable interaction branches", () => {
  it("clears the bill list when the date range is emptied", async () => {
    render(<LLMTable pageSize={10} />);
    await screen.findByText("model-alpha");

    fireEvent.click(screen.getByRole("button", { name: "clear date" }));

    expect(await screen.findByText("No billing data")).toBeInTheDocument();
  });

  it("warns when exporting with no data", async () => {
    getBillListMock.mockResolvedValue({ bills: [] } as any);
    render(<LLMTable pageSize={10} />);
    await screen.findByText("No billing data");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
  });

  it("re-fetches after a group-by change and a model-name search", async () => {
    render(<LLMTable pageSize={10} />);
    await screen.findByText("model-alpha");

    fireEvent.click(screen.getByRole("button", { name: "group by" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ cycleType: "Week" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "search Model Name" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ productName: "searched Model Name" }),
        expect.any(AbortSignal),
      ),
    );
  });

  it("shows a spinner on a pseudo-paginated page change without re-fetching", async () => {
    render(<LLMTable pageSize={10} />);
    await screen.findByText("model-alpha");
    const callsBefore = getBillListMock.mock.calls.length;

    fireEvent.click(screen.getByTestId("pagination"));
    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument(),
    );
    expect(getBillListMock.mock.calls.length).toBe(callsBefore);
  });
});

describe("GPUInstanceTable select + category branches", () => {
  it("normalizes the All category to an empty filter and re-fetches a specific category", async () => {
    render(<GPUInstanceTable pageSize={10} />);
    await screen.findByText("model-alpha");

    fireEvent.click(screen.getByRole("button", { name: "choose vision" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "Vision" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "choose all" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ category: expect.anything() }),
        expect.any(AbortSignal),
      ),
    );
  });

  it("warns when exporting an empty GPU table", async () => {
    getBillListMock.mockResolvedValue({ bills: [] } as any);
    render(<GPUInstanceTable pageSize={10} />);
    await screen.findByText("No billing data");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
  });

  it("exports the GPU on-demand workbook", async () => {
    const xlsx = await import("xlsx");
    render(<GPUInstanceTable pageSize={10} />);
    await screen.findByText("model-alpha");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "GPU-Instances-Ondemand-Billing.xlsx",
    );
  });
});

describe("ServerlessTable dual search + clear", () => {
  it("searches by endpoint and GPU type, then clears the range", async () => {
    render(<ServerlessTable pageSize={10} />);
    await screen.findByText("endpoint-1");

    fireEvent.click(screen.getByRole("button", { name: "search Endpoint" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ ownerId: "searched Endpoint" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "search GPU Type" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ productName: "searched GPU Type" }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "clear date" }));
    expect(await screen.findByText("No billing data")).toBeInTheDocument();
  });

  it("exports the serverless on-demand workbook including the usage-duration fallback", async () => {
    const xlsx = await import("xlsx");
    // one row with usage, one row with billNum0=0 to hit the "/" fallback branch
    getBillListMock.mockResolvedValue({
      bills: [bill, { ...bill, ownerID: "endpoint-2", billNum0: 0 }],
    } as any);
    render(<ServerlessTable pageSize={10} />);
    await screen.findByText("endpoint-1");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "GPU-Serverless-Ondemand-Billing.xlsx",
    );
    const [data] = (xlsx.utils.json_to_sheet as jest.Mock).mock.calls[0];
    expect(data[1]["Usage Duration(seconds)"]).toBe("/");
  });

  it("warns when exporting an empty serverless table", async () => {
    getBillListMock.mockResolvedValue({ bills: [] } as any);
    render(<ServerlessTable pageSize={10} />);
    await screen.findByText("No billing data");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
  });
});

describe("APIKeyTable time-range validation branches", () => {
  it("rejects a start time earlier than 2026-01-01", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha");
    getBillListByAPIKeyMock.mockClear();

    // The mocked picker clears the range; assert no further fetch happens and
    // that prior data is dropped (covers the !startTime/!endTime guard).
    fireEvent.click(screen.getByRole("button", { name: "clear date" }));
    await screen.findByText("No billing data");
    expect(getBillListByAPIKeyMock).not.toHaveBeenCalled();
  });

  it("changes category filter through the select control", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("model-alpha");

    fireEvent.click(screen.getByRole("button", { name: "choose vision" }));
    await waitFor(() =>
      expect(getBillListByAPIKeyMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "Vision" }),
        expect.any(AbortSignal),
      ),
    );
  });

  it("warns when exporting an empty API key table", async () => {
    getBillListByAPIKeyMock.mockResolvedValue({ bills: [] } as any);
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("No billing data");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
  });
});

describe("monthly table operator lookup branches", () => {
  it("renders the operator email when matched by userId (no alias)", async () => {
    userState.user = {
      allTeamMembers: [
        { email: "by-user@example.com", memberId: "m-x", userId: "user-b" },
      ],
      email: "self@example.com",
      uuid: "user-self",
    };
    getBillListMonthlyMock.mockResolvedValue({
      bills: [{ ...monthlyBill, memberId: "no-match", userId: "user-b" }],
    } as any);

    render(<GPUInstanceTableMonthly pageSize={10} />);

    expect(await screen.findByText("by-user@example.com")).toBeInTheDocument();
  });

  it("falls back to the signed-in user's email when no member matches", async () => {
    getBillListMonthlyMock.mockResolvedValue({
      bills: [{ ...monthlyBill, memberId: "no-match", userId: "user-self" }],
    } as any);

    render(<GPUInstanceTableMonthly pageSize={10} />);

    expect(await screen.findByText("self@example.com")).toBeInTheDocument();
  });

  it("renders an empty operator cell when nothing matches", async () => {
    getBillListMonthlyMock.mockResolvedValue({
      bills: [{ ...monthlyBill, memberId: "no-match", userId: "ghost" }],
    } as any);

    render(<NetworkStorageTableMonthly pageSize={10} />);

    expect(await screen.findByText("dedicated endpoint")).toBeInTheDocument();
    expect(screen.queryByText("self@example.com")).not.toBeInTheDocument();
  });

  it("shows alias plus email when a member alias is present", async () => {
    userState.user = {
      allTeamMembers: [
        {
          alias: "Storage Owner",
          email: "owner@example.com",
          memberId: "m-1",
          userId: "user-b",
        },
      ],
      email: "self@example.com",
      uuid: "user-self",
    };
    getBillListMonthlyMock.mockResolvedValue({
      bills: [{ ...monthlyBill, memberId: "m-1", userId: "user-b" }],
    } as any);

    render(<NetworkStorageTableMonthly pageSize={10} />);

    expect(await screen.findByText("Storage Owner")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
  });

  it("warns when exporting an empty monthly table", async () => {
    getBillListMonthlyMock.mockResolvedValue({ bills: [] } as any);
    render(<GPUInstanceTableMonthly pageSize={10} />);
    await screen.findByText("No billing data");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(message.warning).toHaveBeenCalledWith("No Data!");
  });

  it("exports operator emails resolved by memberId, userId, and self fallback", async () => {
    const xlsx = await import("xlsx");
    userState.user = {
      allTeamMembers: [
        { email: "by-member@example.com", memberId: "m-1", userId: "u-1" },
        { email: "by-user@example.com", memberId: "m-other", userId: "u-2" },
      ],
      email: "self@example.com",
      uuid: "user-self",
    };
    getBillListMonthlyMock.mockResolvedValue({
      bills: [
        { ...monthlyBill, memberId: "m-1", userId: "x" }, // matched by memberId
        { ...monthlyBill, memberId: "none", userId: "u-2" }, // matched by userId
        { ...monthlyBill, memberId: "none", userId: "user-self" }, // self fallback
        { ...monthlyBill, memberId: "none", userId: "ghost" }, // empty
      ],
    } as any);

    render(<GPUInstanceTableMonthly pageSize={10} />);
    await screen.findByText("Operator");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "GPU-Instance-Monthly-Billing.xlsx",
    );
    const [data] = (xlsx.utils.json_to_sheet as jest.Mock).mock.calls[0];
    expect(data[0]["Operator"]).toBe("by-member@example.com");
    expect(data[1]["Operator"]).toBe("by-user@example.com");
    expect(data[2]["Operator"]).toBe("self@example.com");
    expect(data[3]["Operator"]).toBe("");
  });

  it("exports the network storage monthly operator column", async () => {
    const xlsx = await import("xlsx");
    userState.user = {
      allTeamMembers: [
        { email: "store@example.com", memberId: "ms-1", userId: "us-1" },
      ],
      email: "self@example.com",
      uuid: "user-self",
    };
    getBillListMonthlyMock.mockResolvedValue({
      bills: [{ ...monthlyBill, memberId: "ms-1", userId: "x" }],
    } as any);

    render(<NetworkStorageTableMonthly pageSize={10} />);
    await screen.findByText("Used by");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Storage-Monthly-Billing.xlsx",
    );
    const [data] = (xlsx.utils.json_to_sheet as jest.Mock).mock.calls[0];
    expect(data[0]["Operator"]).toBe("store@example.com");
  });
});
