import { fireEvent, render, screen } from "@testing-library/react";
import { TabsItems } from "@/components/ui/standard/tabs-items";

const items = [
  { key: "a", label: "Tab A", children: "Body A" },
  { key: "b", label: "Tab B", children: "Body B" },
  { key: "c", label: "Tab C", children: "Body C", disabled: true },
];

describe("TabsItems", () => {
  it("renders all triggers and the first tab's content by default", () => {
    render(<TabsItems items={items} />);
    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
    expect(screen.getByText("Body A")).toBeInTheDocument();
    expect(screen.queryByText("Body B")).not.toBeInTheDocument();
  });

  it("respects defaultActiveKey", () => {
    render(<TabsItems items={items} defaultActiveKey="b" />);
    expect(screen.getByText("Body B")).toBeInTheDocument();
  });

  it("disables the disabled trigger", () => {
    render(<TabsItems items={items} />);
    expect(screen.getByRole("tab", { name: "Tab C" })).toBeDisabled();
  });

  it("calls onChange when a tab is selected", () => {
    const onChange = jest.fn();
    render(<TabsItems items={items} onChange={onChange} />);
    const tabB = screen.getByRole("tab", { name: "Tab B" });
    fireEvent.mouseDown(tabB);
    fireEvent.click(tabB);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("renders nothing breaking with empty items", () => {
    const { container } = render(<TabsItems items={[]} />);
    expect(container).toBeTruthy();
  });
});
