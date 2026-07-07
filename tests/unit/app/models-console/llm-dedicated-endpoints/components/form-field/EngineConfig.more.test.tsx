import { render, screen, fireEvent } from "@testing-library/react";
import EngineConfig from "@/app/models-console/llm-dedicated-endpoints/components/form-field/EngineConfig";

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
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

describe("EngineConfig (more branches)", () => {
  it("ignores invalid (non-positive/non-integer) concurrency input", () => {
    const onChange = jest.fn();
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        onChange={onChange}
      />,
    );
    const input = screen.getByDisplayValue("16");
    // 0 is < 1 and not "" -> no-op
    fireEvent.change(input, { target: { value: "0" } });
    expect(onChange).not.toHaveBeenCalled();
    // negative -> no-op
    fireEvent.change(input, { target: { value: "-5" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("prevents decimal, minus, and exponent keystrokes", () => {
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        onChange={jest.fn()}
      />,
    );
    const input = screen.getByDisplayValue("16");
    for (const key of [".", "-", "e", "E"]) {
      const event = fireEvent.keyDown(input, { key });
      // fireEvent returns false if preventDefault was called
      expect(event).toBe(false);
    }
    // an allowed key is not prevented
    expect(fireEvent.keyDown(input, { key: "5" })).toBe(true);
  });

  it("renders no hint when maxNumSeqs is falsy", () => {
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: undefined }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    // success/optimal hint should not appear
    expect(
      screen.queryByText("Optimal value for your model and GPU configuration."),
    ).not.toBeInTheDocument();
  });

  it("applies warning style class for below-recommended values", () => {
    const { container } = render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 4 }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    // the hint paragraph gets the orange warning class
    expect(
      container.querySelector(".text-\\[var\\(--orange-1\\)\\]"),
    ).toBeInTheDocument();
  });

  it("applies success style class when value equals recommended", () => {
    const { container } = render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    expect(
      container.querySelector(".text-\\[var\\(--brand-0\\)\\]"),
    ).toBeInTheDocument();
  });
});
