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
import analytics from "@/app/components/analytics/analytics";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAllTeamMembers } from "@/store/slice/userSlice";

jest.mock("@/api/sandbox", () => ({
  reqOfficialTemplateList: jest.fn(),
  reqSandboxList: jest.fn(),
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
      SANDBOX_FILTER: "sandbox-filter",
      SANDBOX_REFRESH: "sandbox-refresh",
    },
  },
}));

jest.mock("@/constants/urls", () => ({
  DOCS_URL: {
    CREATE_SANDBOX: "https://docs.example/sandbox",
  },
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
  message: {
    error: jest.fn(),
  },
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
      <button type="button" onClick={() => onSearch("missing")}>
        search missing
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
    <button
      type="button"
      onClick={() => onSelect({ templateID: "tmpl-private" })}
    >
      select private template
    </button>
  ),
}));

jest.mock("@/app/sandbox-console/view/selectRefreshInterval", () => ({
  __esModule: true,
  default: ({
    onRefresh,
    onSelect,
  }: {
    onRefresh: () => void;
    onSelect: (value: { value: string }) => void;
  }) => (
    <div>
      <button type="button" onClick={onRefresh}>
        interval refresh
      </button>
      <button type="button" onClick={() => onSelect({ value: "30" })}>
        choose interval
      </button>
    </div>
  ),
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
  default: ({
    total,
    onChange,
  }: {
    total: number;
    onChange: (page: number) => void;
  }) => (
    <button type="button" onClick={() => onChange(2)}>
      page total {total}
    </button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
  }) => (
    <button id={id} disabled={disabled} type="button" onClick={onClick}>
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
  default: ({
    onSelect,
  }: {
    onSelect: (member: { ids: string[]; email: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onSelect({ ids: ["member-2"], email: "two@example.com" })}
    >
      choose creator
    </button>
  ),
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
const mockTrackClick = analytics.trackClick as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockFetchAllTeamMembers = fetchAllTeamMembers as jest.Mock;

const dispatch = jest.fn();

function makeSandbox(index: number, overrides: Record<string, unknown> = {}) {
  return {
    sandboxID: `sbx-${String(index).padStart(2, "0")}`,
    clientID: `client-${index}`,
    templateID: index % 2 === 0 ? "tmpl-private" : "tmpl-official",
    cpuCount: index,
    memoryMB: 512 * index,
    startedAt: `2026-01-${String(index).padStart(2, "0")}T00:00:00Z`,
    state: index === 2 ? "paused" : index === 3 ? "cloning" : "running",
    memberID: index % 2 === 0 ? "member-2" : "member-1",
    ...overrides,
  };
}

function mockStore(
  currentTeam: { memberId: string } | null = { memberId: "member-1" },
) {
  mockUseAppSelector.mockImplementation(
    (selector: (state: unknown) => unknown) =>
      selector({
        user: {
          allTeamMembers: [
            { memberId: "member-1", email: "one@example.com", alias: "One" },
            { memberId: "member-2", email: "two@example.com", alias: "Two" },
          ],
          currentTeam,
        },
      }),
  );
}

async function renderLoadedPage(
  sandboxes = Array.from({ length: 12 }, (_, index) => makeSandbox(index + 1)),
) {
  mockOfficialTemplates.mockResolvedValue({
    templates: [{ templateID: "tmpl-official", alias: "Official Alias" }],
  });
  mockSandboxTemplates.mockResolvedValue({
    templates: [{ templateID: "tmpl-private", alias: "Private Alias" }],
  });
  mockSandboxList.mockResolvedValue({ sandboxes });

  const renderResult = render(<Page />);

  await waitFor(() => {
    expect(mockSandboxList).toHaveBeenCalled();
    expect(screen.queryByText("standalone spinner")).not.toBeInTheDocument();
  });

  return renderResult;
}

describe("sandbox console view page", () => {
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

  it("loads sandboxes, renders template aliases and creator cells, refreshes, and expands metrics", async () => {
    const { container } = await renderLoadedPage();

    expect(mockFetchAllTeamMembers).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: "fetch-members" });
    expect(await screen.findByText("sbx-01-client-1")).toBeInTheDocument();
    expect(
      screen.getAllByText("tmpl-official (Official Alias)"),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByText("tmpl-private (Private Alias)"),
    ).not.toHaveLength(0);
    expect(screen.getAllByText("member member-1")).not.toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "page total 12" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "choose interval" }));
    expect(mockTrackClick).toHaveBeenCalledWith("sandbox-filter", {
      refreshInterval: "30",
    });

    fireEvent.click(screen.getByRole("button", { name: "interval refresh" }));
    expect(mockSandboxList).toHaveBeenCalledTimes(2);

    const expandIcon = container.querySelector(
      'img[src="/gpu-instance/instances/icon-chevron-down.svg"]',
    );
    expect(expandIcon).not.toBeNull();
    fireEvent.click(expandIcon as Element);
    expect(
      await screen.findByText("metrics sbx-01 running"),
    ).toBeInTheDocument();
  });

  it("applies search, template, creator, sorting, pagination, and empty-result filters", async () => {
    await renderLoadedPage();

    fireEvent.click(screen.getByText("CPU Count"));
    expect(screen.getByText("sbx-01-client-1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "select private template" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("sbx-01-client-1")).not.toBeInTheDocument();
      expect(screen.getByText("sbx-02-client-2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "choose creator" }));
    await waitFor(() => {
      expect(screen.getAllByText("member member-2")).not.toHaveLength(0);
      expect(screen.queryByText("member member-1")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "search sandbox" }));
    await waitFor(() => {
      expect(screen.queryByText("sbx-02-client-2")).not.toBeInTheDocument();
      expect(screen.queryByText("No matching sandboxes")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "search missing" }));
    await waitFor(() => {
      expect(screen.getByText("No matching sandboxes")).toBeInTheDocument();
    });
  });

  it("validates cpu and memory filters and exposes the guide for an empty account", async () => {
    await renderLoadedPage([makeSandbox(1)]);

    const numericInputs = screen.getAllByLabelText(/^number-/);
    fireEvent.change(numericInputs[0], { target: { value: "0" } });
    fireEvent.change(numericInputs[1], { target: { value: "700" } });

    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
    );
    expect(mockMessageError).toHaveBeenCalledWith(
      "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
    );

    jest.clearAllMocks();
    mockStore(null);
    mockOfficialTemplates.mockResolvedValue({ templates: [] });
    mockSandboxTemplates.mockResolvedValue({ templates: [] });
    mockSandboxList.mockResolvedValue({ sandboxes: [] });

    render(<Page />);

    expect(await screen.findByText("Sandbox guide")).toBeInTheDocument();
    expect(mockFetchAllTeamMembers).not.toHaveBeenCalled();

    await act(async () => {
      jest.runOnlyPendingTimers();
    });
  });
});
