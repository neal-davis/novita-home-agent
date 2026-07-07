jest.mock("@/store", () => ({
  reduxStore: {
    store: {
      getState: jest.fn(),
    },
  },
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

import Cookies from "js-cookie";
import { reduxStore } from "@/store";
import {
  getRegistrationCampaign,
  getRegistrationCampaignCode,
  isShowRegistrationCampaign,
  isWithinValidityPeriod,
  syncCampaignCodeForThirdPartyAuth,
} from "@/lib/utils/registrationCampaign";

const mockGetState = reduxStore.store.getState as jest.Mock;
const mockCookiesSet = Cookies.set as jest.Mock;

const activeCampaign = {
  beginTime: 100,
  expiryTime: 300,
  campaignCode: "CODE",
  campaignSlug: "launch",
};

describe("registration campaign utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(200_000);
    mockGetState.mockReturnValue({ config: { campaign: activeCampaign } });
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("checks campaign validity against the current unix timestamp", () => {
    expect(isWithinValidityPeriod(100, 300)).toBe(true);
    expect(isWithinValidityPeriod(201, 300)).toBe(false);
    expect(isWithinValidityPeriod(100, 199)).toBe(false);
  });

  it("returns the active campaign and campaign code", () => {
    expect(getRegistrationCampaign()).toEqual(activeCampaign);
    expect(getRegistrationCampaignCode()).toBe("CODE");
  });

  it("returns null and empty code when campaign is missing or expired", () => {
    mockGetState.mockReturnValueOnce({ config: { campaign: null } });
    expect(getRegistrationCampaign()).toBeNull();

    mockGetState.mockReturnValue({
      config: {
        campaign: { ...activeCampaign, beginTime: 1, expiryTime: 99 },
      },
    });
    expect(getRegistrationCampaignCode()).toBe("");
  });

  it("syncs active campaign code for third-party auth", () => {
    syncCampaignCodeForThirdPartyAuth();

    expect(mockCookiesSet).toHaveBeenCalledWith("campaign_code", "CODE", {
      expires: 5 / (24 * 60),
    });
  });

  it("detects campaign slug from server and browser search params", () => {
    expect(isShowRegistrationCampaign({ launch: "1" })).toBe(true);
    expect(isShowRegistrationCampaign({ other: "1" })).toBe(false);

    window.history.pushState({}, "", "/?launch=1");
    expect(isShowRegistrationCampaign()).toBe(true);

    mockGetState.mockReturnValueOnce({ config: { campaign: null } });
    expect(isShowRegistrationCampaign({ launch: "1" })).toBe(false);
  });
});
