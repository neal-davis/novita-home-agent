import * as React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ user: { email: "me@x.com" } }),
}));

jest.mock("@/app/affiliate/LinkText", () => ({
  LinkText: ({ children }: any) => <span>{children}</span>,
}));

import { ClientNotice } from "@/app/affiliate/ClientNotice";
import { Context } from "@/app/affiliate/ClientWrapper";

function renderWith(affiliate: any) {
  return render(
    <Context.Provider value={{ affiliate, loading: false } as never}>
      <ClientNotice />
    </Context.Provider>,
  );
}

describe("affiliate ClientNotice", () => {
  it("renders the email and generated password", () => {
    renderWith({ password: "secretpw" });
    expect(screen.getByText(/me@x.com/)).toBeInTheDocument();
    expect(screen.getByText(/secretpw/)).toBeInTheDocument();
  });

  it("shows ungenerated when no password yet", () => {
    renderWith({ password: "" });
    expect(screen.getByText(/ungenerated/)).toBeInTheDocument();
  });
});
