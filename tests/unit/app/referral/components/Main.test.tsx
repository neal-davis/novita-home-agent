import { render, screen, waitFor } from "@testing-library/react";

const mockState: { user: { currentTeam: unknown } } = {
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
  default: ({
    isRelatedGithub,
    isSubAccount,
  }: {
    isRelatedGithub: boolean;
    isSubAccount: boolean;
  }) => (
    <div data-testid="first-page">
      first {String(isRelatedGithub)}-{String(isSubAccount)}
    </div>
  ),
}));
jest.mock("@/app/referral/components/Register", () => ({
  __esModule: true,
  default: ({ registered }: { registered: boolean }) => (
    <div data-testid="register">register {String(registered)}</div>
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

describe("referral/Main", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.user.currentTeam = null;
    mockSearch = "";
    mockGet.mockReturnValue("");
  });

  it("shows the not-logged-in register form when no token", async () => {
    mockGet.mockReturnValue("");
    render(<Main />);

    await waitFor(() =>
      expect(screen.getByTestId("first-page")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("register")).toHaveTextContent("register false");
    expect(screen.getByTestId("faq")).toBeInTheDocument();
  });

  it("renders BindGithub when logged-in user is not related to github and not from invite", async () => {
    mockGet.mockReturnValue("token-123");
    mockInviteInfo.mockResolvedValue({
      inviteCode: "code-1",
      isRelatedGithub: false,
      isFromInvite: false,
    });

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByTestId("bind-github")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("register")).not.toBeInTheDocument();
  });

  it("renders the registered Register form when from invite without github", async () => {
    mockGet.mockReturnValue("token-123");
    mockInviteInfo.mockResolvedValue({
      inviteCode: "code-1",
      isRelatedGithub: false,
      isFromInvite: true,
    });

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByTestId("register")).toHaveTextContent("register true"),
    );
  });

  it("renders Share when github-related and the team owner", async () => {
    mockGet.mockReturnValue("token-123");
    mockInviteInfo.mockResolvedValue({
      inviteCode: "code-1",
      isRelatedGithub: true,
      isFromInvite: true,
      inviteCount: 2,
    });

    render(<Main />);

    await waitFor(() =>
      expect(screen.getByTestId("share")).toBeInTheDocument(),
    );
  });

  it("retries when userInviteInfo rejects", async () => {
    mockGet.mockReturnValue("token-123");
    mockInviteInfo
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce({
        inviteCode: "code-1",
        isRelatedGithub: true,
        isFromInvite: true,
      });

    render(<Main />);

    await waitFor(() => expect(mockInviteInfo).toHaveBeenCalledTimes(2));
  });
});
