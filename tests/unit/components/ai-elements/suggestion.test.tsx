import { fireEvent, render, screen } from "@testing-library/react";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

describe("Suggestion", () => {
  it("renders the suggestion text as label by default", () => {
    render(<Suggestion suggestion="Try this" />);
    expect(
      screen.getByRole("button", { name: "Try this" }),
    ).toBeInTheDocument();
  });

  it("calls onClick with the suggestion value", () => {
    const onClick = jest.fn();
    render(<Suggestion suggestion="Hello" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith("Hello");
  });

  it("renders custom children over the suggestion text", () => {
    render(<Suggestion suggestion="raw">Custom label</Suggestion>);
    expect(
      screen.getByRole("button", { name: "Custom label" }),
    ).toBeInTheDocument();
  });

  it("Suggestions wraps children in a scroll area", () => {
    render(
      <Suggestions>
        <Suggestion suggestion="a" />
        <Suggestion suggestion="b" />
      </Suggestions>,
    );
    expect(screen.getByRole("button", { name: "a" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "b" })).toBeInTheDocument();
  });
});
