jest.mock("@/api/api", () => ({
  BASE_API_URL: "https://api.example.test",
  request: jest.fn(),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import {
  reqGetApplicationDetail,
  reqGetApplicationTemplates,
} from "@/api/gpu-instance/application";
import {
  getBareMetalList,
  sendBareMetalRequest,
} from "@/api/gpu-instance/baremetal";
import {
  reqBalanceTotal,
  reqMyVoucherList,
  reqMyWallet,
  reqRecharge,
  reqSendReceipt,
  reqWalletBilling,
  reqWalletInnerBilling,
  reqWalletOrder,
  reqWalletTransaction,
} from "@/api/gpu-instance/billing";
import { reqNoticeRead, reqNotices } from "@/api/gpu-instance/console";
import {
  reqAddGpuImagePrewarm,
  reqDeleteGpuImagePrewarm,
  reqDeleteUserImage,
  reqEditGpuImagePrewarm,
  reqGpuImagePrewarm,
  reqGpuImagePrewarmQuota,
  reqGpuImages,
  reqUpdateUserImage,
} from "@/api/gpu-instance/images";
import {
  reqBreakJob,
  reqGetJobs,
  reqMyVoucherList as reqJobsVoucherList,
  reqMyWallet as reqJobsMyWallet,
  reqSendReceipt as reqJobsSendReceipt,
  reqWalletBilling as reqJobsWalletBilling,
  reqWalletInnerBilling as reqJobsWalletInnerBilling,
  reqWalletTransaction as reqJobsWalletTransaction,
} from "@/api/gpu-instance/jobs";
import { reqGetUserToken, reqRegistryUser } from "@/api/gpu-instance/login";
import { reqResetEmail, reqResetPwd } from "@/api/gpu-instance/password";
import {
  reqCreateSavingPlans,
  reqGetSavingPlans,
} from "@/api/gpu-instance/savingsPlans";

const mockRequest = request as jest.Mock;
const apiV1 = "https://service.example.test/api/v1";
const v1 = "https://service.example.test/v1";

describe("gpu instance API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ ok: true });
  });

  it("builds application template requests and strips signal from detail query", async () => {
    const signal = new AbortController().signal;

    await reqGetApplicationTemplates({ page: 1 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/applications",
      method: "GET",
      base_url: apiV1,
      query: { page: 1 },
    });

    await reqGetApplicationDetail({
      templateId: "tmpl-1",
      configType: "gpu",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/application/detail",
      method: "GET",
      base_url: apiV1,
      query: { templateId: "tmpl-1", configType: "gpu" },
      signal,
    });
  });

  it("builds bare metal list and callback requests", async () => {
    await getBareMetalList({
      pageIndex: "1",
      pageSize: "20",
      displayName: "  ",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/product/bare-metal/list",
      method: "GET",
      query: { pageIndex: "1", pageSize: "20" },
    });

    await getBareMetalList({
      pageIndex: "2",
      pageSize: "10",
      displayName: "A100",
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/product/bare-metal/list",
      method: "GET",
      query: { pageIndex: "2", pageSize: "10", displayName: "A100" },
    });

    await sendBareMetalRequest({ count: 2, note: null, sku: "h100" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/anycross/trigger/callback/MGM3YzNmMjYyZmMxZTRiM2ExMzliOWZhODAxODg4Njcx",
      method: "POST",
      data: { count: "2", note: "", sku: "h100" },
    });
  });

  it.each([
    [reqRecharge, "POST", "/wallet/recharge", "data", apiV1],
    [reqBalanceTotal, "GET", "/billing/balance/total", "query", v1],
    [reqWalletOrder, "GET", "/wallet/order", "query", apiV1],
    [reqWalletTransaction, "GET", "/wallet/transaction", "query", apiV1],
    [reqSendReceipt, "POST", "/wallet/send_invoice", "data", apiV1],
    [reqMyWallet, "GET", "/wallet", "query", apiV1],
    [reqMyVoucherList, "GET", "/voucher/list", "query", apiV1],
    [reqWalletBilling, "GET", "/wallet/statistic/billing", "query", apiV1],
    [reqWalletInnerBilling, "GET", "/wallet/billing", "query", apiV1],
  ])(
    "builds billing wrapper request for %s",
    async (fn, method, url, key, baseUrl) => {
      await fn({ id: "wallet-1" });

      expect(mockRequest).toHaveBeenLastCalledWith({
        url,
        method,
        base_url: baseUrl,
        [key]: { id: "wallet-1" },
      });
    },
  );

  it.each([
    [reqNotices, "GET", "/notices", "query"],
    [reqNoticeRead, "POST", "/notice/read", "data"],
    [reqGetUserToken, "GET", "/user/token", "query"],
    [reqRegistryUser, "POST", "/user/register", "data"],
    [reqResetEmail, "POST", "/user/reset_password_by_email", "query"],
    [reqResetPwd, "POST", "/user/reset_password_by_token", "query"],
    [reqGetSavingPlans, "GET", "/wallet/saving_plan", "query"],
    [reqCreateSavingPlans, "POST", "/wallet/saving_plan", "data"],
  ])(
    "builds simple user/console wrapper request for %s",
    async (fn, method, url, key) => {
      await fn({ id: "row-1" });

      expect(mockRequest).toHaveBeenLastCalledWith({
        url,
        method,
        base_url: apiV1,
        [key]: { id: "row-1" },
      });
    },
  );

  it("builds image management requests", async () => {
    await reqGpuImages({ page: 1 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/images",
      method: "GET",
      base_url: apiV1,
      query: { page: 1 },
    });

    await reqDeleteUserImage("img-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/image/img-1",
      method: "DELETE",
      base_url: apiV1,
    });

    await reqUpdateUserImage("img-2", { name: "ubuntu", ignored: true });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/image/img-2",
      method: "PUT",
      base_url: apiV1,
      data: { name: "ubuntu" },
    });
  });

  it.each([
    [reqGpuImagePrewarm, "GET", "/image/prewarm", "query"],
    [reqAddGpuImagePrewarm, "POST", "/image/prewarm", "data"],
    [reqDeleteGpuImagePrewarm, "POST", "/image/prewarm/delete", "data"],
    [reqEditGpuImagePrewarm, "POST", "/image/prewarm/edit", "data"],
    [reqGpuImagePrewarmQuota, "GET", "/image/prewarm/quota", "query"],
  ])(
    "builds image prewarm wrapper request for %s",
    async (fn, method, url, key) => {
      await fn({ imageId: "img-1" });

      expect(mockRequest).toHaveBeenLastCalledWith({
        url,
        method,
        base_url: apiV1,
        [key]: { imageId: "img-1" },
      });
    },
  );

  it.each([
    [reqGetJobs, "GET", "/jobs", "query"],
    [reqBreakJob, "POST", "/job/break", "data"],
    [reqJobsWalletTransaction, "GET", "/wallet/transaction", "query"],
    [reqJobsSendReceipt, "POST", "/wallet/send_invoice", "data"],
    [reqJobsMyWallet, "GET", "/wallet", "query"],
    [reqJobsVoucherList, "GET", "/voucher/list", "query"],
    [reqJobsWalletBilling, "GET", "/wallet/statistic/billing", "query"],
    [reqJobsWalletInnerBilling, "GET", "/wallet/billing", "query"],
  ])("builds jobs wrapper request for %s", async (fn, method, url, key) => {
    await fn({ jobId: "job-1" });

    expect(mockRequest).toHaveBeenLastCalledWith({
      url,
      method,
      base_url: apiV1,
      [key]: { jobId: "job-1" },
    });
  });
});
