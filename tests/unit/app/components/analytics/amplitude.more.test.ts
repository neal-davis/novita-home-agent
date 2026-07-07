// Exercises the AMPLITUDE_API_KEY-missing branch and the production key ternary.
jest.mock("@amplitude/analytics-browser", () => ({
  setUserId: jest.fn(),
  init: jest.fn(),
  setOptOut: jest.fn(),
  setDeviceId: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  Identify: jest.fn(() => ({
    setOnce: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("@/app/components/analytics/utils", () => ({
  getUTMParams: () => ({}),
}));
jest.mock("@/lib/utils/url", () => ({ getSearchParam: () => "" }));
jest.mock("@/lib/utils/date", () => ({ getDateString: () => "2026-06-15" }));
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: () => undefined },
}));

const ORIGINAL_ENV = { ...process.env };

describe("analytics/amplitude api-key branches", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    (window as any).insiteReferrer = "";
    Object.defineProperty(window, "location", {
      value: new URL("https://novita.ai/path"),
      writable: true,
    });
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("logs an error and bails when no API key is configured", () => {
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    delete process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY_DEV;
    process.env.NEXT_PUBLIC_VERCEL_ENV = "development";
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let amp: any;
    let amplitude: any;
    jest.isolateModules(() => {
      amp = require("@/app/components/analytics/amplitude");
      amplitude = require("@amplitude/analytics-browser");
    });

    amp.initAmplitude({ uid: 1 });
    expect(errSpy).toHaveBeenCalledWith("Amplitude API key is missing");
    expect(amplitude.init).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("uses the production API key when VERCEL_ENV is production", () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY = "prod-key";
    process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY_DEV = "dev-key";

    let amp: any;
    let amplitude: any;
    jest.isolateModules(() => {
      amp = require("@/app/components/analytics/amplitude");
      amplitude = require("@amplitude/analytics-browser");
    });

    amp.initAmplitude({ uid: 0 });
    expect(amplitude.init).toHaveBeenCalledWith("prod-key", expect.any(Object));
  });
});
