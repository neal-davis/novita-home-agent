import { request } from "./api";

export function setTeamName(newName: string) {
  return request({
    url: `/v1/user/team/update-name`,
    method: "PUT",
    data: { name: newName },
  });
}

export function getTeamMembers() {
  return request({
    url: `/v1/user/team/member-list`,
    method: "GET",
    ignoreMsg: true,
  });
}

export function getAllTeamMembers() {
  // For those who is not owner or admin. Used for resource list filters.
  return request({
    url: `/v1/user/team/members`,
    method: "GET",
  });
}

export function inviteTeamMember(emails: string[], role: string) {
  return request({
    url: `/v1/user/team/batch-invite-by-email`,
    method: "POST",
    data: { emails, role },
  });
}

export function inviteTeamMemberByPhone(phones: string[], role: string) {
  return request({
    url: `/v1/user/team/batch-invite-by-phone`,
    method: "POST",
    data: { phones, role },
  });
}

export function editTeamMember(memID: string, role: string) {
  return request({
    url: `/v1/user/team/update-role`,
    method: "PUT",
    data: { member_id: memID, role },
  });
}

export function removeTeamMember(memID: string) {
  return request({
    url: `/v1/user/team/remove-member`,
    method: "POST",
    data: { member_id: memID },
  });
}

export function cancelInvite(inviteID: string) {
  return request({
    url: `/v1/user/team/cancel-invite`,
    method: "POST",
    data: { invite_id: inviteID },
  });
}

export function resendInvite(inviteID: string) {
  return request({
    url: `/v1/user/team/resend-invite-link`,
    method: "POST",
    data: { invite_id: inviteID },
  });
}

export function getInviteInfo(inviteToken: string) {
  return request({
    url: "/v1/user/team/invite-info",
    method: "GET",
    query: {
      invite_token: inviteToken,
    },
  });
}

export function joinTeamByInvite(inviteToken: string) {
  return request({
    url: "/v1/user/team/join-by-invite",
    method: "POST",
    data: {
      invite_token: inviteToken,
    },
  });
}

export function getAuditLogs({
  page,
  pageSize,
  startTime,
  endTime,
  filter,
}: {
  page: number;
  pageSize: number;
  startTime: number;
  endTime: number;
  filter: {
    member_id?: string;
    action?: string;
    service?: string;
  };
}) {
  return request({
    url: `/v1/user/team/audit-logs`,
    method: "GET",
    query: {
      page_index: page,
      page_size: pageSize,
      start_time: startTime,
      end_time: endTime,
      ...filter,
    },
  }).then((res) => {
    return {
      total: res.total,
      logs: res.logs.map((log: any) => {
        return {
          timestamp: log.timestamp,
          email: log.email,
          phone: log.phone,
          resourceGroup: log.resource_group,
          resource: log.resource,
          resourceID: log.resource_id,
          memID: log.member_id,
          action: log.action,
          alias: log.remark_name,
        };
      }),
    };
  });
}

export function upgradeToTeamAccount(name: string) {
  return request({
    url: `/v1/user/team/upgrade`,
    method: "POST",
    data: { name },
  });
}

export function switchTeam(teamID?: string) {
  // If teamID is not provided, switch to the personal account
  return request({
    url: `/v1/user/team/switch`,
    method: "POST",
    data: { team_id: teamID },
  }).then((res) => {
    return res.token;
  });
}

export function editMemberAlias(memID: string, alias: string) {
  return request({
    url: `/v1/user/team/member-name`,
    method: "PUT",
    data: { member_id: memID, remark_name: alias },
  });
}

export function getBudgetList() {
  return request({
    url: `/v1/user/team/budget-list`,
    method: "GET",
    ignoreMsg: true,
  });
}

export type BudgetCycle = "Monthly" | "";

export interface KeyBudgetInfo {
  key_id: string;
  key_name: string;
  budget_type: string;
  budget_limit: number;
  used: number;
  remaining: number;
  cycle?: string;
  period_start?: string;
  period_end?: string;
}

export function updateMemberBudget(
  memberId: string,
  budgetType: string,
  budgetLimit: number,
  cycle?: BudgetCycle,
) {
  return request({
    url: `/v1/user/team/member-budget`,
    method: "PUT",
    data: {
      member_id: memberId,
      budget_type: budgetType,
      budget_limit: budgetLimit,
      ...(budgetType === "Recurring" ? { cycle: cycle ?? "Monthly" } : {}),
    },
  });
}

export async function getKeyBudgetList(
  memberId: string,
): Promise<KeyBudgetInfo[]> {
  try {
    const res = await request({
      url: "/v1/user/team/key-budget-list",
      method: "GET",
      query: { member_id: memberId },
    });
    const raw =
      res.key_budgets ??
      res.keyBudgets ??
      res.data?.key_budgets ??
      res.data?.keyBudgets ??
      res.data ??
      [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((item: any) => ({
      key_id: item.key_id || "",
      key_name: item.key_name || "",
      budget_type: item.budget_type || "Unlimited",
      budget_limit: parseFloat(item.budget_limit) || 0,
      used: parseFloat(item.used) || 0,
      remaining: parseFloat(item.remaining) || 0,
      cycle: item.cycle || "",
      period_start: item.period_start || "",
      period_end: item.period_end || "",
    }));
  } catch {
    return [];
  }
}

export function updateKeyBudget(
  memberId: string,
  keyId: string,
  budgetType: string,
  budgetLimit: number,
) {
  return request({
    url: "/v1/user/team/key-budget",
    method: "PUT",
    data: {
      member_id: memberId,
      key_id: keyId,
      budget_type: budgetType,
      budget_limit: budgetLimit,
      ...(budgetType === "Recurring" ? { cycle: "Monthly" } : {}),
    },
  });
}
