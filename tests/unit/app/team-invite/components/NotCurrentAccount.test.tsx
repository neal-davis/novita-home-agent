import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/team-invite",
}));

const mockDispatch = jest.fn();
const logout = jest.fn(() => ({ type: "logout" }));
jest.mock("@/store", () => ({ useAppDispatch: () => mockDispatch }));
jest.mock("@/store/slice/userSlice", () => ({
  logout: (...a: unknown[]) => logout(...a),
}));

import NotCurrentAccount from "@/app/team-invite/components/NotCurrentAccount";

describe("team-invite NotCurrentAccount", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the unauthorized message", () => {
    render(<NotCurrentAccount inviteToken="tok" />);
    expect(screen.getByText("Unauthorized Account")).toBeInTheDocument();
  });

  it("logs out and redirects to login with the invite token", () => {
    render(<NotCurrentAccount inviteToken="tok" />);
    fireEvent.click(screen.getByText("Log out"));
    expect(logout).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("invite_token=tok"),
    );
  });
});
