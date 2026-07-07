import { render, screen } from "@testing-library/react";
import EmptyPageLoading from "@/components/ui/standard/empty-page-loading";

describe("EmptyPageLoading", () => {
  it("renders the loading text and spinner", () => {
    const { container } = render(<EmptyPageLoading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
