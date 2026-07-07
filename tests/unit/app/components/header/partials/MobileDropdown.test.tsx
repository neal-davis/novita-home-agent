import { fireEvent, render, screen } from "@testing-library/react";
import MobileDropdown from "@/app/components/header/partials/MobileDropdown";

describe("MobileDropdown", () => {
  it("renders the label and hides the dropdown content initially", () => {
    render(
      <MobileDropdown dropdownRender={() => <div>panel</div>}>
        <span>Label</span>
      </MobileDropdown>,
    );
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("toggles the dropdown content on click", () => {
    render(
      <MobileDropdown dropdownRender={() => <div>panel</div>}>
        <span>Label</span>
      </MobileDropdown>,
    );
    fireEvent.click(screen.getByText("Label"));
    expect(screen.getByText("panel")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Label"));
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });
});
