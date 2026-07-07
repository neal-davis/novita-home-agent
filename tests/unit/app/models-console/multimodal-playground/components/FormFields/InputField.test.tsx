import { fireEvent, render, screen } from "@testing-library/react";
import { InputField } from "@/app/models-console/multimodal-playground/components/FormFields/InputField";

describe("InputField", () => {
  it("renders default label and forwards typed changes", () => {
    const onChange = jest.fn();
    render(<InputField value="" onChange={onChange} />);
    expect(screen.getByText("input")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" },
    });
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("renders a custom label and placeholder", () => {
    render(
      <InputField
        label="Name"
        value="x"
        onChange={jest.fn()}
        placeholder="type here"
      />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("type here")).toHaveValue("x");
  });

  it("shows an error message when error is set", () => {
    render(<InputField value="" onChange={jest.fn()} error="required" />);
    expect(screen.getByText("required")).toBeInTheDocument();
  });
});
