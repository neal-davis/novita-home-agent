import analyticsInstance from "@/app/components/analytics/analytics";
import * as amp from "@/app/components/analytics/amplitude";
import * as baidu from "@/app/components/analytics/baidu";
import * as google from "@/app/components/analytics/google";
import { initBrevo } from "@/app/components/analytics/brevo";
import { identifyPostHog } from "@/app/components/analytics/posthog";
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

const user = { email: "a@b.com", uid: 1, role: 2, uuid: "u-1" };

describe("analytics class", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("init", () => {
    it("identifies posthog, inits brevo and amplitude when consent granted", () => {
      consent.mockReturnValue(true);
      analyticsInstance.init(user);
      expect(identifyPostHog).toHaveBeenCalledWith(user);
      expect(initBrevo).toHaveBeenCalledWith(user);
      expect(amp.initAmplitude).toHaveBeenCalledWith(user);
    });

    it("skips brevo and amplitude when consent denied", () => {
      consent.mockReturnValue(false);
      analyticsInstance.init(user);
      expect(identifyPostHog).toHaveBeenCalledWith(user);
      expect(initBrevo).not.toHaveBeenCalled();
      expect(amp.initAmplitude).not.toHaveBeenCalled();
    });
  });

  describe("setAmplitudeOptOut", () => {
    it("forwards to amplitude.setAmplitudeOptOut", () => {
      analyticsInstance.setAmplitudeOptOut(true);
      expect(amp.setAmplitudeOptOut).toHaveBeenCalledWith(true);
    });
  });

  describe("trackCustomPV", () => {
    it("tracks PV when statistics consent granted", () => {
      consent.mockReturnValue(true);
      analyticsInstance.trackCustomPV();
      expect(amp.trackPV).toHaveBeenCalled();
    });

    it("does not track PV when statistics consent denied", () => {
      consent.mockReturnValue(false);
      analyticsInstance.trackCustomPV();
      expect(amp.trackPV).not.toHaveBeenCalled();
    });
  });

  describe("trackExposure", () => {
    it("calls amplitude block exposure when consent granted", () => {
      consent.mockReturnValue(true);
      analyticsInstance.trackExposure("blk", { a: 1 });
      expect(amp.trackBlockExposure).toHaveBeenCalledWith("blk", { a: 1 });
    });
  });

  describe("trackClick", () => {
    it("fans out to amplitude and google when consent granted (baidu not registered)", () => {
      consent.mockReturnValue(true);
      analyticsInstance.trackClick("btn", { x: 1 });
      expect(amp.trackBtnClick).toHaveBeenCalledWith("btn", { x: 1 });
      expect(google.trackBtnClick).toHaveBeenCalledWith("btn", { x: 1 });
      expect(baidu.trackBtnClick).not.toHaveBeenCalled();
    });

    it("does not fan out when consent denied", () => {
      consent.mockReturnValue(false);
      analyticsInstance.trackClick("btn");
      expect(amp.trackBtnClick).not.toHaveBeenCalled();
      expect(google.trackBtnClick).not.toHaveBeenCalled();
    });
  });

  describe("trackEvent", () => {
    it("fans out to amplitude and google when consent granted", () => {
      consent.mockReturnValue(true);
      analyticsInstance.trackEvent("evt", { y: 2 });
      expect(amp.logEvent).toHaveBeenCalledWith("evt", { y: 2 });
      expect(google.trackEvent).toHaveBeenCalledWith("evt", { y: 2 });
    });
  });

  describe("initBtnClickTrackers", () => {
    it("tracks a click on a registered button id and returns a cleanup fn", () => {
      consent.mockReturnValue(true);
      const spy = jest.spyOn(analyticsInstance, "trackClick");
      const cleanup = analyticsInstance.initBtnClickTrackers();

      const btn = document.createElement("button");
      // Use a real id from the flattened CLICK_BTN_IDs set.
      btn.id = "top-up-btn";
      document.body.appendChild(btn);
      btn.click();

      expect(spy).toHaveBeenCalledWith("top-up-btn");

      cleanup();
      spy.mockClear();
      btn.click();
      expect(spy).not.toHaveBeenCalled();

      document.body.removeChild(btn);
      spy.mockRestore();
    });

    it("ignores clicks on disabled buttons", () => {
      consent.mockReturnValue(true);
      const spy = jest.spyOn(analyticsInstance, "trackClick");
      const cleanup = analyticsInstance.initBtnClickTrackers();

      const btn = document.createElement("button");
      btn.id = "top-up-btn";
      btn.setAttribute("disabled", "true");
      document.body.appendChild(btn);
      btn.click();

      expect(spy).not.toHaveBeenCalled();
      cleanup();
      document.body.removeChild(btn);
      spy.mockRestore();
    });
  });
});
