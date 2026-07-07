import { fireEvent, render, screen } from "@testing-library/react";
import { CascadeFilter } from "@/components/ui/standard/cascade-filter";

jest.mock("lucide-react", () => ({
  ChevronDown: () => <span data-testid="chevron" />,
  CircleX: () => <span data-testid="clear-icon" />,
}));

jest.mock("@/components/ui/popover", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const Ctx = React.createContext({ open: false, setOpen: (_: boolean) => {} });
  return {
    Popover: ({ children, open, onOpenChange }: any) => (
      <Ctx.Provider value={{ open, setOpen: onOpenChange }}>
        <div>{children}</div>
      </Ctx.Provider>
    ),
    PopoverTrigger: ({ children }: any) => {
      const { setOpen } = React.useContext(Ctx);
      return (
        <div onClick={() => setOpen(true)} role="presentation">
          {children}
        </div>
      );
    },
    PopoverContent: ({ children }: any) => {
      const { open } = React.useContext(Ctx);
      return open ? <div data-testid="popover-content">{children}</div> : null;
    },
  };
});

type Parent = { id: string; name: string };
type Child = { id: string; parentId: string; name: string };

const parents: Parent[] = [
  { id: "p1", name: "Fruit" },
  { id: "p2", name: "Veg" },
];
const children: Child[] = [
  { id: "c1", parentId: "p1", name: "Apple" },
  { id: "c2", parentId: "p1", name: "Banana" },
  { id: "c3", parentId: "p2", name: "Carrot" },
];

const baseProps = {
  parents,
  childOptions: children,
  getParentValue: (p: Parent) => p.id,
  getParentLabel: (p: Parent) => p.name,
  getChildValue: (c: Child) => c.id,
  getChildLabel: (c: Child) => c.name,
  getChildParentValue: (c: Child) => c.parentId,
};

describe("CascadeFilter", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(
      <CascadeFilter
        {...baseProps}
        onValueChange={jest.fn()}
        placeholder="Choose one"
      />,
    );
    expect(screen.getByText("Choose one")).toBeInTheDocument();
    // chevron shown (no clear) when no value
    expect(screen.getByTestId("chevron")).toBeInTheDocument();
  });

  it("renders the selected child label in the trigger", () => {
    render(
      <CascadeFilter {...baseProps} value="c3" onValueChange={jest.fn()} />,
    );
    expect(screen.getByText("Carrot")).toBeInTheDocument();
  });

  it("opens, switches parent, and selects a child", () => {
    const onValueChange = jest.fn();
    render(<CascadeFilter {...baseProps} onValueChange={onValueChange} />);

    // open the popover via the trigger button
    fireEvent.click(screen.getByText("Please select"));
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();

    // default active parent is p1 -> Apple/Banana visible
    expect(screen.getByText("Apple")).toBeInTheDocument();

    // switch to Veg parent
    fireEvent.click(screen.getByText("Veg"));
    expect(screen.getByText("Carrot")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Carrot"));
    expect(onValueChange).toHaveBeenCalledWith("c3");
  });

  it("shows an empty state when the active parent has no children", () => {
    render(
      <CascadeFilter
        {...baseProps}
        childOptions={[{ id: "c1", parentId: "p1", name: "Apple" }]}
        onValueChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Please select"));
    fireEvent.click(screen.getByText("Veg"));
    expect(screen.getByText("No options")).toBeInTheDocument();
  });

  it("renders a clear control and clears the selection", () => {
    const onValueChange = jest.fn();
    const onClear = jest.fn();
    render(
      <CascadeFilter
        {...baseProps}
        allowClear
        value="c1"
        onClear={onClear}
        onValueChange={onValueChange}
      />,
    );

    const clear = screen.getByLabelText("Clear selection");
    fireEvent.pointerDown(clear);
    expect(onClear).toHaveBeenCalled();
    // onClear short-circuits onValueChange
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("falls back to onValueChange('') when clearing without an onClear handler", () => {
    const onValueChange = jest.fn();
    render(
      <CascadeFilter
        {...baseProps}
        allowClear
        value="c1"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.pointerDown(screen.getByLabelText("Clear selection"));
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("uses custom render functions for trigger, parent, and child", () => {
    render(
      <CascadeFilter
        {...baseProps}
        value="c1"
        onValueChange={jest.fn()}
        renderTrigger={(child) => <span>T:{child?.name}</span>}
        renderParent={(parent, active) => (
          <span>
            P:{parent.name}:{active ? "on" : "off"}
          </span>
        )}
        renderChild={(child, selected) => (
          <span>
            C:{child.name}:{selected ? "sel" : "no"}
          </span>
        )}
      />,
    );

    expect(screen.getByText("T:Apple")).toBeInTheDocument();

    fireEvent.click(screen.getByText("T:Apple"));
    // active parent p1 rendered with custom renderer
    expect(screen.getByText("P:Fruit:on")).toBeInTheDocument();
    expect(screen.getByText("C:Apple:sel")).toBeInTheDocument();
  });
});
