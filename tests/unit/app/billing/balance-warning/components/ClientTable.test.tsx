import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClientTable } from "@/app/billing/balance-warning/components/ClientTable";
import {
  addBlanceWarning,
  deleteBlanceWarning,
  GetBalanceWarning,
  updateBlanceWarning,
} from "@/api/billing";
import { message } from "@/components/ui/standard/notify";
import { showPermissionMessage } from "@/lib/utils/permission";

jest.mock("@/api/billing", () => ({
  GetBalanceWarning: jest.fn(),
  addBlanceWarning: jest.fn(),
  updateBlanceWarning: jest.fn(),
  deleteBlanceWarning: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

let mockHasPermission = true;
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockHasPermission,
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

jest.mock("@/app/billing/components/notice/consoleNotice", () => ({
  ConsoleNotice: ({ title }: any) => <div>{title}</div>,
}));

// HoverCard: render trigger + content inline so Edit/Remove are clickable.
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

// ConfigModal: expose a confirm trigger to drive add/edit onConfirm callbacks.
jest.mock("@/app/billing/balance-warning/components/ConfigModal", () => ({
  ConfigModal: ({ open, type, onConfirm }: any) =>
    open ? (
      <div role="dialog" aria-label={`config-${type}`}>
        <button
          type="button"
          onClick={() => onConfirm({ threshold: "100", state: true })}
        >
          submit config
        </button>
      </div>
    ) : null,
}));

let mockState: any;
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: any) => unknown) => sel(mockState),
}));

jest.mock("@/store/slice/userSlice", () => ({
  selectTeamMembers: (state: any) => state.user.teamMembers,
}));

const mockGet = GetBalanceWarning as jest.Mock;
const mockAdd = addBlanceWarning as jest.Mock;
const mockUpdate = updateBlanceWarning as jest.Mock;
const mockDelete = deleteBlanceWarning as jest.Mock;

const warnings = [
  {
    id: 1,
    threshold: 50,
    member_ids: ["m-1", "m-1", "m-2"],
    notification_methods: ["email", "in_app"],
    state: true,
  },
];

const baseState = (currentTeam: any = { id: "team-1" }) => ({
  user: {
    currentTeam,
    teamMembers: [
      { email: "a@x.com", alias: "Alice", memberIds: ["m-1"] },
      { email: "b@x.com", alias: "Bob", memberIds: ["m-2"] },
    ],
  },
});

describe("ClientTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission = true;
    mockState = baseState();
    mockGet.mockResolvedValue({ warnings });
    mockAdd.mockResolvedValue({});
    mockUpdate.mockResolvedValue({});
    mockDelete.mockResolvedValue({});
  });

  it("fetches and renders warnings with formatted amount, methods and status", async () => {
    render(<ClientTable />);
    expect(await screen.findByText("$50")).toBeInTheDocument();
    expect(screen.getByText("Email、Inbox")).toBeInTheDocument();
    expect(screen.getByText("Enable")).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalled();
  });

  it("shows the Members column with unique member count for team accounts", async () => {
    render(<ClientTable />);
    await screen.findByText("$50");
    // 3 ids dedupe to 2
    expect(screen.getByText("2")).toBeInTheDocument();
    // member emails rendered in popover content
    expect(screen.getByText("a@x.com")).toBeInTheDocument();
    expect(screen.getByText("b@x.com")).toBeInTheDocument();
  });

  it("hides the Members column for non-team (personal) accounts", async () => {
    mockState = baseState(null);
    render(<ClientTable />);
    await screen.findByText("$50");
    expect(screen.queryByText("a@x.com")).not.toBeInTheDocument();
  });

  it("shows permission message and does not fetch when not permitted", async () => {
    mockHasPermission = false;
    render(<ClientTable />);
    await waitFor(() => {
      expect(showPermissionMessage).toHaveBeenCalled();
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("opens add modal and submits a new alert", async () => {
    render(<ClientTable />);
    await screen.findByText("$50");

    fireEvent.click(screen.getByText("Add Alerts"));
    expect(screen.getByLabelText("config-add")).toBeInTheDocument();

    fireEvent.click(screen.getByText("submit config"));
    await waitFor(() => {
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({ threshold: "100", state: true }),
      );
      expect(message.success).toHaveBeenCalledWith("success");
    });
  });

  it("opens edit modal from the row action and submits an update", async () => {
    render(<ClientTable />);
    await screen.findByText("$50");

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("config-edit")).toBeInTheDocument();

    fireEvent.click(screen.getByText("submit config"));
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, threshold: "100" }),
      );
    });
  });

  it("deletes an alert after confirming", async () => {
    render(<ClientTable />);
    await screen.findByText("$50");

    fireEvent.click(screen.getByText("Remove"));
    // Confirm button inside the delete dialog
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(message.success).toHaveBeenCalledWith("Delete successfully");
    });
  });
});
