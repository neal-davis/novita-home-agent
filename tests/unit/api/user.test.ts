jest.mock("@/api/api", () => ({
  BASE_API_URL: "https://api.example.test",
  request: jest.fn(),
  requestInServerEnv: jest.fn(),
}));

import { request, requestInServerEnv } from "@/api/api";
import {
  GithubLogin,
  GoogleLogin,
  UserInfo,
  activeCode,
  addUserKey,
  bindGithub,
  cancelIdentify,
  delModel,
  deleteUserKey,
  enterpriseVerify,
  generateCoupon,
  getAffiliateInfo,
  getCollectInfo,
  getConfig,
  getIdentityInfo,
  getMeta,
  getModel,
  getPointInfo,
  getTeamInfo,
  getUploadUrl,
  getUserKey,
  getUSDTPaymentUrl,
  getVoucherList,
  info,
  infoInServerEnv,
  individualVerify,
  inviteCodeVerify,
  login,
  mobileLogin,
  modalCount,
  pointUsage,
  queryApiUsageByTime,
  queryRecentlyVisited,
  queryUserDiscount,
  queryUserQueryConsumeMonthly,
  queryUserServiceOverview,
  queryVerifyResult,
  queryUSDTPaymentByOid,
  redeemVoucherCode,
  register,
  reportCollect,
  resetPwd,
  sendActiveEmail,
  sendResetPwdEmail,
  sendSms,
  updateUserKey,
  updatePwdWithToken,
  updateRecentlyVisited,
  updateUserInfo,
  userCollect,
  userInviteInfo,
  userPwdLogin,
  userQuestionnaire,
  verifyEmail,
  usernameRegister,
} from "@/api/user";

const mockRequest = request as jest.Mock;
const mockRequestInServerEnv = requestInServerEnv as jest.Mock;

describe("user API wrappers", () => {
  beforeEach(() => {
    mockRequest.mockResolvedValue({});
    mockRequestInServerEnv.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it.each([
    [login, [{ email: "a@example.com" }], "/v1/user/login", "POST"],
    [GoogleLogin, [{ code: "google-code" }], "/v1/user/googleAuth", "POST"],
    [GithubLogin, [{ code: "github-code" }], "/v2/user/githubAuth", "POST"],
    [register, [{ email: "a@example.com" }], "/v1/user/register", "POST"],
    [info, [], "/v1/user/info", "GET"],
    [getUserKey, [], "/v2/user/key", "GET"],
    [queryRecentlyVisited, [], "/v1/user/visits", undefined],
  ])(
    "calls request for %p with the expected url and method",
    (fn, args, url, method) => {
      (fn as (...requestArgs: any[]) => unknown)(...(args as any[]));

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url,
          ...(method ? { method } : {}),
        }),
      );
    },
  );

  it("passes token to the server environment user info request", () => {
    infoInServerEnv({ token: "server-token" });

    expect(mockRequestInServerEnv).toHaveBeenCalledWith({
      url: "/v1/user/info",
      method: "GET",
      token: "server-token",
    });
  });

  it("builds user credential and key management payloads", () => {
    addUserKey({ name: "production", expireTime: "2026-12-31" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v2/user/key",
      method: "POST",
      data: { name: "production", expireTime: "2026-12-31" },
    });

    resetPwd({
      email: "a@example.com",
      password: "new-password",
      confirmPassword: "new-password",
      token: "reset-token",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/resetPwd",
      method: "POST",
      data: {
        email: "a@example.com",
        password: "new-password",
        confirmPassword: "new-password",
        token: "reset-token",
      },
    });

    deleteUserKey("key-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v2/user/key/key-1",
      method: "DELETE",
    });

    updateUserKey({ name: "renamed", stringId: "key-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v2/user/key",
      method: "PUT",
      data: { name: "renamed", stringId: "key-1" },
    });

    sendResetPwdEmail("a@example.com");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/pwd/reset/send?email=a@example.com",
    });

    sendActiveEmail("a@example.com");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/active/resend?email=a@example.com",
    });

    updatePwdWithToken({ token: "raw-token", newPassword: "new-password" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/changePassword",
      method: "POST",
      data: { newPassword: "new-password" },
      token: "Bearer raw-token",
    });
  });

  it("builds activity, voucher and visit payloads", () => {
    userInviteInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/activity/user-invite-info",
      method: "GET",
    });

    bindGithub("github-code");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/activity/related-github",
      method: "POST",
      data: { code: "github-code" },
    });

    inviteCodeVerify("invite-code");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/activity/verify-invite-code",
      method: "GET",
      query: { fromInviteCode: "invite-code" },
    });

    redeemVoucherCode("voucher-code");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/activity/voucher-code/redeem",
      method: "POST",
      data: { code: "voucher-code" },
      ignoreMsg: true,
    });

    reportCollect();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/user/company",
      method: "POST",
    });

    updateRecentlyVisited("billing");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/visit",
      method: "POST",
      data: { page: "billing" },
    });
  });

  it("builds account verification and mobile auth payloads", () => {
    sendSms({
      username: "15500000000",
      randstr: "rand",
      ticket: "ticket",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/sms/send",
      method: "POST",
      data: {
        username: "15500000000",
        ticket: "ticket",
        randstr: "rand",
      },
    });

    mobileLogin({
      mobilePhone: "15500000000",
      verificationCode: "123456",
      agreementVersion: "v1",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/mobile/login",
      method: "POST",
      data: {
        mobilePhone: "15500000000",
        verificationCode: "123456",
        agreementVersion: "v1",
      },
    });

    userPwdLogin({
      username: "a@example.com",
      password: "password",
      agreementVersion: "v1",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/username/login",
      method: "POST",
      data: {
        username: "a@example.com",
        password: "password",
        agreementVersion: "v1",
      },
    });

    usernameRegister({
      username: "a@example.com",
      password: "password",
      mobilePhone: "15500000000",
      verificationCode: "123456",
      agreementVersion: "v1",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/username/register",
      method: "POST",
      data: {
        username: "a@example.com",
        password: "password",
        mobilePhone: "15500000000",
        verificationCode: "123456",
        agreementVersion: "v1",
      },
    });
  });

  it("builds external model API requests with token and base url", () => {
    UserInfo("api-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/user",
      base_url: "https://api.example.test",
      token: "api-token",
    });

    getModel("api-token", { visibility: "public" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/model",
      query: { visibility: "public" },
      token: "api-token",
      base_url: "https://api.example.test",
    });

    getUploadUrl("api-token", "model", "sha256", "safetensors");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/model/uploader",
      method: "POST",
      data: {
        model_name: "model",
        file_sha256: "sha256",
        file_extension: "safetensors",
      },
      token: "api-token",
      base_url: "https://api.example.test",
    });

    getMeta("api-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/metadata",
      token: "api-token",
      base_url: "https://api.example.test",
    });

    delModel("api-token", 12);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/model",
      method: "DELETE",
      token: "api-token",
      base_url: "https://api.example.test",
      query: { id: 12 },
    });
  });

  it("builds billing-related user helper requests", () => {
    queryUSDTPaymentByOid("order-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/queryUSDTOrderByOid",
      method: "GET",
      query: { oid: "order-1" },
    });

    queryApiUsageByTime({ start: "2026-01-01", end: "2026-01-31" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/queryApiUsageByTime",
      query: { start: "2026-01-01", end: "2026-01-31" },
    });

    getUSDTPaymentUrl();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/getUSDTUrl",
      method: "POST",
    });

    queryUserDiscount();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/promotion",
    });

    queryUserServiceOverview();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/serviceOverview",
    });

    queryUserQueryConsumeMonthly();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/queryConsumeMonthly",
    });

    getVoucherList(["template-a", "template-b"]);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/voucher/list?templateIds=template-a&templateIds=template-b",
    });

    getVoucherList();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/voucher/list?undefined",
    });
  });

  it("passes update and coupon payloads through without dropping fields", () => {
    userCollect({ occupation: "developer", category: "ai-app" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/fillCollectInfo",
      method: "POST",
      data: { occupation: "developer", category: "ai-app" },
    });

    getCollectInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/checkCollectInfo",
    });

    userQuestionnaire({
      name: "Ada",
      company: "Novita",
      role: "Engineer",
      monthlySpend: "1000",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/questionnaire",
      method: "POST",
      data: {
        name: "Ada",
        company: "Novita",
        role: "Engineer",
        monthlySpend: "1000",
      },
    });

    generateCoupon({
      type: "gift",
      count: 2,
      point: 100,
      day: 7,
      limit: 1,
      node: "node-a",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/exchangeCode",
      method: "POST",
      data: {
        type: "gift",
        count: 2,
        point: 100,
        day: 7,
        limit: 1,
        node: "node-a",
      },
    });

    activeCode({ code: "code-1", type: "gift", point: 10 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/exchangeCode/activate",
      method: "POST",
      data: { code: "code-1", type: "gift", point: 10 },
    });

    updateUserInfo({ firstName: "First", lastName: "Last" } as any);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/info/update",
      method: "POST",
      data: { firstName: "First", lastName: "Last" },
    });
  });

  it("builds user point, config and identity query requests", () => {
    getPointInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/pointInfo",
    });

    pointUsage();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/pointUsage",
    });

    modalCount();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/modelCount",
    });

    getConfig();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/config",
    });

    queryVerifyResult("cid-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/e-sign-detail?cid=cid-1",
    });

    getIdentityInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/e-sign-info",
    });

    getAffiliateInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/affiliate",
    });

    getTeamInfo("team-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/info/team-1",
      method: "GET",
    });
  });

  it("builds e-sign verification and email verification requests", () => {
    individualVerify({
      name: "Ada",
      idNo: "110101199001011234",
      defaultAuthType: "PSN_FACEAUTH_BYURL",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/e-sign-individual",
      method: "POST",
      data: {
        name: "Ada",
        idNo: "110101199001011234",
        defaultAuthType: "PSN_FACEAUTH_BYURL",
      },
    });

    enterpriseVerify({
      name: "Novita AI",
      orgCode: "ORG-1",
      agentName: "Ada",
      agentIdNo: "110101199001011234",
      defaultAuthType: "ORG_LEGAL_AUTHORIZE",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/e-sign-enterprise",
      method: "POST",
      data: {
        name: "Novita AI",
        orgCode: "ORG-1",
        agentName: "Ada",
        agentIdNo: "110101199001011234",
        defaultAuthType: "ORG_LEGAL_AUTHORIZE",
      },
    });

    cancelIdentify();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/e-sign-revoke",
      method: "POST",
      data: {},
    });

    verifyEmail({
      token: "email-token",
      cloudflareToken: "turnstile-token",
      email: "a@example.com",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/email/verify",
      method: "POST",
      data: {
        token: "email-token",
        cloudflareToken: "turnstile-token",
        email: "a@example.com",
      },
    });
  });
});
