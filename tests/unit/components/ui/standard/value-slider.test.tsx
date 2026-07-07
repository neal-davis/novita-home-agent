import { render, screen } from "@testing-library/react";
import { ValueSlider } from "@/components/ui/standard/value-slider";

let captured: any = {};
jest.mock("@/components/ui/slider", () => ({
  Slider: (props: any) => {
    captured = props;
    return (
      <div
        data-testid="slider"
        data-value={JSON.stringify(props.value)}
        data-default={JSON.stringify(props.defaultValue)}
      />
    );
  },
}));

beforeEach(() => {
  captured = {};
});

describe("ValueSlider", () => {
  it("normalizes a single numeric value into an array", () => {
    render(<ValueSlider value={5} />);
    expect(screen.getByTestId("slider")).toHaveAttribute("data-value", "[5]");
  });

  it("passes an array value through unchanged", () => {
    render(<ValueSlider value={[2, 8]} />);
    expect(screen.getByTestId("slider")).toHaveAttribute("data-value", "[2,8]");
  });

  it("denormalizes to a scalar for non-range onChange", () => {
    const onChange = jest.fn();
    render(<ValueSlider onChange={onChange} />);
    captured.onValueChange([7]);
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("keeps the array for range onChange", () => {
    const onChange = jest.fn();
    render(<ValueSlider range onChange={onChange} />);
    captured.onValueChange([1, 9]);
    expect(onChange).toHaveBeenCalledWith([1, 9]);
  });

  it("calls onAfterChange via onValueCommit", () => {
    const onAfterChange = jest.fn();
    render(<ValueSlider onAfterChange={onAfterChange} />);
    captured.onValueCommit([3]);
    expect(onAfterChange).toHaveBeenCalledWith(3);
  });

  it("leaves value undefined when not provided", () => {
    render(<ValueSlider />);
    expect(screen.getByTestId("slider")).not.toHaveAttribute("data-value");
  });
});
