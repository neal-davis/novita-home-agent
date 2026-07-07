const mockReadConsent = jest.fn();
const mockAddListener = jest.fn();
const mockUseCookiebotEnabled = jest.fn();

jest.mock("@/lib/consent/cookiebot", () => ({
  readCookiebotConsent: (...a: unknown[]) => mockReadConsent(...a),
  addCookiebotConsentListener: (...a: unknown[]) => mockAddListener(...a),
}));
jest.mock("@/app/components/consent/ConsentProvider", () => ({
  useCookiebotEnabled: () => mockUseCookiebotEnabled(),
}));

import {
  useCookieConsent,
  useCookiebotConsent,
} from "@/hooks/useCookiebotConsent";
import { renderHook } from "@testing-library/react";

describe("useCookiebotConsent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCookiebotEnabled.mockReturnValue(true);
    mockReadConsent.mockReturnValue({
      marketing: true,
      necessary: true,
      preferences: false,
      statistics: true,
    });
    mockAddListener.mockReturnValue(() => {});
  });

  it("seeds initial consent from readCookiebotConsent(enabled)", () => {
    const { result } = renderHook(() => useCookiebotConsent());
    expect(mockReadConsent).toHaveBeenCalledWith(true);
    expect(result.current.marketing).toBe(true);
  });

  it("subscribes to consent changes with the enabled flag", () => {
    renderHook(() => useCookiebotConsent());
    expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function), true);
  });

  it("unsubscribes on unmount", () => {
    const unsub = jest.fn();
    mockAddListener.mockReturnValue(unsub);
    const { unmount } = renderHook(() => useCookiebotConsent());
    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it("useCookieConsent returns a single category value", () => {
    const { result } = renderHook(() => useCookieConsent("preferences"));
    expect(result.current).toBe(false);
  });
});
