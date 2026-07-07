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

describe("team-invite CurrentAccount (more)", () => {
  const originalLocation = window.location;

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  function setHostname(hostname: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, hostname },
    });
  }

  it("scopes the auth cookie to the novita.ai domain on the prod host", async () => {
    setHostname("app.novita.ai");
    joinTeamByInvite.mockResolvedValueOnce({ token: "new-token" });
    render(
      <CurrentAccount
        email="me@x.com"
        teamName="Core"
        role="admin"
        inviteToken="tok"
      />,
    );
    fireEvent.click(screen.getByText("Join Team"));
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(cookieSet).toHaveBeenCalledWith(
      "token",
      "new-token",
      expect.objectContaining({ domain: ".novita.ai", expires: 7 }),
    );
  });

  it("does not add a domain when not on a novita.ai host", async () => {
    setHostname("localhost");
    joinTeamByInvite.mockResolvedValueOnce({ token: "tk" });
    render(
      <CurrentAccount
        email="me@x.com"
        teamName="Core"
        role="admin"
        inviteToken="tok"
      />,
    );
    fireEvent.click(screen.getByText("Join Team"));
    await waitFor(() => expect(cookieSet).toHaveBeenCalled());
    const opts = cookieSet.mock.calls[0][2];
    expect(opts.domain).toBeUndefined();
    expect(opts.expires).toBe(7);
  });

  it("renders a blank role label for an unknown role", () => {
    render(
      <CurrentAccount
        email="me@x.com"
        teamName="Core"
        role="mystery"
        inviteToken="tok"
      />,
    );
    // unknown role falls back to the " " placeholder, not a mapped label
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.getByText("Core")).toBeInTheDocument();
  });
});
