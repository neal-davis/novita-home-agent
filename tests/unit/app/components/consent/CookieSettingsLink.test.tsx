import { fireEvent, render, screen } from "@testing-library/react";
import CookieSettingsLink from "@/app/components/consent/CookieSettingsLink";
import {
  isCookiebotEnabled,
  openCookieSettings,
} from "@/lib/consent/cookiebot";

jest.mock("@/lib/consent/cookiebot", () => ({
  isCookiebotEnabled: jest.fn(),
  openCookieSettings: jest.fn(),
}));

const mockEnabled = isCookiebotEnabled as jest.Mock;

describe("CookieSettingsLink", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing when cookiebot is disabled", () => {
    mockEnabled.mockReturnValue(false);
    const { container } = render(
      <CookieSettingsLink>Settings</CookieSettingsLink>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a button and opens settings on click when enabled", () => {
    mockEnabled.mockReturnValue(true);
    render(
      <CookieSettingsLink id="ck" className="c" title="t">
        Cookie Settings
      </CookieSettingsLink>,
    );
    const btn = screen.getByRole("button", { name: "Cookie Settings" });
    expect(btn).toHaveAttribute("id", "ck");
    fireEvent.click(btn);
    expect(openCookieSettings).toHaveBeenCalled();
  });
});
