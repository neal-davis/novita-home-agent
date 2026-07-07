import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TeamAccountWrapper from "@/app/components/TeamAccount/TeamAccountWrapper";
import { upgradeToTeamAccount } from "@/api/team";
import { message } from "@/components/ui/standard/notify";

let mockState: any;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/i18n/provider", () => ({
  useI18nSubscription: jest.fn(),
}));

jest.mock("@/api/team", () => ({ upgradeToTeamAccount: jest.fn() }));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  ButtonArrow: () => <span data-testid="arrow" />,
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
}));

const mockUpgrade = upgradeToTeamAccount as jest.Mock;

function setUser(user: any) {
  mockState = { user };
}

describe("TeamAccountWrapper", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing when the user is not logged in", () => {
    setUser({ uuid: "", currentTeam: null, username: "x" });
    const { container } = render(
      <TeamAccountWrapper>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children for a team account", () => {
    setUser({ uuid: "u1", currentTeam: { id: "t1" }, username: "x" });
    render(
      <TeamAccountWrapper>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders the provided fallback for a personal account", () => {
    setUser({ uuid: "u1", currentTeam: null, username: "x" });
    render(
      <TeamAccountWrapper fallback={<div>fb</div>}>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("shows the upgrade guide for a personal account without fallback", () => {
    setUser({ uuid: "u1", currentTeam: null, username: "Bob" });
    render(
      <TeamAccountWrapper>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    expect(
      screen.getByText("Upgrade to a team account to collaborate with others"),
    ).toBeInTheDocument();
    expect(screen.getByText("Role-Based Access")).toBeInTheDocument();
  });

  it("prefills the team name input from the username and submits an upgrade", async () => {
    setUser({ uuid: "u1", currentTeam: null, username: "Bob" });
    mockUpgrade.mockResolvedValue({});
    // Avoid jsdom "not implemented: navigation" noise on reload().
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: jest.fn() },
      writable: true,
    });
    render(
      <TeamAccountWrapper>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    const input = screen.getByDisplayValue("Bob's Team");
    expect(input).toBeInTheDocument();
    fireEvent.click(screen.getByText("Upgrade"));
    await waitFor(() => expect(mockUpgrade).toHaveBeenCalledWith("Bob's Team"));
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("shows an error toast when the upgrade fails", async () => {
    setUser({ uuid: "u1", currentTeam: null, username: "Bob" });
    mockUpgrade.mockRejectedValue(new Error("fail"));
    render(
      <TeamAccountWrapper>
        <div>child</div>
      </TeamAccountWrapper>,
    );
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    fireEvent.click(screen.getByText("Upgrade"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Upgrade failed"),
    );
  });
});
