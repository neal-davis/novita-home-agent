import { flattenBtnIds } from "./constants";
import {
  trackPV as amplitudeTrackPV,
  trackBlockExposure as amplitudeTrackBlockExposure,
  trackBtnClick as amplitudeTrackBtnClick,
  initAmplitude,
  logEvent as amplitudeTrackEvent,
  setAmplitudeOptOut,
} from "./amplitude";
import {
  trackBtnClick as baiduTrackBtnClick,
  trackEvent as baiduTrackEvent,
} from "./baidu";
import {
  trackBtnClick as googleTrackBtnClick,
  trackEvent as googleTrackEvent,
} from "./google";
import { initBrevo } from "./brevo";
import { isCookieConsentGranted } from "@/lib/consent/cookiebot";
import { identifyPostHog } from "./posthog";

type AnalyticPlatform = "baidu" | "amplitude" | "google" | "brevo" | "posthog";

class Analytics {
  private platforms: AnalyticPlatform[] = [];

  constructor() {
    this.platforms.push("amplitude");
    this.platforms.push("brevo");
    this.platforms.push("google");
    this.platforms.push("posthog");
  }

  init(user: { email: string; uid: number; role: number; uuid: string }) {
    if (this.platforms.includes("posthog")) {
      identifyPostHog(user);
    }
    if (
      this.platforms.includes("brevo") &&
      isCookieConsentGranted("marketing")
    ) {
      initBrevo(user);
    }
    if (
      this.platforms.includes("amplitude") &&
      isCookieConsentGranted("statistics")
    ) {
      initAmplitude(user);
    }
  }

  setAmplitudeOptOut(optOut: boolean) {
    if (this.platforms.includes("amplitude")) {
      setAmplitudeOptOut(optOut);
    }
  }

  initBtnClickTrackers = () => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      for (const id of flattenBtnIds) {
        if (target.matches(`#${id}, #${id} *`)) {
          const btnEl = target.closest(`#${id}`);
          if (btnEl && !btnEl.getAttribute("disabled") && btnEl.id) {
            this.trackClick(btnEl.id);
          }
          return;
        }
      }
    };
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  };

  trackCustomPV() {
    // if (this.platforms.includes('baidu')) {
    //   window?._hmt?.push(['_trackPageview']);
    // }
    if (this.platforms.includes("amplitude")) {
      if (!isCookieConsentGranted("statistics")) {
        return;
      }
      amplitudeTrackPV();
    }
    // if (this.platforms.includes('google')) {
    //   window?.gtag?.('event', 'page_view', {
    //     page_path: window.location.pathname,
    //   });
    // }
  }

  trackExposure(blockId: string, data?: Record<string, any>) {
    if (
      this.platforms.includes("amplitude") &&
      isCookieConsentGranted("statistics")
    ) {
      amplitudeTrackBlockExposure(blockId, data);
    }
  }

  trackClick(btnID: string, data?: Record<string, any>) {
    if (
      this.platforms.includes("amplitude") &&
      isCookieConsentGranted("statistics")
    ) {
      amplitudeTrackBtnClick(btnID, data);
    }
    if (
      this.platforms.includes("baidu") &&
      isCookieConsentGranted("statistics")
    ) {
      baiduTrackBtnClick(btnID, data);
    }
    if (
      this.platforms.includes("google") &&
      isCookieConsentGranted("statistics")
    ) {
      googleTrackBtnClick(btnID, data);
    }
  }

  trackEvent(eventName: string, data?: Record<string, any>) {
    if (
      this.platforms.includes("amplitude") &&
      isCookieConsentGranted("statistics")
    ) {
      amplitudeTrackEvent(eventName, data);
    }
    if (
      this.platforms.includes("baidu") &&
      isCookieConsentGranted("statistics")
    ) {
      baiduTrackEvent(eventName, data);
    }
    if (
      this.platforms.includes("google") &&
      isCookieConsentGranted("statistics")
    ) {
      googleTrackEvent(eventName, data);
    }
  }
}

const analyticsInstance = new Analytics();
export default analyticsInstance;
