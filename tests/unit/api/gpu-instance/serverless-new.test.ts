jest.mock("@/api/api", () => ({
  request: jest.fn(),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import { reqGetApplicationTemplates } from "@/api/gpu-instance/serverless-new";

const mockRequest = request as jest.Mock;

describe("gpu instance serverless-new API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ applications: [] });
  });

  it("builds application GPU template list requests", async () => {
    await expect(
      reqGetApplicationTemplates({
        gpuType: "H100",
        pageIndex: 1,
        pageSize: 20,
      }),
    ).resolves.toEqual({ applications: [] });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/application/gpu",
      method: "GET",
      base_url: "https://service.example.test/api/v1",
      query: {
        gpuType: "H100",
        pageIndex: 1,
        pageSize: 20,
      },
    });
  });
});
