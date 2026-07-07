jest.mock("@/api/api", () => ({
  request: jest.fn(),
  service_base_url: "https://service.example.test",
}));

jest.mock("@/constants/constants", () => ({
  ENTERPRISE_PLAYGROUND_CONFIG: {},
}));

import { request } from "@/api/api";
import {
  createCheckoutSessionV3,
  createProductSession,
  doTransaction,
  orderList,
} from "@/api/buy";
import {
  cancelEnterprisePlan,
  couponCheck,
  enterpriseCount,
  enterprisePlanDetail,
  enterprisePlanList,
  enterpriseProductInfo,
  enterpriseProductList,
  payEnterprise,
  queryEnterpriseConfig,
  queryEnterprisePlanRecord,
  queryEnterprisePlanSubmission,
  querySubmission,
  setPlaygroundConfig,
  submissionEnterprisePlan,
  updateEnterprisePlanBillingMethod,
} from "@/api/enterprise";
import {
  GithubLogin,
  GoogleLogin,
  UserInfo,
  activeCode,
  delModel,
  generateCoupon,
  getCollectInfo,
  getConfig,
  getMeta,
  getModel,
  getPointInfo,
  getUSDTPaymentUrl,
  getUploadUrl,
  info,
  login,
  modalCount,
  pointUsage,
  queryApiUsage,
  queryApiUsageByTime,
  queryUSDTPaymentByOid,
  register,
  resetPwd,
  sendContactInfo,
  setResetPwdEmail,
  userCollect,
} from "@/api/gpu-instance/user";

const mockRequest = request as jest.Mock;

describe("commerce API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({});
  });

  it("builds checkout and transaction requests", () => {
    createProductSession({
      campaign: "campaign-1",
      client_id: "client-1",
      price: 99,
      redirect_url: "/done",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: {
        campaign: "campaign-1",
        client_id: "client-1",
        price: 99,
        redirect_url: "/done",
      },
      ignoreMsg: true,
      method: "POST",
      url: "/v2/stripe/create-checkout-session",
    });

    createCheckoutSessionV3({ price: 199, redirect_url: "/return" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { price: 199, redirect_url: "/return" },
      ignoreMsg: true,
      method: "POST",
      url: "/v3/stripe/create-checkout-session",
    });

    const transaction = {
      billingInformation: { country: "US", email: "a@example.com" },
      orderAmount: "10.00",
      shippingInformation: { country: "US", email: "a@example.com" },
      txnOrderMsg: {
        colorDepth: "24",
        javaEnabled: false,
        language: "en-US",
        screenHeight: "1080",
        screenWidth: "1920",
        timeZoneOffset: "0",
        userAgent: "jest",
      },
    };
    doTransaction(transaction);
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: transaction,
      method: "POST",
      url: "/v1/order/doTransaction",
    });
  });

  it("filters undefined order list query fields", () => {
    orderList({
      channel: undefined,
      endTime: "2024-01-31",
      inputs: "order",
      orderType: "recharge",
      pageIndex: 2,
      pageSize: 20,
      startTime: undefined,
      status: "paid",
    });

    expect(mockRequest).toHaveBeenCalledWith({
      query: {
        endTime: "2024-01-31",
        inputs: "order",
        orderType: "recharge",
        pageIndex: 2,
        pageSize: 20,
        source: 1,
        status: "paid",
      },
      url: "/v1/user/order",
    });
  });
});

describe("enterprise API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({});
  });

  it.each([
    ["product list", enterpriseProductList, "/v1/enterprise-plan/product"],
    ["config", queryEnterpriseConfig, "/v1/enterprise-plan/config"],
    [
      "submission",
      queryEnterprisePlanSubmission,
      "/v1/enterprise-plan/submission",
    ],
    ["plan list", enterprisePlanList, "/v1/enterprise-plan/product"],
    ["record list", queryEnterprisePlanRecord, "/v1/enterprise-plan/list"],
    ["query submission", querySubmission, "/v1/enterprise-plan/submission"],
    ["count", enterpriseCount, "/v1/enterprise-plan/count"],
    ["product info", enterpriseProductInfo, "/v1/enterprise-plan/product-list"],
  ])("calls enterprise %s endpoint", (_label, fn, url) => {
    fn();

    expect(mockRequest).toHaveBeenCalledWith({ url });
  });

  it("builds enterprise mutation requests", () => {
    submissionEnterprisePlan({
      case: "chatbot",
      company_size: "100-500",
      email: "a@example.com",
      plan_id: "pro",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: {
        case: "chatbot",
        company_size: "100-500",
        email: "a@example.com",
        plan_id: "pro",
      },
      method: "post",
      url: "/v1/enterprise-plan/submission",
    });

    enterprisePlanDetail({ uuid: "plan-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      query: { uuid: "plan-1" },
      url: "v1/enterprise-plan/info",
    });

    payEnterprise({
      billingMethod: 1,
      campaign: "camp",
      count: 2,
      paymentMethodId: "pm-1",
      planId: 10,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: {
        billingMethod: 1,
        campaign: "camp",
        count: 2,
        paymentMethodId: "pm-1",
        planId: 10,
      },
      ignoreMsg: true,
      method: "POST",
      url: "/v3/stripe/dedicated-endpoints",
    });

    cancelEnterprisePlan({ uuid: "plan-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { uuid: "plan-1" },
      method: "POST",
      url: "/v1/enterprise-plan/cancel",
    });

    couponCheck({ coupon_no: "SAVE10", plan_id: 10 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { coupon_no: "SAVE10", plan_id: 10 },
      method: "POST",
      url: "/v1/enterprise-plan/coupon-check",
    });

    setPlaygroundConfig({ playground_api_config: "dedicated" as any });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { playground_api_config: "dedicated" },
      ignoreMsg: true,
      method: "PUT",
      url: "/v1/enterprise-plan/playground",
    });

    updateEnterprisePlanBillingMethod({ billingMethod: 2 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { billingMethod: 2 },
      method: "PUT",
      url: "/v1/enterprise-plan/billing-method",
    });
  });
});

describe("gpu instance user API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({});
  });

  it.each([
    [
      "login",
      login,
      [{ email: "a@example.com", password: "pwd" }],
      "/v1/user/login",
      "POST",
    ],
    [
      "google login",
      GoogleLogin,
      [{ code: "google" }],
      "/v1/user/googleAuth",
      "POST",
    ],
    [
      "github login",
      GithubLogin,
      [{ code: "github" }],
      "/v2/user/githubAuth",
      "POST",
    ],
    [
      "register",
      register,
      [{ confirmPassword: "pwd", email: "a@example.com", password: "pwd" }],
      "/v1/user/register",
      "POST",
    ],
    ["info", info, [], "/v1/user/info", "GET"],
    ["point info", getPointInfo, [], "/v1/user/pointInfo", undefined],
    ["point usage", pointUsage, [], "/v1/user/pointUsage", undefined],
    ["model count", modalCount, [], "/v1/user/modelCount", undefined],
    [
      "collect info",
      getCollectInfo,
      [],
      "/v1/user/checkCollectInfo",
      undefined,
    ],
    ["config", getConfig, [], "/v1/config", undefined],
    ["usdt url", getUSDTPaymentUrl, [], "/v1/user/getUSDTUrl", "POST"],
    ["api usage", queryApiUsage, [], "/v1/user/queryApiUsage", undefined],
  ])("builds gpu user %s request", (_label, fn, args, url, method) => {
    (fn as (...requestArgs: any[]) => unknown)(...(args as any[]));

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        ...(method ? { method } : {}),
        url,
      }),
    );
  });

  it("builds account, coupon and collection payloads", () => {
    setResetPwdEmail("a@example.com");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/pwd/reset/send?email=a@example.com",
    });

    resetPwd({
      confirmPassword: "new",
      email: "a@example.com",
      password: "new",
      token: "reset-token",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: {
        confirmPassword: "new",
        email: "a@example.com",
        password: "new",
        token: "reset-token",
      },
      method: "POST",
      url: "/v1/user/resetPwd",
    });

    generateCoupon({ day: 7, point: 10, type: "trial" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { day: 7, point: 10, type: "trial" },
      method: "POST",
      url: "/v1/user/exchangeCode",
    });

    activeCode({ code: "CODE", type: "trial" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { code: "CODE", type: "trial" },
      method: "POST",
      url: "/v1/user/exchangeCode/activate",
    });

    userCollect({ category: "ai", occupation: "developer" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      data: { category: "ai", occupation: "developer" },
      method: "POST",
      url: "/v1/user/fillCollectInfo",
    });
  });

  it("builds external model and usage requests with token and API base url", () => {
    UserInfo("api-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      token: "api-token",
      url: "/v3/user",
    });

    getModel("api-token", { name: "model-a" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      query: { name: "model-a" },
      token: "api-token",
      url: "/v3/model",
    });

    getUploadUrl("api-token", "model-a", "sha", "png");
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      data: {
        file_extension: "png",
        file_sha256: "sha",
        model_name: "model-a",
      },
      method: "POST",
      token: "api-token",
      url: "/v3/model/uploader",
    });

    getMeta("api-token");
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      token: "api-token",
      url: "/v3/metadata",
    });

    delModel("api-token", 123);
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      method: "DELETE",
      query: { id: 123 },
      token: "api-token",
      url: "/v3/model",
    });

    queryUSDTPaymentByOid("oid-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: { oid: "oid-1" },
      url: "/v1/user/queryUSDTOrderByOid",
    });

    queryApiUsageByTime({ end: "2024-01-31", start: "2024-01-01" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      query: { end: "2024-01-31", start: "2024-01-01" },
      url: "/v1/user/queryApiUsageByTime",
    });

    sendContactInfo({ email: "sales@example.com" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "https://service.example.test/api/v1",
      data: { email: "sales@example.com" },
      method: "POST",
      url: "/user/sale/contact",
    });
  });
});
