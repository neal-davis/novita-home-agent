import { fireEvent, render, screen } from "@testing-library/react";
import { GenericField } from "@/app/models-console/multimodal-playground/components/FormFields/GenericField";

// These mocks expose a button that fires the passed onChange so we can cover the
// inline transform callbacks defined in GenericField (e.g. newValue[0] || "").
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/PromptField",
  () => ({ PromptField: () => <div data-testid="prompt-field" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/ImageUploadField",
  () => ({
    ImageUploadField: ({ onChange, value }: any) => (
      <div data-testid="image-field" data-value={JSON.stringify(value)}>
        <button data-testid="img-set" onClick={() => onChange(["http://x"])}>
          set
        </button>
        <button data-testid="img-clear" onClick={() => onChange([])}>
          clear
        </button>
      </div>
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
  () => ({
    InputField: ({ onChange }: any) => (
      <button data-testid="input-field" onClick={() => onChange("typed")}>
        input
      </button>
    ),
  }),
);

describe("GenericField (more branches)", () => {
  it("single image field maps array onChange back to the first value or empty string", () => {
    const onChange = jest.fn();
    render(
      <GenericField label="image" type="string" value="" onChange={onChange} />,
    );
    fireEvent.click(screen.getByTestId("img-set"));
    expect(onChange).toHaveBeenLastCalledWith("http://x");
    fireEvent.click(screen.getByTestId("img-clear"));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("passes an existing single-image value through as a one-element array", () => {
    render(
      <GenericField
        label="image"
        type="string"
        value="http://existing"
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId("image-field")).toHaveAttribute(
      "data-value",
      JSON.stringify(["http://existing"]),
    );
  });

  it("routes a size field via enum values containing '*' to SizeField", () => {
    render(
      <GenericField
        label="size"
        type="string"
        enum={["1024*1024", "512*512"]}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId("size-field")).toBeInTheDocument();
  });

  it("routes loras via items.$ref containing LoraWeight to LorasField", () => {
    render(
      <GenericField
        label="loras"
        type="array"
        items={{ $ref: "#/components/schemas/LoraWeight" }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId("loras-field")).toBeInTheDocument();
  });

  it("skips the generic string-array path when the description mentions image", () => {
    // array + items string but description mentions image -> the ArrayInputField
    // guard is false, so it falls through to the InputField fallback
    render(
      <GenericField
        label="refs"
        type="array"
        items={{ type: "string" }}
        description="An image url list"
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId("input-field")).toBeInTheDocument();
  });

  it("updates the textarea value through onChange for long maxLength strings", () => {
    const onChange = jest.fn();
    render(
      <GenericField
        label="note"
        type="string"
        value="hi"
        onChange={onChange}
        maxLength={150}
        example="placeholder text"
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "longer" },
    });
    expect(onChange).toHaveBeenCalledWith("longer");
  });

  it("parses float values for number type inputs", () => {
    const onChange = jest.fn();
    render(
      <GenericField
        label="ratio"
        type="number"
        value={undefined}
        onChange={onChange}
        example={1.5}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "2.5" },
    });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  it("forwards changes from the InputField fallback", () => {
    const onChange = jest.fn();
    render(
      <GenericField
        label="weird"
        type="object"
        value={123}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("input-field"));
    expect(onChange).toHaveBeenCalledWith("typed");
  });

  it("renders a boolean switch with a description tooltip trigger", () => {
    render(
      <GenericField
        label="flag"
        type="boolean"
        value={true}
        onChange={jest.fn()}
        description="toggles a thing"
        required
      />,
    );
    expect(screen.getByRole("switch")).toBeChecked();
  });
});
