import { fireEvent, render, screen } from "@testing-library/react";
import { ArrayInputField } from "@/app/models-console/multimodal-playground/components/FormFields/ArrayInputField";

describe("ArrayInputField", () => {
  it("renders existing items with the current/max counter", () => {
    render(
      <ArrayInputField
        label="urls"
        value={["a", "b"]}
        onChange={jest.fn()}
        maxItems={5}
      />,
    );
    expect(screen.getByDisplayValue("a")).toBeInTheDocument();
    expect(screen.getByDisplayValue("b")).toBeInTheDocument();
    expect(screen.getByText("2/5 items")).toBeInTheDocument();
  });

  it("updates an existing item via its input", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={["a"]} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("a"), {
      target: { value: "z" },
    });
    expect(onChange).toHaveBeenCalledWith(["z"]);
  });

  it("removes an item", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={["a", "b"]} onChange={onChange} />);
    fireEvent.click(screen.getAllByTitle("Remove")[0]);
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("adds a new item through the add flow", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add item"));
    const input = screen.getByPlaceholderText("Enter content");
    fireEvent.change(input, { target: { value: "new" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith(["new"]);
  });

  it("ignores adding an empty/whitespace value", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add item"));
    fireEvent.change(screen.getByPlaceholderText("Enter content"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("cancels the add input", () => {
    render(<ArrayInputField value={[]} onChange={jest.fn()} />);
    fireEvent.click(screen.getByText("Add item"));
    expect(screen.getByPlaceholderText("Enter content")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByPlaceholderText("Enter content"),
    ).not.toBeInTheDocument();
  });

  it("hides the add button when maxItems is reached", () => {
    render(<ArrayInputField value={["a"]} onChange={jest.fn()} maxItems={1} />);
    expect(screen.queryByText("Add item")).not.toBeInTheDocument();
  });

  it("shows a minimum-items hint and an error", () => {
    render(
      <ArrayInputField
        value={["a"]}
        onChange={jest.fn()}
        minItems={2}
        error="too few"
      />,
    );
    expect(screen.getByText(/minimum 2 items/)).toBeInTheDocument();
    expect(screen.getByText("too few")).toBeInTheDocument();
  });
});
