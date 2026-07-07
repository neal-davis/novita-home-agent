import { render, screen } from "@testing-library/react";

jest.mock("@/app/settings/team/index", () => ({
  __esModule: true,
  default: () => <div data-testid="team-root">team root</div>,
}));

import TeamPage, { metadata } from "@/app/settings/team/page";

describe("settings/team page", () => {
  it("renders the Team component", () => {
    render(<TeamPage />);
    expect(screen.getByTestId("team-root")).toBeInTheDocument();
  });

  it("exports the page metadata title", () => {
    expect(metadata.title).toBe("Team | Novita AI");
  });
});
