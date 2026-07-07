import { render, screen } from "@testing-library/react";
import {
  Source,
  Sources,
  SourcesTrigger,
} from "@/components/ai-elements/source";

describe("Source / Sources", () => {
  it("Sources renders its content", () => {
    render(
      <Sources>
        <span>inner</span>
      </Sources>,
    );
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("SourcesTrigger shows the default count label", () => {
    render(
      <Sources>
        <SourcesTrigger count={3} />
      </Sources>,
    );
    expect(screen.getByText("Used 3 sources")).toBeInTheDocument();
  });

  it("SourcesTrigger renders custom children over the default", () => {
    render(
      <Sources>
        <SourcesTrigger count={1}>Custom trigger</SourcesTrigger>
      </Sources>,
    );
    expect(screen.getByText("Custom trigger")).toBeInTheDocument();
    expect(screen.queryByText("Used 1 sources")).not.toBeInTheDocument();
  });

  it("Source renders a link with title and target blank", () => {
    render(<Source href="https://ex.com" title="Example" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://ex.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByText("Example")).toBeInTheDocument();
  });

  it("Source renders custom children", () => {
    render(
      <Source href="#">
        <span>custom-source</span>
      </Source>,
    );
    expect(screen.getByText("custom-source")).toBeInTheDocument();
  });
});
