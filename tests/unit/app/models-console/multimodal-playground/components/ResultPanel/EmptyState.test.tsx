import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/app/models-console/multimodal-playground/components/ResultPanel/EmptyState";

describe("EmptyState", () => {
  it("renders the empty-state guidance text and image", () => {
    render(<EmptyState />);
    expect(
      screen.getByText("Set parameters and click Generate to get results"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Empty state")).toBeInTheDocument();
  });
});
