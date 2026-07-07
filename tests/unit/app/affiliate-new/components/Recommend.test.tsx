import * as React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/components/LinkWithAuthority", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { Recommend } from "@/app/affiliate-new/components/Recommend";

describe("affiliate-new Recommend", () => {
  it("renders the commission headline and apply cta", () => {
    render(<Recommend />);
    expect(screen.getByText(/Recommend Novita\./)).toBeInTheDocument();
    expect(
      screen.getByText("Earn 10% commission on every referral for 180 days."),
    ).toBeInTheDocument();
    expect(screen.getByText("Apply New")).toBeInTheDocument();
  });
});
