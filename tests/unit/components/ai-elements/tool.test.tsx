import { fireEvent, render, screen } from "@testing-library/react";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolMock,
  ToolOutput,
} from "@/components/ai-elements/tool";

jest.mock("@/components/ai-elements/code-block", () => ({
  __esModule: true,
  CodeBlock: ({ code }: any) => <pre data-testid="code">{code}</pre>,
}));

describe("ToolHeader", () => {
  it.each([
    ["input-streaming", "Pending"],
    ["input-available", "Running"],
    ["output-available", "Completed"],
    ["output-error", "Error"],
  ])("shows %s as the %s badge", (state, label) => {
    render(
      <Tool>
        <ToolHeader type={"tool-foo" as any} state={state as any} />
      </Tool>,
    );
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("tool-foo")).toBeInTheDocument();
  });
});

describe("ToolInput", () => {
  it("renders the JSON-stringified input via CodeBlock", () => {
    render(<ToolInput input={{ a: 1 }} />);
    expect(screen.getByText("Parameters")).toBeInTheDocument();
    expect(screen.getByTestId("code")).toHaveTextContent('"a": 1');
  });
});

describe("ToolOutput", () => {
  it("returns null when there is no output and no error", () => {
    const { container } = render(
      <ToolOutput output={null} errorText={undefined} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a Result heading for normal output", () => {
    render(<ToolOutput output={<span>done</span>} errorText={undefined} />);
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
  });

  it("renders an Error heading and the error text", () => {
    render(<ToolOutput output={null} errorText="boom" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});

describe("ToolMock", () => {
  it("warns when submitting with empty output", () => {
    const onSave = jest.fn();
    render(<ToolMock output="" setOutput={jest.fn()} onSave={onSave} />);
    fireEvent.click(screen.getByText("Submit"));
    expect(
      screen.getByText("Please enter the tool result."),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves when output is present", () => {
    const onSave = jest.fn();
    render(<ToolMock output="result" setOutput={jest.fn()} onSave={onSave} />);
    fireEvent.click(screen.getByText("Submit"));
    expect(onSave).toHaveBeenCalled();
  });

  it("updates output via the textarea", () => {
    const setOutput = jest.fn();
    render(<ToolMock output="" setOutput={setOutput} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Enter tool result..."), {
      target: { value: "typed" },
    });
    expect(setOutput).toHaveBeenCalledWith("typed");
  });

  it("renders a Mock button when onMock is given", () => {
    render(
      <ToolMock
        output="x"
        setOutput={jest.fn()}
        onSave={jest.fn()}
        onMock={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("Mock")).toBeInTheDocument();
  });
});
