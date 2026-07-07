import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockState = {
  user: {
    uuid: "",
    currentTeam: null as { name: string; role: string } | null,
    teamOwnerUuid: "owner-uuid",
  },
};
const mockDispatch = jest.fn();
let mockPermission = true;

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockPermission,
}));

jest.mock("@/api/team", () => ({ setTeamName: jest.fn() }));

jest.mock("@/store/slice/userSlice", () => ({
  // Self-contained mock — requireActual triggers a circular-import TDZ here.
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

import Team, { genRoleCards } from "@/app/settings/team/index";
import { setTeamName } from "@/api/team";

const mockSetTeamName = setTeamName as jest.Mock;

describe("settings/team index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.user = {
      uuid: "",
      currentTeam: null,
      teamOwnerUuid: "owner-uuid",
    };
    mockPermission = true;
  });

  it("genRoleCards returns the four assignable roles", () => {
    const cards = genRoleCards();
    expect(cards.map((c) => c.value)).toEqual([
      "admin",
      "developer",
      "basic",
      "billing",
    ]);
    expect(cards[0].title).toBe("Admin");
  });

  it("shows skeletons while no team and no uuid", () => {
    render(<Team />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("upgrade")).not.toBeInTheDocument();
  });

  it("shows the Upgrade prompt when no team but a uuid exists", () => {
    mockState.user.uuid = "u-1";
    render(<Team />);
    expect(screen.getByTestId("upgrade")).toBeInTheDocument();
  });

  it("renders team info and member list for an owner team", () => {
    mockState.user.uuid = "u-1";
    mockState.user.currentTeam = { name: "Acme", role: "owner" };
    render(<Team />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByTestId("member-list")).toBeInTheDocument();
    // Member count rendered because permission is granted
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("edits and saves the team name", async () => {
    mockSetTeamName.mockResolvedValue({});
    mockState.user.uuid = "u-1";
    mockState.user.currentTeam = { name: "Acme", role: "admin" };
    const { container } = render(<Team />);

    // Click the pencil edit button (first button without text inside team info)
    const editButton = container
      .querySelector(".lucide-pencil-line")
      ?.closest("button");
    fireEvent.click(editButton as Element);

    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "NewName" } });

    const saveBtn = container.querySelector(".lucide-check")?.closest("button");
    fireEvent.click(saveBtn as Element);

    await waitFor(() =>
      expect(mockSetTeamName).toHaveBeenCalledWith("NewName"),
    );
  });

  it("hides member count when permission is denied", () => {
    mockPermission = false;
    mockState.user.uuid = "u-1";
    mockState.user.currentTeam = { name: "Acme", role: "basic" };
    render(<Team />);
    expect(screen.queryByText("Team Member")).not.toBeInTheDocument();
  });
});
