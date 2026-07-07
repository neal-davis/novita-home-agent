import { fireEvent, render, screen } from "@testing-library/react";
import { GenericField } from "@/app/models-console/multimodal-playground/components/FormFields/GenericField";

// Mock all delegated child field components so we can assert routing decisions.
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/PromptField",
  () => ({ PromptField: () => <div data-testid="prompt-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/ImageUploadField",
  () => ({
    ImageUploadField: ({ inputMode, maxItems }: any) => (
      <div
        data-testid="image-field"
        data-mode={inputMode}
        data-max={maxItems}
      />
    ),
  }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/ArrayInputField",
  () => ({ ArrayInputField: () => <div data-testid="array-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/SizeField",
  () => ({ SizeField: () => <div data-testid="size-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/SeedField",
  () => ({ SeedField: () => <div data-testid="seed-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/LorasField",
  () => ({ LorasField: () => <div data-testid="loras-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/SelectField",
  () => ({ SelectField: () => <div data-testid="select-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/InputField",
  () => ({ InputField: () => <div data-testid="input-field" /> }),
);

const baseProps = { value: undefined, onChange: jest.fn() };

describe("GenericField routing", () => {
  it("routes prompt/negative_prompt to PromptField", () => {
    render(<GenericField label="prompt" type="string" {...baseProps} />);
    expect(screen.getByTestId("prompt-field")).toBeInTheDocument();
  });

  it("routes a single image string field to ImageUploadField with maxItems=1", () => {
    render(<GenericField label="image" type="string" {...baseProps} />);
    const f = screen.getByTestId("image-field");
    expect(f).toHaveAttribute("data-mode", "image");
    expect(f).toHaveAttribute("data-max", "1");
  });

  it("routes an image array field to ImageUploadField", () => {
    render(
      <GenericField
        label="image_urls"
        type="array"
        maxItems={4}
        {...baseProps}
      />,
    );
    const f = screen.getByTestId("image-field");
    expect(f).toHaveAttribute("data-mode", "httpUrl");
    expect(f).toHaveAttribute("data-max", "4");
  });

  it("routes a generic string array to ArrayInputField", () => {
    render(
      <GenericField
        label="tags"
        type="array"
        items={{ type: "string" }}
        {...baseProps}
      />,
    );
    expect(screen.getByTestId("array-field")).toBeInTheDocument();
  });

  it("routes a size field (pattern) to SizeField", () => {
    render(
      <GenericField
        label="size"
        type="string"
        pattern="\\d+\\*\\d+"
        {...baseProps}
      />,
    );
    expect(screen.getByTestId("size-field")).toBeInTheDocument();
  });

  it("routes a seed integer to SeedField", () => {
    render(<GenericField label="seed" type="integer" {...baseProps} />);
    expect(screen.getByTestId("seed-field")).toBeInTheDocument();
  });

  it("routes loras array of objects to LorasField", () => {
    render(
      <GenericField
        label="loras"
        type="array"
        items={{ type: "object" }}
        {...baseProps}
      />,
    );
    expect(screen.getByTestId("loras-field")).toBeInTheDocument();
  });

  it("routes enum values to SelectField", () => {
    render(
      <GenericField
        label="mode"
        type="string"
        enum={["a", "b"]}
        {...baseProps}
      />,
    );
    expect(screen.getByTestId("select-field")).toBeInTheDocument();
  });
});

describe("GenericField inline renderers", () => {
  it("renders a boolean as a switch and toggles via onChange", () => {
    const onChange = jest.fn();
    render(
      <GenericField
        label="enabled"
        type="boolean"
        value={false}
        onChange={onChange}
      />,
    );
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders a number input and parses int input", () => {
    const onChange = jest.fn();
    render(
      <GenericField
        label="count"
        type="integer"
        value={undefined}
        onChange={onChange}
        minimum={1}
        maximum={10}
      />,
    );
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("shows a min validation error for an out-of-range number", () => {
    render(
      <GenericField
        label="count"
        type="integer"
        value={0}
        onChange={jest.fn()}
        minimum={1}
      />,
    );
    expect(screen.getByText("Value must be at least 1")).toBeInTheDocument();
  });

  it("shows a max validation error for an out-of-range number", () => {
    render(
      <GenericField
        label="count"
        type="number"
        value={99}
        onChange={jest.fn()}
        maximum={10}
      />,
    );
    expect(screen.getByText("Value must be at most 10")).toBeInTheDocument();
  });

  it("renders a long-maxLength string as a textarea with a char counter", () => {
    render(
      <GenericField
        label="note"
        type="string"
        value="hello"
        onChange={jest.fn()}
        maxLength={200}
      />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("5 / 200")).toBeInTheDocument();
  });

  it("renders a short string as a text input and forwards changes", () => {
    const onChange = jest.fn();
    render(
      <GenericField label="title" type="string" value="" onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new" },
    });
    expect(onChange).toHaveBeenCalledWith("new");
  });

  it("falls back to InputField for unsupported types", () => {
    render(<GenericField label="weird" type="object" {...baseProps} />);
    expect(screen.getByTestId("input-field")).toBeInTheDocument();
  });
});
