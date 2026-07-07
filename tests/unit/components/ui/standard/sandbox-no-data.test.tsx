import { render, screen } from "@testing-library/react";
import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data";

describe("SandboxNoData", () => {
  it("renders the default 'No Data' text and image", () => {
    render(<SandboxNoData />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByAltText("no data")).toBeInTheDocument();
  });

  it("renders custom tips", () => {
    render(<SandboxNoData tips="Nothing yet" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });
});
