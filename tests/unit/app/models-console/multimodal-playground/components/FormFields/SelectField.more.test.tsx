import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SelectField } from "@/app/models-console/multimodal-playground/components/FormFields/SelectField";

beforeAll(() => {
  if (!document.elementsFromPoint) {
    (
      document as unknown as { elementsFromPoint: () => Element[] }
    ).elementsFromPoint = () => [];
  }
  // Radix Select relies on these APIs which jsdom does not implement.
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

async function selectOption(optionText: string) {
  fireEvent.click(screen.getByRole("combobox"));
  const option = await screen.findByRole("option", { name: optionText });
  fireEvent.click(option);
}

describe("SelectField handleValueChange type conversions", () => {
  it("parses integer option values", async () => {
    const onChange = jest.fn();
    render(
      <SelectField
        label="Steps"
        type="integer"
        value={undefined}
        onChange={onChange}
        options={[10, 20]}
      />,
    );
    await selectOption("20");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(20));
  });

  it("parses number option values", async () => {
    const onChange = jest.fn();
    render(
      <SelectField
        label="Ratio"
        type="number"
        value={undefined}
        onChange={onChange}
        options={[0.5, 1.5]}
      />,
    );
    await selectOption("1.5");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(1.5));
  });

  it("parses boolean option values", async () => {
    const onChange = jest.fn();
    render(
      <SelectField
        label="Enabled"
        type="boolean"
        value={undefined}
        onChange={onChange}
        options={[true, false]}
      />,
    );
    await selectOption("true");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });

  it("passes string option values through unchanged", async () => {
    const onChange = jest.fn();
    render(
      <SelectField
        label="Quality"
        type="string"
        value={undefined}
        onChange={onChange}
        options={["low", "high"]}
      />,
    );
    await selectOption("high");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("high"));
  });
});
