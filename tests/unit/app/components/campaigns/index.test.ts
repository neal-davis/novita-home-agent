jest.mock("@/app/components/campaigns/HomeLabel", () => ({
  HomeCampaignLabel: () => null,
}));
jest.mock("@/app/components/campaigns/HomeCampaignBanner", () => ({
  HomeCampaignBanner: () => null,
}));
jest.mock("@/app/components/campaigns/PricingBanner", () => ({
  PricingBanner: () => null,
}));
jest.mock("@/app/components/campaigns/ConsoleBanner", () => ({
  ConsoleBanner: () => null,
}));

import * as campaigns from "@/app/components/campaigns";

describe("campaigns index barrel", () => {
  it("re-exports the campaign components under their public names", () => {
    expect(typeof campaigns.HomeCampaignLabel).toBe("function");
    expect(typeof campaigns.HomeCampaignBanner).toBe("function");
    expect(typeof campaigns.PricingCampaignBanner).toBe("function");
    expect(typeof campaigns.ConsoleCampaignBanner).toBe("function");
  });
});
