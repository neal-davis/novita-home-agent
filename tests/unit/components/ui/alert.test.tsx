import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

describe("Alert", () => {
  it("renders with role alert and default variant", () => {
    render(<Alert>Body</Alert>);
    const el = screen.getByRole("alert");
    expect(el).toHaveTextContent("Body");
    expect(el).toHaveClass("bg-background");
  });

  it("applies destructive variant classes", () => {
    render(<Alert variant="destructive">D</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });

  it("renders title and description", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Details here</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Details here")).toBeInTheDocument();
  });

  it("merges custom className on alert", () => {
    render(<Alert className="my-alert">X</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("my-alert");
  });
});
