import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BudgetsTable, {
  mapBudgetData,
} from "@/app/billing/budgets/components/BudgetsTable";
import {
  getBudgetList,
  getKeyBudgetList,
  updateKeyBudget,
  updateMemberBudget,
} from "@/api/team";

jest.mock("@/api/team", () => ({
  getBudgetList: jest.fn(),
  getKeyBudgetList: jest.fn(),
  updateKeyBudget: jest.fn(),
  updateMemberBudget: jest.fn(),
}));

let mockTeamRole = "admin";

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ user: { currentTeam: { role: mockTeamRole } } }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  TeamRole: {
    admin: "admin",
    billing: "billing",
    owner: "owner",
  },
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({
    onChange,
    total,
  }: {
    onChange: (page: number) => void;
    total: number;
  }) => (
    <button type="button" onClick={() => onChange(2)}>
      page total {total}
    </button>
  ),
}));

jest.mock(
  "@/app/billing/budgets/components/BudgetEditModal",
  () =>
    function MockBudgetEditModal({
      isOpen,
      memberData,
      onSave,
    }: {
      isOpen: boolean;
      memberData: { id: string; name: string } | null;
      onSave: (data: {
        budgetAmount: number;
        budgetType: string;
        memberName: string;
      }) => void;
    }) {
      if (!isOpen || !memberData) return null;
      return (
        <div role="dialog" aria-label="member budget modal">
          <span>{memberData.name}</span>
          <button
            type="button"
            onClick={() =>
              onSave({
                budgetAmount: 123.4,
                budgetType: "Recurring",
                memberName: memberData.name,
              })
            }
          >
            save member budget
          </button>
        </div>
      );
    },
);

jest.mock(
  "@/app/billing/budgets/components/ApiKeyEditModal",
  () =>
    function MockApiKeyEditModal({
      apiKeyData,
      isOpen,
      onSave,
    }: {
      apiKeyData: { id: string; name: string } | null;
      isOpen: boolean;
      onSave: (data: {
        apiKeyId: string;
        budgetAmount: number;
        budgetType: string;
      }) => void;
    }) {
      if (!isOpen || !apiKeyData) return null;
      return (
        <div role="dialog" aria-label="api key budget modal">
          <span>{apiKeyData.name}</span>
          <button
            type="button"
            onClick={() =>
              onSave({
                apiKeyId: apiKeyData.id,
                budgetAmount: 45.6,
                budgetType: "One-time",
              })
            }
          >
            save api key budget
          </button>
        </div>
      );
    },
);

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@radix-ui/react-popover", () => ({
  Arrow: () => <span data-testid="popover-arrow" />,
}));

const mockGetBudgetList = getBudgetList as jest.Mock;
const mockGetKeyBudgetList = getKeyBudgetList as jest.Mock;
const mockUpdateMemberBudget = updateMemberBudget as jest.Mock;
const mockUpdateKeyBudget = updateKeyBudget as jest.Mock;

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
    email: "billing@example.com",
    member_id: "member-2",
    phone: "",
    remaining: "0",
    remark_name: "Billing Manager",
    role: "billing",
    status: "Invite Pending",
    used: "1250.5",
    user_id: "user-2",
  },
];

describe("mapBudgetData", () => {
  it("maps API values to budget rows with defaults for missing fields", () => {
    expect(
      mapBudgetData([
        {
          budget_limit: "bad",
          budget_type: "",
          email: "member@example.com",
          member_id: "member-x",
          phone: "123",
          remaining: "",
          remark_name: "",
          role: "basic",
          status: "",
          used: "4.5",
          user_id: "user-x",
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        budgetLimit: 0,
        budgetType: "Unlimited",
        id: "member-x",
        member: "member@example.com",
        remaining: 0,
        status: "-",
        used: 4.5,
      }),
    ]);
  });
});

describe("BudgetsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTeamRole = "admin";
    mockGetBudgetList.mockResolvedValue({ budgets: budgetResponse });
    mockGetKeyBudgetList.mockResolvedValue([
      {
        budget_limit: 200,
        budget_type: "Recurring",
        key_id: "key-1",
        key_name: "Production key",
        period_end: "2026-05-01T00:00:00Z",
        used: 75.25,
      },
    ]);
    mockUpdateMemberBudget.mockResolvedValue({});
    mockUpdateKeyBudget.mockResolvedValue({});
  });

  it("renders fetched budgets with formatted usage and reset time", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);

    expect(await screen.findByText("13800138000")).toBeInTheDocument();
    expect(screen.getByText("Owner User")).toBeInTheDocument();
    expect(screen.getByText("Invite Pending")).toBeInTheDocument();
    expect(screen.getByText("$0.10")).toBeInTheDocument();
    expect(screen.getByText("$0.025")).toBeInTheDocument();
    expect(
      screen.getByText(/Reset at 2026-04-01 00:00:00/),
    ).toBeInTheDocument();
  });

  it("filters fetched budgets by remark name", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="manager" />);

    expect(await screen.findByText("billing@example.com")).toBeInTheDocument();
    expect(screen.queryByText("13800138000")).not.toBeInTheDocument();
  });

  it("expands member rows and loads API key budgets", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);

    fireEvent.click(await screen.findByText("13800138000"));

    await waitFor(() => {
      expect(mockGetKeyBudgetList).toHaveBeenCalledWith("member-1");
      expect(screen.getByText("Production key")).toBeInTheDocument();
      expect(screen.getByText("$0.0075")).toBeInTheDocument();
      expect(
        screen.getByText(/Reset at 2026-05-01 00:00:00/),
      ).toBeInTheDocument();
    });
  });

  it("saves member and API key budget edits with rounded amounts", async () => {
    render(<BudgetsTable refreshTrigger={0} searchValue="" />);

    await screen.findByText("13800138000");
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "save member budget" }));

    await waitFor(() => {
      expect(mockUpdateMemberBudget).toHaveBeenCalledWith(
        "member-1",
        "Recurring",
        123,
        "Monthly",
      );
    });

    fireEvent.click(screen.getByText("13800138000"));
    await screen.findByText("Production key");
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);
    fireEvent.click(
      screen.getByRole("button", { name: "save api key budget" }),
    );

    await waitFor(() => {
      expect(mockUpdateKeyBudget).toHaveBeenCalledWith(
        "member-1",
        "key-1",
        "One-time",
        46,
      );
    });
  });

  it("disables edit actions for non budget admins", async () => {
    mockTeamRole = "basic";

    render(<BudgetsTable refreshTrigger={0} searchValue="" />);

    await screen.findByText("13800138000");
    expect(screen.getAllByRole("button", { name: "Edit" })[0]).toBeDisabled();
  });
});
