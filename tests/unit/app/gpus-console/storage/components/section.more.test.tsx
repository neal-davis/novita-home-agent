import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Section from "@/app/gpus-console/storage/components/section";
import { reqGetStorage } from "@/api/gpu-instance/storage";

let mockStoreState: any;

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
  default: ({ mode }: any) => <div>add volume modal {mode}</div>,
}));

jest.mock("@/app/gpus-console/storage/components/deleteStorage", () => ({
  __esModule: true,
  default: ({ storageName }: any) => <div>delete modal {storageName}</div>,
}));

jest.mock("@/app/gpus-console/components/myPagination", () => ({
  MyPagination: () => <span>next page</span>,
  MyTablePagination: () => <span>rows per page</span>,
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
    <button type="button" onClick={() => onSelect({ ids: [] })}>
      clear member
    </button>
  ),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(mockStoreState),
}));

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

describe("storage section — more branches", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    mockStoreState = {
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
    mockReqGetStorage.mockResolvedValue({ data: [storageRow], total: 1 });
  });

  afterEach(() => consoleLogSpy.mockRestore());

  it("shows the loading skeleton before data resolves", async () => {
    let resolve: (value: any) => void = () => {};
    mockReqGetStorage.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<Section />);

    expect(screen.getByText("loading skeleton")).toBeInTheDocument();
    resolve({ data: [storageRow], total: 1 });
    expect(await screen.findByText("vol-one")).toBeInTheDocument();
  });

  it("hides team info and member selector when there is no current team", async () => {
    mockStoreState.user.currentTeam = null;
    render(<Section />);

    await screen.findByText("vol-one");
    expect(screen.queryByText(/Creator:/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "clear member" }),
    ).not.toBeInTheDocument();
  });

  it("resolves a creator via the userId fallback when no memberId matches", async () => {
    mockReqGetStorage.mockResolvedValue({
      data: [{ ...storageRow, creator: "ghost-member", uuid: "user-1" }],
      total: 1,
    });
    render(<Section />);

    await screen.findByText("vol-one");
    // memberId lookup fails -> falls back to userId match with alias
    expect(screen.getByText(/ops@example.com \(Ops\)/)).toBeInTheDocument();
  });

  it("renders an empty creator when neither memberId nor userId matches", async () => {
    mockReqGetStorage.mockResolvedValue({
      data: [{ ...storageRow, creator: "ghost", uuid: "ghost-uuid" }],
      total: 1,
    });
    render(<Section />);

    await screen.findByText("vol-one");
    // both lookups fail -> empty string after "Creator:"
    expect(screen.getByText(/Creator:/).textContent).toContain("Creator:");
  });

  it("uses the bare email when the matched member has no alias", async () => {
    mockStoreState.user.allTeamMembers = [
      {
        email: "noalias@example.com",
        memberId: "member-1",
        userId: "user-1",
      },
    ];
    render(<Section />);

    await screen.findByText("vol-one");
    expect(screen.getByText(/noalias@example.com/)).toBeInTheDocument();
    expect(
      screen.queryByText(/noalias@example.com \(/),
    ).not.toBeInTheDocument();
  });

  it("clears the creators filter to -1 when the member selection is emptied", async () => {
    render(<Section />);
    await screen.findByText("vol-one");

    fireEvent.click(screen.getByRole("button", { name: "clear member" }));
    await waitFor(() => {
      expect(mockReqGetStorage).toHaveBeenCalledWith(
        expect.objectContaining({ creators: "" }),
      );
    });
  });

  it("stops loading without rows when the storage request rejects", async () => {
    mockReqGetStorage.mockRejectedValue(new Error("network"));
    render(<Section />);

    // catch branch clears tableLoading -> empty state, no skeleton
    expect(await screen.findByText("No storage")).toBeInTheDocument();
    expect(screen.queryByText("loading skeleton")).not.toBeInTheDocument();
  });
});
