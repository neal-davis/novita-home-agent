import { fireEvent, render, screen } from "@testing-library/react";
import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
} from "@/components/ai-elements/branch";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

function setup(onBranchChange?: (i: number) => void) {
  return render(
    <Branch onBranchChange={onBranchChange}>
      <BranchMessages>
        <div key="0">First branch</div>
        <div key="1">Second branch</div>
        <div key="2">Third branch</div>
      </BranchMessages>
      <BranchSelector from="assistant">
        <BranchPrevious />
        <BranchPage />
        <BranchNext />
      </BranchSelector>
    </Branch>,
  );
}

describe("Branch", () => {
  it("shows the first branch and the page indicator", () => {
    setup();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    // first branch visible, the others hidden via class
    expect(screen.getByText("First branch").parentElement).toHaveClass("block");
    expect(screen.getByText("Second branch").parentElement).toHaveClass(
      "hidden",
    );
  });

  it("advances to the next branch and reports the change", () => {
    const onBranchChange = jest.fn();
    setup(onBranchChange);
    fireEvent.click(screen.getByLabelText("Next branch"));
    expect(onBranchChange).toHaveBeenCalledWith(1);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("wraps to the last branch when going previous from the first", () => {
    const onBranchChange = jest.fn();
    setup(onBranchChange);
    fireEvent.click(screen.getByLabelText("Previous branch"));
    expect(onBranchChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
  });

  it("hides the selector when there is a single branch", () => {
    render(
      <Branch>
        <BranchMessages>
          <div key="0">Only</div>
        </BranchMessages>
        <BranchSelector from="user">
          <BranchPage />
        </BranchSelector>
      </Branch>,
    );
    expect(screen.queryByText("1 of 1")).not.toBeInTheDocument();
  });
});
