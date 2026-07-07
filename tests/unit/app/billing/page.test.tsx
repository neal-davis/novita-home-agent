import { render, screen } from "@testing-library/react";
import BillingPageContent from "@/app/billing/BillingPageContent";

jest.mock("@/app/billing/overview", () => ({
  __esModule: true,
  default: () => <div data-testid="overview" />,
}));
jest.mock("@/app/billing/billing-transactions", () => ({
  __esModule: true,
  default: () => <div data-testid="transactions" />,
}));
jest.mock("@/app/billing/billing-details", () => ({
  __esModule: true,
  default: () => <div data-testid="details" />,
}));
jest.mock("@/app/billing/balance-warning", () => ({
  __esModule: true,
  default: () => <div data-testid="balance-warning" />,
}));
jest.mock("@/app/billing/budgets", () => ({
  __esModule: true,
  default: () => <div data-testid="budgets" />,
}));
jest.mock("@/app/billing/coding-plan", () => ({
  __esModule: true,
  default: () => <div data-testid="coding-plan" />,
}));

const renderPage = async (section?: string) => {
  return render(<BillingPageContent section={section} />);
};

describe("billing Page section router", () => {
  it.each([
    ["transactions", "transactions"],
    ["details", "details"],
    ["coding-plan", "coding-plan"],
    ["balance-warning", "balance-warning"],
    ["budgets", "budgets"],
  ])("renders the %s section", async (section, testId) => {
    await renderPage(section);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it("defaults to the overview when section is unknown or missing", async () => {
    await renderPage(undefined);
    expect(screen.getByTestId("overview")).toBeInTheDocument();
  });
});
