import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { ClientLink } from "@/app/affiliate/ClientLink";
import { Context } from "@/app/affiliate/ClientWrapper";

function renderWith(affiliate: any) {
  return render(
    <Context.Provider value={{ affiliate, loading: false } as never}>
      <ClientLink />
    </Context.Provider>,
  );
}

describe("affiliate ClientLink", () => {
  it("renders the referral link when present", () => {
    renderWith({ referralLink: "https://ref/abc" });
    expect(screen.getByText(/https:\/\/ref\/abc/)).toBeInTheDocument();
  });

  it("shows ungenerated when no referral link exists", () => {
    renderWith({ referralLink: "" });
    expect(screen.getByText(/ungenerated/)).toBeInTheDocument();
  });

  it("opens the blog when Learn More is clicked", () => {
    const open = jest.fn();
    window.open = open as never;
    renderWith({ referralLink: "" });
    fireEvent.click(screen.getByText("Learn More"));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("blogs"),
      "_blank",
    );
  });
});
