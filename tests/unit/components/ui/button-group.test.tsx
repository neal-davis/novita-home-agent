import { render, screen } from "@testing-library/react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from "@/components/ui/button-group";

describe("ButtonGroup", () => {
  it("renders a group with default horizontal orientation classes", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-slot", "button-group");
    expect(group.className).toContain("rounded-l-none");
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("applies vertical orientation classes", () => {
    expect(buttonGroupVariants({ orientation: "vertical" })).toContain(
      "flex-col",
    );
    render(
      <ButtonGroup orientation="vertical">
        <button>A</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("renders ButtonGroupText content", () => {
    render(<ButtonGroupText>Label</ButtonGroupText>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("ButtonGroupText supports asChild via Slot", () => {
    render(
      <ButtonGroupText asChild>
        <span data-testid="slotted">Slotted</span>
      </ButtonGroupText>,
    );
    expect(screen.getByTestId("slotted").tagName.toLowerCase()).toBe("span");
  });

  it("renders a separator", () => {
    render(
      <ButtonGroup>
        <button>A</button>
        <ButtonGroupSeparator />
        <button>B</button>
      </ButtonGroup>,
    );
    expect(
      document.querySelector('[data-slot="button-group-separator"]'),
    ).toBeInTheDocument();
  });
});
