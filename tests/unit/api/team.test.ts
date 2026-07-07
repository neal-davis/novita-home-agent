jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import {
  cancelInvite,
  editMemberAlias,
  editTeamMember,
  getAuditLogs,
  getInviteInfo,
  getKeyBudgetList,
  inviteTeamMember,
  inviteTeamMemberByPhone,
  joinTeamByInvite,
  removeTeamMember,
  resendInvite,
  setTeamName,
  switchTeam,
  updateKeyBudget,
  updateMemberBudget,
  upgradeToTeamAccount,
} from "@/api/team";

const mockRequest = request as jest.Mock;

describe("team API wrappers", () => {
  beforeEach(() => {
    mockRequest.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("builds team mutation request payloads", () => {
    setTeamName("Core Team");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/update-name",
      method: "PUT",
      data: { name: "Core Team" },
    });

    inviteTeamMember(["a@example.com"], "admin");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/batch-invite-by-email",
      method: "POST",
      data: { emails: ["a@example.com"], role: "admin" },
    });

    inviteTeamMemberByPhone(["15500000000"], "member");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/batch-invite-by-phone",
      method: "POST",
      data: { phones: ["15500000000"], role: "member" },
    });

    editTeamMember("member-1", "viewer");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/update-role",
      method: "PUT",
      data: { member_id: "member-1", role: "viewer" },
    });

    removeTeamMember("member-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/remove-member",
      method: "POST",
      data: { member_id: "member-1" },
    });
  });

  it("builds invite and account switching requests", async () => {
    cancelInvite("invite-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/cancel-invite",
      method: "POST",
      data: { invite_id: "invite-1" },
    });

    resendInvite("invite-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/resend-invite-link",
      method: "POST",
      data: { invite_id: "invite-1" },
    });

    getInviteInfo("invite-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/invite-info",
      method: "GET",
      query: { invite_token: "invite-token" },
    });

    joinTeamByInvite("invite-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/join-by-invite",
      method: "POST",
      data: { invite_token: "invite-token" },
    });

    mockRequest.mockResolvedValueOnce({ token: "team-token" });
    await expect(switchTeam("team-1")).resolves.toBe("team-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/switch",
      method: "POST",
      data: { team_id: "team-1" },
    });

    upgradeToTeamAccount("New Team");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/upgrade",
      method: "POST",
      data: { name: "New Team" },
    });
  });

  it("maps audit log API fields into client fields", async () => {
    mockRequest.mockResolvedValueOnce({
      total: 1,
      logs: [
        {
          timestamp: 1,
          email: "a@example.com",
          phone: "15500000000",
          resource_group: "billing",
          resource: "balance",
          resource_id: "resource-1",
          member_id: "member-1",
          action: "read",
          remark_name: "Alias",
        },
      ],
    });

    await expect(
      getAuditLogs({
        page: 2,
        pageSize: 20,
        startTime: 10,
        endTime: 20,
        filter: { member_id: "member-1", service: "billing" },
      }),
    ).resolves.toEqual({
      total: 1,
      logs: [
        {
          timestamp: 1,
          email: "a@example.com",
          phone: "15500000000",
          resourceGroup: "billing",
          resource: "balance",
          resourceID: "resource-1",
          memID: "member-1",
          action: "read",
          alias: "Alias",
        },
      ],
    });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/user/team/audit-logs",
      method: "GET",
      query: {
        page_index: 2,
        page_size: 20,
        start_time: 10,
        end_time: 20,
        member_id: "member-1",
        service: "billing",
      },
    });
  });

  it("normalizes key budget responses from supported response shapes", async () => {
    mockRequest.mockResolvedValueOnce({
      data: {
        keyBudgets: [
          {
            key_id: "key-1",
            key_name: "Production",
            budget_type: "Recurring",
            budget_limit: "100.5",
            used: "20.25",
            remaining: "80.25",
            cycle: "Monthly",
          },
        ],
      },
    });

    await expect(getKeyBudgetList("member-1")).resolves.toEqual([
      {
        key_id: "key-1",
        key_name: "Production",
        budget_type: "Recurring",
        budget_limit: 100.5,
        used: 20.25,
        remaining: 80.25,
        cycle: "Monthly",
        period_start: "",
        period_end: "",
      },
    ]);

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/user/team/key-budget-list",
      method: "GET",
      query: { member_id: "member-1" },
    });
  });

  it("returns an empty key budget list when the request fails", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network"));

    await expect(getKeyBudgetList("member-1")).resolves.toEqual([]);
  });

  it("adds recurring budget cycle fields only for recurring budgets", () => {
    updateMemberBudget("member-1", "Recurring", 100);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/member-budget",
      method: "PUT",
      data: {
        member_id: "member-1",
        budget_type: "Recurring",
        budget_limit: 100,
        cycle: "Monthly",
      },
    });

    updateMemberBudget("member-1", "OneTime", 50);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/member-budget",
      method: "PUT",
      data: {
        member_id: "member-1",
        budget_type: "OneTime",
        budget_limit: 50,
      },
    });

    updateKeyBudget("member-1", "key-1", "Recurring", 25);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/key-budget",
      method: "PUT",
      data: {
        member_id: "member-1",
        key_id: "key-1",
        budget_type: "Recurring",
        budget_limit: 25,
        cycle: "Monthly",
      },
    });

    editMemberAlias("member-1", "Alias");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/member-name",
      method: "PUT",
      data: { member_id: "member-1", remark_name: "Alias" },
    });
  });
});
