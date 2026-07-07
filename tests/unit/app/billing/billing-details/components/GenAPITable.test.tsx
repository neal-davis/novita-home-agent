import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { getBillList } from "@/api/billing";
import { message } from "@/components/ui/standard/notify";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const GenAPITable =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@/app/billing/billing-details/components/GenAPITable").default;

jest.mock("lodash-es/isEqual", () => ({
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
  getBillList: jest.fn(),
}));

const mockGetBillList = getBillList as jest.Mock;

const bills = [
  {
    startTime: "1704067200",
    endTime: "1704153600",
    productName: "Image API",
    requestCount: 42,
    billNum: "1200",
    billNumUnit: "images",
    originAmount: 1000,
    amount: 800,
    voucherAmount: 100,
    payAmount: 700,
  },
  {
    startTime: "1704153600",
    endTime: "1704240000",
    productName: "Video API",
    requestCount: 7,
    billNum: "",
    billNumUnit: "",
    originAmount: undefined,
    amount: 200,
    voucherAmount: 0,
    payAmount: 200,
  },
];

describe("GenAPITable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBillList.mockResolvedValue({ bills });
  });

  it("loads gen api bills, renders table values, and exports rows", async () => {
    render(<GenAPITable pageSize={1} />);

    await waitFor(() => {
      expect(screen.getByText("Image API")).toBeInTheDocument();
    });
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("1200")).toBeInTheDocument();
    expect(screen.getByText("images")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toHaveTextContent(
      "total:2;pageSize:1",
    );

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          "API Name": "Image API",
          "Request Count": 42,
          Usage: "1200",
          "Usage Unit": "images",
        }),
        expect.objectContaining({
          "API Name": "Video API",
          Usage: "-",
          "Usage Unit": "-",
        }),
      ]),
      expect.any(Object),
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "Image-Video-Ondemand-Billing.xlsx",
    );
  });

  it("warns when exporting an empty result and renders empty state", async () => {
    mockGetBillList.mockResolvedValue({ bills: [] });

    render(<GenAPITable pageSize={10} />);

    await screen.findByText("No Data View");
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(message.warning).toHaveBeenCalledWith("No Data!");
    expect(XLSX.writeFile).not.toHaveBeenCalled();
  });

  it("refetches on range and group changes, and pseudo-paginates locally", async () => {
    render(<GenAPITable pageSize={1} />);
    await screen.findByText("Image API");

    fireEvent.click(screen.getByRole("button", { name: "pick range" }));
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(2);
    });
    expect(mockGetBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ productCategory: "gen_api" }),
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Hour" }));
    await waitFor(() => {
      expect(mockGetBillList).toHaveBeenCalledTimes(3);
    });
    expect(mockGetBillList).toHaveBeenLastCalledWith(
      expect.objectContaining({ cycleType: "Hour" }),
      expect.any(AbortSignal),
    );
    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    jest.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "page 2" }));
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(mockGetBillList).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Video API")).toBeInTheDocument();
    jest.useRealTimers();
  });
});
