import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import APIKeyTable from "@/app/billing/billing-details/components/APIKeyTable";
import GPUInstanceTable from "@/app/billing/billing-details/components/GPUInstanceTable";
import GPUInstanceTableMonthly from "@/app/billing/billing-details/components/GPUInstanceTableMonthly";
import ImageDedicatedEndpointTable from "@/app/billing/billing-details/components/ImageDedicatedEndpointTable";
import LLMTable from "@/app/billing/billing-details/components/LLMTable";
import NetworkStorageTableMonthly from "@/app/billing/billing-details/components/NetworkStorageTableMonthly";
import ServerlessTable from "@/app/billing/billing-details/components/ServerlessTable";
import {
  getBillCategory,
  getBillList,
  getBillListByAPIKey,
  getBillListMonthly,
} from "@/api/billing";

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

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({
      user: {
        allTeamMembers: [
          {
            alias: "Ops Owner",
            email: "ops@example.com",
            memberId: "member-1",
            userId: "user-b",
          },
        ],
        email: "self@example.com",
        uuid: "user-a",
      },
    }),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    warning: jest.fn(),
  },
}));

jest.mock("lodash-es/isEqual", () => ({
  __esModule: true,
  default: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    BILLING: {
      BILLING_DETAIL_EXPORT_EXCEL: "export",
      BILLING_DETAIL_PICK_DATE: "pick-date",
      BILLING_DETAIL_SEARCH_ENDPOINT: "search-endpoint",
      BILLING_DETAIL_SEARCH_GPU_TYPE: "search-gpu-type",
      BILLING_DETAIL_SEARCH_MODEL_NAME: "search-model",
      BILLING_DETAIL_SEARCH_PRODUCT_NAME: "search-product",
      BILLING_DETAIL_SELECTED_PRODUCT_TYPE: "select-type",
      BILLING_DETAIL_SELECTED_TIME_GROUP: "select-group",
    },
  },
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({
    onSearch,
    placeholder,
  }: {
    onSearch: (value: string) => void;
    placeholder: string;
  }) => (
    <button type="button" onClick={() => onSearch(`searched ${placeholder}`)}>
      search {placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({
    children,
    loading,
  }: {
    children: React.ReactNode;
    loading?: boolean;
  }) => <div data-loading={loading ? "true" : "false"}>{children}</div>,
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TableSpinner: () => <div data-testid="table-spinner">loading</div>,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No billing data</div>,
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({
    onChange,
    pageSize,
    total,
  }: {
    onChange: (page: number) => void;
    pageSize: number;
    total: number;
  }) => (
    <button
      type="button"
      data-testid="billing-pagination"
      onClick={() => onChange(2)}
    >
      total {total} pageSize {pageSize}
    </button>
  ),
}));

jest.mock("@/app/user/components/console-button", () => ({
  ConsoleButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock(
  "@/components/ui/standard/date-range-picker-utc",
  () =>
    function DateRangePicker({
      onChange,
    }: {
      onChange: (date?: { from?: Date; to?: Date }) => void;
    }) {
      return (
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
      );
    },
);

jest.mock(
  "@/components/ui/standard/date-range-picker-utc-common",
  () =>
    function DateRangePicker({
      onChange,
    }: {
      onChange: (date?: { from?: Date; to?: Date }) => void;
    }) {
      return (
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
      );
    },
);

jest.mock("@/app/billing/billing-details/components/DateToggleGroup", () => ({
  __esModule: true,
  default: ({
    onCycleChange,
    selected,
  }: {
    onCycleChange: (cycleType: string) => void;
    selected: string;
  }) => (
    <button
      type="button"
      data-testid="date-toggle"
      data-selected={selected}
      onClick={() => onCycleChange("Week")}
    >
      group by {selected}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value?: string;
  }) => (
    <div data-testid="billing-select" data-value={value}>
      {children}
      <button type="button" onClick={() => onValueChange("Vision")}>
        choose product type
      </button>
      <button type="button" onClick={() => onValueChange("gen_api")}>
        choose image video
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  HoverCardContent: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  HoverCardTrigger: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

const getBillListMock = jest.mocked(getBillList);
const getBillListByAPIKeyMock = jest.mocked(getBillListByAPIKey);
const getBillCategoryMock = jest.mocked(getBillCategory);
const getBillListMonthlyMock = jest.mocked(getBillListMonthly);

const bill = {
  amount: 123456,
  amountDecimal: "12.3456",
  basePrice0: 30000,
  basePrice1: 40000,
  billNum0: 10,
  billNum1: 20,
  billingMethod: 1,
  category: "Vision",
  discountPrice0: 25000,
  discountPrice1: 35000,
  endTime: "2026-01-01T01:00:00.000Z",
  originAmount: 155000,
  ownerID: "endpoint-1",
  payAmount: 100000,
  payableDecimal: "10.0000",
  pricePrecision: 10000,
  productName: "model-alpha",
  requestCount: 7,
  startTime: "2026-01-01T00:00:00.000Z",
  voucherAmount: 23456,
  voucherAmountDecimal: "2.3456",
};

const apiKeyBill = {
  ...bill,
  amountDecimal: "15.5000",
  apikeyMask: "sk-***-1234",
  apikeyName: "production key",
  billNum: 99,
  billNumUnit: "images",
  category: "gen_api",
};

const monthlyBill = {
  amount: 456789,
  amountDecimal: "45.6789",
  basePrice: 880000,
  billNum: 2,
  cycle: "2026-01",
  endTime: 1767225600,
  memberId: "member-1",
  ownerID: "instance-monthly-1",
  payAmount: 400000,
  payableDecimal: "40.0000",
  pricePrecision: 10000,
  productCategory: "GPU Instance",
  productName: "dedicated image endpoint",
  startTime: 1767139200,
  storageDays: 31,
  tradeMode: "monthly",
  tradeType: "monthly_new_buy",
  userId: "user-b",
  voucherAmount: 56789,
  voucherAmountDecimal: "5.6789",
};

const resolveBills = (bills: unknown[]) => {
  getBillListMock.mockResolvedValue({ bills });
  getBillListByAPIKeyMock.mockResolvedValue({ bills });
  getBillListMonthlyMock.mockResolvedValue({ bills: [monthlyBill] });
  getBillCategoryMock.mockResolvedValue({ data: ["Vision", "Compute"] });
};

describe("billing detail table components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveBills([bill]);
  });

  it("renders LLM billing rows with formatted token, price, and amount columns", async () => {
    render(<LLMTable pageSize={10} />);

    expect(await screen.findByText("model-alpha")).toBeInTheDocument();
    expect(screen.getByText("Input Tokens(tokens)")).toBeInTheDocument();
    expect(screen.getByText("Output Tokens(tokens)")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("$0.00025")).toBeInTheDocument();
    expect(screen.getByText("$0.00035")).toBeInTheDocument();
    expect(screen.getAllByText("$0.0003")).toHaveLength(1);
    expect(screen.getByText("$12.3456")).toBeInTheDocument();
    expect(screen.getByText("$2.3456")).toBeInTheDocument();
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(screen.getByTestId("billing-pagination")).toHaveTextContent(
      "total 1 pageSize 10",
    );
    expect(getBillListMock).toHaveBeenCalledWith(
      expect.objectContaining({ productCategory: "llm" }),
      expect.any(AbortSignal),
    );
  });

  it("renders API key table gen-api fields and normalizes the all category", async () => {
    resolveBills([apiKeyBill]);

    render(<APIKeyTable pageSize={5} />);

    expect(await screen.findByText("production key")).toBeInTheDocument();
    expect(screen.getByText("sk-***-1234")).toBeInTheDocument();
    expect(screen.getByText("Image/Video/Search")).toBeInTheDocument();
    expect(screen.getByText("Usage Unit")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("images")).toBeInTheDocument();
    expect(screen.getByText("$15.5000")).toBeInTheDocument();
    expect(getBillListByAPIKeyMock).toHaveBeenCalledWith(
      expect.objectContaining({ category: "", productCategory: "llm" }),
      expect.any(AbortSignal),
    );
  });

  it("renders GPU instance table category options and pricing model fields", async () => {
    render(<GPUInstanceTable pageSize={10} />);

    expect(await screen.findByText("model-alpha")).toBeInTheDocument();
    expect(screen.getByText("Product Type")).toBeInTheDocument();
    expect(screen.getAllByText("Vision")).toHaveLength(2);
    expect(screen.getByText("Instance ID")).toBeInTheDocument();
    expect(screen.getByText("endpoint-1")).toBeInTheDocument();
    expect(screen.getByText("On-Demand")).toBeInTheDocument();
    expect(getBillCategoryMock).toHaveBeenCalledWith({
      productCategory: "gpu",
    });
    expect(getBillListMock).toHaveBeenCalledWith(
      expect.objectContaining({ productCategory: "gpu" }),
      expect.any(AbortSignal),
    );
  });

  it("renders serverless endpoint usage fields and search filters", async () => {
    render(<ServerlessTable pageSize={10} />);

    expect(await screen.findByText("endpoint-1")).toBeInTheDocument();
    expect(screen.getByText("GPU Type")).toBeInTheDocument();
    expect(
      screen.getByText(
        /usage duration is calculated based on the total GPU time/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "search Endpoint" }));
    await waitFor(() =>
      expect(getBillListMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          ownerId: "searched Endpoint",
          productCategory: "serverless",
        }),
        expect.any(AbortSignal),
      ),
    );

    fireEvent.click(screen.getByTestId("billing-pagination"));
    await waitFor(() =>
      expect(screen.getByTestId("table-spinner")).toBeInTheDocument(),
    );
  });

  it("renders image dedicated endpoint monthly rows, date filters, and export", async () => {
    const xlsx = await import("xlsx");

    render(<ImageDedicatedEndpointTable pageSize={10} />);

    expect(
      await screen.findByText("dedicated image endpoint"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ops Owner")).toBeInTheDocument();
    expect(screen.getByText("ops@example.com")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Monthly New Purchase")).toBeInTheDocument();
    expect(screen.getByText("$0.0088")).toBeInTheDocument();
    expect(screen.getByText("$45.6789")).toBeInTheDocument();
    expect(screen.getByText("$5.6789")).toBeInTheDocument();
    expect(screen.getByText("$40.0000")).toBeInTheDocument();
    expect(getBillListMonthlyMock).toHaveBeenCalledWith(
      expect.objectContaining({ category: "image", cycleType: "Month" }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Storage-Monthly-Billing.xlsx",
    );

    fireEvent.click(screen.getByRole("button", { name: "pick date" }));
    await waitFor(() =>
      expect(getBillListMonthlyMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: "image" }),
        expect.any(AbortSignal),
      ),
    );
  });

  it("renders GPU instance monthly billing rows and exports the GPU workbook", async () => {
    const xlsx = await import("xlsx");

    render(<GPUInstanceTableMonthly pageSize={10} />);

    expect(
      await screen.findByText("dedicated image endpoint"),
    ).toBeInTheDocument();
    expect(screen.getByText("Instance ID")).toBeInTheDocument();
    expect(screen.getByText("instance-monthly-1")).toBeInTheDocument();
    expect(screen.getByText("GPU Instance")).toBeInTheDocument();
    expect(screen.getByText("$0.0088")).toBeInTheDocument();
    expect(getBillListMonthlyMock).toHaveBeenCalledWith(
      expect.objectContaining({ category: "gpu", cycleType: "Month" }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "GPU-Instance-Monthly-Billing.xlsx",
    );
  });

  it("renders network storage monthly billing rows and exports the storage workbook", async () => {
    const xlsx = await import("xlsx");

    render(<NetworkStorageTableMonthly pageSize={10} />);

    expect(
      await screen.findByText("dedicated image endpoint"),
    ).toBeInTheDocument();
    expect(screen.getByText("Used by")).toBeInTheDocument();
    expect(screen.getByText("instance-monthly-1")).toBeInTheDocument();
    expect(screen.getByText("Service Duration(days)")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
    expect(screen.getByText("Usage(GB)")).toBeInTheDocument();
    expect(getBillListMonthlyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "local_storage",
        cycleType: "Month",
      }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(xlsx.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Storage-Monthly-Billing.xlsx",
    );
  });

  it("renders no-data after an empty response and hides pagination", async () => {
    resolveBills([]);

    render(<LLMTable pageSize={10} />);

    expect(await screen.findByText("No billing data")).toBeInTheDocument();
    expect(screen.queryByTestId("billing-pagination")).not.toBeInTheDocument();
  });

  it("clears loading state when table fetches fail with non-abort errors", async () => {
    getBillListMock.mockRejectedValue(new Error("network down"));

    render(<LLMTable pageSize={10} />);

    await waitFor(() =>
      expect(screen.getByText("No billing data")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("table-spinner")).not.toBeInTheDocument();
  });
});
