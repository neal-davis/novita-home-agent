import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/app/models-console/multimodal-playground/components/ResultPanel/StatusBadge";

describe("StatusBadge", () => {
  it("shows 'Pending' when idle with no result", () => {
    render(<StatusBadge status="idle" result={null} category="image_gen" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows 'Example result' when idle but a result type exists", () => {
    render(
      <StatusBadge
        status="idle"
        result={{ images: [{ image_url: "x" }] } as any}
        category="image_gen"
      />,
    );
    expect(screen.getByText("Example result")).toBeInTheDocument();
  });

  it("renders the submitting label for creating", () => {
    render(
      <StatusBadge status="creating" result={null} category="image_gen" />,
    );
    expect(screen.getByText("Submitting task...")).toBeInTheDocument();
  });

  it("renders the generating label for polling", () => {
    render(<StatusBadge status="polling" result={null} category="image_gen" />);
    expect(screen.getByText("Generating...")).toBeInTheDocument();
  });

  it("renders success and error labels", () => {
    const { rerender } = render(
      <StatusBadge status="success" result={null} category="image_gen" />,
    );
    expect(screen.getByText("Success")).toBeInTheDocument();

    rerender(<StatusBadge status="error" result={null} category="image_gen" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
