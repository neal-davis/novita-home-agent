import { render, screen, waitFor } from "@testing-library/react";

const mockState: { user: { currentTeam: { role: string } | null } } = {
  user: { currentTeam: null },
};
let mockSearch = "";

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: jest.fn(() => "") },
}));

jest.mock("@/api/user", () => ({ userInviteInfo: jest.fn() }));

jest.mock("@/app/referral/components/FirstPage", () => ({
  __esModule: true,
  default: ({ isSubAccount }: { isSubAccount: boolean }) => (
    <div data-testid="first-page">first {String(isSubAccount)}</div>
  ),
}));
jest.mock("@/app/referral/components/Register", () => ({
  __esModule: true,
  default: ({ isSubAccount }: { isSubAccount: boolean }) => (
    <div data-testid="register">register {String(isSubAccount)}</div>
  ),
}));
jest.mock("@/app/referral/components/Share", () => ({
  __esModule: true,
  default: () => <div data-testid="share">share</div>,
}));
jest.mock("@/app/referral/components/BindGithub", () => ({
  __esModule: true,
  default: () => <div data-testid="bind-github">bind</div>,
}));
jest.mock("@/app/referral/components/FAQ", () => ({
  __esModule: true,
  default: () => <div data-testid="faq">faq</div>,
}));
jest.mock("@/app/referral/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">loading</div>,
}));

import Main from "@/app/referral/components/Main";
import { userInviteInfo } from "@/api/user";
import Cookies from "js-cookie";

const mockInviteInfo = userInviteInfo as jest.Mock;
const mockGet = Cookies.get as unknown as jest.Mock;

describe("referral/Main (more)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockState.user.currentTeam = null;
    mockSearch = "";
    mockGet.mockReturnValue("");
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("schedules a delayed re-fetch while the referral voucher is still pending", async () => {
    mockGet.mockReturnValue("token-123");
    mockInviteInfo.mockResolvedValue({
      inviteCode: "code-1",
      isRelatedGithub: true,
      isFromInvite: true,
      registerCommissions: 0,
    });

    render(<Main />);

    await waitFor(() => expect(mockInviteInfo).toHaveBeenCalledTimes(1));
    // voucher delay branch arms a 5s timer for the next poll
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockInviteInfo).toHaveBeenCalledTimes(2));
  });

  it("treats a non-owner team member as a sub-account in the share flow", async () => {
    mockGet.mockReturnValue("token-123");
    mockState.user.currentTeam = { role: "admin" };
    mockInviteInfo.mockResolvedValue({
      inviteCode: "code-1",
      isRelatedGithub: true,
      isFromInvite: true,
      registerCommissions: 100,
    });

    render(<Main />);

    // sub-account owner is not allowed the Share panel
    await waitFor(() =>
      expect(screen.getByTestId("first-page")).toHaveTextContent("first true"),
    );
    expect(screen.queryByTestId("share")).not.toBeInTheDocument();
  });
});
