import { isCookieConsentGranted } from "@/lib/consent/cookiebot";
import { capturePostHog } from "@/app/components/analytics/posthog";

export const traffic_type = process.env.NEXT_PUBLIC_ENV;

export const GA_ENVENT = {
  GITHUB_CLICK: "github_auth_btn_click",
  GOOGLE_CLICK: "google_auth_btn_click",
  HUGGINGFACE_CLICK: "huggingface_auth_btn_click",
  SIGN_IN_SUCCESS: "sign_in_success",
  SIGN_UP_SUCCESS: "sign_up_success",
};

const POSTHOG_AUTH_EVENT_MAP: Record<string, string> = {
  [GA_ENVENT.SIGN_IN_SUCCESS]: "UserLogin",
  [GA_ENVENT.SIGN_UP_SUCCESS]: "UserRegister",
};

const POSTHOG_AUTH_EVENT_DEDUPE_WINDOW_MS = 5000;
const posthogAuthEventLastCapturedAt = new Map<string, number>();

function shouldCapturePostHogAuthEvent(eventName: string) {
  const now = Date.now();
  const lastCapturedAt = posthogAuthEventLastCapturedAt.get(eventName) || 0;

  if (now - lastCapturedAt < POSTHOG_AUTH_EVENT_DEDUPE_WINDOW_MS) {
    return false;
  }

  posthogAuthEventLastCapturedAt.set(eventName, now);
  return true;
}

export function dataLayerPushEvent(
  params: Record<string, any>,
  purchaseFlag?: boolean,
  options?: {
    posthog?: boolean;
  },
) {
  if (
    !isCookieConsentGranted("statistics") &&
    !isCookieConsentGranted("marketing")
  ) {
    return;
  }

  const posthogEventName =
    typeof params.event === "string"
      ? POSTHOG_AUTH_EVENT_MAP[params.event]
      : "";

  if (
    options?.posthog !== false &&
    posthogEventName &&
    shouldCapturePostHogAuthEvent(posthogEventName)
  ) {
    capturePostHog(posthogEventName, {
      source_event: params.event,
      traffic_type,
    });
  }

  if (window.dataLayer) {
    console.log("push event traffic_type", traffic_type, params);
    if (purchaseFlag) {
      window.dataLayer.push({ ecommerce: null });
    }
    window.dataLayer.push({
      ...params,
      environment: {
        traffic_type,
      },
    });
  }
}
