import { fireEvent, render, screen } from "@testing-library/react";
import { SeedField } from "@/app/models-console/multimodal-playground/components/FormFields/SeedField";

describe("SeedField", () => {
  it("renders default label and value", () => {
    render(<SeedField value={42} onChange={jest.fn()} />);
    expect(screen.getByText("seed")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
  });

  it("parses numeric input and forwards it", () => {
    const onChange = jest.fn();
    render(<SeedField value={-1} onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "123" },
    });
    expect(onChange).toHaveBeenCalledWith(123);
  });

  it("falls back to min when the input is not a number", () => {
    const onChange = jest.fn();
    render(<SeedField value={5} onChange={onChange} min={-1} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "abc" },
    });
    expect(onChange).toHaveBeenCalledWith(-1);
  });

  it("randomizes a seed within range when the dice button is clicked", () => {
    const onChange = jest.fn();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    render(<SeedField value={0} onChange={onChange} max={100} />);
    fireEvent.click(screen.getByTitle("Random seed"));
    expect(onChange).toHaveBeenCalledWith(50);
    spy.mockRestore();
  });

  it("shows an error message when error is set", () => {
    render(<SeedField value={1} onChange={jest.fn()} error="bad seed" />);
    expect(screen.getByText("bad seed")).toBeInTheDocument();
  });
});
