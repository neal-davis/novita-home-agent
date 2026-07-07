import { render, screen, waitFor } from "@testing-library/react";

const mockState = {
  user: {
    uuid: "",
    email: "",
    teamInvite: { email: "", phone: "", teamName: "", role: "" },
  },
};
let mockSearch = "token=tok-1";
const mockPush = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: jest.fn(() => "") },
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchUserInfo: jest.fn(() => ({ type: "fetchUserInfo" })),
  fetchTeamInvite: jest.fn((t: string) => ({ type: "fetchTeamInvite", t })),
}));

jest.mock("@/app/team-invite/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">loading</div>,
}));
jest.mock("@/app/team-invite/components/NotLoggedIn", () => ({
  __esModule: true,
  default: () => <div data-testid="not-logged-in" />,
}));
jest.mock("@/app/team-invite/components/NotCurrentAccount", () => ({
  __esModule: true,
  default: () => <div data-testid="not-current">not-current</div>,
}));
jest.mock("@/app/team-invite/components/CurrentAccount", () => ({
  __esModule: true,
  default: ({ email }: { email: string }) => (
    <div data-testid="current">{email}</div>
  ),
}));

import Main from "@/app/team-invite/components/Main";
import Cookies from "js-cookie";
import { fetchUserInfo } from "@/store/slice/userSlice";

const mockGet = Cookies.get as unknown as jest.Mock;

describe("team-invite/Main (more)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch = "token=tok-1";
    mockState.user = {
      uuid: "",
      email: "",
      teamInvite: { email: "", phone: "", teamName: "", role: "" },
    };
    mockGet.mockReturnValue("");
  });

  it("dispatches fetchUserInfo when an auth token cookie exists", async () => {
    mockGet.mockReturnValue("auth-token");
    render(<Main />);
    await waitFor(() =>
      expect(mockDispatch).toHaveBeenCalledWith(
        (fetchUserInfo as jest.Mock).mock.results[0].value,
      ),
    );
  });

  it("resolves a current account through the phone-only invite branch", async () => {
    // invitedEmail empty but phone present keeps the account resolved (not AUTH_LOADING),
    // and the email comparison still passes because both sides are empty strings.
    mockGet.mockReturnValue("auth-token");
    mockState.user.uuid = "u-1";
    mockState.user.email = "";
    mockState.user.teamInvite.email = "";
    mockState.user.teamInvite.phone = "+15550001111";
    render(<Main />);
    await waitFor(() =>
      expect(screen.getByTestId("current")).toBeInTheDocument(),
    );
  });
});
