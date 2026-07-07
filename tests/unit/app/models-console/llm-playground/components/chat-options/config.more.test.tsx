import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  LLMConfig,
  ConfigRef,
} from "@/app/models-console/llm-playground/components/chat-options/config";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

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

describe("LLMConfig (more branches)", () => {
  it("updates the system prompt via the textarea", () => {
    const ref = createRef<ConfigRef>();
    render(<LLMConfig ref={ref} {...baseProps} />);
    const textarea = screen.getByRole("textbox");
    act(() => {
      fireEvent.change(textarea, { target: { value: "You are a poet" } });
    });
    expect(ref.current!.getChatParams().system_content).toBe("You are a poet");
  });

  it("updates a slider-backed param through the embedded OptionItem", () => {
    const ref = createRef<ConfigRef>();
    render(<LLMConfig ref={ref} {...baseProps} />);
    // The first slider corresponds to max_tokens (first filtered key).
    // The mock range input clamps to 0-100, so use an in-range value.
    const sliders = screen.getAllByTestId("slider");
    act(() => {
      fireEvent.change(sliders[0], { target: { value: "80" } });
    });
    expect(ref.current!.getChatParams().max_tokens).toBe(80);
  });

  it("shows the default option only for dedicated endpoints", () => {
    const { rerender } = render(
      <LLMConfig
        {...baseProps}
        currentModel={{ id: "m", features: [] } as any}
      />,
    );
    // Non-DE endpoint: no "default" option
    expect(
      screen.queryByRole("option", { name: "default" }),
    ).not.toBeInTheDocument();

    rerender(
      <LLMConfig
        {...baseProps}
        currentModel={{ id: "m", features: [] } as any}
        isDeEndpoint
      />,
    );
    expect(screen.getByRole("option", { name: "default" })).toBeInTheDocument();
    // DE endpoint also exposes json_object even without structured-outputs
    expect(
      screen.getByRole("option", { name: "json_object" }),
    ).toBeInTheDocument();
  });

  it("falls back to a default max_tokens when model lacks token info", () => {
    const ref = createRef<ConfigRef>();
    render(
      <LLMConfig
        ref={ref}
        {...baseProps}
        currentModel={
          {
            id: "m",
            features: [],
            max_output_tokens: 0,
            context_size: 0,
          } as any
        }
      />,
    );
    // Math.floor(0/2)=0 -> falls back to prev value (512)
    expect(ref.current!.getChatParams().max_tokens).toBe(512);
  });
});
