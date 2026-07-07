const mockGetState = jest.fn();
const mockIsWithinValidityPeriod = jest.fn();

jest.mock("@/store", () => ({
  reduxStore: { store: { getState: () => mockGetState() } },
}));
jest.mock("@/lib/utils/registrationCampaign", () => ({
  isWithinValidityPeriod: (...args: unknown[]) =>
    mockIsWithinValidityPeriod(...args),
}));

import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";

describe("isCodingPlanCampaignActive", () => {
  const originalEnv = process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED = originalEnv;
  });

  it("force-enables when override is 'true'", () => {
    process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED = "true";
    expect(isCodingPlanCampaignActive()).toBe(true);
    expect(mockGetState).not.toHaveBeenCalled();
  });

  it("force-disables when override is 'false'", () => {
    process.env.NEXT_PUBLIC_CODING_PLAN_ENABLED = "false";
    expect(isCodingPlanCampaignActive()).toBe(false);
  });

  it("returns false when no campaign config in store", () => {
    mockGetState.mockReturnValue({ config: {} });
    expect(isCodingPlanCampaignActive()).toBe(false);
    expect(mockIsWithinValidityPeriod).not.toHaveBeenCalled();
  });

  it("delegates to validity-period check when a campaign exists", () => {
    mockGetState.mockReturnValue({
      config: { codingPlanCampaign: { beginTime: 1, expiryTime: 2 } },
    });
    mockIsWithinValidityPeriod.mockReturnValue(true);
    expect(isCodingPlanCampaignActive()).toBe(true);
    expect(mockIsWithinValidityPeriod).toHaveBeenCalledWith(1, 2);
  });
});
