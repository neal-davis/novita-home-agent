"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const LOCATION_CHANGE_EVT = "locationchange";

const useNavHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [referrer, setReferrer] = useState<string | null>(null);
  const historyRef = useRef<string[]>([]);

  const handleRouteChange = useCallback(() => {
    const href = window.location.href;
    const previousHistory = historyRef.current;
    const previousHref = previousHistory.slice(-1)[0];
    if (previousHref === href) return;

    const nextReferrer = previousHref || document.referrer;
    const nextHistory = [...previousHistory, href];

    historyRef.current = nextHistory;
    window.insiteReferrer = nextReferrer;
    setReferrer(nextReferrer);
    setHistory(nextHistory);
  }, []);

  useEffect(() => {
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;
    const timeoutHandles = new Set<number>();

    const scheduleHistoryEvents = (eventName?: string) => {
      const timeoutHandle = window.setTimeout(() => {
        timeoutHandles.delete(timeoutHandle);
        if (eventName) {
          window.dispatchEvent(new Event(eventName));
        }
        window.dispatchEvent(new Event(LOCATION_CHANGE_EVT));
      }, 0);
      timeoutHandles.add(timeoutHandle);
    };

    const wrappedPushState: History["pushState"] = function (
      this: History,
      ...args
    ) {
      const result = pushState.apply(this, args);
      scheduleHistoryEvents("pushState");
      return result;
    };

    const wrappedReplaceState: History["replaceState"] = function (
      this: History,
      ...args
    ) {
      const result = replaceState.apply(this, args);
      scheduleHistoryEvents("replaceState");
      return result;
    };

    const handlePopState = () => scheduleHistoryEvents();

    window.history.pushState = wrappedPushState;
    window.history.replaceState = wrappedReplaceState;
    window.addEventListener("popstate", handlePopState);

    // Initial load
    handleRouteChange();

    // Listen to custom locationchange event
    window.addEventListener(LOCATION_CHANGE_EVT, handleRouteChange);

    return () => {
      if (window.history.pushState === wrappedPushState) {
        window.history.pushState = pushState;
      }
      if (window.history.replaceState === wrappedReplaceState) {
        window.history.replaceState = replaceState;
      }
      timeoutHandles.forEach((timeoutHandle) => {
        window.clearTimeout(timeoutHandle);
      });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(LOCATION_CHANGE_EVT, handleRouteChange);
    };
  }, [handleRouteChange]);

  return { history, referrer };
};

export default useNavHistory;
