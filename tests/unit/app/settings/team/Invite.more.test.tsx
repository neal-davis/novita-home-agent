import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockState = {
  user: { currentTeam: { maxMemberCount: 20 } },
};

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));

const inviteTeamMember = jest.fn();
jest.mock("@/api/team", () => ({
  inviteTeamMember: (...a: unknown[]) => inviteTeamMember(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/lib/utils/validators", () => ({
  validateEmail: (email: string) => /@/.test(email),
}));

const mockPermissionsOpen = jest.fn();
jest.mock("@/app/settings/team/Permissions", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => {
    mockPermissionsOpen(open);
    return open ? <div data-testid="permissions-open" /> : null;
  },
}));

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({
    children,
    onCopy,
  }: {
    children: React.ReactNode;
    onCopy?: () => void;
  }) => (
    <span data-testid="copy-wrapper" onClick={() => onCopy?.()}>
      {children}
    </span>
  ),
}));

jest.mock("@/app/settings/team/index", () => ({
  genRoleCards: () => [
    { value: "basic", title: "Basic", desc: "basic role" },
    { value: "admin", title: "Admin", desc: "admin role" },
  ],
}));

jest.mock("@/app/settings/team/MemberList", () => ({
  formatBudgetLimit: (n: number) => `$${n}`,
  getRoleColor: () => "",
  getRoleLabel: (r: string) => r,
  getStatusLabel: (s: string) => s,
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

import Invite from "@/app/settings/team/Invite";
import { message } from "@/components/ui/standard/notify";
import { TeamMemberStatus } from "@/store/slice/userSlice";

const onClose = jest.fn();
const onSuccess = jest.fn();

function renderInvite(allMembers: any[] = []) {
  return render(
    <Invite onClose={onClose} onSuccess={onSuccess} allMembers={allMembers} />,
  );
}

const PENDING_MEMBER = {
  email: "pending@example.com",
  role: "basic",
  status: TeamMemberStatus.invitePending,
  budgetType: "Unlimited",
  budgetLimit: 0,
  inviteLink: "https://invite.example/abc",
};

describe("Invite (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes an added email tag via its remove button", () => {
    const { container } = renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "a@x.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("a@x.com")).toBeInTheDocument();

    // The tag's X button removes it
    const removeBtn = screen
      .getByText("a@x.com")
      .querySelector("button") as HTMLButtonElement;
    fireEvent.click(removeBtn);
    expect(screen.queryByText("a@x.com")).not.toBeInTheDocument();
  });

  it("adds an email on blur", () => {
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "blur@x.com" } });
    fireEvent.blur(input);
    expect(screen.getByText("blur@x.com")).toBeInTheDocument();
  });

  it("shows autocomplete domain options and selects one", () => {
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "alice@gmail" } });
    // The filtered option should appear and clicking it adds the email
    const option = screen.getByText("alice@gmail.com");
    fireEvent.mouseDown(option);
    expect(screen.getByText("alice@gmail.com")).toBeInTheDocument();
  });

  it("clears options when the input becomes empty", () => {
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "bob" } });
    // options visible
    expect(screen.getAllByText(/bob@/).length).toBeGreaterThan(0);
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByText(/bob@/)).not.toBeInTheDocument();
  });

  it("caps the number of added emails at the max count", () => {
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, {
      target: {
        value: "a@x.com,b@x.com,c@x.com,d@x.com,e@x.com,f@x.com,g@x.com",
      },
    });
    fireEvent.keyDown(input, { key: "Enter" });
    // MAX_COUNT is 6 — only six tags should remain
    expect(screen.getByText("6 / 6")).toBeInTheDocument();
    expect(screen.queryByText("g@x.com")).not.toBeInTheDocument();
  });

  it("selects a role via the role card click handler", async () => {
    inviteTeamMember.mockResolvedValueOnce({ urls: [] });
    renderInvite();
    // Click the Admin role card text to switch the selected role
    fireEvent.click(screen.getByText("Admin"));

    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "a@x.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByText("+ Invite Members"));
    await waitFor(() =>
      expect(inviteTeamMember).toHaveBeenCalledWith(["a@x.com"], "admin"),
    );
  });

  it("opens the permission details modal", () => {
    renderInvite();
    fireEvent.click(screen.getByText("View permission details"));
    expect(screen.getByTestId("permissions-open")).toBeInTheDocument();
  });

  it("renders the pending members table and copies an invite link", () => {
    renderInvite([PENDING_MEMBER]);
    // The pending member row renders the email and budget value
    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
    expect(screen.getByText("Unlimited")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("copy-wrapper"));
    expect(message.success).toHaveBeenCalledWith("Invite link copied");
  });

  it("does not render the pending table when there are no pending members", () => {
    renderInvite([{ ...PENDING_MEMBER, status: TeamMemberStatus.active }]);
    expect(screen.queryByText("pending@example.com")).not.toBeInTheDocument();
  });

  it("closes via the top-right X button and clears state", () => {
    const { container } = renderInvite();
    // First X (top-right close) clears and closes
    const closeBtn = container.querySelector(".lucide-x")?.closest("button");
    fireEvent.click(closeBtn as Element);
    expect(onClose).toHaveBeenCalled();
  });
});
