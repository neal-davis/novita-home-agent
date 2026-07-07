import { act, renderHook, waitFor } from "@testing-library/react";
import { usePaymentMethod } from "@/app/billing/lib/hooks/paymentMethods";
import {
  bindPaymentMethod,
  getPaymentMethod,
  unbindPaymentMethod,
} from "@/api/buy";

jest.mock("@/api/buy", () => ({
  getPaymentMethod: jest.fn(),
  unbindPaymentMethod: jest.fn(),
  bindPaymentMethod: jest.fn(),
}));

const mockGet = getPaymentMethod as jest.Mock;
const mockUnbind = unbindPaymentMethod as jest.Mock;
const mockBind = bindPaymentMethod as jest.Mock;

const cards = [
  {
    brand: "visa",
    country: "US",
    expMonth: "12",
    expYear: "2030",
    funding: "credit",
    id: "card-1",
    last4: "4242",
  },
];

describe("usePaymentMethod", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockGet.mockResolvedValue({ paymentMethods: cards });
    mockUnbind.mockResolvedValue({});
    mockBind.mockResolvedValue({ url: "https://bind" });
  });

  it("does not fetch by default and starts with empty cards", () => {
    const { result } = renderHook(() => usePaymentMethod({}));
    expect(result.current.cardsInfo).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("initLoading sets isLoading true initially", () => {
    const { result } = renderHook(() =>
      usePaymentMethod({ initLoading: true }),
    );
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches cards when initFetch is true and caches to localStorage", async () => {
    const { result } = renderHook(() => usePaymentMethod({ initFetch: true }));
    await waitFor(() => {
      expect(result.current.cardsInfo).toEqual(cards);
    });
    expect(mockGet).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("cardsInfo") || "[]")).toEqual(
      cards,
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("reads from cache when useCache is true without calling the API", async () => {
    localStorage.setItem("cardsInfo", JSON.stringify(cards));
    const { result } = renderHook(() => usePaymentMethod({ useCache: true }));
    await waitFor(() => {
      expect(result.current.cardsInfo).toEqual(cards);
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("deletes a payment method then refetches", async () => {
    const { result } = renderHook(() => usePaymentMethod({}));
    await act(async () => {
      result.current.delPaymentMethod("card-1");
    });
    await waitFor(() => {
      expect(mockUnbind).toHaveBeenCalledWith({ paymentMethodId: "card-1" });
      expect(mockGet).toHaveBeenCalled();
    });
  });

  it("addPaymentMethod calls bind with the redirect url", async () => {
    const { result } = renderHook(() => usePaymentMethod({}));
    await act(async () => {
      await result.current.addPaymentMethod("/back");
    });
    expect(mockBind).toHaveBeenCalledWith({ redirect_url: "/back" });
  });

  it("defaults welcomeVoucherEligible to false", () => {
    const { result } = renderHook(() => usePaymentMethod({}));
    expect(result.current.welcomeVoucherEligible).toBe(false);
  });

  it("exposes welcomeVoucherEligible from the API response", async () => {
    mockGet.mockResolvedValue({
      paymentMethods: cards,
      welcomeVoucherEligible: true,
    });
    const { result } = renderHook(() => usePaymentMethod({ initFetch: true }));
    await waitFor(() => {
      expect(result.current.welcomeVoucherEligible).toBe(true);
    });
  });

  it("treats a missing welcomeVoucherEligible field as not eligible", async () => {
    mockGet.mockResolvedValue({ paymentMethods: cards });
    const { result } = renderHook(() => usePaymentMethod({ initFetch: true }));
    await waitFor(() => {
      expect(result.current.cardsInfo).toEqual(cards);
    });
    expect(result.current.welcomeVoucherEligible).toBe(false);
  });
});
