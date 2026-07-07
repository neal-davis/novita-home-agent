import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders the root with base classes", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("avatar")).toHaveClass("rounded-full");
  });

  it("renders the fallback content", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("merges custom className on root", () => {
    render(
      <Avatar className="ring-x" data-testid="a2">
        <AvatarFallback>x</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId("a2")).toHaveClass("ring-x");
  });
});
