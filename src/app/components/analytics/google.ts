import { EVENTS } from "./constants";
import { extractDomain } from "@/lib/utils/utils";
import { getUTMParams } from "./utils";

export const trackBtnClick = (id: string, params?: Record<string, any>) => {
  trackEvent(EVENTS.BUTTON_CLICK, {
    element_id: id,
    referrer: window.insiteReferrer,
    referring_domain: extractDomain(window.insiteReferrer),
    page_title: document.title,
    page_url: window.location.href,
    page_path: window.location.pathname,
    ...getUTMParams(),
    ...params,
  });
};

export function trackEvent(eventName: string, data?: Record<string, any>) {
  window?.gtag?.("event", eventName, data)
}