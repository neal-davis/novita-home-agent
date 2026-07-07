import { render, screen } from "@testing-library/react";
import { SelectField } from "@/app/models-console/multimodal-playground/components/FormFields/SelectField";

// jsdom lacks elementsFromPoint, used by the custom Select trigger measurement.
beforeAll(() => {
  if (!document.elementsFromPoint) {
    (
      document as unknown as { elementsFromPoint: () => Element[] }
    ).elementsFromPoint = () => [];
  }
});

describe("SelectField", () => {
  it("renders the label and the currently selected value in the trigger", () => {
    render(
      <SelectField
        label="Quality"
        type="string"
        value="high"
        onChange={jest.fn()}
        options={["low", "high"]}
      />,
    );
    expect(screen.getByText("Quality")).toBeInTheDocument();
    // Radix shows the selected value text inside the trigger
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows the placeholder when no value is selected", () => {
    render(
      <SelectField
        label="Quality"
        type="string"
        value={undefined}
        onChange={jest.fn()}
        options={["low", "high"]}
      />,
    );
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  it("renders a required asterisk and an error message", () => {
    render(
      <SelectField
        label="Quality"
        type="string"
        value=""
        onChange={jest.fn()}
        options={["low"]}
        required
        error="pick one"
      />,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("pick one")).toBeInTheDocument();
  });
});
