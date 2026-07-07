import { act, renderHook, waitFor } from "@testing-library/react";
import { useTopup } from "@/app/billing/lib/hooks/topup";
import { createCheckoutSessionV3, getTopUpStatus, topUp } from "@/api/buy";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/buy", () => ({
  createCheckoutSessionV3: jest.fn(),
  getTopUpStatus: jest.fn(),
  topUp: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: jest.fn(() => "camp-1") },
}));

const mockSession = createCheckoutSessionV3 as jest.Mock;
const mockTopUp = topUp as jest.Mock;
const mockStatus = getTopUpStatus as jest.Mock;

describe("useTopup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("topupByStripeLink returns the session url on success", async () => {
    mockSession.mockResolvedValue({ sessionUrl: "https://session" });
    const { result } = renderHook(() => useTopup());

    let url: string | undefined;
    await act(async () => {
      url = await result.current.topupByStripeLink(50, "/billing");
    });
    expect(mockSession).toHaveBeenCalledWith({
      price: 50,
      redirect_url: "/billing",
    });
    expect(url).toBe("https://session");
    expect(result.current.isLoading).toBe(false);
  });

  it("topupByStripeLink shows a message and returns null on string errors", async () => {
    mockSession.mockRejectedValue("boom");
    const { result } = renderHook(() => useTopup());

    let url: string | undefined | null;
    await act(async () => {
      url = await result.current.topupByStripeLink(50, "/billing");
    });
    expect(message.error).toHaveBeenCalledWith("boom");
    expect(url).toBeNull();
  });

  it("topupWidthCard polls status and fires success callbacks when status is 0", async () => {
    mockTopUp.mockResolvedValue({ topUpId: "tu-1" });
    mockStatus.mockResolvedValue({ status: 0 });
    const succ = jest.fn();
    const { result } = renderHook(() => useTopup());

    await act(async () => {
      await result.current.topupWidthCard({
        amount: 50,
        paymentMethodId: "card-1",
        succCb: [succ],
      });
    });

    expect(mockTopUp).toHaveBeenCalledWith({
      amount: 50,
      paymentMethodId: "card-1",
      campaign: "camp-1",
    });

    // advance the polling interval
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(succ).toHaveBeenCalled();
    });
  });

  it("topupWidthCard reports a string error and fires errCb", async () => {
    mockTopUp.mockRejectedValue("topup failed");
    const err = jest.fn();
    const { result } = renderHook(() => useTopup());

    await act(async () => {
      await result.current.topupWidthCard({
        amount: 50,
        paymentMethodId: "card-1",
        errCb: [err],
      });
    });

    expect(message.error).toHaveBeenCalledWith("topup failed");
    expect(err).toHaveBeenCalled();
  });
});
