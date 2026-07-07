jest.mock("@/api/api", () => ({
  request: jest.fn(),
  requestInServerEnv: jest.fn(),
}));

jest.mock("@/lib/utils/models", () => ({
  convertRawModelToLLMModelClient: jest.fn((model) => ({
    ...model,
    converted: true,
  })),
}));

import { request, requestInServerEnv } from "@/api/api";
import {
  bindPaymentMethod,
  createCheckoutSessionV3,
  createProductSession,
  doTransaction,
  getAutoRecharge,
  getPaymentMethod,
  getStripeInvoiceUrl,
  getTopUpStatus,
  orderList,
  queryBillingGetTotalBalance,
  queryBillingGetVoucherNum,
  setAutoRecharge,
  topUp,
  unbindPaymentMethod,
  updateStripeCustomerPortal,
} from "@/api/buy";
import { getBuildMonthModelList } from "@/api/campaigns";
import { getOAuthClient } from "@/api/oauth";
import { convertRawModelToLLMModelClient } from "@/lib/utils/models";

const mockRequest = request as jest.Mock;
const mockRequestInServerEnv = requestInServerEnv as jest.Mock;
const mockConvertRawModelToLLMModelClient =
  convertRawModelToLLMModelClient as jest.Mock;

describe("buy, campaign and oauth API helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ data: [] });
    mockRequestInServerEnv.mockResolvedValue({ name: "client" });
  });

  it("creates checkout sessions with expected payloads and ignored messages", async () => {
    await createProductSession({
      price: 100,
      client_id: "client-1",
      campaign: "summer",
      redirect_url: "https://example.test/return",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v2/stripe/create-checkout-session",
      method: "POST",
      data: {
        price: 100,
        client_id: "client-1",
        campaign: "summer",
        redirect_url: "https://example.test/return",
      },
      ignoreMsg: true,
    });

    await createCheckoutSessionV3({
      price: 200,
      redirect_url: "https://example.test/v3",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/create-checkout-session",
      method: "POST",
      data: {
        price: 200,
        redirect_url: "https://example.test/v3",
      },
      ignoreMsg: true,
    });
  });

  it("submits transaction and filtered order-list requests", async () => {
    const transaction = {
      orderAmount: "10.00",
      txnOrderMsg: {
        javaEnabled: false,
        colorDepth: "24",
        screenHeight: "900",
        screenWidth: "1440",
        timeZoneOffset: "0",
        userAgent: "jest",
        language: "en",
      },
      billingInformation: { email: "user@example.com", country: "US" },
      shippingInformation: { email: "user@example.com", country: "US" },
    };

    await doTransaction(transaction);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/order/doTransaction",
      method: "POST",
      data: transaction,
    });

    await orderList({
      inputs: "oid",
      pageIndex: 1,
      pageSize: 20,
      status: undefined,
      orderType: "recharge",
      channel: "stripe",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/order",
      query: {
        inputs: "oid",
        pageIndex: 1,
        pageSize: 20,
        source: 1,
        orderType: "recharge",
        channel: "stripe",
      },
    });
  });

  it.each([
    [
      getPaymentMethod,
      "/v3/stripe/paymentMethods",
      undefined,
      { ignoreMsg: true },
    ],
    [
      bindPaymentMethod,
      "/v3/stripe/paymentMethod",
      { redirect_url: "https://example.test/pay" },
      { method: "POST", data: { redirect_url: "https://example.test/pay" } },
    ],
    [
      unbindPaymentMethod,
      "/v3/stripe/paymentMethod",
      { paymentMethodId: "pm_1" },
      { method: "DELETE", query: { paymentMethodId: "pm_1" } },
    ],
    [
      setAutoRecharge,
      "/v3/stripe/autoRecharge",
      { threshold: 10, amount: 50, isAutoRecharge: true },
      {
        method: "POST",
        data: { threshold: 10, amount: 50, isAutoRecharge: true },
      },
    ],
    [getAutoRecharge, "/v3/stripe/autoRecharge", undefined, {}],
    [
      topUp,
      "/v3/stripe/topup",
      { amount: 25, paymentMethodId: "pm_1", campaign: "summer" },
      {
        method: "POST",
        data: { amount: 25, paymentMethodId: "pm_1", campaign: "summer" },
        ignoreMsg: true,
      },
    ],
    [
      getTopUpStatus,
      "/v3/stripe/topup",
      "topup-1",
      { query: { topUpId: "topup-1" } },
    ],
    [
      updateStripeCustomerPortal,
      "/v3/stripe/customer-portal",
      { redirect_url: "https://example.test/portal" },
      {
        method: "POST",
        data: { redirect_url: "https://example.test/portal" },
      },
    ],
  ])("builds stripe helper request for %s", async (fn, url, arg, expected) => {
    if (arg === undefined) {
      await fn();
    } else {
      await fn(arg as never);
    }

    expect(mockRequest).toHaveBeenLastCalledWith({
      url,
      ...expected,
    });
  });

  it("builds voucher, balance and invoice queries", async () => {
    await queryBillingGetVoucherNum();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/voucher/num",
      query: {},
    });

    await queryBillingGetVoucherNum("model_api" as IBusinessType);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/voucher/num",
      query: { businessType: "model_api" },
    });

    await queryBillingGetTotalBalance();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/total",
    });

    await getStripeInvoiceUrl("order-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/order/invoice-url",
      query: { oid: "order-1" },
    });
  });

  it("converts build-month models when the response data is an array", async () => {
    const signal = new AbortController().signal;
    mockRequest.mockResolvedValueOnce({
      data: [{ id: "model-a" }, { id: "model-b" }],
    });

    await expect(getBuildMonthModelList({ signal })).resolves.toEqual({
      data: [
        { id: "model-a", converted: true },
        { id: "model-b", converted: true },
      ],
    });
    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/product/build-month/model/list",
      signal,
    });
    expect(mockConvertRawModelToLLMModelClient).toHaveBeenCalledTimes(2);

    mockRequest.mockResolvedValueOnce({ data: null });
    await expect(getBuildMonthModelList({})).resolves.toEqual({ data: null });
  });

  it("builds OAuth client server-side requests with token and scope", async () => {
    await getOAuthClient("client-1", "openid profile", "token-1");

    expect(mockRequestInServerEnv).toHaveBeenCalledWith({
      url: "/oauth/client",
      method: "GET",
      token: "token-1",
      query: {
        client_id: "client-1",
        scope: "openid profile",
      },
    });
  });
});
