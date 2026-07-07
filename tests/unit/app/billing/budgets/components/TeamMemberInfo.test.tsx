import { render, screen, waitFor } from "@testing-library/react";
import TeamMemberInfo from "@/app/billing/budgets/components/TeamMemberInfo";
import { getBudgetList } from "@/api/team";

jest.mock("@/api/team", () => ({
  getBudgetList: jest.fn(),
}));

let mockCurrentTeam: any;
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: any) => unknown) =>
    sel({ user: { currentTeam: mockCurrentTeam } }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  TeamRole: {
    owner: "owner",
    admin: "admin",
    developer: "developer",
    basic: "basic",
    billing: "billing",
  },
}));

// RolePermission passthrough so all role-gated content renders.
jest.mock("@/app/components/Permission", () => ({
  RolePermission: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockGet = getBudgetList as jest.Mock;

describe("TeamMemberInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentTeam = {
      id: "team-123",
      name: "Acme",
      role: "admin",
      alias: "Acme Alias",
    };
    mockGet.mockResolvedValue({
      member_count: "10",
      budget_count: "4",
      budgets: [],
    });
  });

  it("renders the team fields from the store", async () => {
    render(<TeamMemberInfo />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    // team id appears in both the trigger and the tooltip content
    expect(screen.getAllByText("team-123").length).toBeGreaterThan(0);
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("Acme Alias")).toBeInTheDocument();
  });

  it("fetches and displays member/budget counts", async () => {
    render(<TeamMemberInfo />);
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("4/10")).toBeInTheDocument();
    });
    expect(mockGet).toHaveBeenCalled();
  });

  it("renders fallbacks when team fields are missing", () => {
    mockCurrentTeam = { id: "", name: "", role: "", alias: "" };
    render(<TeamMemberInfo />);
    // name/role fall back to Loading..., alias to "-"
    expect(screen.getAllByText("Loading...").length).toBeGreaterThan(0);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("does not fetch when there is no current team", () => {
    mockCurrentTeam = null;
    render(<TeamMemberInfo />);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
