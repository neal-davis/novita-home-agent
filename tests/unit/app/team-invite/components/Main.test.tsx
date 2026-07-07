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
  default: ({ teamName }: { teamName: string }) => (
    <div data-testid="not-logged-in">{teamName}</div>
  ),
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

const mockGet = Cookies.get as unknown as jest.Mock;

describe("team-invite/Main", () => {
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

  it("redirects to home when there is no invite token", () => {
    mockSearch = "";
    render(<Main />);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows NotLoggedIn when there is no auth token", async () => {
    mockGet.mockReturnValue("");
    mockState.user.teamInvite.teamName = "Acme";
    render(<Main />);
    await waitFor(() =>
      expect(screen.getByTestId("not-logged-in")).toHaveTextContent("Acme"),
    );
  });

  it("shows Loading while auth resolves with a token", async () => {
    mockGet.mockReturnValue("auth-token");
    // uuid empty -> AUTH_LOADING
    render(<Main />);
    await waitFor(() =>
      expect(screen.getByTestId("loading")).toBeInTheDocument(),
    );
    // fetchTeamInvite + fetchUserInfo dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("shows NotCurrentAccount when invited email differs", async () => {
    mockGet.mockReturnValue("auth-token");
    mockState.user.uuid = "u-1";
    mockState.user.email = "me@example.com";
    mockState.user.teamInvite.email = "other@example.com";
    render(<Main />);
    await waitFor(() =>
      expect(screen.getByTestId("not-current")).toBeInTheDocument(),
    );
  });

  it("shows CurrentAccount when invited email matches", async () => {
    mockGet.mockReturnValue("auth-token");
    mockState.user.uuid = "u-1";
    mockState.user.email = "me@example.com";
    mockState.user.teamInvite.email = "ME@example.com";
    render(<Main />);
    await waitFor(() =>
      expect(screen.getByTestId("current")).toHaveTextContent("ME@example.com"),
    );
  });
});
