import { fireEvent, render, screen } from "@testing-library/react";
import { NumberInput } from "@/components/ui/standard/number-input";

function getInput() {
  return screen.getByRole("spinbutton") as HTMLInputElement;
}

describe("NumberInput", () => {
  it("renders a number input with min/max/step attributes", () => {
    render(<NumberInput min={0} max={10} step={2} aria-label="qty" />);
    const input = getInput();
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "10");
    expect(input).toHaveAttribute("step", "2");
  });

  it("emits the parsed number on change", () => {
    const onChange = jest.fn();
    render(<NumberInput onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("emits null for an empty value", () => {
    const onChange = jest.fn();
    render(<NumberInput value={3} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("clamps the value to max", () => {
    const onChange = jest.fn();
    render(<NumberInput max={10} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: "99" } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("clamps the value to min", () => {
    const onChange = jest.fn();
    render(<NumberInput min={2} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: "-5" } });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("rounds to the requested precision", () => {
    const onChange = jest.fn();
    render(<NumberInput precision={1} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: "1.26" } });
    expect(onChange).toHaveBeenCalledWith(1.3);
  });

  it("forwards onBlur", () => {
    const onBlur = jest.fn();
    render(<NumberInput onBlur={onBlur} />);
    fireEvent.blur(getInput());
    expect(onBlur).toHaveBeenCalled();
  });

  it("renders a controlled empty string when value is null", () => {
    render(<NumberInput value={null} />);
    expect(getInput().value).toBe("");
  });
});
