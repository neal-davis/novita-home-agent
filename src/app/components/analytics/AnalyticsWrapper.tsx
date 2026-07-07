"use client";

import { useEffect } from "react";
import useNavHistory, { LOCATION_CHANGE_EVT } from "@/lib/hooks/useNavHistory";
import { useAppSelector } from "@/store";
import analytic from "./analytics";
import { useCookiebotConsent } from "@/hooks/useCookiebotConsent";

export default function AnalyticsWrapper() {
  useNavHistory();
  const user = useAppSelector((state) => state.user);
  const consent = useCookiebotConsent();

  useEffect(() => {
    analytic.setAmplitudeOptOut(!consent.statistics);
  }, [consent.statistics]);

  useEffect(() => {
    if (!consent.marketing && !consent.statistics) {
      return;
    }

    analytic.init({
      email: user.email,
      uid: user.uid,
      role: user.role,
      uuid: user.uuid,
    });
    if (!consent.statistics) {
      return;
    }

    analytic.trackCustomPV();
    const clearBtnClick = analytic.initBtnClickTrackers();

    return () => {
      clearBtnClick();
    };
  }, [
    consent.marketing,
    consent.statistics,
    user.email,
    user.role,
    user.uid,
    user.uuid,
  ]);

  useEffect(() => {
    if (!consent.statistics) {
      return;
    }

    const trackPV = () => {
      analytic.trackCustomPV();
    };
    window.addEventListener(LOCATION_CHANGE_EVT, trackPV);

    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVT, trackPV);
    };
  }, [consent.statistics]);

  return <></>;
}
