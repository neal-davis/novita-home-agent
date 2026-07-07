import { render, screen } from "@testing-library/react";

jest.mock("@/app/components/header/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header">header</div>,
}));
jest.mock("@/app/components/footer/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer">footer</div>,
}));
jest.mock("@/app/affiliate-new/components/Info", () => ({
  Info: () => <div data-testid="info">info</div>,
}));
jest.mock("@/app/affiliate-new/components/Partners", () => ({
  Partners: () => <div data-testid="partners">partners</div>,
}));
jest.mock("@/app/affiliate-new/components/Questions", () => ({
  Questions: () => <div data-testid="questions">questions</div>,
}));
jest.mock("@/app/affiliate-new/components/Recommend", () => ({
  Recommend: () => <div data-testid="recommend">recommend</div>,
}));
jest.mock("@/app/affiliate-new/components/AffiliateExperience", () => ({
  AffiliateExperience: () => <div data-testid="experience">experience</div>,
}));

import { AffiliateNewPage } from "@/app/affiliate-new/components/AffiliateNewPage";

describe("AffiliateNewPage", () => {
  it("composes the affiliate landing sections in order", () => {
    render(<AffiliateNewPage />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("experience")).toBeInTheDocument();
    expect(screen.getByTestId("info")).toBeInTheDocument();
    expect(screen.getByTestId("partners")).toBeInTheDocument();
    expect(screen.getByTestId("questions")).toBeInTheDocument();
    expect(screen.getByTestId("recommend")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
