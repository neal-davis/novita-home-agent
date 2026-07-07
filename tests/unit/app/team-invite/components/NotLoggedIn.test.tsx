import * as React from "react";
import { render, screen } from "@testing-library/react";

import NotLoggedIn from "@/app/team-invite/components/NotLoggedIn";

describe("team-invite NotLoggedIn", () => {
  it("renders the team name and login/signup links with the invite token", () => {
    render(<NotLoggedIn teamName="Core" inviteToken="tok" />);
    expect(screen.getByText("Core")).toBeInTheDocument();
    const login = screen.getByText("Log in").closest("a");
    const signup = screen.getByText("Sign up").closest("a");
    expect(login?.getAttribute("href")).toContain("invite_token=tok");
    expect(signup?.getAttribute("href")).toContain("invite_token=tok");
  });
});
