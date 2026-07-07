const mockGetLLMDedicatedSpec = jest.fn();
jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedSpec: (...a: unknown[]) => mockGetLLMDedicatedSpec(...a),
}));

import { useDedicatedGpuPricing } from "@/hooks/useDedicatedGpuPricing";
import { renderHook, waitFor } from "@testing-library/react";

describe("useDedicatedGpuPricing hook", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts loading then populates rows from the API specs", async () => {
    mockGetLLMDedicatedSpec.mockResolvedValue({
      specs: [
        {
          displayName: "NVIDIA H200",
          gpuName: "h200",
          price: 10000,
          discount: 0,
          pricePrecision: 1,
        },
      ],
    });
    const { result } = renderHook(() => useDedicatedGpuPricing());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows.length).toBe(1);
    expect(result.current.rows[0].key).toBe("H200");
  });

  it("returns an empty rows array when specs is not an array", async () => {
    mockGetLLMDedicatedSpec.mockResolvedValue({ specs: null });
    const { result } = renderHook(() => useDedicatedGpuPricing());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([]);
  });

  it("clears rows and stops loading on API error", async () => {
    mockGetLLMDedicatedSpec.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useDedicatedGpuPricing());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([]);
    expect(result.current.loadingKeys.length).toBeGreaterThan(0);
  });
});
