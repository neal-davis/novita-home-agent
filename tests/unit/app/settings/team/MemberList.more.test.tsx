import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
const mockTrackClick = jest.fn();

const mockState = {
  user: {
    currentTeam: {
      id: "team-1",
      name: "Core team",
      role: "owner",
      maxMemberCount: 20,
      memberId: "mem-owner",
      alias: "Owner Alias",
    },
    uuid: "user-owner",
    email: "owner@example.com",
  },
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}));

jest.mock("@/api/team", () => ({
  editMemberAlias: jest.fn(),
  getAllTeamMembers: jest.fn(),
  getBudgetList: jest.fn(),
  getInviteInfo: jest.fn(),
  getTeamMembers: jest.fn(),
  resendInvite: jest.fn(),
  updateMemberBudget: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: (...args: unknown[]) => mockTrackClick(...args),
  },
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    type = "button",
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    className,
    maxLength,
    onChange,
    type,
    value,
  }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      className={className}
      maxLength={maxLength}
      onChange={onChange}
      type={type}
      value={value}
    />
  ),
  SearchInput: ({
    onSearch,
    placeholder,
  }: {
    onSearch: (value: string) => void;
    placeholder?: string;
  }) => (
    <input
      aria-label={placeholder || "Search"}
      onChange={(event) => onSearch(event.target.value)}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    <div data-open={open}>{open ? children : null}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: (event: { preventDefault: () => void }) => void;
  }) => (
    <button onClick={() => onSelect?.({ preventDefault: jest.fn() })}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@/components/ui/table", () => ({
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
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
    value: string;
  }) => (
    <div data-testid="status-select" data-value={value}>
      {children}
      <button type="button" onClick={() => onValueChange("Invite Pending")}>
        choose-pending-status
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
    <button type="button">{children}</button>
  ),
}));

jest.mock("@/components/ui/standard/pagination-control", () => ({
  __esModule: true,
  default: ({ total }: { total: number }) => (
    <div data-testid="pagination">total:{total}</div>
  ),
}));

jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <button type="button">copy:{content}</button>
  ),
}));

jest.mock("@/app/billing/budgets/components/BudgetsTable", () => ({
  mapBudgetData: jest.fn((budgets) => budgets),
}));

jest.mock("@/app/billing/budgets/components/BudgetEditModal", () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="budget-edit-modal" /> : null,
}));

jest.mock("@/app/settings/team/Invite", () => ({
  __esModule: true,
  default: () => <div data-testid="invite-content">Invite content</div>,
}));

for (const name of ["Edit", "Remove", "Resend", "Cancel"]) {
  jest.mock(`@/app/settings/team/${name}`, () => ({
    __esModule: true,
    default: ({ open }: { open: boolean }) =>
      open ? <div data-testid={`${name.toLowerCase()}-modal`} /> : null,
  }));
}

import { getBudgetList, getTeamMembers } from "@/api/team";
import MemberList, {
  getRoleColor,
  getRoleLabel,
  getStatusLabel,
} from "@/app/settings/team/MemberList";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { TeamMemberStatus, TeamRole } from "@/store/slice/userSlice";

const mockGetTeamMembers = getTeamMembers as jest.Mock;
const mockGetBudgetList = getBudgetList as jest.Mock;

const defaultMembers = {
  members: [
    {
      user_id: "user-dev",
      member_id: "mem-dev",
      email: "dev@example.com",
      role: TeamRole.developer,
      status: TeamMemberStatus.active,
      joined_at: "1767225600",
      invite_id: "",
      phone: "15500000000",
      invite_url: "",
      remark_name: "Developer Alias",
      budget_type: "One-time",
      budget_limit: "25.25",
    },
    {
      user_id: "user-owner",
      member_id: "mem-owner",
      email: "owner@example.com",
      role: TeamRole.owner,
      status: TeamMemberStatus.active,
      joined_at: "1704067200",
      invite_id: "",
      phone: "",
      invite_url: "",
      remark_name: "Owner Alias",
      budget_type: "Unlimited",
      budget_limit: "0",
    },
    {
      user_id: "user-pending",
      member_id: "mem-pending",
      email: "pending@example.com",
      role: TeamRole.basic,
      status: TeamMemberStatus.invitePending,
      joined_at: "0",
      invite_id: "invite-1",
      phone: "",
      invite_url: "https://invite.example.test/1",
      remark_name: "Pending Alias",
      budget_type: "Recurring",
      budget_limit: "3.5",
    },
  ],
};

describe("MemberList (more branches)", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
    window.localStorage.clear();
    mockGetBudgetList.mockResolvedValue({ budgets: [] });
    mockGetTeamMembers.mockResolvedValue(defaultMembers);
  });

  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("covers the remaining helper label/color branches", () => {
    // default branch for role color (developer is not owner/admin)
    expect(getRoleColor(TeamRole.developer)).toBe("!text-[var(--black)]");
    // unknown role label falls through to "All"
    expect(getRoleLabel("nope" as unknown as TeamRole)).toBe("All");
    // status label branches not yet asserted
    expect(getStatusLabel(TeamMemberStatus.all)).toBe("All Status");
    expect(getStatusLabel(TeamMemberStatus.invitePending)).toBe(
      "Invite Pending",
    );
    expect(getStatusLabel(TeamMemberStatus.inviteCanceled)).toBe(
      "Invite Canceled",
    );
    expect(getStatusLabel(TeamMemberStatus.leftTeam)).toBe("Left Team");
    // default branch -> empty string
    expect(getStatusLabel("unknown" as unknown as TeamMemberStatus)).toBe("");
  });

  it("renders pagination total and the recurring budget value", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );
    // pagination uses memberList length (3 rows)
    expect(await screen.findByTestId("pagination")).toHaveTextContent(
      "total:3",
    );
    // recurring budget falls through to plain formatBudgetLimit (not "(One-time)")
    expect(screen.getByText("$0.0004")).toBeInTheDocument();
  });

  // Regression for DEV-157: fillMemberList used to list `loading` in its
  // useCallback deps, so every loading toggle recreated the callback and the
  // mount effect re-fired — an infinite member-list request loop. The fetch
  // must happen exactly once on mount and stay settled afterwards.
  it("fetches the member list only once on mount (no refresh loop)", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );
    // Give any spurious effect re-runs a chance to fire.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockGetTeamMembers).toHaveBeenCalledTimes(1);
  });

  it("triggers the Edit action for an active member", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Edit"));
    await waitFor(() =>
      expect(mockTrackClick).toHaveBeenCalledWith(
        CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT,
      ),
    );
  });

  it("triggers the Remove action for an active member", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() =>
      expect(mockTrackClick).toHaveBeenCalledWith(
        CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_REMOVE,
      ),
    );
  });

  it("triggers the Cancel Invitation action for a pending invite", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Pending Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Cancel Invitation"));
    await waitFor(() =>
      expect(mockTrackClick).toHaveBeenCalledWith(
        CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_CANCEL_INVITE,
      ),
    );
  });

  it("triggers the Resend modal path (not the direct API) for a pending invite", async () => {
    const { resendInvite } = jest.requireMock("@/api/team") as {
      resendInvite: jest.Mock;
    };
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Pending Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Resend Email"));
    await waitFor(() =>
      expect(mockTrackClick).toHaveBeenCalledWith(
        CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_RESEND_EMAIL,
      ),
    );
    // The pending path opens a modal instead of calling the resend API directly
    expect(resendInvite).not.toHaveBeenCalled();
  });

  it("shows an alias update error when editMemberAlias rejects", async () => {
    const { editMemberAlias } = jest.requireMock("@/api/team") as {
      editMemberAlias: jest.Mock;
    };
    editMemberAlias.mockRejectedValue(new Error("boom"));
    const { message } = jest.requireMock("@/components/ui/standard/notify") as {
      message: { error: jest.Mock };
    };

    const { container } = render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(
      container.querySelector(".lucide-chevron-right") as Element,
    );
    await waitFor(() =>
      expect(screen.getByText("Member ID")).toBeInTheDocument(),
    );
    fireEvent.click(container.querySelector(".lucide-pencil-line") as Element);
    const input = container.querySelector(
      'input[maxlength="15"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Whatever" } });
    fireEvent.click(
      container.querySelector(".lucide-check")?.closest("button") as Element,
    );

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to update alias"),
    );
  });

  it("cancels alias editing and closes the details panel", async () => {
    const { container } = render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(
      container.querySelector(".lucide-chevron-right") as Element,
    );
    await waitFor(() =>
      expect(screen.getByText("Member ID")).toBeInTheDocument(),
    );

    // Enter edit mode, then cancel via the X inside the alias editor
    fireEvent.click(container.querySelector(".lucide-pencil-line") as Element);
    expect(
      container.querySelector('input[maxlength="15"]'),
    ).toBeInTheDocument();
    const cancelEdit = container.querySelectorAll(".lucide-x");
    fireEvent.click(cancelEdit[cancelEdit.length - 1].closest("button")!);
    await waitFor(() =>
      expect(
        container.querySelector('input[maxlength="15"]'),
      ).not.toBeInTheDocument(),
    );

    // Close the whole details panel via the header X
    fireEvent.click(container.querySelector(".lucide-x") as Element);
    await waitFor(() =>
      expect(screen.queryByText("Member ID")).not.toBeInTheDocument(),
    );
  });

  it("opens the budget edit modal from the details panel pencil", async () => {
    const { container } = render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(
      container.querySelector(".lucide-chevron-right") as Element,
    );
    await waitFor(() =>
      expect(screen.getByText("Member ID")).toBeInTheDocument(),
    );

    // The last pencil is the budget editor (owner role can edit budgets)
    const pencils = container.querySelectorAll(".lucide-pencil-line");
    fireEvent.click(pencils[pencils.length - 1] as Element);
    await waitFor(() =>
      expect(screen.getByTestId("budget-edit-modal")).toBeInTheDocument(),
    );
  });

  it("hides the action menu when filtering to invite pending only", async () => {
    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("choose-pending-status"));
    await waitFor(() =>
      expect(screen.queryByText("Developer Alias")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Pending Alias")).toBeInTheDocument();
  });
});
