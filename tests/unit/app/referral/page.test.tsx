import { render, screen } from "@testing-library/react";

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: () => ({ get: mockGet }),
}));

jest.mock("@/app/components/header/Header", () => ({
  __esModule: true,
  default: ({ page }: { page?: string }) => (
    <div data-testid="header">header {page || "anon"}</div>
  ),
}));
jest.mock("@/app/components/footer/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer">footer</div>,
}));
jest.mock("@/app/referral/components/Main", () => ({
  __esModule: true,
  default: () => <div data-testid="main">main</div>,
}));
jest.mock("@/app/referral/components/ActivityEndedModal", () => ({
  __esModule: true,
  default: ({ show }: { show: boolean }) => (
    <div data-testid="ended-modal">{String(show)}</div>
  ),
}));

import Page, { metadata } from "@/app/referral/page";

describe("referral/page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the console header when a token cookie is present", () => {
    mockGet.mockReturnValue({ value: "tok-1" });
    render(<Page />);
    expect(screen.getByTestId("header")).toHaveTextContent("header console");
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("ended-modal")).toHaveTextContent("true");
  });

  it("renders the anonymous header when there is no token", () => {
    mockGet.mockReturnValue(undefined);
    render(<Page />);
    expect(screen.getByTestId("header")).toHaveTextContent("header anon");
  });

  it("exposes referral campaign metadata", () => {
    expect(metadata.title).toContain("$10");
    expect(metadata.openGraph?.siteName).toBe("Novita AI");
  });
});
