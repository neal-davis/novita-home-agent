import { fireEvent, render, screen } from "@testing-library/react";
import AutoscalingConfig from "@/app/models-console/llm-dedicated-endpoints/components/form-field/AutoscalingConfig";

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (c: boolean) => void;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    >
      switch
    </button>
  ),
}));

jest.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
  }: {
    value: number[];
    onValueChange: (v: number[]) => void;
  }) => (
    <div>
      <span>slider-value:{value.join(",")}</span>
      <button type="button" onClick={() => onValueChange([2, 6])}>
        slider-range
      </button>
      <button type="button" onClick={() => onValueChange([3])}>
        slider-single
      </button>
      <button type="button" onClick={() => onValueChange([0, 6])}>
        slider-zero-min
      </button>
    </div>
  ),
}));

describe("AutoscalingConfig", () => {
  it("renders ON state with replica range and scale-down input", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        mode="edit"
        value={{
          enabled: true,
          minReplicas: 1,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    expect(screen.getByText(/Min: 1 ~ Max: 4/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("300")).toBeInTheDocument();
  });

  it("renders OFF state with number of replicas", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: false,
          minReplicas: 2,
          maxReplicas: 2,
          cooldownPeriod: 300,
        }}
      />,
    );
    expect(screen.getByText("Number of replicas:")).toBeInTheDocument();
    // single slider reflects current min value
    expect(screen.getByText("slider-value:2")).toBeInTheDocument();
  });

  it("toggling switch off emits disabled config", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: true,
          minReplicas: 1,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        minReplicas: 1,
        maxReplicas: 1,
      }),
    );
  });

  it("toggling switch on emits enabled defaults", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: false,
          minReplicas: 1,
          maxReplicas: 1,
          cooldownPeriod: 300,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        minReplicas: 1,
        maxReplicas: 8,
      }),
    );
  });

  it("range slider change updates min and max", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: true,
          minReplicas: 1,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "slider-range" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ minReplicas: 2, maxReplicas: 6 }),
    );
  });

  it("single slider change (OFF) sets min=max", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: false,
          minReplicas: 1,
          maxReplicas: 1,
          cooldownPeriod: 300,
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "slider-single" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ minReplicas: 3, maxReplicas: 3 }),
    );
  });

  it("shows Scale-to-Zero warning when min becomes 0", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: true,
          minReplicas: 0,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    expect(screen.getByText("Scale-to-Zero is enabled")).toBeInTheDocument();
  });

  it("cooldown input change emits new cooldownPeriod", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={onChange}
        value={{
          enabled: true,
          minReplicas: 1,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    fireEvent.change(screen.getByDisplayValue("300"), {
      target: { value: "600" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ cooldownPeriod: 600 }),
    );
  });

  it("clamps values exceeding maxReplicasLimit on mount", () => {
    const onChange = jest.fn();
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={4}
        onChange={onChange}
        value={{
          enabled: true,
          minReplicas: 6,
          maxReplicas: 10,
          cooldownPeriod: 300,
        }}
      />,
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxReplicas: 4, minReplicas: 3 }),
    );
  });

  it("renders error text when error prop given", () => {
    render(
      <AutoscalingConfig
        instanceGPUCount={1}
        maxReplicasLimit={8}
        onChange={jest.fn()}
        error="bad cooldown"
        value={{
          enabled: true,
          minReplicas: 1,
          maxReplicas: 4,
          cooldownPeriod: 300,
        }}
      />,
    );
    expect(screen.getByText("bad cooldown")).toBeInTheDocument();
  });
});
