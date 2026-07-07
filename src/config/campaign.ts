import { reduxStore } from "@/store";

// Only configure model IDs here, the actual model data comes from model-library-config.ts
const campaignMediaModelIds = [
  "wan-2-1-i2v",
  "hunyuan-3-0",
  "minimax-hailuo-02",
  "pixverse-v4-5-i2v",
  "vidu-2-0-img2video",
  "SEEDANCE_V1_LITE_I2V",
  "kling-v1-6-t2v",
  "kling-v1-6-i2v",
  "KLING_V2_5_I2V",
  "seedream-4-0",
  "qwen-txt2img",
];

export interface CampaignConfig {
  enabled: boolean;
  campaignUrl: string;
  campaignMediaModelIds: string[];
  // home banner config
  HomeCampaignLabelText: string;
  HomeCampaignLabelLinkText: string;
  // Model Library Campaign Config
  modelLibraryDisplayName: string;
  gpuExploreDisplayName: string;
  gpuExploreOnDemandDesc: string;
  modelLibraryDiscription: string;
  modelLibraryDiscountLabel: string;
  modelPageDiscountLabel: string;
  modelLibraryTermsUrl: string;
  // Login/Signup Campaign Config
  loginSignupLabelText: string;
  loginSignupTitle: string;
  loginSignupDescription: string;
  // LLM Campaign Config
  llmDiscountLabel: string;
  // GPU Campaign Config
  gpuDiscountLabel: string;
}

const CAMPAIGN_END_DATE = new Date("2026-01-01T15:59:59+08:00").getTime();

const getCampaignConfig = (): CampaignConfig => {
  // Get server timestamp from Redux store (injected during SSR in layout.tsx)
  const state = reduxStore.store.getState();
  const serverTimestamp = state.config.serverTimestamp;
  const currentTime = serverTimestamp || Date.now();
  const enabled = currentTime < CAMPAIGN_END_DATE;

  return {
    enabled,
    campaignUrl: "/build-month",
    campaignMediaModelIds,
    // home banner config
    HomeCampaignLabelText: "🔥 20% Off on Most Products",
    HomeCampaignLabelLinkText: "Join Build Month Now",
    // Model Library Campaign Config
    modelLibraryDisplayName: "Build Month",
    gpuExploreDisplayName: "Build Month",
    gpuExploreOnDemandDesc:
      "Discount applies to your first GPU instance launched before 12/31/2025 11:59 PM PST.",
    modelLibraryDiscription:
      "Enjoy limited-time discounts on Models, GPUs, and Sandbox throughout Build Month.",
    modelLibraryDiscountLabel: "UP TO 20% OFF",
    modelPageDiscountLabel: "20% OFF",
    modelLibraryTermsUrl: "/build-month#questions",
    // Login/Signup Campaign Config
    loginSignupLabelText: "Build Month",
    loginSignupTitle: "<span>Build Month</span> Is Live — Up to 20% OFF! 🔥",
    loginSignupDescription: `Build faster with our best pricing of the year. Save up to 20% across Model APIs, GPU Instances, and Agent Sandbox.

👉 **[Join the Event](/build-month)**

Happening now until 12/31/2025 11:59PM PST.`,
    // LLM Campaign Config
    llmDiscountLabel: "20% OFF",
    // GPU Campaign Config
    gpuDiscountLabel: "20% OFF",
  };
};

export default getCampaignConfig;
