import * as React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/components/LinkWithAuthority", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { Info } from "@/app/affiliate-new/components/Info";

describe("affiliate-new Info", () => {
  it("renders the section heading and benefit cards", () => {
    render(<Info />);
    expect(
      screen.getByText("Why Join the Affiliate Program"),
    ).toBeInTheDocument();
    expect(screen.getByText("Unique AI Cloud Platform")).toBeInTheDocument();
    expect(screen.getByText("High conversion rate")).toBeInTheDocument();
    expect(screen.getByText("Dedicated Support")).toBeInTheDocument();
  });
});
