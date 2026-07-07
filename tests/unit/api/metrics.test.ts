jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import { getLLMMetrics, getLLMMetricsModels } from "@/api/metrics";

const mockRequest = request as jest.Mock;

describe("metrics API helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ data: [] });
  });

  it("skips LLM metric requests when no model is selected", async () => {
    await expect(
      getLLMMetrics({
        metricsType: "tokens",
        startTime: 100,
        endTime: 200,
      }),
    ).resolves.toEqual([]);

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("requests LLM metrics with the selected model and abort signal", async () => {
    const controller = new AbortController();

    await getLLMMetrics({
      metricsType: "requests",
      model: "deepseek-v3",
      startTime: 10,
      endTime: 20,
      signal: controller.signal,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/metrics/llm",
      query: {
        metricsType: "requests",
        model: "deepseek-v3",
        startTime: 10,
        endTime: 20,
      },
      signal: controller.signal,
    });
  });

  it("requests the metrics model list with the date range and signal", async () => {
    const controller = new AbortController();

    await getLLMMetricsModels({
      startTime: 1,
      endTime: 9,
      signal: controller.signal,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/v1/metrics/models",
      query: {
        startTime: 1,
        endTime: 9,
      },
      signal: controller.signal,
    });
  });
});
