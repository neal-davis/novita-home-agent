import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/app/components/LinkWithAuthority", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("@/app/mainpage/components/Partners", () => ({
  __esModule: true,
  default: () => <div data-testid="mainpage-partners" />,
}));

import { Header } from "@/app/affiliate-new/components/Header";

const base = {
  affiliatePortalUrl: "https://portal",
  loginUrl: "https://login",
  onLoginStart: jest.fn(),
};

describe("affiliate-new Header", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the Become an Affiliate CTA and login card for logged-out users", () => {
    render(<Header {...base} isLoggedIn={false} isTeamNonOwner={false} />);
    expect(screen.getByText("Become an Affiliate")).toBeInTheDocument();
    expect(
      screen.getByText("Already have a Novita account?"),
    ).toBeInTheDocument();
  });

  it("calls onLoginStart when the Get Started link is clicked", () => {
    render(<Header {...base} isLoggedIn={false} isTeamNonOwner={false} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(base.onLoginStart).toHaveBeenCalled();
  });

  it("shows the Affiliate Login CTA for logged-in users without the login card", () => {
    render(<Header {...base} isLoggedIn={true} isTeamNonOwner={false} />);
    expect(screen.getByText("Affiliate Login")).toBeInTheDocument();
    expect(
      screen.queryByText("Already have a Novita account?"),
    ).not.toBeInTheDocument();
  });

  it("shows the Team Owner Required CTA for team non-owners", () => {
    render(<Header {...base} isLoggedIn={true} isTeamNonOwner={true} />);
    expect(screen.getByText("Team Owner Required")).toBeInTheDocument();
    expect(screen.getByText("Team Owner required")).toBeInTheDocument();
  });
});
