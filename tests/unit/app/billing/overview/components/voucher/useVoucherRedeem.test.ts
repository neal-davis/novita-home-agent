import { act, renderHook, waitFor } from "@testing-library/react";
import { useVoucherRedeem } from "@/app/billing/overview/components/voucher/useVoucherRedeem";
import { redeemVoucherCode } from "@/api/user";

jest.mock("@/api/user", () => ({
  redeemVoucherCode: jest.fn(),
}));

const mockRedeem = redeemVoucherCode as jest.Mock;

const redeemResult = {
  templateId: "t-1",
  amount: "100000",
  endTime: "1700000000",
  businessTypes: ["all"],
};

describe("useVoucherRedeem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedeem.mockResolvedValue(redeemResult);
  });

  it("starts empty and not redeemed", () => {
    const { result } = renderHook(() => useVoucherRedeem());
    expect(result.current.code).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.redeemed).toBe(false);
    expect(result.current.redeemResult).toBeNull();
  });

  it("updates code and clears existing error on change", () => {
    const { result } = renderHook(() => useVoucherRedeem());
    // trigger an error first
    act(() => {
      result.current.handleRedeem();
    });
    expect(result.current.error).toBe("Please enter a voucher code");

    act(() => {
      result.current.handleCodeChange("ABC");
    });
    expect(result.current.code).toBe("ABC");
    expect(result.current.error).toBe("");
  });

  it("errors when redeeming an empty code", async () => {
    const { result } = renderHook(() => useVoucherRedeem());
    await act(async () => {
      await result.current.handleRedeem();
    });
    expect(result.current.error).toBe("Please enter a voucher code");
    expect(mockRedeem).not.toHaveBeenCalled();
  });

  it("redeems a valid code and stores the result", async () => {
    const { result } = renderHook(() => useVoucherRedeem());
    act(() => {
      result.current.handleCodeChange("VOUCHER1");
    });
    await act(async () => {
      await result.current.handleRedeem();
    });
    await waitFor(() => {
      expect(result.current.redeemResult).toEqual(redeemResult);
    });
    expect(mockRedeem).toHaveBeenCalledWith("VOUCHER1");
    expect(result.current.redeemed).toBe(true);
    // code is cleared after success
    expect(result.current.code).toBe("");
  });

  it("captures errInfo message on failure", async () => {
    mockRedeem.mockRejectedValue({ errInfo: "Invalid code" });
    const { result } = renderHook(() => useVoucherRedeem());
    act(() => {
      result.current.handleCodeChange("BAD");
    });
    await act(async () => {
      await result.current.handleRedeem();
    });
    expect(result.current.error).toBe("Invalid code");
    expect(result.current.redeemed).toBe(false);
  });

  it("falls back to a default message on unknown errors", async () => {
    mockRedeem.mockRejectedValue({});
    const { result } = renderHook(() => useVoucherRedeem());
    act(() => {
      result.current.handleCodeChange("BAD");
    });
    await act(async () => {
      await result.current.handleRedeem();
    });
    expect(result.current.error).toBe("Failed to redeem voucher code");
  });

  it("resets state", async () => {
    const { result } = renderHook(() => useVoucherRedeem());
    act(() => {
      result.current.handleCodeChange("VOUCHER1");
    });
    await act(async () => {
      await result.current.handleRedeem();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.redeemResult).toBeNull();
    expect(result.current.code).toBe("");
    expect(result.current.error).toBe("");
  });
});
