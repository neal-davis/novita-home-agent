import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  CodeBlock,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";

// react-syntax-highlighter is heavy and irrelevant to the logic under test.
jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: any) => <pre>{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
  oneLight: {},
}));

describe("CodeBlock", () => {
  it("renders the code content", () => {
    render(<CodeBlock code="const x = 1;" language="ts" />);
    // rendered twice (light + dark variants)
    expect(screen.getAllByText("const x = 1;").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("copies code to the clipboard and fires onCopy", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopy = jest.fn();

    render(
      <CodeBlock code="copy me" language="ts">
        <CodeBlockCopyButton onCopy={onCopy} />
      </CodeBlock>,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("copy me"));
    expect(onCopy).toHaveBeenCalled();
  });

  it("calls onError when the clipboard write rejects", async () => {
    const writeText = jest.fn().mockRejectedValue(new Error("nope"));
    Object.assign(navigator, { clipboard: { writeText } });
    const onError = jest.fn();

    render(
      <CodeBlock code="x" language="ts">
        <CodeBlockCopyButton onError={onError} />
      </CodeBlock>,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});
