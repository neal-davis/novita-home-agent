import * as React from "react";
import { render, screen } from "@testing-library/react";
import FirstPage from "@/app/referral/components/FirstPage";

describe("referral FirstPage", () => {
  it("renders the campaign headline and credits copy", () => {
    render(<FirstPage isSubAccount={false} isRelatedGithub={false} />);
    expect(screen.getByText("Give $10,")).toBeInTheDocument();
    expect(screen.getByText("Earn $10")).toBeInTheDocument();
    expect(screen.getByText("In LLM API credits")).toBeInTheDocument();
  });

  it("shows the team-account tip only when related github and sub-account", () => {
    const { rerender } = render(
      <FirstPage isSubAccount={false} isRelatedGithub={true} />,
    );
    expect(
      screen.queryByText(/Only team owners are eligible/),
    ).not.toBeInTheDocument();

    rerender(<FirstPage isSubAccount={true} isRelatedGithub={true} />);
    expect(
      screen.getByText(/Only team owners are eligible/),
    ).toBeInTheDocument();
  });
});
