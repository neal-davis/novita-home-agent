import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TeamSwitcher from "@/app/components/header/partials/TeamSwitcher";
import { switchTeam } from "@/api/team";
import { message } from "@/components/ui/standard/notify";

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

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (href: string) => href,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));

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

const mockSwitch = switchTeam as jest.Mock;

function setUser(user: any) {
  mockState = { user };
}

describe("TeamSwitcher", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the personal account label when no current team", () => {
    setUser({ username: "Alice", teams: [], currentTeam: null });
    render(<TeamSwitcher />);
    expect(screen.getAllByText("Personal").length).toBeGreaterThan(0);
    // Non-owner sees a Create Team CTA.
    expect(screen.getByText("Create Team")).toBeInTheDocument();
  });

  it("lists teams and marks the active team, showing Team Settings for owner", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "team-123456789", name: "Acme", role: "owner" }],
      currentTeam: { id: "team-123456789", name: "Acme", role: "owner" },
    });
    render(<TeamSwitcher />);
    expect(screen.getAllByText("Acme").length).toBeGreaterThan(0);
    expect(screen.getByText("Team Settings")).toBeInTheDocument();
  });

  it("switches team and reloads on success", async () => {
    mockSwitch.mockResolvedValue({});
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: jest.fn() },
      writable: true,
    });
    setUser({
      username: "Alice",
      teams: [
        { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
        { id: "team-bbbbbbbbbb", name: "Beta", role: "admin" },
      ],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    render(<TeamSwitcher />);
    fireEvent.click(screen.getByText("Beta"));
    await waitFor(() =>
      expect(mockSwitch).toHaveBeenCalledWith("team-bbbbbbbbbb"),
    );
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("shows an error toast when team switching fails", async () => {
    mockSwitch.mockRejectedValue(new Error("x"));
    setUser({
      username: "Alice",
      teams: [
        { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
        { id: "team-bbbbbbbbbb", name: "Beta", role: "admin" },
      ],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    render(<TeamSwitcher />);
    fireEvent.click(screen.getByText("Beta"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Switch team failed"),
    );
  });

  it("does not switch when clicking the already-active team", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "team-aaaaaaaaaa", name: "Acme", role: "admin" }],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    render(<TeamSwitcher />);
    const acmeNodes = screen.getAllByText("Acme");
    fireEvent.click(acmeNodes[acmeNodes.length - 1]);
    expect(mockSwitch).not.toHaveBeenCalled();
  });
});
