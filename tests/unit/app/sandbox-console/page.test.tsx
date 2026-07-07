import { render, screen } from "@testing-library/react";
import Page from "@/app/sandbox-console/page";

jest.mock("@/app/sandbox-console/view/page", () => ({
  __esModule: true,
  default: () => <div data-testid="sandbox-view">sandbox view</div>,
}));

describe("sandbox-console root page", () => {
  it("renders the sandbox view", () => {
    render(<Page />);
    expect(screen.getByTestId("sandbox-view")).toBeInTheDocument();
    expect(screen.getByText("sandbox view")).toBeInTheDocument();
  });
});
