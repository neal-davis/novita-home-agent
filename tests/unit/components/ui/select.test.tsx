import { fireEvent, render, screen } from "@testing-library/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

function renderSelect(props: any = {}) {
  return render(
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Apple</SelectItem>
        <SelectItem value="b">Banana</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe("Select", () => {
  it("renders a combobox trigger with the placeholder", () => {
    renderSelect();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Choose")).toBeInTheDocument();
  });

  it("shows the selected value label for a default value", () => {
    renderSelect({ defaultValue: "b" });
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("renders a disabled trigger when the select is disabled", () => {
    renderSelect({ disabled: true });
    expect(screen.getByRole("combobox")).toHaveAttribute("data-disabled", "");
  });

  it("supports a custom trigger icon", () => {
    render(
      <Select>
        <SelectTrigger icon={<span data-testid="custom-icon">v</span>}>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
