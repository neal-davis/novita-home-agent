import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  LLMConfig,
  ConfigRef,
  OptionItem,
  defaultParams,
} from "@/app/models-console/llm-playground/components/chat-options/config";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

// Native select + simple tooltip/slider/number-input stand-ins for jsdom.
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select
      data-testid="rf-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange }: any) => (
    <input
      type="range"
      data-testid="slider"
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  ),
}));
jest.mock("@/components/ui/standard/number-input", () => ({
  NumberInput: ({ value, onChange }: any) => (
    <input
      type="number"
      data-testid="num"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  ),
}));

const baseProps = {
  currentModel: null,
  chatMode: ChatMode.Chat,
  onParamsChange: jest.fn(),
};

describe("LLMConfig defaults & ref", () => {
  it("exposes default chat params via the ref", () => {
    const ref = createRef<ConfigRef>();
    render(<LLMConfig ref={ref} {...baseProps} />);
    const params = ref.current!.getChatParams();
    expect(params.max_tokens).toBe(defaultParams.max_tokens);
    expect(params.temperature).toBe(defaultParams.temperature);
    expect(params.response_format).toEqual({ type: "text" });
  });

  it("invokes onParamsChange with the built params on mount", () => {
    const onParamsChange = jest.fn();
    render(<LLMConfig {...baseProps} onParamsChange={onParamsChange} />);
    expect(onParamsChange).toHaveBeenCalled();
    const last = onParamsChange.mock.calls.at(-1)![0];
    expect(last.system_content).toBe(defaultParams.system_content);
  });
});

describe("LLMConfig response format selection", () => {
  it("drops response_format from params when set to 'default'", () => {
    const ref = createRef<ConfigRef>();
    render(
      <LLMConfig
        ref={ref}
        {...baseProps}
        currentModel={{ id: "m", features: [], max_output_tokens: 100 } as any}
        isDeEndpoint
      />,
    );
    // dedicated endpoint sets response_format to "default" via effect
    expect(ref.current!.getChatParams().response_format).toBeUndefined();
  });

  it("includes a chosen json_object response format", () => {
    const ref = createRef<ConfigRef>();
    render(
      <LLMConfig
        ref={ref}
        {...baseProps}
        currentModel={{ id: "m", features: ["structured-outputs"] } as any}
      />,
    );
    act(() => {
      fireEvent.change(screen.getByTestId("rf-select"), {
        target: { value: "json_object" },
      });
    });
    expect(ref.current!.getChatParams().response_format).toEqual({
      type: "json_object",
    });
  });
});

describe("LLMConfig model-driven effects", () => {
  it("derives max_tokens from the model context and sets r1 temperature", () => {
    const ref = createRef<ConfigRef>();
    render(
      <LLMConfig
        ref={ref}
        {...baseProps}
        currentModel={
          {
            id: "deepseek/deepseek-r1",
            features: [],
            max_output_tokens: 0,
            context_size: 4096,
          } as any
        }
      />,
    );
    const params = ref.current!.getChatParams();
    expect(params.max_tokens).toBe(2048);
    expect(params.temperature).toBe(0.6);
  });

  it("hides the system prompt section outside chat mode", () => {
    render(<LLMConfig {...baseProps} chatMode={ChatMode.Completion} />);
    expect(screen.queryByText("System Prompt")).not.toBeInTheDocument();
  });
});

describe("OptionItem", () => {
  it("forwards slider and number input changes with the attribute key", () => {
    const onChange = jest.fn();
    render(
      <OptionItem
        attribute="top_p"
        config={{ value: 0.5, min: 0, max: 1, step: 0.1 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId("slider"), {
      target: { value: "0.8" },
    });
    expect(onChange).toHaveBeenCalledWith("top_p", 0.8);
    fireEvent.change(screen.getByTestId("num"), { target: { value: "0.3" } });
    expect(onChange).toHaveBeenCalledWith("top_p", 0.3);
  });
});
