import { render, screen } from "@testing-library/react";
import Page from "@/app/sandbox-console/usage/page";

jest.mock("@/app/sandbox-console/usage/section", () => ({
  __esModule: true,
  default: () => <div data-testid="usage-section">usage section</div>,
}));

describe("sandbox-console usage page", () => {
  it("renders the usage Section", () => {
    render(<Page />);
    expect(screen.getByTestId("usage-section")).toBeInTheDocument();
    expect(screen.getByText("usage section")).toBeInTheDocument();
  });
});
