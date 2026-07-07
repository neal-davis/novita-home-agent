const mockIsCookieConsentGranted = jest.fn();
const mockCapturePostHog = jest.fn();

jest.mock("@/lib/consent/cookiebot", () => ({
  isCookieConsentGranted: (...a: unknown[]) => mockIsCookieConsentGranted(...a),
}));
jest.mock("@/app/components/analytics/posthog", () => ({
  capturePostHog: (...a: unknown[]) => mockCapturePostHog(...a),
}));

import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";

describe("dataLayerPushEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer = [];
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("does nothing when neither statistics nor marketing consent is granted", () => {
    mockIsCookieConsentGranted.mockReturnValue(false);
    dataLayerPushEvent({ event: "x" });
    expect(
      (window as unknown as { dataLayer: unknown[] }).dataLayer.length,
    ).toBe(0);
    expect(mockCapturePostHog).not.toHaveBeenCalled();
  });

  it("pushes to dataLayer with environment when consent granted", () => {
    mockIsCookieConsentGranted.mockReturnValue(true);
    dataLayerPushEvent({ event: "custom_event", foo: "bar" });
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] })
      .dataLayer;
    expect(dl[dl.length - 1]).toMatchObject({
      event: "custom_event",
      foo: "bar",
      environment: expect.any(Object),
    });
  });

  it("captures a PostHog auth event for known events", () => {
    mockIsCookieConsentGranted.mockReturnValue(true);
    dataLayerPushEvent({ event: GA_ENVENT.SIGN_IN_SUCCESS });
    expect(mockCapturePostHog).toHaveBeenCalledWith(
      "UserLogin",
      expect.objectContaining({ source_event: GA_ENVENT.SIGN_IN_SUCCESS }),
    );
  });

  it("dedupes repeated PostHog auth events within the window", () => {
    mockIsCookieConsentGranted.mockReturnValue(true);
    dataLayerPushEvent({ event: GA_ENVENT.SIGN_UP_SUCCESS });
    dataLayerPushEvent({ event: GA_ENVENT.SIGN_UP_SUCCESS });
    expect(mockCapturePostHog).toHaveBeenCalledTimes(1);
  });

  it("skips PostHog when options.posthog is false", () => {
    mockIsCookieConsentGranted.mockReturnValue(true);
    dataLayerPushEvent({ event: GA_ENVENT.SIGN_IN_SUCCESS }, false, {
      posthog: false,
    });
    expect(mockCapturePostHog).not.toHaveBeenCalled();
  });

  it("clears ecommerce first when purchaseFlag is set", () => {
    mockIsCookieConsentGranted.mockReturnValue(true);
    dataLayerPushEvent({ event: "purchase" }, true);
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] })
      .dataLayer;
    expect(dl.some((e) => e.ecommerce === null)).toBe(true);
  });
});
