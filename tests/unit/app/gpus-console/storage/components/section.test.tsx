import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Section from "@/app/gpus-console/storage/components/section";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/storage", () => ({
  reqGetStorage: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder, value }: any) => (
    <button type="button" onClick={() => onSearch(`${placeholder} value`)}>
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/legacy-button", () => ({
  LegacyButton: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect }: any) => (
    <button type="button" onClick={() => onSelect?.()}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/storage/components/addNetworkVolume", () => ({
  __esModule: true,
  default: ({ finishOper, mode }: any) => (
    <div>
      <span>add volume modal {mode}</span>
      <button type="button" onClick={() => finishOper(true)}>
        finish add
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/storage/components/deleteStorage", () => ({
  __esModule: true,
  default: ({ finishForm, storageName }: any) => (
    <div>
      <span>delete modal {storageName}</span>
      <button type="button" onClick={() => finishForm(true)}>
        confirm delete
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/components/myPagination", () => ({
  MyPagination: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange?.({}, 2)}>
      next page
    </button>
  ),
  MyTablePagination: ({ onRowsPerPageChange }: any) => (
    <button
      type="button"
      onClick={() => onRowsPerPageChange?.({ target: { value: "25" } })}
    >
      rows per page
    </button>
  ),
  PaginationItem: ({ page }: any) => <span>page {page}</span>,
}));

jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: () => <div>No storage</div>,
}));

jest.mock("@/app/gpus-console/components/ContentSkeleton", () => ({
  __esModule: true,
  default: () => <div>loading skeleton</div>,
}));

jest.mock("@/app/components/TeamMemberSelector", () => ({
  __esModule: true,
  default: ({ onSelect }: any) => (
    <button type="button" onClick={() => onSelect({ ids: ["member-1"] })}>
      choose member
    </button>
  ),
}));

jest.mock("@/store", () => {
  const state = {
    user: {
      allTeamMembers: [
        {
          alias: "Ops",
          email: "ops@example.com",
          memberId: "member-1",
          userId: "user-1",
        },
      ],
      currentTeam: { id: "team-1" },
    },
  };
  return { useAppSelector: (selector: any) => selector(state) };
});

jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
  getPathnameWithoutLocale: (url: string) => url,
}));
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

const mockReqGetStorage = reqGetStorage as jest.Mock;
const mockSuccess = message.success as jest.Mock;

const storageRow = {
  clusterId: "cluster-a",
  clusterName: "US East",
  createdAt: "1768435200",
  creator: "member-1",
  storageId: "stg-1",
  storageName: "vol-one",
  storageSize: 100,
  uuid: "user-1",
};

describe("storage section", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    mockReqGetStorage.mockResolvedValue({ data: [storageRow], total: 1 });
  });

  afterEach(() => consoleLogSpy.mockRestore());

  it("loads storage rows, applies filters/search and paginates", async () => {
    render(<Section />);

    expect(await screen.findByText("vol-one")).toBeInTheDocument();
    expect(screen.getByText("stg-1")).toBeInTheDocument();
    expect(screen.getByText(/100 GB I US East/)).toBeInTheDocument();
    expect(screen.getByText(/ops@example.com \(Ops\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "choose member" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Storage Name/ID Filter" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "rows per page" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "next page" }));

    await waitFor(() => {
      expect(mockReqGetStorage).toHaveBeenCalledWith(
        expect.objectContaining({ creators: "member-1" }),
      );
      expect(mockReqGetStorage).toHaveBeenCalledWith(
        expect.objectContaining({
          storageName: "Storage Name/ID Filter value",
        }),
      );
      expect(mockReqGetStorage).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 25 }),
      );
      expect(mockReqGetStorage).toHaveBeenCalledWith(
        expect.objectContaining({ pageNo: 2 }),
      );
    });
    expect(localStorage.getItem("storage_pageSize")).toBe("25");
  });

  it("renders empty state when there are no rows", async () => {
    mockReqGetStorage.mockResolvedValue({ data: [], total: 0 });
    render(<Section />);
    expect(await screen.findByText("No storage")).toBeInTheDocument();
  });

  it("opens the add modal and refreshes after a successful create", async () => {
    render(<Section />);
    expect(await screen.findByText("vol-one")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "+ New Network Volume" }),
    );
    expect(await screen.findByText("add volume modal Add")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "finish add" }));
    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalledWith("success");
    });
  });

  it("opens the edit modal from the row menu", async () => {
    render(<Section />);
    expect(await screen.findByText("vol-one")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      await screen.findByText("add volume modal Edit"),
    ).toBeInTheDocument();
  });

  it("opens the delete modal and refreshes after confirming deletion", async () => {
    render(<Section />);
    expect(await screen.findByText("vol-one")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText(/delete modal vol-one/)).toBeInTheDocument();

    const callsBefore = mockReqGetStorage.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "confirm delete" }));
    await waitFor(() => {
      expect(mockReqGetStorage.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("navigates to explore when clicking deploy", async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: "" };

    render(<Section />);
    expect(await screen.findByText("vol-one")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deploy" }));
    expect(window.location.href).toContain(
      "/gpus-console/explore?clusterId=cluster-a&storageId=stg-1",
    );

    (window as any).location = originalLocation;
  });
});
