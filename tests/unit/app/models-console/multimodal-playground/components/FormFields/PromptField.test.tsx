import { fireEvent, render, screen } from "@testing-library/react";
import { PromptField } from "@/app/models-console/multimodal-playground/components/FormFields/PromptField";

describe("PromptField", () => {
  it("renders default label, value and char counter", () => {
    render(<PromptField value="hello" onChange={jest.fn()} />);
    expect(screen.getByText("prompt")).toBeInTheDocument();
    expect(screen.getByText("5 / 2000")).toBeInTheDocument();
  });

  it("forwards typed changes", () => {
    const onChange = jest.fn();
    render(<PromptField value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "a cat" },
    });
    expect(onChange).toHaveBeenCalledWith("a cat");
  });

  it("shows an error message when error is provided", () => {
    render(<PromptField value="" onChange={jest.fn()} error="too short" />);
    expect(screen.getByText("too short")).toBeInTheDocument();
  });
});
