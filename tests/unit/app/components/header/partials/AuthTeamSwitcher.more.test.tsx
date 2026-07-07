import { act, fireEvent, render, screen } from "@testing-library/react";
import AuthTeamSwitcher from "@/app/components/header/partials/AuthTeamSwitcher";

let mockState: any;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/api/team", () => ({ switchTeam: jest.fn() }));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));
jest.mock("@/store/slice/userSlice", () => ({
  TeamRole: { owner: "owner", admin: "admin" },
}));
jest.mock("@/i18n/config", () => ({ getLocalizedPath: (h: string) => h }));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));

// Wire the trigger so mouse handlers run.
jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  ButtonArrow: () => <span data-testid="arrow" />,
}));

function setUser(user: any) {
  mockState = { user };
}

describe("AuthTeamSwitcher more branches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows Team Settings CTA for an owner and full team id formatting", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "team-owner-123456", name: "Acme", role: "owner" }],
      currentTeam: { id: "team-owner-123456", name: "Acme", role: "owner" },
    });
    render(<AuthTeamSwitcher />);
    expect(screen.getByText("Team Settings")).toBeInTheDocument();
    // formatTeamID masks middle characters for long ids
    expect(screen.getByText(/team-\*+/)).toBeInTheDocument();
  });

  it("does not mask short team ids", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "short", name: "Acme", role: "owner" }],
      currentTeam: { id: "short", name: "Acme", role: "owner" },
    });
    render(<AuthTeamSwitcher />);
    expect(screen.getByText(/short/)).toBeInTheDocument();
  });

  it("does not switch when clicking the already-active team", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { switchTeam } = require("@/api/team");
    setUser({
      username: "Alice",
      teams: [{ id: "team-aaaaaaaaaa", name: "Acme", role: "admin" }],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    render(<AuthTeamSwitcher />);
    // The list row carries the Team ID label; click that row's active entry.
    const teamIdLabel = screen.getByText(/Team ID/);
    fireEvent.click(teamIdLabel);
    expect(switchTeam).not.toHaveBeenCalled();
  });

  it("handles mouse enter/leave open + close timers on the trigger", () => {
    jest.useFakeTimers();
    setUser({ username: "Alice", teams: [], currentTeam: null });
    const { container } = render(<AuthTeamSwitcher />);
    const trigger = container.querySelector(".cursor-pointer") as HTMLElement;
    act(() => {
      fireEvent.mouseEnter(trigger);
    });
    act(() => {
      fireEvent.mouseLeave(trigger);
      jest.advanceTimersByTime(200);
    });
    // re-enter cancels any pending timer
    act(() => {
      fireEvent.mouseEnter(trigger);
    });
    expect(screen.getByText("Create Team")).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("uses the current team name as the trigger label when a team is active", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "team-aaaaaaaaaa", name: "Acme", role: "admin" }],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    const { container } = render(<AuthTeamSwitcher />);
    const trigger = container.querySelector(".cursor-pointer") as HTMLElement;
    expect(trigger.textContent).toContain("Acme");
    expect(trigger.textContent).toContain("Team");
  });
});
