import { render, screen, waitFor } from "@testing-library/react";
import { ClientTable } from "@/app/billing/balance-warning/components/ClientTable";
import { GetBalanceWarning } from "@/api/billing";

jest.mock("@/api/billing", () => ({
  GetBalanceWarning: jest.fn(),
  addBlanceWarning: jest.fn(),
  updateBlanceWarning: jest.fn(),
  deleteBlanceWarning: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => true,
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

jest.mock("@/app/billing/components/notice/consoleNotice", () => ({
  ConsoleNotice: ({ title }: any) => <div>{title}</div>,
}));

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <div>{children}</div>,
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (
    <div data-dialog-open={open ? "true" : "false"}>{children}</div>
  ),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/billing/balance-warning/components/ConfigModal", () => ({
  ConfigModal: ({ open, type }: any) =>
    open ? <div role="dialog" aria-label={`config-${type}`} /> : null,
}));

let mockState: any;
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: any) => unknown) => sel(mockState),
}));

jest.mock("@/store/slice/userSlice", () => ({
  selectTeamMembers: (state: any) => state.user.teamMembers,
}));

const mockGet = GetBalanceWarning as jest.Mock;

describe("ClientTable extra branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the loading-members placeholder when team members are empty", async () => {
    mockState = { user: { currentTeam: { id: "t" }, teamMembers: [] } };
    mockGet.mockResolvedValue({
      warnings: [
        {
          id: 1,
          threshold: 50,
          member_ids: ["m-1"],
          notification_methods: ["email"],
          state: false,
        },
      ],
    });
    render(<ClientTable />);
    await screen.findByText("$50");
    expect(screen.getByText("Loading team members...")).toBeInTheDocument();
    // state=false -> "Disable"
    expect(screen.getByText("Disable")).toBeInTheDocument();
  });

  it("renders an empty methods cell when notification_methods is empty", async () => {
    mockState = {
      user: {
        currentTeam: null,
        teamMembers: [{ email: "a@x.com", alias: "Alice", memberIds: ["m-1"] }],
      },
    };
    mockGet.mockResolvedValue({
      warnings: [
        {
          id: 2,
          threshold: 75,
          member_ids: [],
          notification_methods: [],
          state: true,
        },
      ],
    });
    render(<ClientTable />);
    await waitFor(() => expect(screen.getByText("$75")).toBeInTheDocument());
    expect(screen.getByText("Enable")).toBeInTheDocument();
  });
});
