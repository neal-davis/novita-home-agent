import { fireEvent, render, screen } from "@testing-library/react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";

jest.mock("lucide-react", () => ({
  SendIcon: () => <span data-testid="icon-send" />,
  Loader2Icon: () => <span data-testid="icon-loader" />,
  SquareIcon: () => <span data-testid="icon-square" />,
  XIcon: () => <span data-testid="icon-x" />,
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children, className }: any) => (
    <button type="button" className={className}>
      {children}
    </button>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

describe("PromptInput", () => {
  it("renders a form and submits on Enter without Shift", () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <PromptInput onSubmit={onSubmit}>
        <PromptInputTextarea />
        <PromptInputSubmit />
      </PromptInput>,
    );

    const textarea = screen.getByPlaceholderText(
      "What would you like to know?",
    );
    // requestSubmit is not implemented in jsdom forms — stub it.
    const form = textarea.closest("form") as HTMLFormElement;
    form.requestSubmit = jest.fn(() =>
      onSubmit({ preventDefault() {} } as any),
    );

    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(form.requestSubmit).toHaveBeenCalled();
  });

  it("does not submit on Shift+Enter or during IME composition", () => {
    render(
      <PromptInput>
        <PromptInputTextarea />
      </PromptInput>,
    );
    const textarea = screen.getByPlaceholderText(
      "What would you like to know?",
    );
    const form = textarea.closest("form") as HTMLFormElement;
    form.requestSubmit = jest.fn();

    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(form.requestSubmit).not.toHaveBeenCalled();

    // simulate IME composition
    fireEvent.keyDown(textarea, {
      key: "Enter",
      // nativeEvent.isComposing
      isComposing: true,
    });
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });

  it("forwards textarea change events", () => {
    const onChange = jest.fn();
    render(
      <PromptInput>
        <PromptInputTextarea onChange={onChange} placeholder="Ask" />
      </PromptInput>,
    );
    fireEvent.change(screen.getByPlaceholderText("Ask"), {
      target: { value: "hi" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders the toolbar, tools, and a labelled button", () => {
    render(
      <PromptInput>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputButton>
              <span>icon</span>
              <span>Label</span>
            </PromptInputButton>
          </PromptInputTools>
        </PromptInputToolbar>
      </PromptInput>,
    );
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it.each([
    ["submitted", "icon-loader"],
    ["streaming", "icon-square"],
    ["error", "icon-x"],
    [undefined, "icon-send"],
  ])("shows the %s submit icon", (status, testid) => {
    render(<PromptInputSubmit status={status as any} />);
    expect(screen.getByTestId(testid)).toBeInTheDocument();
  });

  it("renders custom submit children instead of the status icon", () => {
    render(<PromptInputSubmit>Go</PromptInputSubmit>);
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-send")).not.toBeInTheDocument();
  });

  it("renders the model select composition", () => {
    render(
      <PromptInputModelSelect>
        <PromptInputModelSelectTrigger>
          <PromptInputModelSelectValue placeholder="Pick model" />
        </PromptInputModelSelectTrigger>
        <PromptInputModelSelectContent>
          <PromptInputModelSelectItem value="gpt">
            GPT
          </PromptInputModelSelectItem>
        </PromptInputModelSelectContent>
      </PromptInputModelSelect>,
    );
    expect(screen.getByText("Pick model")).toBeInTheDocument();
    expect(screen.getByText("GPT")).toBeInTheDocument();
  });
});
