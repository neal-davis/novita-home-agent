import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders the full composition with text", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("rounded-lg");
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<Card className="extra">x</Card>);
    expect(screen.getByText("x")).toHaveClass("extra");
  });

  it("CardTitle renders as a heading element", () => {
    render(<CardTitle>H</CardTitle>);
    expect(screen.getByText("H").tagName.toLowerCase()).toBe("h6");
  });
});
