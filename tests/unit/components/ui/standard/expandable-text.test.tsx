import { fireEvent, render, screen } from "@testing-library/react";
import ExpandableText from "@/components/ui/standard/expandable-text";

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("ExpandableText", () => {
  it("renders the text content", () => {
    render(<ExpandableText text="Hello world" />);
    // text appears twice (measurement + visible)
    expect(screen.getAllByText("Hello world").length).toBeGreaterThanOrEqual(1);
  });

  it("does not show the expand button when content does not overflow", () => {
    render(<ExpandableText text="short" />);
    expect(screen.queryByText("Expand")).not.toBeInTheDocument();
  });

  it("shows Expand and toggles to Folding when content overflows", () => {
    // Force overflow: lineHeight via getComputedStyle, scrollHeight via prototype
    jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ lineHeight: "20px" } as CSSStyleDeclaration);
    const scrollHeightSpy = jest
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockReturnValue(500);

    render(<ExpandableText text="a very long body of text" maxLines={2} />);

    const expandBtn = screen.getByText("Expand");
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);
    expect(screen.getByText("Folding")).toBeInTheDocument();

    scrollHeightSpy.mockRestore();
  });
});
