import { fireEvent, render, screen } from "@testing-library/react";
import { OCRPromptSelector } from "@/app/models-console/llm-playground/components/chat-messages/OCRPromptSelector";

// Replace the Radix Select with a native select so we can drive onValueChange.
jest.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children, disabled }: any) => (
    <select
      data-testid="ocr-select"
      value={value}
      disabled={disabled}
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

describe("OCRPromptSelector", () => {
  it("emits the default 'other-image' prompt on mount", () => {
    const onChange = jest.fn();
    render(<OCRPromptSelector value="" onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith(
      "<|grounding|>OCR this image.",
      false,
    );
  });

  it("emits the selected option's prompt without custom input", () => {
    const onChange = jest.fn();
    render(<OCRPromptSelector value="" onChange={onChange} />);
    onChange.mockClear();
    fireEvent.change(screen.getByTestId("ocr-select"), {
      target: { value: "document" },
    });
    expect(onChange).toHaveBeenCalledWith(
      "<|grounding|>Convert the document to markdown.",
      false,
    );
  });

  it("switches to recognition mode requiring custom input and shows the text field", () => {
    const onChange = jest.fn();
    render(<OCRPromptSelector value="" onChange={onChange} />);
    onChange.mockClear();
    fireEvent.change(screen.getByTestId("ocr-select"), {
      target: { value: "rec" },
    });
    expect(onChange).toHaveBeenCalledWith("", true);
    expect(screen.getByText("Enter text to locate")).toBeInTheDocument();
  });

  it("builds the locate prompt from custom text in recognition mode", () => {
    const onChange = jest.fn();
    render(<OCRPromptSelector value="" onChange={onChange} />);
    fireEvent.change(screen.getByTestId("ocr-select"), {
      target: { value: "rec" },
    });
    onChange.mockClear();
    fireEvent.change(
      screen.getByPlaceholderText("Enter the text to locate in the image..."),
      { target: { value: "logo" } },
    );
    expect(onChange).toHaveBeenCalledWith(
      "Locate <|ref|>logo<|/ref|> in the image.",
      false,
    );
  });
});
