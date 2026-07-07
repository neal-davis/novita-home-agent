import { fireEvent, render, screen } from "@testing-library/react";
import { PromptTemplateSelector } from "@/app/models-console/llm-playground/components/chat-input/prompt-template-selector";

const templates = [
  { id: "t1", label: "Doc", prompt: "p1", description: "convert doc" },
  { id: "t2", label: "Img", prompt: "p2" },
];

describe("PromptTemplateSelector", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(
      <PromptTemplateSelector
        templates={templates}
        selectedTemplate={null}
        onSelectTemplate={jest.fn()}
      />,
    );
    expect(screen.getByText("Select a prompt template")).toBeInTheDocument();
  });

  it("shows the selected template label and description", () => {
    render(
      <PromptTemplateSelector
        templates={templates}
        selectedTemplate={templates[0]}
        onSelectTemplate={jest.fn()}
      />,
    );
    expect(screen.getByText("Doc")).toBeInTheDocument();
    expect(screen.getByText("convert doc")).toBeInTheDocument();
  });

  it("opens the dropdown and lists template options", () => {
    render(
      <PromptTemplateSelector
        templates={templates}
        selectedTemplate={null}
        onSelectTemplate={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    // both templates' prompts are shown in the open dropdown
    expect(screen.getByText("p1")).toBeInTheDocument();
    expect(screen.getByText("p2")).toBeInTheDocument();
  });

  it("selects a template and closes the dropdown", () => {
    const onSelect = jest.fn();
    render(
      <PromptTemplateSelector
        templates={templates}
        selectedTemplate={null}
        onSelectTemplate={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    // click the second template option (matched by its unique prompt text)
    fireEvent.click(screen.getByText("p2"));
    expect(onSelect).toHaveBeenCalledWith(templates[1]);
    // dropdown is closed -> prompt text gone
    expect(screen.queryByText("p1")).not.toBeInTheDocument();
  });

  it("closes the dropdown on an outside click", () => {
    render(
      <PromptTemplateSelector
        templates={templates}
        selectedTemplate={null}
        onSelectTemplate={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("p1")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("p1")).not.toBeInTheDocument();
  });
});
