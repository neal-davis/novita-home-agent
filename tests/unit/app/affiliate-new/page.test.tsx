import { render, screen } from "@testing-library/react";

jest.mock("@/app/affiliate-new/components/AffiliateNewPage", () => ({
  AffiliateNewPage: () => <div data-testid="affiliate-new-page">page</div>,
}));

import AffiliateNew from "@/app/affiliate-new/page";

describe("affiliate-new/page", () => {
  it("renders the AffiliateNewPage component", () => {
    render(<AffiliateNew />);
    expect(screen.getByTestId("affiliate-new-page")).toBeInTheDocument();
  });
});
