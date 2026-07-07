import { fireEvent, render, screen } from "@testing-library/react";
import { ParametersPanel } from "@/app/models-console/multimodal-playground/components/ParametersPanel";

jest.mock(
  "@/app/models-console/multimodal-playground/components/FormFields/GenericField",
  () => ({
    GenericField: ({ label, value, onChange }: any) => (
      <div data-testid={`field-${label}`}>
        <span>{label}</span>
        <input
          data-testid={`input-${label}`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
  }),
);

const schema = {
  prompt: { type: "string", description: "the prompt" },
  hidden_one: { type: "string" },
  required_extra: { type: "number" },
};

function renderPanel(overrides: Record<string, any> = {}) {
  const onChange = jest.fn();
  const onReset = jest.fn();
  const onRun = jest.fn();
  render(
    <ParametersPanel
      schema={schema}
      requiredFields={["required_extra"]}
      formData={{ prompt: "p" }}
      errors={{}}
      onChange={onChange}
      onReset={onReset}
      onRun={onRun}
      isRunning={false}
      isLoggedIn={true}
      {...overrides}
    />,
  );
  return { onChange, onReset, onRun };
}

describe("ParametersPanel", () => {
  it("renders visible fields and required-not-visible fields", () => {
    renderPanel();
    expect(screen.getByTestId("field-prompt")).toBeInTheDocument();
    // required but not in VISIBLE_PARAMETERS still rendered
    expect(screen.getByTestId("field-required_extra")).toBeInTheDocument();
    // hidden_one is neither visible nor required -> not rendered
    expect(screen.queryByTestId("field-hidden_one")).not.toBeInTheDocument();
  });

  it("calls onChange with the field name when a field changes", () => {
    const { onChange } = renderPanel();
    fireEvent.change(screen.getByTestId("input-prompt"), {
      target: { value: "new" },
    });
    expect(onChange).toHaveBeenCalledWith("prompt", "new");
  });

  it("shows Reset and Generate buttons when logged in", () => {
    const { onReset, onRun } = renderPanel();
    fireEvent.click(screen.getByText("Reset"));
    fireEvent.click(screen.getByText("Generate"));
    expect(onReset).toHaveBeenCalled();
    expect(onRun).toHaveBeenCalled();
  });

  it("hides Reset and shows login prompt when logged out", () => {
    renderPanel({ isLoggedIn: false });
    expect(screen.queryByText("Reset")).not.toBeInTheDocument();
    expect(screen.getByText("Log in to use")).toBeInTheDocument();
  });

  it("shows Generating... and disables buttons while running", () => {
    renderPanel({ isRunning: true });
    expect(screen.getByText("Generating...")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeDisabled();
    expect(screen.getByText("Generating...")).toBeDisabled();
  });
});
