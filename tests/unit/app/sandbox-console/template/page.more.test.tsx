import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Page from "@/app/sandbox-console/template/page";
import { reqSandboxTemplateList } from "@/api/sandbox";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/sandbox", () => ({
  reqSandboxTemplateList: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    SANDBOX_CONSOLE: { TEMPLATE_FILTER: "template-filter" },
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
  message: { error: jest.fn() },
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
      <button type="button" onClick={() => onValueChange("all")}>
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
  default: ({ total }: any) => <div>page total {total}</div>,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <>{children}</>,
}));

const mockReqSandboxTemplateList = reqSandboxTemplateList as jest.Mock;

describe("sandbox template page (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("steps memory down from 1024 to 512 and CPU down with min-error", async () => {
    mockReqSandboxTemplateList.mockResolvedValue({
      templates: [
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
      ],
      total: 1,
    });

    render(<Page />);
    await screen.findByText("Ubuntu 22");

    const subButtons = screen.getAllByAltText("sub");
    const plusButtons = screen.getAllByAltText("plus");

    // CPU starts at 1 -> sub fires the validation error (min 1).
    fireEvent.click(subButtons[0]);
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );

    // Memory starts at 512 -> sub is below 1024 so fires the 512 error.
    fireEvent.click(subButtons[1]);
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );

    // Memory plus -> 1024 -> GiB formatting branch.
    fireEvent.click(plusButtons[1]);
    await waitFor(() => expect(screen.getByText("1 GiB")).toBeInTheDocument());

    // Memory sub from 1024 -> 512 (the >=1024, bei!=0 branch).
    fireEvent.click(screen.getAllByAltText("sub")[1]);
    await waitFor(() =>
      expect(screen.getByText("512 MiB")).toBeInTheDocument(),
    );

    // CPU plus -> 2, then sub -> 1 (the >=2 decrement branch).
    fireEvent.click(screen.getAllByAltText("plus")[0]);
    await waitFor(() =>
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ minCpuCount: 2 }),
      ),
    );
    fireEvent.click(screen.getAllByAltText("sub")[0]);
    await waitFor(() =>
      expect(mockReqSandboxTemplateList).toHaveBeenLastCalledWith(
        expect.objectContaining({ minCpuCount: 1 }),
      ),
    );
  });

  it("sends no isPublic flag when visibility is reset to all", async () => {
    mockReqSandboxTemplateList.mockResolvedValue({ templates: [], total: 0 });

    render(<Page />);
    await screen.findByText("No templates");

    fireEvent.click(screen.getByRole("button", { name: "choose all" }));
    await waitFor(() => {
      const lastCall =
        mockReqSandboxTemplateList.mock.calls[
          mockReqSandboxTemplateList.mock.calls.length - 1
        ][0];
      expect(lastCall).not.toHaveProperty("isPublic");
    });
  });

  it("rounds non-integer CPU and non-multiple memory inputs through debounce", async () => {
    mockReqSandboxTemplateList.mockResolvedValue({ templates: [], total: 0 });

    render(<Page />);
    await screen.findByText("No templates");

    fireEvent.change(screen.getByLabelText("number-1"), {
      target: { value: "3.6" },
    });
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );

    (message.error as jest.Mock).mockClear();
    fireEvent.change(screen.getByLabelText("number-512"), {
      target: { value: "1300" },
    });
    expect(message.error).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );
  });

  it("falls back to template length when backend total is absent", async () => {
    mockReqSandboxTemplateList.mockResolvedValue({
      templates: [
        {
          templateID: "",
          alias: "",
          isOfficial: true,
          cpuCount: 4,
          memoryMB: 4096,
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-03-02T00:00:00Z",
          public: false,
        },
      ],
    });

    render(<Page />);

    // No total/pagination -> total falls back to templates.length (1).
    await waitFor(() =>
      expect(screen.getByText("page total 1")).toBeInTheDocument(),
    );
    // isOfficial with no alias -> renders the public tip image.
    expect(screen.getAllByAltText("publicTip").length).toBeGreaterThan(0);
    // Empty templateID -> rendered as-is (no tooltip span), and "Cores".
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Cores")).toBeInTheDocument();

    await act(async () => {});
  });
});
