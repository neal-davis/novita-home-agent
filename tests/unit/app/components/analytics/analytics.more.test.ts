import analyticsInstance from "@/app/components/analytics/analytics";
import { isCookieConsentGranted } from "@/lib/consent/cookiebot";

jest.mock("@/app/components/analytics/amplitude", () => ({
  trackPV: jest.fn(),
  trackBlockExposure: jest.fn(),
  trackBtnClick: jest.fn(),
  initAmplitude: jest.fn(),
  logEvent: jest.fn(),
  setAmplitudeOptOut: jest.fn(),
}));
jest.mock("@/app/components/analytics/baidu", () => ({
  trackBtnClick: jest.fn(),
  trackEvent: jest.fn(),
}));
jest.mock("@/app/components/analytics/google", () => ({
  trackBtnClick: jest.fn(),
  trackEvent: jest.fn(),
}));
jest.mock("@/app/components/analytics/brevo", () => ({ initBrevo: jest.fn() }));
jest.mock("@/app/components/analytics/posthog", () => ({
  identifyPostHog: jest.fn(),
}));
jest.mock("@/lib/consent/cookiebot", () => ({
  isCookieConsentGranted: jest.fn(),
}));

const consent = isCookieConsentGranted as jest.Mock;

describe("analytics initBtnClickTrackers more branches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("tracks when clicking a child element inside a registered button", () => {
    consent.mockReturnValue(true);
    const spy = jest.spyOn(analyticsInstance, "trackClick");
    const cleanup = analyticsInstance.initBtnClickTrackers();

    const btn = document.createElement("button");
    btn.id = "top-up-btn";
    const child = document.createElement("span");
    btn.appendChild(child);
    document.body.appendChild(btn);

    child.click();
    expect(spy).toHaveBeenCalledWith("top-up-btn");

    cleanup();
    document.body.removeChild(btn);
    spy.mockRestore();
  });

  it("ignores clicks on elements that do not match any registered id", () => {
    consent.mockReturnValue(true);
    const spy = jest.spyOn(analyticsInstance, "trackClick");
    const cleanup = analyticsInstance.initBtnClickTrackers();

    const div = document.createElement("div");
    div.id = "not-a-tracked-id-xyz";
    document.body.appendChild(div);
    div.click();

    expect(spy).not.toHaveBeenCalled();

    cleanup();
    document.body.removeChild(div);
    spy.mockRestore();
  });

  it("does not call PV when amplitude consent granted but statistics denied", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const amp = require("@/app/components/analytics/amplitude");
    consent.mockImplementation((k: string) => k !== "statistics");
    analyticsInstance.trackCustomPV();
    expect(amp.trackPV).not.toHaveBeenCalled();
  });
});
