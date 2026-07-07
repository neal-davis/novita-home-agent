import { render, screen } from "@testing-library/react";
import { FieldLabel } from "@/app/models-console/multimodal-playground/components/FormFields/FieldLabel";

describe("FieldLabel", () => {
  it("renders the label text", () => {
    render(<FieldLabel label="Width" />);
    expect(screen.getByText("Width")).toBeInTheDocument();
  });

  it("shows a required asterisk when required", () => {
    render(<FieldLabel label="Width" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("omits the asterisk when not required", () => {
    render(<FieldLabel label="Width" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders an info tooltip trigger when a description is given", () => {
    const { container } = render(
      <FieldLabel label="Width" description="pixel width" />,
    );
    // Info icon (lucide) renders an svg trigger
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders no tooltip icon without a description", () => {
    const { container } = render(<FieldLabel label="Width" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
