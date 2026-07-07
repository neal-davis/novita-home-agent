import { render, screen } from "@testing-library/react";

jest.mock("@/app/team-invite/components/Main", () => ({
  __esModule: true,
  default: () => <div data-testid="main">main</div>,
}));
jest.mock("@/app/components/header/partials/Logo", () => ({
  Logo: () => <div data-testid="logo">logo</div>,
}));

import Page from "@/app/team-invite/page";

describe("team-invite/page", () => {
  it("renders the logo and the invite Main panel", () => {
    render(<Page />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
  });
});
