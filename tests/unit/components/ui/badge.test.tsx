import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children and default variant classes", () => {
    render(<Badge>New</Badge>);
    const el = screen.getByText("New");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("bg-primary");
  });

  it("applies the destructive variant", () => {
    render(<Badge variant="destructive">Err</Badge>);
    expect(screen.getByText("Err")).toHaveClass("bg-destructive");
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">O</Badge>);
    expect(screen.getByText("O")).toHaveClass("text-foreground");
  });

  it("merges custom className", () => {
    render(<Badge className="custom-x">C</Badge>);
    expect(screen.getByText("C")).toHaveClass("custom-x");
  });

  it("badgeVariants returns secondary classes", () => {
    expect(badgeVariants({ variant: "secondary" })).toContain("bg-secondary");
  });
});
