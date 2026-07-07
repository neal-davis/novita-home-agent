import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/i18n/provider", () => ({ useI18nSubscription: jest.fn() }));

import { Questions } from "@/app/affiliate-new/components/Questions";

describe("affiliate-new Questions", () => {
  it("renders the heading and all FAQ titles collapsed", () => {
    render(<Questions />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(
      screen.getByText("How does the Novita affiliate program work?"),
    ).toBeInTheDocument();
    // answer hidden until expanded
    expect(
      screen.queryByText(/you'll get a unique affiliate link/),
    ).not.toBeInTheDocument();
  });

  it("expands and collapses an answer on click", () => {
    render(<Questions />);
    const title = screen.getByText(
      "How does the Novita affiliate program work?",
    );
    fireEvent.click(title);
    expect(
      screen.getByText(/you'll get a unique affiliate link/),
    ).toBeInTheDocument();
    fireEvent.click(title);
    expect(
      screen.queryByText(/you'll get a unique affiliate link/),
    ).not.toBeInTheDocument();
  });
});
