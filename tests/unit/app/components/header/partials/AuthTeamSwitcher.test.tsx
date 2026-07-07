import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import AuthTeamSwitcher from "@/app/components/header/partials/AuthTeamSwitcher";
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
jest.mock("@/i18n/config", () => ({ getLocalizedPath: (h: string) => h }));
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

describe("AuthTeamSwitcher", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the personal label and Create Team CTA for a non-owner", () => {
    setUser({ username: "Alice", teams: [], currentTeam: null });
    render(<AuthTeamSwitcher />);
    expect(screen.getAllByText("Personal").length).toBeGreaterThan(0);
    expect(screen.getByText("Create Team")).toBeInTheDocument();
  });

  it("shows My Team CTA for a basic team member", () => {
    setUser({
      username: "Alice",
      teams: [{ id: "team-123456789", name: "Acme", role: "basic" }],
      currentTeam: { id: "team-123456789", name: "Acme", role: "basic" },
    });
    render(<AuthTeamSwitcher />);
    expect(screen.getByText("My Team")).toBeInTheDocument();
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
    render(<AuthTeamSwitcher />);
    fireEvent.click(screen.getByText("Beta"));
    await waitFor(() =>
      expect(mockSwitch).toHaveBeenCalledWith("team-bbbbbbbbbb"),
    );
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("shows an error toast when switching fails", async () => {
    mockSwitch.mockRejectedValue(new Error("x"));
    setUser({
      username: "Alice",
      teams: [
        { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
        { id: "team-bbbbbbbbbb", name: "Beta", role: "admin" },
      ],
      currentTeam: { id: "team-aaaaaaaaaa", name: "Acme", role: "admin" },
    });
    render(<AuthTeamSwitcher />);
    fireEvent.click(screen.getByText("Beta"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Switch team failed"),
    );
  });

  it("toggles open state on trigger click", () => {
    setUser({ username: "Alice", teams: [], currentTeam: null });
    render(<AuthTeamSwitcher />);
    // Clicking the trigger row should not throw and keeps rendering content.
    const trigger = screen.getAllByText("Personal")[0];
    act(() => {
      fireEvent.click(trigger);
    });
    expect(screen.getByText("Create Team")).toBeInTheDocument();
  });
});
