import { fireEvent, render, screen } from "@testing-library/react";
import * as mockReact from "react";
import BudgetsPage from "@/app/billing/budgets/index";

let mockCurrentTeam: any;
let mockBudgetTableRefresh: jest.Mock;
const originalMutationObserver = global.MutationObserver;
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

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/components/Permission", () => ({
  RolePermission: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/billing/budgets/components/BudgetsTable", () => ({
  __esModule: true,
  default: mockReact.forwardRef(({ searchValue }: any, ref: any) => {
    mockReact.useImperativeHandle(ref, () => ({
      refresh: mockBudgetTableRefresh,
    }));

    return <div>budgets table search:{searchValue}</div>;
  }),
}));

jest.mock("@/app/billing/budgets/components/TeamMemberInfo", () => ({
  __esModule: true,
  default: () => <div>team member info</div>,
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: any) => (
    <div data-sheet-open={open ? "true" : "false"}>{children}</div>
  ),
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder }: any) => (
    <input
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
  Input: (props: any) => <input {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("BudgetsPage", () => {
  beforeAll(() => {
    global.MutationObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      takeRecords: jest.fn(),
    }));
  });

  afterAll(() => {
    global.MutationObserver = originalMutationObserver;
  });

  beforeEach(() => {
    mockCurrentTeam = { role: "admin" };
    mockBudgetTableRefresh = jest.fn();
  });

  it("renders the team-account upgrade fallback when there is no team", () => {
    mockCurrentTeam = null;
    render(<BudgetsPage />);
    expect(
      screen.getByText(/only available for team accounts/),
    ).toBeInTheDocument();
    expect(screen.getByText("Upgrade To Team Account")).toBeInTheDocument();
  });

  it("renders Members title and the budgets table for team admins", () => {
    render(<BudgetsPage />);
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByText(/budgets table/)).toBeInTheDocument();
    expect(screen.getByText("Team Info")).toBeInTheDocument();
  });

  it("renders 'My Budget' title for the developer role", () => {
    mockCurrentTeam = { role: "developer" };
    render(<BudgetsPage />);
    expect(screen.getByText("My Budget")).toBeInTheDocument();
  });

  it("passes search value down to the table", () => {
    render(<BudgetsPage />);
    fireEvent.change(screen.getByPlaceholderText("Search Member"), {
      target: { value: "alice" },
    });
    expect(screen.getByText(/search:alice/)).toBeInTheDocument();
  });

  it("refreshes the table on Refresh click", () => {
    render(<BudgetsPage />);
    fireEvent.click(screen.getByText("Refresh"));
    expect(mockBudgetTableRefresh).toHaveBeenCalledTimes(1);
  });

  it("opens the team info drawer", () => {
    render(<BudgetsPage />);
    fireEvent.click(screen.getByText("Team Info"));
    expect(screen.getByText("Team Member Budgets")).toBeInTheDocument();
    expect(screen.getByText("team member info")).toBeInTheDocument();
  });
});
