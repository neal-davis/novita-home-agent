jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import {
  GetBalanceWarning,
  addBlanceWarning,
  billingForUser,
  deleteBlanceWarning,
  getBalanceDetail,
  getBillCategory,
  getBillList,
  getBillListByAPIKey,
  getBillListByMember,
  getBillListMonthly,
  getEnterpriseBillList,
  getMonthlyBill,
  getOrderStatus,
  queryBillingInfo,
  updateBlanceWarning,
} from "@/api/billing";

const mockRequest = request as jest.Mock;

describe("billing API wrappers", () => {
  const signal = new AbortController().signal;
  const billQuery = {
    cycleType: "Daily",
    productCategory: "gpu" as const,
    startTime: "2026-01-01",
    endTime: "2026-01-31",
    productName: "GPU",
    ownerId: "owner-1",
  };

  beforeEach(() => {
    mockRequest.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("builds balance warning CRUD requests", () => {
    GetBalanceWarning();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/warning",
      method: "GET",
    });

    const warning = {
      id: 1,
      threshold: 10,
      notification_methods: ["sms" as const],
      notificationMembers: ["member-1"],
      state: true,
    };
    addBlanceWarning(warning);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/warning",
      method: "POST",
      data: warning,
    });

    updateBlanceWarning(warning);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/warning",
      method: "PUT",
      data: warning,
    });

    deleteBlanceWarning(1);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/warning",
      method: "DELETE",
      data: { id: 1 },
    });
  });

  it("builds recharge and order status requests", () => {
    billingForUser({ paymentMethod: "Stripe", rechargeAmount: 100 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/recharge",
      method: "POST",
      data: { paymentMethod: "Stripe", rechargeAmount: 100 },
    });

    getOrderStatus({ orderNo: "order-1", isPay: true });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/order-status",
      method: "GET",
      query: { orderNo: "order-1", isPay: true },
    });
  });

  it("passes bill list query and abort signal through", () => {
    getBillList(billQuery, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/bill/list",
      method: "GET",
      query: billQuery,
      signal,
    });

    getBillListMonthly(billQuery, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/bill/monthly/list",
      method: "GET",
      query: billQuery,
      signal,
    });

    getEnterpriseBillList(billQuery, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/enterprise/bill/list",
      method: "GET",
      query: billQuery,
      signal,
    });
  });

  it("removes productCategory from API key bill list queries", () => {
    getBillListByAPIKey(
      {
        ...billQuery,
        apiKey: "key-1",
      },
      signal,
    );

    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/apikey/bill/list",
      method: "GET",
      query: {
        cycleType: "Daily",
        startTime: "2026-01-01",
        endTime: "2026-01-31",
        productName: "GPU",
        ownerId: "owner-1",
        apiKey: "key-1",
      },
      signal,
    });
  });

  it("builds member, category and overview requests", () => {
    getBillListByMember(
      { cycleType: "Daily", startTime: "2026-01-01", endTime: "2026-01-31" },
      signal,
    );
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/member/bill/list",
      method: "GET",
      query: {
        cycleType: "Daily",
        startTime: "2026-01-01",
        endTime: "2026-01-31",
      },
      signal,
    });

    getBillCategory({ productCategory: "gpu" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/bill/category",
      method: "GET",
      query: { productCategory: "gpu" },
    });

    queryBillingInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/info",
      method: "GET",
    });

    getBalanceDetail();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/balance/detail",
      method: "GET",
    });

    getMonthlyBill();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/billing/monthly/bill",
      method: "GET",
    });
  });
});
