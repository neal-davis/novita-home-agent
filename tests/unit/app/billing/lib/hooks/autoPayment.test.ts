import { act, renderHook, waitFor } from "@testing-library/react";
import { useAutoPayment } from "@/app/billing/lib/hooks/autoPayment";
import { getAutoRecharge, setAutoRecharge } from "@/api/buy";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/buy", () => ({
  getAutoRecharge: jest.fn(),
  setAutoRecharge: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), config: jest.fn() },
}));

const mockGet = getAutoRecharge as jest.Mock;
const mockSet = setAutoRecharge as jest.Mock;

describe("useAutoPayment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({
      amount: 200,
      threshold: 20,
      isAutoRecharge: true,
    });
    mockSet.mockResolvedValue({});
  });

  it("starts with default recharge setting and no fetch", () => {
    const { result } = renderHook(() => useAutoPayment({}));
    expect(result.current.rechargeSetting).toEqual({
      amount: "0",
      threshold: "0",
      isAutoRecharge: false,
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches and stringifies numeric amount/threshold when initFetch", async () => {
    const { result } = renderHook(() => useAutoPayment({ initFetch: true }));
    await waitFor(() => {
      expect(result.current.rechargeSetting).toEqual({
        amount: "200",
        threshold: "20",
        isAutoRecharge: true,
      });
    });
    expect(mockGet).toHaveBeenCalled();
  });

  it("setAutoRechargeConfig posts numeric values and refetches", async () => {
    const { result } = renderHook(() => useAutoPayment({}));
    const cb = jest.fn();
    await act(async () => {
      await result.current.setAutoRechargeConfig(
        { amount: "100", threshold: "10", isAutoRecharge: true },
        [cb],
      );
    });
    expect(mockSet).toHaveBeenCalledWith({
      amount: 100,
      threshold: 10,
      isAutoRecharge: true,
    });
    expect(mockGet).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it("surfaces an error message and rethrows when set fails", async () => {
    mockSet.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useAutoPayment({}));
    let threw = false;
    await act(async () => {
      try {
        await result.current.setAutoRechargeConfig({
          amount: "100",
          threshold: "10",
          isAutoRecharge: true,
        });
      } catch {
        threw = true;
      }
    });
    expect(threw).toBe(true);
    expect(message.error).toHaveBeenCalledWith("Failed to set auto recharge");
  });
});
