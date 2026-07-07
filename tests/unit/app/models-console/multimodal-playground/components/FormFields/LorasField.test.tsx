import { fireEvent, render, screen } from "@testing-library/react";
import { LorasField } from "@/app/models-console/multimodal-playground/components/FormFields/LorasField";

describe("LorasField", () => {
  it("renders an Add button when below maxItems and adds an empty lora", () => {
    const onChange = jest.fn();
    render(<LorasField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add LoRA"));
    expect(onChange).toHaveBeenCalledWith([{ path: "", scale: 1 }]);
  });

  it("renders each lora row with path input and scale value", () => {
    render(
      <LorasField value={[{ path: "p1", scale: 0.5 }]} onChange={jest.fn()} />,
    );
    expect(screen.getByText("LoRA 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("p1")).toBeInTheDocument();
    expect(screen.getByText("0.5")).toBeInTheDocument();
  });

  it("updates a lora path", () => {
    const onChange = jest.fn();
    render(<LorasField value={[{ path: "", scale: 1 }]} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new/path" },
    });
    expect(onChange).toHaveBeenCalledWith([{ path: "new/path", scale: 1 }]);
  });

  it("removes a lora row", () => {
    const onChange = jest.fn();
    render(
      <LorasField
        value={[
          { path: "a", scale: 1 },
          { path: "b", scale: 1 },
        ]}
        onChange={onChange}
      />,
    );
    // remove buttons are the icon-only buttons (X), Add LoRA has text
    const removeButtons = screen
      .getAllByRole("button")
      .filter((b) => !/Add LoRA/.test(b.textContent || ""));
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith([{ path: "b", scale: 1 }]);
  });

  it("hides the Add button when maxItems is reached", () => {
    render(
      <LorasField
        value={[{ path: "a", scale: 1 }]}
        onChange={jest.fn()}
        maxItems={1}
      />,
    );
    expect(screen.queryByText("Add LoRA")).not.toBeInTheDocument();
  });

  it("shows an error message when error is set", () => {
    render(<LorasField value={[]} onChange={jest.fn()} error="bad" />);
    expect(screen.getByText("bad")).toBeInTheDocument();
  });
});
