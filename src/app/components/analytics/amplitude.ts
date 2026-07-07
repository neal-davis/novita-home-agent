import { extractDomain } from "@/lib/utils/utils";
import { getSearchParam } from "@/lib/utils/url";
import { getDateString } from "@/lib/utils/date";
import * as amplitude from "@amplitude/analytics-browser";
import type { BaseEvent, EventOptions } from "@amplitude/analytics-types";
import { getUTMParams } from "./utils";
import { EVENTS } from "./constants";
import Cookies from "js-cookie";

const AMPLITUDE_API_KEY =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
    : process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY_DEV;

export function trackBlockExposure(
  blockId: string,
  params?: Record<string, any>,
) {
  logEvent(EVENTS.BLOCK_EXPOSURE, {
    element_id: blockId,
    referrer: window.insiteReferrer,
    referring_domain: extractDomain(window.insiteReferrer),
    page_title: document.title,
    page_url: window.location.href,
    page_path: window.location.pathname,
    ...getUTMParams(),
    ...params,
  });
}

export function trackBtnClick(id: string, params?: Record<string, any>) {
  logEvent(EVENTS.BUTTON_CLICK, {
    element_id: id,
    referrer: window.insiteReferrer,
    referring_domain: extractDomain(window.insiteReferrer),
    page_title: document.title,
    page_url: window.location.href,
    page_path: window.location.pathname,
    ...getUTMParams(),
    ...params,
  });
}

export function trackPV() {
  const eventProperties = {
    page_domain: window.location.hostname,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_url: window.location.href.split("?")[0],
    page_ref: getSearchParam("ref"),
    referrer: window.insiteReferrer,
    referring_domain: extractDomain(window.insiteReferrer),
    ...getUTMParams(),
  };

  logEvent(EVENTS.PAGE_VIEW, eventProperties);
}

export const initAmplitude = (user: { uid: number }) => {
  if (!AMPLITUDE_API_KEY) {
    console.error("Amplitude API key is missing");
    return;
  }
  if (user.uid) {
    amplitude.setUserId(user.uid.toString());
  }
  amplitude.init(AMPLITUDE_API_KEY, {
    defaultTracking: {
      attribution: true,
      fileDownloads: true,
      formInteractions: false,
      pageViews: false,
      sessions: true,
    },
    minIdLength: 1,
  });
  amplitude.setOptOut(false);

  const i = new amplitude.Identify();

  const dateStr = getDateString(8);
  i.setOnce("initial_page_url", window.location.href);
  i.setOnce("first_visit_time", dateStr);
  i.setOnce("initial_referrer", document.referrer);
  i.set("last_seen", dateStr);

  amplitude.identify(i);

  // read cookies device id
  const deviceId = Cookies.get("amplitude_deviceId");
  if (deviceId) {
    amplitude.setDeviceId(deviceId);
  }
};

export const setAmplitudeOptOut = (optOut: boolean) => {
  amplitude.setOptOut(optOut);
};

export const logEvent = (
  eventName: string | BaseEvent,
  eventProperties?: Record<string, any>,
  eventOptions?: EventOptions,
) => {
  amplitude.track(eventName, eventProperties, eventOptions);
};
