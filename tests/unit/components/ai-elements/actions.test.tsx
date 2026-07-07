import { fireEvent, render, screen } from "@testing-library/react";
import { Action, Actions } from "@/components/ai-elements/actions";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

describe("Actions / Action", () => {
  it("renders the action button with children", () => {
    render(<Action label="Copy">icon</Action>);
    expect(screen.getByRole("button")).toHaveTextContent("icon");
  });

  it("includes a screen-reader label", () => {
    render(<Action label="Save">x</Action>);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("falls back to tooltip text for the sr-only label", () => {
    render(<Action tooltip="Tip text">x</Action>);
    expect(screen.getByText("Tip text")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = jest.fn();
    render(
      <Action label="C" onClick={onClick}>
        x
      </Action>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("Actions renders its children", () => {
    render(
      <Actions data-testid="acts">
        <Action label="a">A</Action>
        <Action label="b">B</Action>
      </Actions>,
    );
    expect(screen.getByTestId("acts")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
