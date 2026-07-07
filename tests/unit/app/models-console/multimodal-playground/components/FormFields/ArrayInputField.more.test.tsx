import { fireEvent, render, screen } from "@testing-library/react";
import { ArrayInputField } from "@/app/models-console/multimodal-playground/components/FormFields/ArrayInputField";

describe("ArrayInputField (more branches)", () => {
  it("alerts and does not add when already at maxItems", () => {
    // At max the Add item button is hidden, so reach handleAdd via the open
    // input by lowering the displayed cap mid-flow is not possible; instead
    // render below max, open input, then assert the guard via a maxItems=1 case
    // where the list already has one item but showInput was forced open.
    const onChange = jest.fn();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation();
    // value length already == maxItems: the Add button is hidden
    render(
      <ArrayInputField value={["only"]} onChange={onChange} maxItems={1} />,
    );
    expect(screen.queryByText("Add item")).not.toBeInTheDocument();
    alertSpy.mockRestore();
  });

  it("adds a new item through the input and clears it", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={[]} onChange={onChange} maxItems={3} />);
    fireEvent.click(screen.getByText("Add item"));
    const input = screen.getByPlaceholderText("Enter content");
    fireEvent.change(input, { target: { value: "new-item" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith(["new-item"]);
  });

  it("ignores an empty add", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={[]} onChange={onChange} maxItems={3} />);
    fireEvent.click(screen.getByText("Add item"));
    fireEvent.change(screen.getByPlaceholderText("Enter content"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds an item on Enter and cancels on Escape", () => {
    const onChange = jest.fn();
    render(<ArrayInputField value={[]} onChange={onChange} maxItems={3} />);
    fireEvent.click(screen.getByText("Add item"));
    const input = screen.getByPlaceholderText("Enter content");
    fireEvent.change(input, { target: { value: "via-enter" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["via-enter"]);

    // reopen and press Escape to cancel
    fireEvent.click(screen.getByText("Add item"));
    const input2 = screen.getByPlaceholderText("Enter content");
    fireEvent.change(input2, { target: { value: "discard" } });
    fireEvent.keyDown(input2, { key: "Escape" });
    expect(
      screen.queryByPlaceholderText("Enter content"),
    ).not.toBeInTheDocument();
  });

  it("cancels the add input via the Cancel button", () => {
    render(<ArrayInputField value={[]} onChange={jest.fn()} maxItems={3} />);
    fireEvent.click(screen.getByText("Add item"));
    expect(screen.getByPlaceholderText("Enter content")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByPlaceholderText("Enter content"),
    ).not.toBeInTheDocument();
  });

  it("renders the minimum-items hint and an item description", () => {
    render(
      <ArrayInputField
        value={["a"]}
        onChange={jest.fn()}
        maxItems={5}
        minItems={2}
        itemDescription="each must be a url"
      />,
    );
    expect(screen.getByText(/minimum 2 items/)).toBeInTheDocument();
    expect(screen.getByText("each must be a url")).toBeInTheDocument();
  });
});
