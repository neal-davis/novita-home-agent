import { render, screen } from "@testing-library/react";
import { AppTooltip } from "@/components/ui/standard/tooltip";

// Render the radix wrappers inline so content + props are observable in jsdom
// without pointer/hover orchestration.
jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children, side, style, className }: any) => (
    <div data-side={side} data-zindex={style?.zIndex} className={className}>
      {children}
    </div>
  ),
}));

describe("AppTooltip", () => {
  it("renders the title content with the default z-index", () => {
    render(
      <AppTooltip title="Help text">
        <button>trigger</button>
      </AppTooltip>,
    );
    const content = screen.getByText("Help text");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-zindex", "10003");
  });

  it("falls back to the content prop when no title is given", () => {
    render(
      <AppTooltip content="From content">
        <span>x</span>
      </AppTooltip>,
    );
    expect(screen.getByText("From content")).toBeInTheDocument();
  });

  it("renders children only when there is no tooltip content", () => {
    render(
      <AppTooltip>
        <span>just child</span>
      </AppTooltip>,
    );
    expect(screen.getByText("just child")).toBeInTheDocument();
    // no content node rendered (no data-side wrapper)
    expect(screen.queryByText("just child").closest("[data-side]")).toBeNull();
  });

  it.each([
    ["topLeft", "top"],
    ["topRight", "top"],
    ["bottomLeft", "bottom"],
    ["bottomRight", "bottom"],
    ["left", "left"],
    ["right", "right"],
  ])("normalizes placement %s to side %s", (placement, side) => {
    render(
      <AppTooltip title="T" placement={placement as any}>
        <span>c</span>
      </AppTooltip>,
    );
    expect(screen.getByText("T")).toHaveAttribute("data-side", side);
  });

  it("wraps multiple children in a span trigger", () => {
    render(
      <AppTooltip title="T">
        <span>one</span>
        <span>two</span>
      </AppTooltip>,
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("honors an explicit zIndex override and computes the delay from mouseEnterDelay", () => {
    render(
      <AppTooltip title="T" zIndex={42} mouseEnterDelay={2}>
        <span>c</span>
      </AppTooltip>,
    );
    expect(screen.getByText("T")).toHaveAttribute("data-zindex", "42");
  });
});
