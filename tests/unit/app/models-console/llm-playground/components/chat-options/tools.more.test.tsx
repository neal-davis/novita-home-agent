import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LLMTools } from "@/app/models-console/llm-playground/components/chat-options/tools";

beforeAll(() => {
  if (!document.elementsFromPoint) {
    (
      document as unknown as { elementsFromPoint: () => Element[] }
    ).elementsFromPoint = () => [];
  }
  if (!(Element.prototype as any).hasPointerCapture) {
    (Element.prototype as any).hasPointerCapture = () => false;
  }
  if (!(Element.prototype as any).scrollIntoView) {
    (Element.prototype as any).scrollIntoView = () => {};
  }
  if (!(Element.prototype as any).releasePointerCapture) {
    (Element.prototype as any).releasePointerCapture = () => {};
  }
});

describe("LLMTools template selection", () => {
  it("fills the JSON editor when a template is selected from the dropdown", async () => {
    render(<LLMTools />);
    // open the add dialog
    fireEvent.click(screen.getByText("Add Function"));
    // open the template Select and pick the weather template
    fireEvent.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", {
      name: /get_weather/,
    });
    fireEvent.click(option);

    const textarea = screen.getByPlaceholderText(
      "Enter JSON schema...",
    ) as HTMLTextAreaElement;
    await waitFor(() =>
      expect(textarea.value).toContain('"name": "get_weather"'),
    );
    // valid template -> shows the "Format correct" indicator
    expect(screen.getByText("Format correct")).toBeInTheDocument();
  });

  it("adds the selected template as a tool on save", async () => {
    render(<LLMTools />);
    fireEvent.click(screen.getByText("Add Function"));
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(
      await screen.findByRole("option", { name: /simple_calculator/ }),
    );
    await waitFor(() =>
      expect(
        (
          screen.getByPlaceholderText(
            "Enter JSON schema...",
          ) as HTMLTextAreaElement
        ).value,
      ).toContain("simple_calculator"),
    );
    fireEvent.click(screen.getByText("Save"));
    // the tool card now appears in the list
    await waitFor(() =>
      expect(screen.getByText("simple_calculator")).toBeInTheDocument(),
    );
  });
});
