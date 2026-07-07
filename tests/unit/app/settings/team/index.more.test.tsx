import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockState = {
  user: {
    uuid: "u-1",
    currentTeam: { name: "Acme", role: "admin" } as {
      name: string;
      role: string;
    } | null,
    teamOwnerUuid: "owner-uuid",
  },
};
const mockDispatch = jest.fn();

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => true,
}));

jest.mock("@/api/team", () => ({ setTeamName: jest.fn() }));

jest.mock("@/store/slice/userSlice", () => ({
  fetchUserInfo: jest.fn(() => ({ type: "fetchUserInfo" })),
  TeamRole: {
    owner: "owner",
    admin: "admin",
    developer: "developer",
    basic: "basic",
    billing: "billing",
  },
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
  }) => <input value={value} onChange={onChange} />,
}));

jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <button type="button">copy:{content}</button>
  ),
}));

jest.mock("@/app/settings/team/Upgrade", () => ({
  __esModule: true,
  default: () => <div data-testid="upgrade">upgrade</div>,
}));

jest.mock("@/app/settings/team/MemberList", () => ({
  __esModule: true,
  default: ({ setMemberCount }: { setMemberCount: (n: number) => void }) => {
    setMemberCount(5);
    return <div data-testid="member-list">members</div>;
  },
}));

import Team from "@/app/settings/team/index";
import { setTeamName } from "@/api/team";
import { message } from "@/components/ui/standard/notify";

const mockSetTeamName = setTeamName as jest.Mock;

describe("settings/team index (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.user = {
      uuid: "u-1",
      currentTeam: { name: "Acme", role: "admin" },
      teamOwnerUuid: "owner-uuid",
    };
  });

  it("surfaces an error toast when saving the team name fails", async () => {
    mockSetTeamName.mockRejectedValueOnce(new Error("nope"));
    const { container } = render(<Team />);

    fireEvent.click(
      container
        .querySelector(".lucide-pencil-line")
        ?.closest("button") as Element,
    );
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "NewName" } });
    fireEvent.click(
      container.querySelector(".lucide-check")?.closest("button") as Element,
    );

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Set team name failed"),
    );
    // Dispatch should NOT fire on the failure path
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("cancels editing the team name and restores the display name", () => {
    const { container } = render(<Team />);

    fireEvent.click(
      container
        .querySelector(".lucide-pencil-line")
        ?.closest("button") as Element,
    );
    expect(container.querySelector("input")).toBeInTheDocument();

    // The X button cancels editing
    fireEvent.click(
      container.querySelector(".lucide-x")?.closest("button") as Element,
    );
    expect(container.querySelector("input")).not.toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("hides the team-name edit pencil for non-admin/owner roles", () => {
    mockState.user.currentTeam = { name: "Acme", role: "developer" };
    const { container } = render(<Team />);
    expect(container.querySelector(".lucide-pencil-line")).toBeNull();
  });

  it("dispatches a user-info refresh after a successful save", async () => {
    mockSetTeamName.mockResolvedValueOnce({});
    const { container } = render(<Team />);

    fireEvent.click(
      container
        .querySelector(".lucide-pencil-line")
        ?.closest("button") as Element,
    );
    fireEvent.change(container.querySelector("input") as HTMLInputElement, {
      target: { value: "Renamed" },
    });
    fireEvent.click(
      container.querySelector(".lucide-check")?.closest("button") as Element,
    );

    await waitFor(() =>
      expect(mockSetTeamName).toHaveBeenCalledWith("Renamed"),
    );
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
    expect(screen.getByText("Renamed")).toBeInTheDocument();
  });
});
