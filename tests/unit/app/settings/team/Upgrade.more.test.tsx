import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockState = { user: { username: "alice" } };
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));

const upgradeToTeamAccount = jest.fn();
jest.mock("@/api/team", () => ({
  upgradeToTeamAccount: (...a: unknown[]) => upgradeToTeamAccount(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
}));

import Upgrade from "@/app/settings/team/Upgrade";

describe("Upgrade (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the terms and privacy links inside the upgrade dialog", () => {
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("closes the upgrade dialog via Cancel without calling the API", () => {
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    expect(screen.getByDisplayValue("alice's Team")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByDisplayValue("alice's Team")).not.toBeInTheDocument();
    expect(upgradeToTeamAccount).not.toHaveBeenCalled();
  });

  it("reloads the window after a successful upgrade", async () => {
    upgradeToTeamAccount.mockResolvedValueOnce({});
    const reload = jest.fn();
    const original = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...original, reload },
    });

    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    fireEvent.click(screen.getByText("Upgrade"));

    await waitFor(() => expect(reload).toHaveBeenCalled());

    Object.defineProperty(window, "location", {
      configurable: true,
      value: original,
    });
  });

  it("falls back to an empty default team name when username is missing", () => {
    mockState.user.username = "" as unknown as string;
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    expect(screen.getByDisplayValue("'s Team")).toBeInTheDocument();
    mockState.user.username = "alice";
  });
});
