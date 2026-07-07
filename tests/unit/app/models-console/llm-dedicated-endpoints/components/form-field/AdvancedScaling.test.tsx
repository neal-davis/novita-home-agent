import { render, screen, fireEvent } from "@testing-library/react";
import AdvancedScalingConfig from "@/app/models-console/llm-dedicated-endpoints/components/form-field/AdvancedScaling";

describe("AdvancedScalingConfig", () => {
  it("renders both windows with default values", () => {
    render(<AdvancedScalingConfig onChange={jest.fn()} />);
    expect(screen.getByText("Scale Down Window")).toBeInTheDocument();
    expect(screen.getByText("Stable Window")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("300").length).toBe(2);
  });

  it("renders provided values", () => {
    render(
      <AdvancedScalingConfig
        value={{ scaleDownWindow: 120, stableWindow: 240 }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByDisplayValue("120")).toBeInTheDocument();
    expect(screen.getByDisplayValue("240")).toBeInTheDocument();
  });

  it("changing scale down window emits parsed number", () => {
    const onChange = jest.fn();
    render(
      <AdvancedScalingConfig
        value={{ scaleDownWindow: 300, stableWindow: 300 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getAllByDisplayValue("300")[0], {
      target: { value: "150" },
    });
    expect(onChange).toHaveBeenCalledWith({
      scaleDownWindow: 150,
      stableWindow: 300,
    });
  });

  it("changing stable window emits parsed number; invalid becomes 0", () => {
    const onChange = jest.fn();
    render(
      <AdvancedScalingConfig
        value={{ scaleDownWindow: 300, stableWindow: 300 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getAllByDisplayValue("300")[1], {
      target: { value: "abc" },
    });
    expect(onChange).toHaveBeenCalledWith({
      scaleDownWindow: 300,
      stableWindow: 0,
    });
  });

  it("renders error text", () => {
    render(<AdvancedScalingConfig onChange={jest.fn()} error="bad value" />);
    expect(screen.getByText("bad value")).toBeInTheDocument();
  });
});
