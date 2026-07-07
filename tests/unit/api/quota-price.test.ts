jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import { getBatchPrice } from "@/api/price";
import { applyAdjustQuota, getQuotaList } from "@/api/quota";

const mockRequest = request as jest.Mock;

describe("quota and price API wrappers", () => {
  beforeEach(() => {
    mockRequest.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("returns an empty quota list without calling request when modal is empty", async () => {
    await expect(
      getQuotaList({ modal: "" as "llm", quotaObject: "tokens" }),
    ).resolves.toEqual([]);

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("builds quota list query with optional quota object and signal", () => {
    const signal = new AbortController().signal;

    getQuotaList({ modal: "llm", quotaObject: "tokens", signal });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/user/quota/list",
      query: {
        modal: "llm",
        quotaObject: "tokens",
      },
      signal,
    });
  });

  it("passes quota adjustment payload and signal through", () => {
    const signal = new AbortController().signal;
    const params = {
      uuid: "uuid-1",
      quotaObject: "tokens",
      quotaType: "monthly",
      currentLimit: 100,
      requestLimit: 200,
      contactEmail: "a@example.com",
      requestReason: "Need more capacity",
      signal,
    };

    applyAdjustQuota(params);

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/user/quota/adjust",
      method: "POST",
      data: params,
      signal,
    });
  });

  it("extracts products from batch price responses", async () => {
    mockRequest.mockResolvedValueOnce({
      products: [{ productId: "gpu-a10", basePrice0: 100 }],
    });

    await expect(
      getBatchPrice({
        businessType: "gpu",
        productIds: ["gpu-a10"],
      }),
    ).resolves.toEqual([{ productId: "gpu-a10", basePrice0: 100 }]);

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/product/batch-price",
      method: "POST",
      data: {
        businessType: "gpu",
        productIds: ["gpu-a10"],
      },
    });
  });
});
