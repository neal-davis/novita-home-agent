import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/sandbox-console/template/page";
import { reqSandboxTemplateList } from "@/api/sandbox";
import { message } from "@/components/ui/standard/notify";
import { copyText } from "@/lib/utils/utils";

jest.mock("@/api/sandbox", () => ({
  reqSandboxTemplateList: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    SANDBOX_CONSOLE: {
      TEMPLATE_FILTER: "template-filter",
    },
  },
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => `sliced ${value.slice(0, 16)}`),
}));

jest.mock("@/lib/utils/utils", () => ({
  copyText: jest.fn(),
}));

jest.mock("lodash.debounce", () => {
  return jest.fn((fn) => {
    const immediate = (...args: unknown[]) => fn(...args);
    immediate.cancel = jest.fn();
    return immediate;
  });
});

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
  },
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder }: any) => (
    <div>
      <span>{placeholder}</span>
      <button type="button" onClick={() => onSearch("ubuntu")}>
        search template
      </button>
    </div>
  ),
  Input: ({ value, onChange, type }: any) => (
    <input
      aria-label={type === "number" ? `number-${value}` : "input"}
      value={value}
      onChange={(event) => onChange(event)}
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange("public")}>
        choose public
      </button>
      <button type="button" onClick={() => onValueChange("private")}>
        choose private
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
    <table data-loading={String(loading)}>{children}</table>
  ),
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

jest.mock("@/app/sandbox-console/components/TableSpinner", () => ({
  __esModule: true,
  default: ({ tdColNum }: { tdColNum?: number }) => (
    <tr>
      <td colSpan={tdColNum}>table spinner</td>
    </tr>
  ),
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No templates</div>,
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ total, pageSize, onChange }: any) => (
    <button type="button" onClick={() => onChange(2)}>
      page total {total} size {pageSize}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <>{children}</>,
}));

const mockReqSandboxTemplateList = reqSandboxTemplateList as jest.Mock;
const mockCopyText = copyText as jest.Mock;

const templates = [
  {
    templateID: "tmpl-1",
    alias: "Ubuntu 22",
    isOfficial: true,
    cpuCount: 1,
    memoryMB: 512,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    public: true,
  },
  {
    templateID: "tmpl-2",
    alias: "",
    isOfficial: false,
    cpuCount: 2,
    memoryMB: 2048,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-03T00:00:00Z",
    public: false,
  },
];

describe("sandbox template page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReqSandboxTemplateList.mockResolvedValue({
      templates,
      pagination: { total: 12 },
    });
  });

  it("loads templates, renders table values, copies ids, and paginates", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Ubuntu 22")).toBeInTheDocument();
    });
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("1 Core")).toBeInTheDocument();
    expect(screen.getByText("512 MiB")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Cores")).toBeInTheDocument();
    expect(screen.getByText("2048")).toBeInTheDocument();
    expect(screen.getAllByText("Public").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Private").length).toBeGreaterThan(0);
    expect(screen.getByText("sliced Mon, 01 Jan 2024")).toBeInTheDocument();

    fireEvent.click(screen.getByText("tmpl-1"));
    expect(mockCopyText).toHaveBeenCalledWith("tmpl-1");

    fireEvent.click(screen.getByRole("button", { name: /page total 12/ }));
    await waitFor(() => {
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, pageSize: 10 }),
      );
    });
  });

  it("refetches for search, visibility, cpu, and memory filters", async () => {
    render(<Page />);
    await screen.findByText("Ubuntu 22");

    fireEvent.click(screen.getByRole("button", { name: "search template" }));
    await waitFor(() => {
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "ubuntu" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "choose public" }));
    await waitFor(() => {
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ isPublic: true }),
      );
    });

    const plusButtons = screen.getAllByAltText("plus");
    fireEvent.click(plusButtons[0]);
    await waitFor(() => {
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ minCpuCount: 2 }),
      );
    });

    fireEvent.click(plusButtons[1]);
    await waitFor(() => {
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ minMemoryMB: 1024 }),
      );
    });
  });

  it("normalizes invalid numeric filters and renders empty state after failures", async () => {
    render(<Page />);
    await screen.findByText("Ubuntu 22");

    fireEvent.change(screen.getByLabelText("number-1"), {
      target: { value: "0" },
    });
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );

    fireEvent.change(screen.getByLabelText("number-512"), {
      target: { value: "700" },
    });
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );

    mockReqSandboxTemplateList.mockRejectedValueOnce(new Error("network"));
    fireEvent.click(screen.getByRole("button", { name: "choose private" }));

    await screen.findByText("No templates");
  });
});
