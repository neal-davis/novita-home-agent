import { fireEvent, render, screen } from "@testing-library/react";
import { CompletionInput } from "@/app/models-console/llm-playground/components/chat-input/completionInput";

function setup(overrides: Record<string, any> = {}) {
  const props = {
    isLoading: false,
    input: "",
    setInput: jest.fn(),
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    stopCompletion: jest.fn(),
    ...overrides,
  };
  render(<CompletionInput {...props} />);
  return props;
}

describe("CompletionInput", () => {
  it("disables the submit button when input is empty", () => {
    setup({ input: "" });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("enables submit and calls handleSubmit + clears input on form submit", () => {
    const props = setup({ input: "hello" });
    const textarea = screen.getByPlaceholderText("Say something...");
    expect(screen.getByRole("button")).not.toBeDisabled();
    fireEvent.submit(textarea.closest("form")!);
    expect(props.handleSubmit).toHaveBeenCalled();
    expect(props.setInput).toHaveBeenCalledWith("");
  });

  it("submits on Enter without shift", () => {
    const props = setup({ input: "hi" });
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(props.handleSubmit).toHaveBeenCalled();
    expect(props.setInput).toHaveBeenCalledWith("");
  });

  it("does not submit on Shift+Enter", () => {
    const props = setup({ input: "hi" });
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(props.handleSubmit).not.toHaveBeenCalled();
  });

  it("forwards typing through handleInputChange", () => {
    const props = setup({ input: "" });
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "typed" } });
    expect(props.handleInputChange).toHaveBeenCalled();
  });

  it("renders a stop button while loading and calls stopCompletion", () => {
    const props = setup({ isLoading: true, input: "x" });
    fireEvent.click(screen.getByRole("button"));
    expect(props.stopCompletion).toHaveBeenCalled();
  });
});
