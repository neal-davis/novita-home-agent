import { render, screen } from "@testing-library/react";
import { ErrorState } from "@/app/models-console/multimodal-playground/components/ResultPanel/ErrorState";

describe("ErrorState", () => {
  it("renders the failure heading and the error message", () => {
    render(<ErrorState error="boom" />);
    expect(screen.getByText("Generation failed")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("renders a trace id when provided", () => {
    render(<ErrorState error="boom" traceId="abc-123" />);
    expect(screen.getByText("Trace ID: abc-123")).toBeInTheDocument();
  });

  it("omits the trace id line when not provided", () => {
    render(<ErrorState error="boom" />);
    expect(screen.queryByText(/Trace ID:/)).not.toBeInTheDocument();
  });
});
