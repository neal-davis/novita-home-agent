import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Page from "@/app/sandbox-console/view/page";
import {
  reqOfficialTemplateList,
  reqSandboxList,
  reqSandboxTemplateList,
} from "@/api/sandbox";
import { message } from "@/components/ui/standard/notify";
import { useAppDispatch, useAppSelector } from "@/store";

jest.mock("@/api/sandbox", () => ({
  reqOfficialTemplateList: jest.fn(),
  reqSandboxList: jest.fn(),
  reqSandboxTemplateList: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    SANDBOX_CONSOLE: {
      SANDBOX_FILTER: "sandbox-filter",
      SANDBOX_REFRESH: "sandbox-refresh",
    },
  },
}));

jest.mock("@/constants/urls", () => ({
  DOCS_URL: { CREATE_SANDBOX: "https://docs.example/sandbox" },
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => `sliced ${value.slice(0, 16)}`),
}));

jest.mock("lodash.debounce", () => {
  return jest.fn((fn) => {
    const immediate = (...args: unknown[]) => fn(...args);
    immediate.cancel = jest.fn();
    return immediate;
  });
});

jest.mock("lucide-react", () => ({
  RefreshCw: ({ size }: { size?: number }) => (
    <span data-testid="refresh-icon">refresh {size}</span>
  ),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({
    onSearch,
    placeholder,
  }: {
    onSearch: (value: string) => void;
    placeholder?: string;
  }) => (
    <div>
      <span>{placeholder}</span>
      <button type="button" onClick={() => onSearch("sbx-03")}>
        search sandbox
      </button>
    </div>
  ),
  Input: ({
    value,
    onChange,
    type,
  }: {
    value: string | number;
    onChange: (event: { target: { value: string } }) => void;
    type?: string;
  }) => (
    <input
      aria-label={type === "number" ? `number-${value}` : "input"}
      value={value}
      onChange={(event) => onChange(event)}
    />
  ),
}));

jest.mock("@/app/sandbox-console/view/DateToggleGroup", () => ({
  __esModule: true,
  default: ({
    selected,
    onCycleChange,
  }: {
    selected: string;
    onCycleChange: (value: string) => void;
  }) => (
    <button type="button" onClick={() => onCycleChange("5")}>
      started filter {selected}
    </button>
  ),
}));

jest.mock("@/app/sandbox-console/view/selectTemplate", () => ({
  __esModule: true,
  default: ({
    onSelect,
  }: {
    onSelect: (value: { templateID: string }) => void;
  }) => (
    <button type="button" onClick={() => onSelect({ templateID: "all" })}>
      select all template
    </button>
  ),
}));

jest.mock("@/app/sandbox-console/view/selectRefreshInterval", () => ({
  __esModule: true,
  default: () => <div>refresh interval</div>,
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  ),
}));

jest.mock("@/app/sandbox-console/components/TableSpinner", () => ({
  __esModule: true,
  default: ({
    standalone,
    tdColNum,
  }: {
    standalone?: boolean;
    tdColNum?: number;
  }) =>
    tdColNum ? (
      <tr>
        <td colSpan={tdColNum}>table spinner</td>
      </tr>
    ) : (
      <span>{standalone ? "standalone spinner" : "table spinner"}</span>
    ),
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: () => <div>No matching sandboxes</div>,
}));

jest.mock("@/components/ui/standard/sandbox-no-data", () => ({
  SandboxNoData: ({ tips }: { tips: React.ReactNode }) => (
    <div>
      <span>Sandbox empty state</span>
      {tips}
    </div>
  ),
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ total }: { total: number }) => <div>page total {total}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button
      id={id}
      disabled={disabled}
      data-variant={variant}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/app/sandbox-console/components/singleMetrics", () => ({
  __esModule: true,
  default: ({ sandboxID, state }: { sandboxID: string; state: string }) => (
    <tr>
      <td>
        metrics {sandboxID} {state}
      </td>
    </tr>
  ),
}));

jest.mock("@/app/sandbox-console/components/SandboxGuide", () => ({
  __esModule: true,
  default: () => <div>Sandbox guide</div>,
}));

jest.mock("@/store", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchAllTeamMembers: jest.fn(() => ({ type: "fetch-members" })),
}));

jest.mock("@/app/components/TeamMemberSelector", () => ({
  __esModule: true,
  default: () => <div>team member selector</div>,
}));

jest.mock("@/app/components/Table/MemberCell", () => ({
  __esModule: true,
  default: ({ memberID }: { memberID: string }) => (
    <span>member {memberID}</span>
  ),
}));

const mockOfficialTemplates = reqOfficialTemplateList as jest.Mock;
const mockSandboxTemplates = reqSandboxTemplateList as jest.Mock;
const mockSandboxList = reqSandboxList as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;

const dispatch = jest.fn();

function mockStore(currentTeam: { memberId: string } | null = null) {
  mockUseAppSelector.mockImplementation(
    (selector: (state: unknown) => unknown) =>
      selector({
        user: {
          allTeamMembers: [],
          currentTeam,
        },
      }),
  );
}

async function renderLoadedPage(sandboxes: any[]) {
  mockOfficialTemplates.mockResolvedValue({ templates: [] });
  mockSandboxTemplates.mockResolvedValue({ templates: [] });
  mockSandboxList.mockResolvedValue({ sandboxes });

  const renderResult = render(<Page />);

  await waitFor(() => {
    expect(mockSandboxList).toHaveBeenCalled();
    expect(screen.queryByText("standalone spinner")).not.toBeInTheDocument();
  });

  return renderResult;
}

describe("sandbox console view page (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ now: new Date("2026-01-20T00:00:00Z") });
    mockUseAppDispatch.mockReturnValue(dispatch);
    mockStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("cycles sort state through asc, desc, and default for CPU/memory/startedAt", async () => {
    const { container } = await renderLoadedPage([
      {
        sandboxID: "sbx-a",
        clientID: "c1",
        templateID: "t1",
        cpuCount: 4,
        memoryMB: 2048,
        startedAt: "2026-01-02T00:00:00Z",
        state: "running",
      },
      {
        sandboxID: "sbx-b",
        clientID: "c2",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-01T00:00:00Z",
        state: "running",
      },
    ]);

    const srcs = () =>
      Array.from(container.querySelectorAll('img[alt="sort"]')).map((el) =>
        el.getAttribute("src"),
      );

    // Initially every sort icon is the default arrow.
    expect(srcs().every((s) => s === "/sandbox/console/sortDefault.svg")).toBe(
      true,
    );

    // Click CPU Count -> asc, then desc, then back to default.
    fireEvent.click(screen.getByText("CPU Count"));
    expect(srcs()).toContain("/sandbox/console/sortAsc.svg");

    fireEvent.click(screen.getByText("CPU Count"));
    expect(srcs()).toContain("/sandbox/console/sortDesc.svg");

    fireEvent.click(screen.getByText("CPU Count"));
    expect(srcs().every((s) => s === "/sandbox/console/sortDefault.svg")).toBe(
      true,
    );

    // Switching to a different key (Memory) resets to asc for that key.
    const memoryHeader = Array.from(container.querySelectorAll("th span")).find(
      (el) => el.textContent?.includes("Memory"),
    ) as Element;
    fireEvent.click(memoryHeader);
    expect(srcs()).toContain("/sandbox/console/sortAsc.svg");

    // Started At sort path.
    fireEvent.click(screen.getByText("Started At"));
    expect(srcs()).toContain("/sandbox/console/sortAsc.svg");
    expect(screen.getByText("sbx-a-c1")).toBeInTheDocument();
  });

  it("renders paused, cloning and unknown states and expands a paused row", async () => {
    const { container } = await renderLoadedPage([
      {
        sandboxID: "sbx-paused",
        clientID: "c1",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "paused",
      },
      {
        sandboxID: "sbx-cloning",
        clientID: "c2",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "cloning",
      },
      {
        sandboxID: "sbx-unknown",
        clientID: "c3",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "terminated",
      },
    ]);

    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText("Cloning")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();

    const expandIcon = container.querySelector(
      'img[src="/gpu-instance/instances/icon-chevron-down.svg"]',
    );
    fireEvent.click(expandIcon as Element);
    expect(
      await screen.findByText("metrics sbx-paused paused"),
    ).toBeInTheDocument();
  });

  it("steps CPU and memory filters with +/- buttons and shows GiB formatting", async () => {
    const { container } = await renderLoadedPage([
      {
        sandboxID: "sbx-a",
        clientID: "c1",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "running",
      },
    ]);

    const cpuPlus = container.querySelector(
      'img[src="/sandbox/console/plus.svg"]',
    )?.parentElement as Element;
    const cpuSub = container.querySelector(
      'img[src="/sandbox/console/sub.svg"]',
    )?.parentElement as Element;

    // CPU starts at 1 -> sub triggers the validation error (min is 1).
    fireEvent.click(cpuSub);
    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );

    // CPU plus -> 2 "Cores", then sub back -> 1 "Core".
    fireEvent.click(cpuPlus);
    await waitFor(() =>
      expect(screen.getByText("2 Cores")).toBeInTheDocument(),
    );
    fireEvent.click(cpuSub);
    await waitFor(() => expect(screen.getByText("1 Core")).toBeInTheDocument());

    const subIcons = container.querySelectorAll(
      'img[src="/sandbox/console/sub.svg"]',
    );
    const plusIcons = container.querySelectorAll(
      'img[src="/sandbox/console/plus.svg"]',
    );
    const memorySub = subIcons[1].parentElement as Element;
    const memoryPlus = plusIcons[1].parentElement as Element;

    // Memory starts at 512 -> sub triggers the multiples-of-512 error.
    fireEvent.click(memorySub);
    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );

    // Memory plus -> 1024 -> GiB formatting branch in getStorage.
    fireEvent.click(memoryPlus);
    await waitFor(() => expect(screen.getByText("1 GiB")).toBeInTheDocument());

    // Memory sub from 1024 -> 512 (the >=1024 branch).
    fireEvent.click(memorySub);
    await waitFor(() =>
      expect(screen.getByText("512 MiB")).toBeInTheDocument(),
    );
  });

  it("rounds a non-integer CPU input and a non-multiple memory input via debounce", async () => {
    await renderLoadedPage([
      {
        sandboxID: "sbx-a",
        clientID: "c1",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "running",
      },
    ]);

    const numericInputs = screen.getAllByLabelText(/^number-/);
    // Non-integer CPU -> rounded, error fired.
    fireEvent.change(numericInputs[0], { target: { value: "2.4" } });
    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );

    mockMessageError.mockClear();
    // Non-multiple memory >= 512 -> rounded to nearest 512, error fired.
    fireEvent.change(numericInputs[1], { target: { value: "1100" } });
    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  });

  it("toggles the Only Mine creator filter for a team", async () => {
    mockStore({ memberId: "member-1" });

    await renderLoadedPage([
      {
        sandboxID: "sbx-a",
        clientID: "c1",
        templateID: "t1",
        cpuCount: 1,
        memoryMB: 512,
        startedAt: "2026-01-02T00:00:00Z",
        state: "running",
        memberID: "member-1",
      },
    ]);

    const onlyMine = screen.getByRole("button", { name: "Only Mine" });
    // Default unselected -> outline variant.
    expect(onlyMine).toHaveAttribute("data-variant", "outline");

    fireEvent.click(onlyMine);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Only Mine" })).toHaveAttribute(
        "data-variant",
        "default",
      ),
    );

    // Click again -> clears the filter, back to outline.
    fireEvent.click(screen.getByRole("button", { name: "Only Mine" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Only Mine" })).toHaveAttribute(
        "data-variant",
        "outline",
      ),
    );
  });
});
