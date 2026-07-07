import * as React from "react";
import { render, screen } from "@testing-library/react";
import FAQ from "@/app/referral/components/FAQ";

describe("referral FAQ", () => {
  it("renders all FAQ questions and the support link", () => {
    render(<FAQ />);
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(
      screen.getByText("How much can I earn in vouchers?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Are there any usage limits with the vouchers?"),
    ).toBeInTheDocument();
    expect(screen.getByText("How do I use the voucher?")).toBeInTheDocument();
    expect(screen.getByText("support@novita.ai")).toBeInTheDocument();
  });
});
