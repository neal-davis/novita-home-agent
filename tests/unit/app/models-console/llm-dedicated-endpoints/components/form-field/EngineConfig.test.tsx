import { render, screen, fireEvent } from "@testing-library/react";
import EngineConfig, {
  DEFAULT_RECOMMENDED_CONCURRENCY,
} from "@/app/models-console/llm-dedicated-endpoints/components/form-field/EngineConfig";

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

describe("EngineConfig", () => {
  it("renders recommended concurrency and Off suffix decoding by default", () => {
    render(
      <EngineConfig
        value={{
          engineType: "vllm",
          maxNumSeqs: DEFAULT_RECOMMENDED_CONCURRENCY,
        }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Max Concurrency per Replica")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(String(DEFAULT_RECOMMENDED_CONCURRENCY)),
    ).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("shows optimal hint when value equals recommended", () => {
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    expect(
      screen.getByText("Optimal value for your model and GPU configuration."),
    ).toBeInTheDocument();
  });

  it("shows warning hints below and above recommended", () => {
    const { rerender } = render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 4 }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    // below recommended hint present (non-optimal)
    expect(
      screen.queryByText("Optimal value for your model and GPU configuration."),
    ).not.toBeInTheDocument();

    rerender(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 64 }}
        recommendedConcurrency={16}
        onChange={jest.fn()}
      />,
    );
    expect(
      screen.queryByText("Optimal value for your model and GPU configuration."),
    ).not.toBeInTheDocument();
  });

  it("accepts valid positive integer change", () => {
    const onChange = jest.fn();
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByDisplayValue("16"), {
      target: { value: "32" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxNumSeqs: 32 }),
    );
  });

  it("clears value to undefined on empty input", () => {
    const onChange = jest.fn();
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByDisplayValue("16"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxNumSeqs: undefined }),
    );
  });

  it("toggling suffix decoding switch emits change", () => {
    const onChange = jest.fn();
    render(
      <EngineConfig
        value={{
          engineType: "vllm",
          maxNumSeqs: 16,
          isSuffixDecodingEnable: false,
        }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ isSuffixDecodingEnable: true }),
    );
  });

  it("uses sglang display labels for sglang engine", () => {
    render(
      <EngineConfig
        value={{ engineType: "sglang", maxNumSeqs: 16 }}
        onChange={jest.fn()}
      />,
    );
    // both engines use the same "Max Concurrency per Replica" label
    expect(screen.getByText("Max Concurrency per Replica")).toBeInTheDocument();
  });

  it("renders error text", () => {
    render(
      <EngineConfig
        value={{ engineType: "vllm", maxNumSeqs: 16 }}
        error="bad concurrency"
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("bad concurrency")).toBeInTheDocument();
  });
});
