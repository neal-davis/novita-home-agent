const mockIsGranted = jest.fn();
jest.mock("@/lib/consent/cookiebot", () => ({
  isCookieConsentGranted: (...a: unknown[]) => mockIsGranted(...a),
}));

import {
  clearLocalePreference,
  persistLocalePreference,
} from "@/i18n/preference";
import { LOCALE_PREFERENCE_COOKIE_NAME } from "@/i18n/config";

describe("locale preference cookie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // wipe cookie
    document.cookie = `${LOCALE_PREFERENCE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("persists the locale when consent is granted", () => {
    mockIsGranted.mockReturnValue(true);
    persistLocalePreference("fr" as never);
    expect(mockIsGranted).toHaveBeenCalledWith("preferences");
    expect(document.cookie).toContain(`${LOCALE_PREFERENCE_COOKIE_NAME}=fr`);
  });

  it("does not write the cookie when consent is denied", () => {
    mockIsGranted.mockReturnValue(false);
    persistLocalePreference("de" as never);
    expect(document.cookie).not.toContain(
      `${LOCALE_PREFERENCE_COOKIE_NAME}=de`,
    );
  });

  it("clears the cookie", () => {
    mockIsGranted.mockReturnValue(true);
    persistLocalePreference("fr" as never);
    clearLocalePreference();
    expect(document.cookie).not.toContain(
      `${LOCALE_PREFERENCE_COOKIE_NAME}=fr`,
    );
  });
});
