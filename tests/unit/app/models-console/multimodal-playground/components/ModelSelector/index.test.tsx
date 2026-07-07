import { fireEvent, render, screen } from "@testing-library/react";
import { ModelSelector } from "@/app/models-console/multimodal-playground/components/ModelSelector/index";

// Stand-in for the project SelectFilter that exercises the option accessors.
jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({
    options,
    value,
    onValueChange,
    getOptionLabel,
    getOptionValue,
  }: any) => (
    <div data-testid="filter" data-value={value}>
      {options.map((opt: any) => (
        <button
          key={getOptionValue(opt)}
          onClick={() => onValueChange(getOptionValue(opt))}
        >
          {getOptionLabel(opt)}
        </button>
      ))}
    </div>
  ),
}));

const modelList = [
  { fusionConfig: { name: "m1", displayName: "Model One" } },
  { fusionConfig: { name: "m2", displayName: "Model Two" } },
] as any;

const selectedModel = { name: "m1", description: "first model" } as any;

describe("ModelSelector", () => {
  it("renders the selected model description and options", () => {
    render(
      <ModelSelector
        modelList={modelList}
        selectedModel={selectedModel}
        onModelChange={jest.fn()}
        endpoint="/v3/txt2img"
      />,
    );
    expect(screen.getByText("first model")).toBeInTheDocument();
    expect(screen.getByText("Model One")).toBeInTheDocument();
    expect(screen.getByText("Model Two")).toBeInTheDocument();
  });

  it("fires onModelChange with the option value", () => {
    const onModelChange = jest.fn();
    render(
      <ModelSelector
        modelList={modelList}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        endpoint="/v3/txt2img"
      />,
    );
    fireEvent.click(screen.getByText("Model Two"));
    expect(onModelChange).toHaveBeenCalledWith("m2");
  });

  it("builds the API docs link from the endpoint's last segment", () => {
    render(
      <ModelSelector
        modelList={modelList}
        selectedModel={selectedModel}
        onModelChange={jest.fn()}
        endpoint="/v3/txt2img"
      />,
    );
    const link = screen.getByText("Model API docs").closest("a");
    expect(link).toHaveAttribute(
      "href",
      "https://novita.ai/docs/api-reference/model-apis-txt2img",
    );
  });

  it("omits the API docs link when there is no endpoint", () => {
    render(
      <ModelSelector
        modelList={modelList}
        selectedModel={selectedModel}
        onModelChange={jest.fn()}
        endpoint=""
      />,
    );
    expect(screen.queryByText("Model API docs")).not.toBeInTheDocument();
  });
});
