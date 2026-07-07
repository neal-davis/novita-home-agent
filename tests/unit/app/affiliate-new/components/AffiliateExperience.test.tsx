import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
  default: ({
    children,
    onCopy,
  }: {
    children: React.ReactNode;
    onCopy: () => void;
  }) => <span onClick={onCopy}>{children}</span>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));

jest.mock("@/app/affiliate-new/components/Header", () => ({
  Header: ({
    isLoggedIn,
    isTeamNonOwner,
  }: {
    isLoggedIn: boolean;
    isTeamNonOwner: boolean;
  }) => (
    <div data-testid="banner">
      banner {String(isLoggedIn)}-{String(isTeamNonOwner)}
    </div>
  ),
}));

import { AffiliateExperience } from "@/app/affiliate-new/components/AffiliateExperience";
import { getAffiliateInfo } from "@/api/user";
import { message } from "@/components/ui/standard/notify";

const mockInfo = getAffiliateInfo as jest.Mock;
const mockSuccess = message.success as jest.Mock;

describe("AffiliateExperience", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
    mockState.user = {
      token: "",
      email: "",
      currentTeam: null,
      state: "login",
    };
  });
  afterEach(() => consoleError.mockRestore());

  it("shows only the banner when not logged in", () => {
    render(<AffiliateExperience />);
    expect(screen.getByTestId("banner")).toHaveTextContent("banner false");
    expect(mockInfo).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Your Affiliate Credentials"),
    ).not.toBeInTheDocument();
  });

  it("loads and displays affiliate credentials for a logged-in owner", async () => {
    mockState.user.token = "tok";
    mockState.user.email = "me@example.com";
    mockInfo.mockResolvedValue({
      referralLink: "https://ref.example/abc",
      password: "secret123",
      invites: 1,
      balance: 2,
      clicks: 3,
    });

    render(<AffiliateExperience />);

    await waitFor(() =>
      expect(
        screen.getByText("Your Affiliate Credentials"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("https://ref.example/abc")).toBeInTheDocument();
    expect(screen.getByText("secret123")).toBeInTheDocument();

    // Copying the referral link fires the success toast
    fireEvent.click(screen.getByLabelText("Copy Referral Link"));
    expect(mockSuccess).toHaveBeenCalledWith("Referral Link copied");
  });

  it("does not fetch for a non-owner team member", () => {
    mockState.user.token = "tok";
    mockState.user.currentTeam = { role: "admin" };
    render(<AffiliateExperience />);
    expect(screen.getByTestId("banner")).toHaveTextContent("banner true-true");
    expect(mockInfo).not.toHaveBeenCalled();
  });

  it("shows an error state with retry when the request fails", async () => {
    mockState.user.token = "tok";
    mockState.user.email = "me@example.com";
    mockInfo.mockRejectedValue(new Error("nope"));

    render(<AffiliateExperience />);

    await waitFor(() =>
      expect(
        screen.getByText(/Unable to load affiliate credentials/),
      ).toBeInTheDocument(),
    );

    mockInfo.mockResolvedValueOnce({ referralLink: "x", password: "p" });
    fireEvent.click(screen.getByRole("button", { name: /Retry/ }));
    await waitFor(() => expect(mockInfo).toHaveBeenCalledTimes(2));
  });

  it("does not fetch while the user state is initializing", () => {
    mockState.user.token = "tok";
    mockState.user.email = "me@example.com";
    mockState.user.state = "initializing";
    render(<AffiliateExperience />);
    expect(mockInfo).not.toHaveBeenCalled();
  });
});
