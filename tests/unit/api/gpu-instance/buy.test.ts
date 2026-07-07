jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import {
  bindPaymentMethod,
  createProductSession,
  doTransaction,
  getAutoRecharge,
  getPaymentMethod,
  getTopUpStatus,
  orderList,
  setAutoRecharge,
  topUp,
  unbindPaymentMethod,
} from "@/api/gpu-instance/buy";

const mockRequest = request as jest.Mock;

describe("gpu instance buy API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ ok: true });
  });

  it("creates checkout sessions with optional campaign and client id", async () => {
    await createProductSession({
      campaign: "summer",
      client_id: "client-1",
      price: 1200,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v2/stripe/create-checkout-session",
      method: "POST",
      data: {
        price: 1200,
        client_id: "client-1",
        campaign: "summer",
      },
      ignoreMsg: true,
    });
  });

  it("submits transaction payloads unchanged", async () => {
    const params = {
      merchantTxnId: "txn-1",
      merchantTxnTimeZone: "UTC",
      orderAmount: "49.99",
      txnOrderMsg: {
        javaEnabled: false,
        colorDepth: "24",
        screenHeight: "1080",
        screenWidth: "1920",
        timeZoneOffset: "0",
        userAgent: "Jest",
        language: "en-US",
        transactionIp: "127.0.0.1",
        accept: "application/json",
        contentLength: "123",
      },
      billingInformation: {
        email: "billing@example.test",
        country: "US",
      },
      shippingInformation: {
        email: "shipping@example.test",
        country: "US",
      },
    };

    await doTransaction(params);

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/order/doTransaction",
      method: "POST",
      data: params,
    });
  });

  it("builds order list and payment method requests", async () => {
    await orderList("gpu", 2, 50);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/order?",
      query: {
        inputs: "gpu",
        pageIndex: 2,
        pageSize: 50,
        source: 1,
      },
    });

    await getPaymentMethod();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/paymentMethods",
    });

    await bindPaymentMethod();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/paymentMethod",
      method: "POST",
    });

    await unbindPaymentMethod({ paymentMethodId: "pm-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/paymentMethod",
      method: "DELETE",
      query: {
        paymentMethodId: "pm-1",
      },
    });
  });

  it("builds auto recharge and top up requests", async () => {
    await setAutoRecharge({
      threshold: 10,
      amount: 100,
      isAutoRecharge: true,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/autoRecharge",
      method: "POST",
      data: {
        threshold: 10,
        amount: 100,
        isAutoRecharge: true,
      },
    });

    await getAutoRecharge();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/autoRecharge",
    });

    await topUp({
      amount: 200,
      paymentMethodId: "pm-2",
      campaign: "launch",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/topup",
      method: "POST",
      data: {
        amount: 200,
        paymentMethodId: "pm-2",
        campaign: "launch",
      },
      ignoreMsg: true,
    });

    await getTopUpStatus("topup-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v3/stripe/topup",
      query: {
        topUpId: "topup-1",
      },
    });
  });
});
