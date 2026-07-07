import * as React from "react";
import { render, screen } from "@testing-library/react";

import { ClientConversions } from "@/app/affiliate/ClientConversions";
import { Context } from "@/app/affiliate/ClientWrapper";

describe("affiliate ClientConversions", () => {
  it("renders the commission and invites values from context", () => {
    render(
      <Context.Provider
        value={
          { affiliate: { balance: 42, invites: 7 }, loading: false } as never
        }
      >
        <ClientConversions />
      </Context.Provider>,
    );
    expect(screen.getByText("$42")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Commission Earned ($)")).toBeInTheDocument();
  });
});
