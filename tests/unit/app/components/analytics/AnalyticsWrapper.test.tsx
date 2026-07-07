import { render } from "@testing-library/react";
import AnalyticsWrapper from "@/app/components/analytics/AnalyticsWrapper";
import analytic from "@/app/components/analytics/analytics";
import { useCookiebotConsent } from "@/hooks/useCookiebotConsent";

const mockUser = { email: "a@b.com", uid: 1, role: 2, uuid: "u-1" };

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ user: mockUser }),
}));

jest.mock("@/lib/hooks/useNavHistory", () => ({
  __esModule: true,
  default: jest.fn(),
  LOCATION_CHANGE_EVT: "locationchange",
}));

jest.mock("@/hooks/useCookiebotConsent", () => ({
  useCookiebotConsent: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    setAmplitudeOptOut: jest.fn(),
    init: jest.fn(),
    trackCustomPV: jest.fn(),
    initBtnClickTrackers: jest.fn(() => jest.fn()),
  },
}));

const consentHook = useCookiebotConsent as jest.Mock;

describe("AnalyticsWrapper", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sets amplitude opt-out based on statistics consent", () => {
    consentHook.mockReturnValue({ marketing: false, statistics: true });
    render(<AnalyticsWrapper />);
    expect(analytic.setAmplitudeOptOut).toHaveBeenCalledWith(false);
  });

  it("opts out of amplitude when statistics consent is denied", () => {
    consentHook.mockReturnValue({ marketing: false, statistics: false });
    render(<AnalyticsWrapper />);
    expect(analytic.setAmplitudeOptOut).toHaveBeenCalledWith(true);
  });

  it("does not init analytics when both consents are denied", () => {
    consentHook.mockReturnValue({ marketing: false, statistics: false });
    render(<AnalyticsWrapper />);
    expect(analytic.init).not.toHaveBeenCalled();
    expect(analytic.trackCustomPV).not.toHaveBeenCalled();
  });

  it("inits but does not track PV when only marketing consent is granted", () => {
    consentHook.mockReturnValue({ marketing: true, statistics: false });
    render(<AnalyticsWrapper />);
    expect(analytic.init).toHaveBeenCalledWith({
      email: "a@b.com",
      uid: 1,
      role: 2,
      uuid: "u-1",
    });
    expect(analytic.trackCustomPV).not.toHaveBeenCalled();
  });

  it("inits, tracks PV and registers btn click trackers when statistics granted", () => {
    consentHook.mockReturnValue({ marketing: true, statistics: true });
    render(<AnalyticsWrapper />);
    expect(analytic.init).toHaveBeenCalled();
    expect(analytic.trackCustomPV).toHaveBeenCalled();
    expect(analytic.initBtnClickTrackers).toHaveBeenCalled();
  });

  it("tracks PV again on a locationchange event when statistics granted", () => {
    consentHook.mockReturnValue({ marketing: true, statistics: true });
    render(<AnalyticsWrapper />);
    (analytic.trackCustomPV as jest.Mock).mockClear();
    window.dispatchEvent(new Event("locationchange"));
    expect(analytic.trackCustomPV).toHaveBeenCalled();
  });
});
