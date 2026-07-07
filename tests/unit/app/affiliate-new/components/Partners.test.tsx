import * as React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/app/components/LinkWithAuthority", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import { Partners } from "@/app/affiliate-new/components/Partners";

describe("affiliate-new Partners", () => {
  it("renders the ecosystem heading and integration guide descriptions", () => {
    render(<Partners />);
    expect(
      screen.getByText("Developer Ecosystem Partners"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Novita AI & Hugging Face Integration Guide"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Novita AI & LlamaIndex Integration Guide"),
    ).toBeInTheDocument();
  });

  it("renders eight Learn more links plus the footer cta", () => {
    render(<Partners />);
    expect(screen.getAllByText("Learn more")).toHaveLength(8);
    expect(screen.getByText("learn more")).toBeInTheDocument();
  });
});
