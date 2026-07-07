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
      <button type="button" onClick={() => onValueChange("Active")}>
        choose-active-status
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
  formatBudgetLimit,
  getRoleColor,
  getRoleLabel,
  getStatusLabel,
} from "@/app/settings/team/MemberList";
import { TeamMemberStatus, TeamRole } from "@/store/slice/userSlice";

const mockGetTeamMembers = getTeamMembers as jest.Mock;
const mockGetBudgetList = getBudgetList as jest.Mock;

describe("MemberList", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
    window.localStorage.clear();
    mockGetBudgetList.mockResolvedValue({ budgets: [] });
    mockGetTeamMembers.mockResolvedValue({
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
    });
  });

  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("formats helper labels and budget display values", () => {
    expect(formatBudgetLimit(25.25)).toBe("$0.0025");
    expect(getStatusLabel(TeamMemberStatus.inviteExpired)).toBe(
      "Invite Expired",
    );
    expect(getRoleLabel(TeamRole.billing)).toBe("Billing");
    expect(getRoleColor(TeamRole.admin)).toBe("!text-[var(--cyan-2)]");
  });

  it("loads, sorts, filters, and renders member rows", async () => {
    const setMemberCount = jest.fn();
    render(<MemberList setMemberCount={setMemberCount} />);

    await waitFor(() => {
      expect(screen.getByText("Owner Alias")).toBeInTheDocument();
    });

    expect(setMemberCount).toHaveBeenCalledWith(2);
    expect(screen.getByText("Developer Alias")).toBeInTheDocument();
    expect(screen.getByText("Pending Alias")).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();
    expect(screen.getByText("$0.0025 (One-time)")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search members..."), {
      target: { value: "pending" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Developer Alias")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Pending Alias")).toBeInTheDocument();
    expect(mockTrackClick).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Go to Budgets" }));
    expect(mockPush).toHaveBeenCalledWith("/billing/budgets");

    fireEvent.click(screen.getByRole("button", { name: "Invite Members" }));
    expect(screen.getByTestId("invite-content")).toBeInTheDocument();
  });

  it("handles getTeamMembers rejection without crashing", async () => {
    mockGetTeamMembers.mockRejectedValue(new Error("boom"));
    const setMemberCount = jest.fn();
    render(<MemberList setMemberCount={setMemberCount} />);

    // No member rows appear because the fetch failed
    await waitFor(() => {
      expect(mockGetTeamMembers).toHaveBeenCalled();
    });
    expect(screen.queryByText("Owner Alias")).not.toBeInTheDocument();
  });

  it("filters by status and refreshes the list", async () => {
    const setMemberCount = jest.fn();
    render(<MemberList setMemberCount={setMemberCount} />);

    await waitFor(() =>
      expect(screen.getByText("Owner Alias")).toBeInTheDocument(),
    );

    // Choosing a status fires the analytics track with the status payload
    fireEvent.click(screen.getByText("choose-active-status"));
    expect(mockTrackClick).toHaveBeenCalledWith(expect.anything(), {
      status: "Active",
    });

    mockGetTeamMembers.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));
    await waitFor(() => expect(mockGetTeamMembers).toHaveBeenCalled());
  });

  it("copies the invite link for a pending member", async () => {
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    const { message } = jest.requireMock("@/components/ui/standard/notify") as {
      message: { success: jest.Mock };
    };

    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Pending Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Copy Invite Link"));
    expect(writeText).toHaveBeenCalledWith("https://invite.example.test/1");
    expect(message.success).toHaveBeenCalledWith("Invite link copied");
  });

  it("resends an invite for an expired member and copies returned url", async () => {
    mockGetTeamMembers.mockResolvedValue({
      members: [
        {
          user_id: "user-exp",
          member_id: "mem-exp",
          email: "exp@example.com",
          role: TeamRole.basic,
          status: TeamMemberStatus.inviteExpired,
          joined_at: "0",
          invite_id: "invite-exp",
          phone: "",
          invite_url: "",
          remark_name: "Expired Alias",
          budget_type: "-",
          budget_limit: "0",
        },
      ],
    });
    const { resendInvite } = jest.requireMock("@/api/team") as {
      resendInvite: jest.Mock;
    };
    resendInvite.mockResolvedValue({ invite_url: "https://resent.example/x" });
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });

    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Expired Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Resend Email"));
    await waitFor(() =>
      expect(resendInvite).toHaveBeenCalledWith("invite-exp"),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("https://resent.example/x"),
    );
  });

  it("shows resend error when resendInvite rejects", async () => {
    mockGetTeamMembers.mockResolvedValue({
      members: [
        {
          user_id: "user-exp",
          member_id: "mem-exp",
          email: "exp@example.com",
          role: TeamRole.basic,
          status: TeamMemberStatus.inviteExpired,
          joined_at: "0",
          invite_id: "invite-exp",
          phone: "",
          invite_url: "",
          remark_name: "Expired Alias",
          budget_type: "-",
          budget_limit: "0",
        },
      ],
    });
    const { resendInvite } = jest.requireMock("@/api/team") as {
      resendInvite: jest.Mock;
    };
    resendInvite.mockRejectedValue(new Error("nope"));
    const { message } = jest.requireMock("@/components/ui/standard/notify") as {
      message: { error: jest.Mock };
    };

    render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Expired Alias")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Resend Email"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to resend invitation"),
    );
  });

  it("opens member details, edits alias, and saves it", async () => {
    const { editMemberAlias } = jest.requireMock("@/api/team") as {
      editMemberAlias: jest.Mock;
    };
    editMemberAlias.mockResolvedValue({});

    const { container } = render(<MemberList setMemberCount={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText("Developer Alias")).toBeInTheDocument(),
    );

    // The active (non-pending) rows render a clickable chevron to open details
    const chevron = container.querySelector(".lucide-chevron-right");
    expect(chevron).toBeTruthy();
    fireEvent.click(chevron as Element);

    // Details panel shows the Member ID label
    await waitFor(() =>
      expect(screen.getByText("Member ID")).toBeInTheDocument(),
    );

    // Owner role can edit alias -> click the pencil
    const pencil = container.querySelector(".lucide-pencil-line");
    expect(pencil).toBeTruthy();
    fireEvent.click(pencil as Element);

    const input = container.querySelector(
      'input[maxlength="15"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "NewAlias" } });

    // Save button is the secondary one containing the Check icon
    const saveBtn = container.querySelector(".lucide-check")?.closest("button");
    fireEvent.click(saveBtn as Element);

    await waitFor(() =>
      expect(editMemberAlias).toHaveBeenCalledWith(
        expect.any(String),
        "NewAlias",
      ),
    );
  });
});
