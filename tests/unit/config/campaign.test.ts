const mockGetState = jest.fn();
jest.mock("@/store", () => ({
  reduxStore: { store: { getState: () => mockGetState() } },
}));

import getCampaignConfig from "@/config/campaign";

describe("getCampaignConfig", () => {
  afterEach(() => jest.clearAllMocks());

  it("is enabled before the campaign end date", () => {
    mockGetState.mockReturnValue({
      config: { serverTimestamp: new Date("2025-06-01").getTime() },
    });
    const cfg = getCampaignConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.campaignUrl).toBe("/build-month");
    expect(cfg.campaignMediaModelIds.length).toBeGreaterThan(0);
    expect(cfg.llmDiscountLabel).toBe("20% OFF");
  });

  it("is disabled after the campaign end date", () => {
    mockGetState.mockReturnValue({
      config: { serverTimestamp: new Date("2026-06-01").getTime() },
    });
    expect(getCampaignConfig().enabled).toBe(false);
  });

  it("falls back to Date.now when no server timestamp is present", () => {
    mockGetState.mockReturnValue({ config: {} });
    const cfg = getCampaignConfig();
    expect(typeof cfg.enabled).toBe("boolean");
  });
});
