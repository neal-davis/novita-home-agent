/**
 * New user registration campaign page (e.g., Hackathon)
 */

import { reduxStore } from "@/store";
import Cookies from "js-cookie";
export function isWithinValidityPeriod(beginTime: number, expiryTime: number) {
  const currentTime = Date.now() / 1000;
  return currentTime >= beginTime && currentTime <= expiryTime;
}

export function getRegistrationCampaign(): Campaign | null {
  const state = reduxStore.store.getState();
  const campaign = state.config.campaign;
  if (!campaign) {
    return null;
  }
  const { beginTime, expiryTime } = campaign;
  if (isWithinValidityPeriod(beginTime, expiryTime)) {
    return campaign;
  }
  return null;
}

export function getRegistrationCampaignCode(): string {
  const campaign = getRegistrationCampaign();
  return campaign?.campaignCode || "";
}

export function syncCampaignCodeForThirdPartyAuth(): void {
  const campaign = getRegistrationCampaign();
  if (campaign) {
    Cookies.set("campaign_code", campaign.campaignCode, {
      expires: 5 / (24 * 60),
    });
  }
}

export function isShowRegistrationCampaign(
  searchParamsInServer?: Record<string, string>,
): boolean {
  const campaign = getRegistrationCampaign();
  if (!campaign) {
    return false;
  }

  if (searchParamsInServer) {
    return searchParamsInServer[campaign.campaignSlug] ? true : false;
  }

  const { search } = window.location;
  const searchParams = new URLSearchParams(search);
  return searchParams.has(campaign.campaignSlug);
}
