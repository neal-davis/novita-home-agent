import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const joinTeamByInvite = jest.fn();
jest.mock("@/api/team", () => ({
  joinTeamByInvite: (...a: unknown[]) => joinTeamByInvite(...a),
}));

const cookieSet = jest.fn();
const cookieRemove = jest.fn();
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: {
    set: (...a: unknown[]) => cookieSet(...a),
    remove: (...a: unknown[]) => cookieRemove(...a),
  },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/team-invite",
}));

import CurrentAccount from "@/app/team-invite/components/CurrentAccount";

function renderIt() {
  return render(
    <CurrentAccount
      email="me@x.com"
      teamName="Core"
      role="admin"
      inviteToken="tok"
    />,
  );
}

describe("team-invite CurrentAccount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the invite details with the mapped role label", () => {
    renderIt();
    expect(screen.getByText("me@x.com")).toBeInTheDocument();
    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("joins the team, stores the token, and navigates", async () => {
    joinTeamByInvite.mockResolvedValueOnce({ token: "new-token" });
    renderIt();
    fireEvent.click(screen.getByText("Join Team"));
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(joinTeamByInvite).toHaveBeenCalledWith("tok");
    expect(cookieSet).toHaveBeenCalledWith(
      "token",
      "new-token",
      expect.any(Object),
    );
    expect(cookieRemove).toHaveBeenCalledWith("invite_token");
  });

  it("stops loading without navigating when joining fails", async () => {
    joinTeamByInvite.mockRejectedValueOnce(new Error("nope"));
    renderIt();
    fireEvent.click(screen.getByText("Join Team"));
    await waitFor(() => expect(joinTeamByInvite).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
