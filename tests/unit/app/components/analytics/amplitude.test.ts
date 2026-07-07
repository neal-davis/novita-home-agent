import * as amplitude from "@amplitude/analytics-browser";

process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY_DEV = "test-key";

// Required lazily so the API-key env var is set before module init.
const {
  trackBlockExposure,
  trackBtnClick,
  trackPV,
  initAmplitude,
  setAmplitudeOptOut,
  logEvent,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("@/app/components/analytics/amplitude");

const identifyInstance = {
  setOnce: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

jest.mock("@amplitude/analytics-browser", () => ({
  setUserId: jest.fn(),
  init: jest.fn(),
  setOptOut: jest.fn(),
  setDeviceId: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  Identify: jest.fn(() => identifyInstance),
}));

jest.mock("@/app/components/analytics/utils", () => ({
  getUTMParams: () => ({ utm_source: "amp" }),
}));

jest.mock("@/lib/utils/url", () => ({
  getSearchParam: () => "refval",
}));

jest.mock("@/lib/utils/date", () => ({
  getDateString: () => "2026-06-15",
}));

const mockCookieGet = jest.fn();
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: (...a: any[]) => mockCookieGet(...a) },
}));

describe("analytics/amplitude", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).insiteReferrer = "https://ref.test/p";
    Object.defineProperty(window, "location", {
      value: new URL("https://novita.ai/path?x=1"),
      writable: true,
    });
    document.title = "Title";
  });

  it("logEvent forwards to amplitude.track", () => {
    logEvent("evt", { a: 1 });
    expect(amplitude.track).toHaveBeenCalledWith("evt", { a: 1 }, undefined);
  });

  it("trackBtnClick logs a btn_click event with enriched props", () => {
    trackBtnClick("b1", { foo: "bar" });
    expect(amplitude.track).toHaveBeenCalledWith(
      "btn_click",
      expect.objectContaining({
        element_id: "b1",
        page_path: "/path",
        utm_source: "amp",
        foo: "bar",
      }),
      undefined,
    );
  });

  it("trackBlockExposure logs a block_exposure event", () => {
    trackBlockExposure("blk");
    expect(amplitude.track).toHaveBeenCalledWith(
      "block_exposure",
      expect.objectContaining({ element_id: "blk" }),
      undefined,
    );
  });

  it("trackPV logs a page_view event with location-derived props", () => {
    trackPV();
    expect(amplitude.track).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({
        page_path: "/path",
        page_ref: "refval",
      }),
      undefined,
    );
  });

  it("setAmplitudeOptOut forwards to amplitude.setOptOut", () => {
    setAmplitudeOptOut(true);
    expect(amplitude.setOptOut).toHaveBeenCalledWith(true);
  });

  it("initAmplitude initializes, identifies and sets device id from cookie", () => {
    mockCookieGet.mockReturnValue("dev-1");
    initAmplitude({ uid: 7 });

    expect(amplitude.setUserId).toHaveBeenCalledWith("7");
    expect(amplitude.init).toHaveBeenCalled();
    expect(amplitude.setOptOut).toHaveBeenCalledWith(false);
    expect(amplitude.identify).toHaveBeenCalledWith(identifyInstance);
    expect(amplitude.setDeviceId).toHaveBeenCalledWith("dev-1");
  });

  it("initAmplitude skips setDeviceId when no cookie present", () => {
    mockCookieGet.mockReturnValue(undefined);
    initAmplitude({ uid: 0 });
    expect(amplitude.setUserId).not.toHaveBeenCalled();
    expect(amplitude.setDeviceId).not.toHaveBeenCalled();
  });
});
