import { request, requestInServerEnv, BASE_API_URL } from "./api";

export function login(params: any) {
  return request({
    url: "/v1/user/login",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function GoogleLogin(params: any) {
  return request({
    url: "/v1/user/googleAuth",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function GithubLogin(params: any) {
  return request({
    url: "/v2/user/githubAuth",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function bindGithub(code: string) {
  return request({
    url: "/v1/activity/related-github",
    method: "POST",
    data: { code },
  });
}

export function userInviteInfo() {
  return request({
    url: "/v1/activity/user-invite-info",
    method: "GET",
  });
}

export function inviteCodeVerify(code: string) {
  return request({
    url: "/v1/activity/verify-invite-code",
    method: "GET",
    query: {
      fromInviteCode: code,
    },
  });
}

export function register(params: any) {
  return request({
    url: "/v1/user/register",
    method: "POST",
    data: { ...params },
  });
}

export function info() {
  return request({
    url: "/v1/user/info",
    method: "GET",
  });
}

export function infoInServerEnv({ token }: { token: string }) {
  return requestInServerEnv({
    url: "/v1/user/info",
    method: "GET",
    token,
  });
}

export function addUserKey(data: { name: string; expireTime: string }) {
  return request({
    url: "/v2/user/key",
    method: "POST",
    data,
  });
}

export function deleteUserKey(stringId: string) {
  return request({
    url: "/v2/user/key/" + stringId,
    method: "DELETE",
  });
}

export function updateUserKey(data: { name: string; stringId: string }) {
  return request({
    url: "/v2/user/key",
    method: "PUT",
    data,
  });
}

export function getUserKey() {
  return request({
    url: "/v2/user/key",
    method: "GET",
  });
}

export function sendResetPwdEmail(email: string) {
  return request({
    url: "/v1/user/pwd/reset/send?email=" + email,
  });
}

export function sendActiveEmail(email: string) {
  return request({
    url: "/v1/user/active/resend?email=" + email,
  });
}

export function resetPwd(data: {
  email: string;
  password: string;
  confirmPassword: string;
  token: string;
}) {
  return request({
    url: "/v1/user/resetPwd",
    method: "POST",
    data,
  });
}

export function getPointInfo() {
  return request({
    url: "/v1/user/pointInfo",
  });
}

export function pointUsage() {
  return request({
    url: "/v1/user/pointUsage",
  });
}

export function modalCount() {
  return request({
    url: "/v1/user/modelCount",
  });
}

export function generateCoupon(params: {
  type: string;
  count?: number;
  point: number;
  day: number;
  limit?: number;
  node?: string;
}) {
  return request({
    url: "/v1/user/exchangeCode",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function activeCode(params: {
  code?: string;
  type?: string;
  url?: string;
  emails?: string[];
  note?: string;
  point?: number;
}) {
  return request({
    url: "/v1/user/exchangeCode/activate",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function userCollect(params: { occupation: string; category: string }) {
  return request({
    url: "/v1/user/fillCollectInfo",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function getCollectInfo() {
  return request({
    url: "/v1/user/checkCollectInfo",
  });
}

export function userQuestionnaire(params: {
  name: string;
  company?: string;
  role?: string;
  monthlySpend?: string;
}) {
  return request({
    url: "/v1/user/questionnaire",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function getConfig() {
  return request({
    url: "/v1/config",
  });
}

export function UserInfo(token: string) {
  return request({
    url: "/v3/user",
    base_url: BASE_API_URL,
    token,
  });
}

export function getModel(token: string, params: any) {
  return request({
    url: "/v3/model",
    query: {
      ...params,
    },
    token: token,
    base_url: BASE_API_URL,
  });
}

export function getUploadUrl(
  key: string,
  model_name: string,
  file_sha256: string,
  file_extension: string,
) {
  return request({
    url: "/v3/model/uploader",
    method: "POST",
    data: {
      model_name: model_name,
      file_sha256: file_sha256,
      file_extension: file_extension,
    },
    token: key,
    base_url: BASE_API_URL,
  });
}
export function getMeta(key: string) {
  return request({
    url: "/v3/metadata",
    token: key,
    base_url: BASE_API_URL,
  });
}

export function delModel(token: string, id: number) {
  return request({
    url: `/v3/model`,
    method: "DELETE",
    token: token,
    base_url: BASE_API_URL,
    query: {
      id: id,
    },
  });
}

export function getUSDTPaymentUrl() {
  return request({
    url: "/v1/user/getUSDTUrl",
    method: "POST",
  });
}

export function queryUSDTPaymentByOid(oid: string) {
  return request({
    url: "/v1/user/queryUSDTOrderByOid",
    method: "GET",
    query: {
      oid: oid,
    },
  });
}

export function queryApiUsageByTime({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  return request({
    url: "/v1/user/queryApiUsageByTime",
    query: {
      start,
      end,
    },
  });
}

export function queryUserDiscount() {
  return request({
    url: "/v3/stripe/promotion",
  });
}

export function queryUserServiceOverview() {
  return request({
    url: "/v1/user/serviceOverview",
  });
}

export function queryUserQueryConsumeMonthly() {
  return request({
    url: "/v1/user/queryConsumeMonthly",
  });
}

export function getVoucherList(templateIds?: string[]) {
  return request({
    url: `/v1/billing/voucher/list?${templateIds
      ?.map((id) => `templateIds=${id}`)
      .join("&")}`,
  });
}

export function redeemVoucherCode(code: string) {
  return request({
    url: "/v1/activity/voucher-code/redeem",
    method: "POST",
    data: { code },
    ignoreMsg: true,
  });
}

export function updateUserInfo(params: userUpdateSchema) {
  return request({
    url: "/v1/user/info/update",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function updateRecentlyVisited(page: string) {
  return request({
    url: "/v1/user/visit",
    method: "POST",
    data: {
      page,
    },
  });
}

export function queryRecentlyVisited() {
  return request({
    url: "/v1/user/visits",
  });
}

export function sendSms({
  username,
  randstr,
  ticket,
}: {
  username: string;
  randstr: string;
  ticket: string;
}) {
  return request({
    url: "/v1/user/sms/send",
    method: "POST",
    data: {
      username,
      ticket,
      randstr,
    },
  });
}

export function mobileLogin(params: {
  mobilePhone: string;
  verificationCode: string;
  agreementVersion: string;
  [key: string]: any;
}) {
  return request({
    url: "/v1/user/mobile/login",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function userPwdLogin(params: {
  username: string;
  password: string;
  agreementVersion: string;
}) {
  return request({
    url: "/v1/user/username/login",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function usernameRegister(params: {
  username: string;
  password: string;
  mobilePhone: string;
  verificationCode: string;
  agreementVersion: string;
  [key: string]: any;
}) {
  return request({
    url: "/v1/user/username/register",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function updatePwdWithToken(params: {
  token: string;
  newPassword: string;
}) {
  return request({
    url: "/v1/user/changePassword",
    method: "POST",
    data: {
      newPassword: params.newPassword,
    },
    token: `Bearer ${params.token}`,
  });
}

export function reportCollect() {
  return request({
    url: "/api/v1/user/company",
    method: "POST",
  });
}

export type VerifyAuthType =
  | "PSN_BANK4_AUTHCODE" // 银行卡
  | "PSN_TELECOM_AUTHCODE" // 手机号
  | "PSN_FACEAUTH_BYURL" // 人脸识别
  | "ORG_BANK_TRANSFER" // 组织机构对公账户打款认证
  | "ORG_ZM_AUTHORIZE" // 企业芝麻认证
  | "ORG_LEGAL_AUTHORIZE" // 组织机构法定代表人授权书签署认证
  | "LEGAL_REP_AUTH"; // 法定代表人认证

export type individualVerifyRequest = {
  name: string;
  idNo: string;
  defaultAuthType: VerifyAuthType;
};

export type VerifyResponse = {
  cid: string; // 业务id
  flowId: string; // e签宝流程id
  url: string; //e签宝认证链接
  shortUrl: string; //短链接
};

export function individualVerify(
  params: individualVerifyRequest,
): Promise<VerifyResponse> {
  return request({
    url: "/v1/user/e-sign-individual",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export type enterpriseVerifyRequest = {
  name: string;
  orgCode: string;
  agentName: string;
  agentIdNo: string;
  defaultAuthType: VerifyAuthType;
};

export function enterpriseVerify(
  params: enterpriseVerifyRequest,
): Promise<VerifyResponse> {
  return request({
    url: "/v1/user/e-sign-enterprise",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export type VerifyResultStatus =
  | "INIT" //  已发起
  | "ING" // 进行中
  | "SUCCESS" // 已成功
  | "FAIL" // 已失败
  | "REVOKED"; // 已撤销

export type queryVerifyResultResponse = {
  cid: string; // 业务id
  flowId: string; // 流程id
  url: string; // e签宝认证链接
  shortUrl: string; // e签宝认证短链接
  failReason: string; // 失败原因
  objectType: "INDIVIDUAL" | "ORGANIZATION"; // 认证主体类型
  authType: VerifyAuthType;
  status: VerifyResultStatus;
  name: string; // 个人认证的姓名/企业认证的办理人姓名
  idNo: string; // 个人认证的证件号/企业认证的办理人证件号
  orgName: string; // 企业名称
  orgNo: string; // 组织代号
  startAt: number; // 流程开始时间
  endAt: number; // 流程结束时间
};

export function queryVerifyResult(
  cid: string,
): Promise<queryVerifyResultResponse> {
  return request({
    url: `/v1/user/e-sign-detail?cid=${cid}`,
  });
}

export function getIdentityInfo(): Promise<{
  verifyStatus: number; // 实名认证状态 0未认证 1个人认证 2企业认证
  individual: queryVerifyResultResponse;
  organization: queryVerifyResultResponse;
}> {
  return request({
    url: "/v1/user/e-sign-info",
  });
}

export function cancelIdentify() {
  return request({
    url: "/v1/user/e-sign-revoke",
    method: "POST",
    data: {},
  });
}

export interface AffiliateInfoResponse {
  referralLink: string;
  invites: number;
  balance: number;
  clicks: number;
  password: string;
}

export function getAffiliateInfo(): Promise<AffiliateInfoResponse> {
  return request({
    url: "/v1/user/affiliate",
  });
}

export function getTeamInfo(teamID: string) {
  return request({
    url: `/v1/user/team/info/${teamID}`,
    method: "GET",
  });
}

export function verifyEmail(params: {
  token: string;
  cloudflareToken: string;
  email: string;
}) {
  return request({
    url: "/v1/user/email/verify",
    method: "POST",
    data: {
      ...params,
    },
  });
}
