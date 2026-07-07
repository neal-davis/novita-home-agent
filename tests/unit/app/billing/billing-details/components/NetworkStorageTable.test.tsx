import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { getBillCategory, getBillList } from "@/api/billing";
import { message } from "@/components/ui/standard/notify";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const NetworkStorageTable =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@/app/billing/billing-details/components/NetworkStorageTable").default;

jest.mock("lodash-es/isEqual", () => ({
  __esModule: true,
  default: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ placeholder, onSearch }: any) => (
    <button type="button" onClick={() => onSearch("storage-a")}>
      search {placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      {children}
      <button
        type="button"
        onClick={() => onValueChange("cloud_network_storage")}
      >
        choose network
      </button>
      <button type="button" onClick={() => onValueChange("All")}>
        choose all
      </button>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
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
  TableSpinner: () => <div>loading...</div>,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No Data View</div>,
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ total, pageSize, onChange }: any) => (
    <nav data-testid="pagination">
      total:{total};pageSize:{pageSize}
      <button type="button" onClick={() => onChange(2)}>
        page 2
      </button>
    </nav>
  ),
}));

jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          from: new Date("2024-01-01T00:00:00Z"),
          to: new Date("2024-01-05T00:00:00Z"),
        })
      }
    >
      pick range
    </button>
  ),
}));

jest.mock("@/app/billing/billing-details/components/DateToggleGroup", () => ({
  __esModule: true,
  default: ({ options, selected, onCycleChange }: any) => (
    <div data-selected={selected}>
      {options.map((option: any) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onCycleChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/app/user/components/console-button", () => ({
  ConsoleButton: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    warning: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

jest.mock("xlsx", () => ({
  utils: {
    book_new: jest.fn(() => ({ sheets: [] })),
    json_to_sheet: jest.fn(() => ({ rows: [] })),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

jest.mock("@/api/billing", () => ({
  getBillCategory: jest.fn(),
  getBillList: jest.fn(),
}));

const mockGetBillCategory = getBillCategory as jest.Mock;
const mockGetBillList = getBillList as jest.Mock;

const bills = [
  {
    startTime: "1704067200",
    endTime: "1704153600",
    productName: "Network Volume A",
    category: "cloud_network_storage",
    productId: "network",
    ownerID: "owner-a",
    billingMethod: 1,
    billNum0: "172800",
    discountPrice0: 25,
    pricePrecision: 1,
    amount: 1200,
    voucherAmount: 200,
    payAmount: 1000,
  },
  {
    startTime: "1704153600",
    endTime: "1704240000",
    productName: "Sandbox Storage",
    category: "cloud_sandbox_storage",
    productId: "sandbox-storage",
    ownerID: "owner-b",
    billingMethod: 2,
    billNum0: "7200",
    discountPrice0: 10000,
    pricePrecision: 1,
    amount: 300,
    voucherAmount: 0,
    payAmount: 300,
  },
];

describe("NetworkStorageTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBillCategory.mockResolvedValue({
      data: ["cloud_network_storage", "cloud_sandbox_storage"],
    });
    mockGetBillList.mockResolvedValue({ bills });
  });

  it("loads storage bills, renders usage variants, and exports rows", async () => {
    render(<NetworkStorageTable pageSize={2} />);

    await waitFor(() => {
      expect(screen.getByText("Network Volume A")).toBeInTheDocument();
    });
    expect(screen.getAllByText("cloud_network_storage").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("2GB·d")).toBeInTheDocument();
    expect(screen.getByText("$1.00/GB/h")).toBeInTheDocument();
    expect(screen.getByText("Network Volume/owner-a")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent(
      "total:2;pageSize:2",
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          "Product Name": "Network Volume A",
          "Product Type": "cloud_network_storage",
          Usage: "2GB·d",
          "Used by": "Network Volume/owner-a",
          "Pricing Model": "On-Demand",
        }),
        expect.objectContaining({
          "Product Name": "Sandbox Storage",
          Usage: "2GB·h",
          "Used by": "Sandbox",
          "Pricing Model": "Subscription",
          "Unit Price($)": "1.00/GB/h",
        }),
      ]),
      expect.any(Object),
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Storage-Ondemand-Billing.xlsx",
    );
  });

  it("warns on empty export and renders empty state", async () => {
    mockGetBillList.mockResolvedValue({ bills: [] });

    render(<NetworkStorageTable pageSize={10} />);

    await screen.findByText("No Data View");
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(message.warning).toHaveBeenCalledWith("No Data!");
    expect(XLSX.writeFile).not.toHaveBeenCalled();
  });

  it("refetches for filters and paginates loaded rows locally", async () => {
    render(<NetworkStorageTable pageSize={1} />);
    await screen.findByText("Network Volume A");

    fireEvent.click(
      screen.getByRole("button", { name: "search Product Name" }),
    );
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(2);
    });
    expect(mockGetBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        productCategory: "cloud_storage",
        productName: "storage-a",
      }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "choose network" }));
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(3);
    });
    expect(mockGetBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: "cloud_network_storage" }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "pick range" }));
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(4);
    });

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(5);
    });
    expect(mockGetBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ cycleType: "Week" }),
      expect.any(AbortSignal),
    );

    jest.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "page 2" }));
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(mockGetBillList).toHaveBeenCalledTimes(5);
    expect(screen.getByText("Sandbox Storage")).toBeInTheDocument();
    jest.useRealTimers();
  });
});
