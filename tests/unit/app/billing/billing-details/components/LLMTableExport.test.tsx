import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fireEvent, render, screen } from "@testing-library/react";
import LLMTable from "@/app/billing/billing-details/components/LLMTable";
import APIKeyTable from "@/app/billing/billing-details/components/APIKeyTable";
import { getBillList, getBillListByAPIKey } from "@/api/billing";
import * as XLSX from "xlsx";

dayjs.extend(utc);

jest.mock("xlsx", () => ({
  utils: {
    aoa_to_sheet: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn(() => ({})),
  },
  writeFile: jest.fn(),
}));

jest.mock("@/api/billing", () => ({
  getBillList: jest.fn(),
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

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn() },
}));

jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button
      type="button"
      onClick={() => onChange({ from: undefined, to: undefined })}
    >
      pick date
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
      pick date
    </button>
  ),
}));

jest.mock("@/app/billing/billing-details/components/DateToggleGroup", () => ({
  __esModule: true,
  default: ({ onCycleChange }: any) => (
    <button type="button" onClick={() => onCycleChange("Hour")}>
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
      <button type="button" onClick={() => onValueChange("llm")}>
        choose llm
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

// A multimodal row (billingMethod 7) plus a prompt-cache row to exercise
// the multimodal + cache export branches of exportFile.
const multimodalRow = {
  productName: "mm-model",
  billingMethod: 7,
  billNum0: 100,
  billNum1: 50,
  billNum5: 5,
  billNum6: 6,
  billNum7: 7,
  billNum8: 8,
  billNum9: 9,
  billNum10: 10,
  billNum11: 11,
  billNum12: 12,
  basePrice0: 30000,
  basePrice1: 40000,
  discountPrice0: 25000,
  discountPrice1: 35000,
  pricePrecision: 10000,
  amount: 123456,
  voucherAmount: 23456,
  payAmount: 100000,
  category: "llm",
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-01T01:00:00.000Z",
  multimodalPricing: {
    inputPrice: [
      {
        modals: ["text", "image"],
        inputTokenBasePrice: 1000,
        inputTokenDiscountPrice: 800,
      },
    ],
    outputPrice: [
      {
        modals: ["text"],
        outputTokenBasePrice: 2000,
        outputTokenDiscountPrice: 1500,
      },
    ],
  },
};

const cacheRow = {
  productName: "cache-model",
  billingMethod: 1,
  billNum0: 10,
  billNum1: 20,
  billNum2: 2,
  billNum3: 3,
  billNum5: 5,
  basePrice0: 30000,
  basePrice1: 40000,
  basePrice2: 30000,
  basePrice3: 30000,
  basePrice5: 30000,
  discountPrice0: 25000,
  discountPrice1: 35000,
  discountPrice2: 20000,
  discountPrice3: 15000,
  discountPrice5: 10000,
  pricePrecision: 10000,
  amount: 222222,
  voucherAmount: 11111,
  payAmount: 200000,
  category: "llm",
  requestCount: 9,
  startTime: "2026-01-01T00:00:00.000Z",
  endTime: "2026-01-01T01:00:00.000Z",
};

describe("LLMTable / APIKeyTable export branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBillListMock.mockResolvedValue({
      bills: [multimodalRow, cacheRow],
    } as any);
    getBillListByAPIKeyMock.mockResolvedValue({
      bills: [
        { ...multimodalRow, apikeyName: "k1", apikeyMask: "sk-1" },
        cacheRow,
      ],
    } as any);
  });

  it("exports the LLM workbook with multimodal and prompt-cache columns", async () => {
    render(<LLMTable pageSize={10} />);
    await screen.findByText("mm-model");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    const [worksheetRows] = (XLSX.utils.aoa_to_sheet as jest.Mock).mock
      .calls[0];
    const [topHeaderRow, subHeaderRow] = worksheetRows as string[][];
    expect(topHeaderRow).toEqual(
      expect.arrayContaining([
        "Text input uncached",
        "Image input",
        "Text output",
      ]),
    );
    expect(subHeaderRow).toEqual(
      expect.arrayContaining([
        "Usage(token)",
        "List price($/M token)",
        "Discount price($/M token)",
      ]),
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "LLM-Serverless-Endpoints-Billing.xlsx",
    );
  });

  it("exports the API key workbook including gen-api usage fields", async () => {
    render(<APIKeyTable pageSize={10} />);
    await screen.findByText("mm-model");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.any(Object),
      "API_Key-Billing.xlsx",
    );
    const [worksheetRows] = (XLSX.utils.aoa_to_sheet as jest.Mock).mock
      .calls[0];
    const firstDataRow = worksheetRows[2];
    expect(firstDataRow[0]).toBe("k1");
    expect(firstDataRow[1]).toBe("sk-1");
  });
});
