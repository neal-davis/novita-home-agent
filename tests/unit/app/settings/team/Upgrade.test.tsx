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
import { message } from "@/components/ui/standard/notify";

describe("Upgrade", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders benefits and the upgrade entry point", () => {
    render(<Upgrade />);
    expect(screen.getByText("Role-Based Access")).toBeInTheDocument();
    expect(screen.getByText("Centralized Billing")).toBeInTheDocument();
    expect(screen.getByText("Upgrade To Team Account")).toBeInTheDocument();
  });

  it("opens the upgrade dialog with a default team name", () => {
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    const input = screen.getByDisplayValue("alice's Team");
    expect(input).toBeInTheDocument();
  });

  it("submits the upgrade with the entered team name", async () => {
    upgradeToTeamAccount.mockResolvedValueOnce({});
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    fireEvent.change(screen.getByDisplayValue("alice's Team"), {
      target: { value: "New Team" },
    });
    fireEvent.click(screen.getByText("Upgrade"));
    await waitFor(() =>
      expect(upgradeToTeamAccount).toHaveBeenCalledWith("New Team"),
    );
  });

  it("reports an error toast when the upgrade fails", async () => {
    upgradeToTeamAccount.mockRejectedValueOnce(new Error("nope"));
    render(<Upgrade />);
    fireEvent.click(screen.getByText("Upgrade To Team Account"));
    fireEvent.click(screen.getByText("Upgrade"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Upgrade failed"),
    );
  });
});
