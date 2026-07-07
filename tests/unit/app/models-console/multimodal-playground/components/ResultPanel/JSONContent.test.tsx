import { render, screen } from "@testing-library/react";
import { JSONContent } from "@/app/models-console/multimodal-playground/components/ResultPanel/JSONContent";

describe("JSONContent", () => {
  it("renders 'Blob result' for a Blob result", () => {
    const blob = new Blob(["x"], { type: "text/plain" });
    render(<JSONContent result={blob as any} />);
    expect(screen.getByText("Blob result")).toBeInTheDocument();
    // no copy button in the blob branch
    expect(
      screen.queryByRole("button", { name: /Copy/ }),
    ).not.toBeInTheDocument();
  });

  it("renders pretty-printed JSON and a copy button for object results", () => {
    render(<JSONContent result={{ status: "ok", value: 1 } as any} />);
    expect(screen.getByRole("button", { name: /Copy/ })).toBeInTheDocument();
    expect(screen.getByText(/"status": "ok"/)).toBeInTheDocument();
  });

  it("renders null as JSON when result is null", () => {
    render(<JSONContent result={null} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });
});
