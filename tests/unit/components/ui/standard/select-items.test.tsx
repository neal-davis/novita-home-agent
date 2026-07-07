import { fireEvent, render, screen } from "@testing-library/react";
import { SelectItems } from "@/components/ui/standard/select-items";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

const flatOptions = [
  { value: 1, label: "One" },
  { value: 2, label: "Two" },
];

const groupedOptions = [
  {
    label: "Group A",
    options: [
      { value: "x", label: "X" },
      { value: "y", label: "Y", disabled: true },
    ],
  },
  { value: "z", label: "Z" },
];

describe("SelectItems", () => {
  it("renders the placeholder when no value is selected", () => {
    render(<SelectItems options={flatOptions} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("renders the selected value's label", () => {
    render(<SelectItems options={flatOptions} value={2} />);
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("shows a combobox trigger with default value applied", () => {
    render(<SelectItems options={flatOptions} defaultValue={1} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
  });

  it("supports grouped options for the default value", () => {
    render(<SelectItems options={groupedOptions} defaultValue="x" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders disabled state on the trigger", () => {
    render(<SelectItems options={flatOptions} disabled placeholder="p" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-disabled", "");
  });
});
