type PostHogClient = {
  capture?: (eventName: string, properties?: Record<string, unknown>) => void;
  get_distinct_id?: () => string;
  identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
};

const IDENTIFY_RETRY_DELAY_MS = 500;
const IDENTIFY_MAX_RETRIES = 30;

let pendingIdentifyTimeout: number | undefined;
let pendingIdentifyUuid = "";

function getPostHog() {
  return window.posthog as PostHogClient | undefined;
}

function clearPendingIdentify() {
  if (pendingIdentifyTimeout !== undefined) {
    window.clearTimeout(pendingIdentifyTimeout);
    pendingIdentifyTimeout = undefined;
  }
  pendingIdentifyUuid = "";
}

function identifyPostHogNow(uuid: string) {
  const posthog = getPostHog();
  if (!posthog?.identify) {
    return false;
  }

  if (posthog.get_distinct_id?.() === uuid) {
    return true;
  }

  posthog.identify(uuid, {
    name: uuid,
  });
  return true;
}

function retryIdentifyPostHog(uuid: string, retryCount = 0) {
  if (retryCount >= IDENTIFY_MAX_RETRIES) {
    clearPendingIdentify();
    return;
  }

  pendingIdentifyTimeout = window.setTimeout(() => {
    pendingIdentifyTimeout = undefined;

    if (identifyPostHogNow(uuid)) {
      clearPendingIdentify();
      return;
    }

    retryIdentifyPostHog(uuid, retryCount + 1);
  }, IDENTIFY_RETRY_DELAY_MS);
}

function capturePostHogNow(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  const posthog = getPostHog();
  if (!posthog?.capture) {
    return false;
  }

  posthog.capture(eventName, properties);
  return true;
}

function retryCapturePostHog(
  eventName: string,
  properties?: Record<string, unknown>,
  retryCount = 0,
) {
  if (retryCount >= IDENTIFY_MAX_RETRIES) {
    return;
  }

  window.setTimeout(() => {
    if (capturePostHogNow(eventName, properties)) {
      return;
    }

    retryCapturePostHog(eventName, properties, retryCount + 1);
  }, IDENTIFY_RETRY_DELAY_MS);
}

export function identifyPostHog(user: { uuid: string }) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user.uuid) {
    clearPendingIdentify();
    return;
  }

  if (identifyPostHogNow(user.uuid)) {
    clearPendingIdentify();
    return;
  }

  if (
    pendingIdentifyUuid === user.uuid &&
    pendingIdentifyTimeout !== undefined
  ) {
    return;
  }

  clearPendingIdentify();
  pendingIdentifyUuid = user.uuid;
  retryIdentifyPostHog(user.uuid);
}

export function capturePostHog(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !eventName) {
    return;
  }

  if (capturePostHogNow(eventName, properties)) {
    return;
  }

  retryCapturePostHog(eventName, properties);
}
