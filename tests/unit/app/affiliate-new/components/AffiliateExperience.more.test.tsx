import { render, screen } from "@testing-library/react";

const mockState = {
  user: {
    token: "",
    email: "",
    currentTeam: null as { role: string } | null,
    state: "login",
  },
};

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));

jest.mock("@/api/user", () => ({ getAffiliateInfo: jest.fn() }));

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));

// Capture the Banner props so we can invoke onLoginStart directly.
const bannerProps: { onLoginStart?: () => void; loginUrl?: string } = {};
jest.mock("@/app/affiliate-new/components/Header", () => ({
  Header: (props: any) => {
    Object.assign(bannerProps, props);
    return (
      <button data-testid="login" onClick={props.onLoginStart}>
        login
      </button>
    );
  },
}));

import { AffiliateExperience } from "@/app/affiliate-new/components/AffiliateExperience";
import { getAffiliateInfo } from "@/api/user";

const mockInfo = getAffiliateInfo as jest.Mock;

describe("AffiliateExperience (more)", () => {
  let setItem: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(bannerProps))
      delete (bannerProps as Record<string, unknown>)[k];
    mockState.user = {
      token: "",
      email: "",
      currentTeam: null,
      state: "login",
    };
    setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation();
  });
  afterEach(() => setItem.mockRestore());

  it("stores the affiliate redirect target when login starts", () => {
    render(<AffiliateExperience />);
    bannerProps.onLoginStart?.();
    expect(setItem).toHaveBeenCalledWith("redirect", expect.any(String));
  });

  it("builds an encoded affiliate login url passed to the banner", () => {
    render(<AffiliateExperience />);
    expect(bannerProps.loginUrl).toContain("redirect=");
    // affiliate path is URL-encoded into the redirect query param
    expect(bannerProps.loginUrl).toContain("%2F");
    expect(mockInfo).not.toHaveBeenCalled();
  });
});
