/**
 * Utilities for Coding Plan campaign feature gate
 */

import { reduxStore } from "@/store";
import { isWithinValidityPeriod } from "./registrationCampaign";

/**
 * Check if the coding plan campaign is active
 * For use in client-side components
 *
 * Set NEXT_PUBLIC_CODING_PLAN_ENABLED to override:
 * - "true": force enable
 * - "false": force disable
 * - unset: use campaign time range
 */
export function isCodingPlanCampaignActive(): boolean {
  const override = process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED;
  if (override === "true") return true;
  if (override === "false") return false;

  const state = reduxStore.store.getState();
  const codingPlanCampaign = state.config.codingPlanCampaign;

  if (!codingPlanCampaign) {
    return false;
  }

  return isWithinValidityPeriod(
    codingPlanCampaign.beginTime,
    codingPlanCampaign.expiryTime,
  );
}
