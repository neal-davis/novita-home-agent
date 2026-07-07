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

jest.mock("@/app/settings/team/Permissions", () => () => null);
jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

const onClose = jest.fn();
const onSuccess = jest.fn();

function renderInvite(allMembers: any[] = []) {
  return render(
    <Invite onClose={onClose} onSuccess={onSuccess} allMembers={allMembers} />,
  );
}

describe("Invite", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the invite form with role cards", () => {
    renderInvite();
    expect(screen.getByText("Invite Members")).toBeInTheDocument();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows an error when submitting with no emails", () => {
    renderInvite();
    fireEvent.click(screen.getByText("+ Invite Members"));
    expect(screen.getByText("Please input the emails")).toBeInTheDocument();
    expect(inviteTeamMember).not.toHaveBeenCalled();
  });

  it("adds emails via comma and submits successfully", async () => {
    inviteTeamMember.mockResolvedValueOnce({ urls: [] });
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "a@x.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("a@x.com")).toBeInTheDocument();

    fireEvent.click(screen.getByText("+ Invite Members"));
    await waitFor(() =>
      expect(inviteTeamMember).toHaveBeenCalledWith(["a@x.com"], "basic"),
    );
    expect(message.success).toHaveBeenCalledWith(
      "Invitation emails sent successfully!",
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("rejects invalid emails before calling the api", () => {
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByText("+ Invite Members"));
    expect(
      screen.getByText("Some of the emails are invalid"),
    ).toBeInTheDocument();
    expect(inviteTeamMember).not.toHaveBeenCalled();
  });

  it("surfaces an error toast when invitation fails", async () => {
    inviteTeamMember.mockRejectedValueOnce(new Error("nope"));
    const errSpy = jest.spyOn(console, "error").mockImplementation();
    renderInvite();
    const input = screen.getByPlaceholderText(
      "Separate multiple emails with commas",
    );
    fireEvent.change(input, { target: { value: "a@x.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByText("+ Invite Members"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Invitation failed"),
    );
    errSpy.mockRestore();
  });

  it("calls onClose when the cancel button is clicked", () => {
    renderInvite();
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
