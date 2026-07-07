import { fireEvent, render, screen } from "@testing-library/react";
import { RenderToolPart } from "@/app/models-console/llm-playground/components/chat-messages/parts-render/tool-parts";

jest.mock("@/components/ai-elements/tool", () => ({
  Tool: ({ children }: any) => <div data-testid="tool">{children}</div>,
  ToolHeader: ({ type, state }: any) => (
    <div data-testid="header" data-type={type} data-state={state} />
  ),
  ToolContent: ({ children }: any) => <div>{children}</div>,
  ToolInput: ({ input }: any) => (
    <div data-testid="input">{JSON.stringify(input)}</div>
  ),
  ToolOutput: ({ output, errorText }: any) => (
    <div data-testid="output" data-error={errorText}>
      {output}
    </div>
  ),
  ToolMock: ({ onSave, onMock }: any) => (
    <div data-testid="mock">
      <button onClick={onSave}>save</button>
      <button onClick={onMock}>mock</button>
    </div>
  ),
}));
jest.mock("@/components/ai-elements/code-block", () => ({
  CodeBlock: ({ code }: any) => <pre data-testid="code">{code}</pre>,
}));

const currentTools = [{ name: "get_weather" }] as any;

describe("RenderToolPart", () => {
  const baseProps = {
    keyPrefix: "k",
    currentTools,
    mockToolOutput: "",
    setMockToolOutput: jest.fn(),
    onSaveTool: jest.fn(),
    onMockTool: jest.fn(),
  };

  it("returns null when the tool name does not match any current tool", () => {
    const { container } = render(
      <RenderToolPart
        {...(baseProps as any)}
        part={{ type: "tool-unknown", state: "input-available" } as any}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the mock UI when there is no output yet", () => {
    render(
      <RenderToolPart
        {...(baseProps as any)}
        part={
          {
            type: "tool-get_weather",
            state: "input-available",
            input: { location: "NYC" },
            toolCallId: "call-1",
          } as any
        }
      />,
    );
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-type",
      "tool-get_weather",
    );
    expect(screen.getByTestId("input")).toHaveTextContent("NYC");
    expect(screen.getByTestId("mock")).toBeInTheDocument();

    fireEvent.click(screen.getByText("save"));
    expect(baseProps.onSaveTool).toHaveBeenCalledWith("get_weather", "call-1");
    fireEvent.click(screen.getByText("mock"));
    expect(baseProps.onMockTool).toHaveBeenCalledWith(
      { name: "get_weather" },
      { location: "NYC" },
    );
  });

  it("renders the output (with code block) when output is present", () => {
    render(
      <RenderToolPart
        {...(baseProps as any)}
        part={
          {
            type: "tool-get_weather",
            state: "output-available",
            input: {},
            output: { temp: 20 },
          } as any
        }
      />,
    );
    expect(screen.getByTestId("output")).toBeInTheDocument();
    expect(screen.getByTestId("code")).toHaveTextContent('"temp": 20');
  });

  it("renders the output branch with errorText", () => {
    render(
      <RenderToolPart
        {...(baseProps as any)}
        part={
          {
            type: "tool-get_weather",
            state: "output-error",
            input: {},
            errorText: "failed",
          } as any
        }
      />,
    );
    expect(screen.getByTestId("output")).toHaveAttribute(
      "data-error",
      "failed",
    );
  });
});
