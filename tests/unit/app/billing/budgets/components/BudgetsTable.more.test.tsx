import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BudgetsTable from "@/app/billing/budgets/components/BudgetsTable";
import {
  getBudgetList,
  getKeyBudgetList,
  updateMemberBudget,
} from "@/api/team";

jest.mock("@/api/team", () => ({
  getBudgetList: jest.fn(),
  getKeyBudgetList: jest.fn(),
  updateKeyBudget: jest.fn(),
  updateMemberBudget: jest.fn(),
}));

let mockTeamRole = "owner";
jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ user: { currentTeam: { role: mockTeamRole } } }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  TeamRole: { admin: "admin", billing: "billing", owner: "owner" },
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ onChange, total }: any) => (
    <button type="button" onClick={() => onChange(2)}>
      page total {total}
    </button>
  ),
}));

jest.mock(
  "@/app/billing/budgets/components/BudgetEditModal",
  () =>
    function MockBudgetEditModal({ isOpen, memberData, onSave }: any) {
      if (!isOpen || !memberData) return null;
      return (
        <div role="dialog" aria-label="member budget modal">
          <button
            type="button"
            onClick={() =>
              onSave({
                budgetAmount: 0,
                budgetType: "Unlimited",
                memberName: memberData.name,
              })
            }
          >
            save unlimited budget
          </button>
        </div>
      );
    },
);

jest.mock(
  "@/app/billing/budgets/components/ApiKeyEditModal",
  () =>
    function MockApiKeyEditModal() {
      return null;
    },
);

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
}));

jest.mock("@radix-ui/react-popover", () => ({
  Arrow: () => <span data-testid="popover-arrow" />,
}));

const mockGetBudgetList = getBudgetList as jest.Mock;
const mockGetKeyBudgetList = getKeyBudgetList as jest.Mock;
const mockUpdateMemberBudget = updateMemberBudget as jest.Mock;

// Rows exercising every status + role class branch.
const budgetResponse = [
  {
    budget_limit: "1000",
    budget_type: "Recurring",
    email: "owner@example.com",
    member_id: "member-1",
    period_end: "2026-04-01T00:00:00Z",
    phone: "13800138000",
    remaining: "750.5",
    remark_name: "Owner User",
    role: "owner",
    status: "Active",
    used: "249.5",
    user_id: "user-1",
  },
  {
    budget_limit: "0",
    budget_type: "Unlimited",
    email: "admin@example.com",
    member_id: "member-2",
    phone: "222",
    remaining: "0",
    remark_name: "Admin User",
    role: "admin",
    status: "Invite Canceled",
    used: "0",
    user_id: "user-2",
  },
  {
    budget_limit: "0",
    budget_type: "Unlimited",
    email: "basic@example.com",
    member_id: "member-3",
    phone: "333",
    remaining: "0",
    remark_name: "Basic User",
    role: "basic",
    status: "Invite Expired",
    used: "0",
    user_id: "user-3",
  },
  {
    budget_limit: "0",
    budget_type: "Unlimited",
    email: "left@example.com",
    member_id: "member-4",
    phone: "444",
    remaining: "0",
    remark_name: "Left User",
    role: "billing",
    status: "Left Team",
    used: "0",
    user_id: "user-4",
  },
];

describe("BudgetsTable extra branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTeamRole = "owner";
    mockGetBudgetList.mockResolvedValue({ budgets: budgetResponse });
    mockGetKeyBudgetList.mockResolvedValue([]);
    mockUpdateMemberBudget.mockResolvedValue({});
  });

  it("renders all status and role class variants", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    expect(await screen.findByText("Owner User")).toBeInTheDocument();
    expect(screen.getByText("Invite Canceled")).toBeInTheDocument();
    expect(screen.getByText("Invite Expired")).toBeInTheDocument();
    expect(screen.getByText("Left Team")).toBeInTheDocument();
  });

  it("collapses an expanded member row on a second click", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    const row = await screen.findByText("13800138000");

    fireEvent.click(row);
    await waitFor(() =>
      expect(mockGetKeyBudgetList).toHaveBeenCalledWith("member-1"),
    );
    // second click collapses (no extra fetch)
    fireEvent.click(row);
    expect(mockGetKeyBudgetList).toHaveBeenCalledTimes(1);
  });

  it("changes the page through pagination, collapsing any expansion", async () => {
    // need > pageSize (10) rows for the pager to render
    const many = Array.from({ length: 12 }).map((_, i) => ({
      budget_limit: "0",
      budget_type: "Unlimited",
      email: `u${i}@example.com`,
      member_id: `mm-${i}`,
      phone: `phone-${i}`,
      remaining: "0",
      remark_name: `User ${i}`,
      role: "basic",
      status: "Active",
      used: "0",
      user_id: `user-${i}`,
    }));
    mockGetBudgetList.mockResolvedValue({ budgets: many });

    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    await screen.findByText("phone-0");
    const pager = screen.getByRole("button", { name: /page total/ });
    fireEvent.click(pager);
    // page 2 shows the 11th/12th rows
    expect(await screen.findByText("phone-10")).toBeInTheDocument();
  });

  it("falls back to empty key budgets when the key list fetch rejects", async () => {
    mockGetKeyBudgetList.mockRejectedValue(new Error("nope"));
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    fireEvent.click(await screen.findByText("13800138000"));
    await waitFor(() =>
      expect(mockGetKeyBudgetList).toHaveBeenCalledWith("member-1"),
    );
  });

  it("saves an unlimited member budget with a zero limit and empty cycle", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    await screen.findByText("Owner User");
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(
      screen.getByRole("button", { name: "save unlimited budget" }),
    );
    await waitFor(() =>
      expect(mockUpdateMemberBudget).toHaveBeenCalledWith(
        "member-1",
        "Unlimited",
        0,
        "",
      ),
    );
  });

  it("logs and recovers when the budget list fetch rejects", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetBudgetList.mockRejectedValue(new Error("boom"));
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    errSpy.mockRestore();
  });
});
