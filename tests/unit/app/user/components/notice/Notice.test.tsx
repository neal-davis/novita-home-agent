import * as React from "react";
import { render, screen } from "@testing-library/react";

let mockTeamName: string | undefined;
jest.mock("@/store", () => ({
  useAppSelector: (sel: any) =>
    sel({ user: { teamInvite: { teamName: mockTeamName } } }),
}));

import { Notice } from "@/app/user/components/notice/Notice";

describe("user Notice", () => {
  it("renders the default title and description when no invite", () => {
    mockTeamName = undefined;
    render(<Notice title="Free credits" description="lots of tokens" />);
    expect(screen.getByText("Free credits")).toBeInTheDocument();
    expect(screen.getByText("lots of tokens")).toBeInTheDocument();
  });

  it("renders the team invite message when a team invite exists", () => {
    mockTeamName = "Core Team";
    render(<Notice />);
    expect(screen.getByText("Core Team")).toBeInTheDocument();
  });
});
