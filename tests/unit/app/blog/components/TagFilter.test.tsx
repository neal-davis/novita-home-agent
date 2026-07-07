import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TagFilter from "@/app/blog/components/TagFilter";

const tags = [
  { tag: "Partnerships", count: 29 },
  { tag: "Research", count: 10 },
];

describe("TagFilter", () => {
  it("renders an All button plus one per tag and reports selections", () => {
    const onSelect = jest.fn();
    render(<TagFilter tags={tags} activeTag={null} onSelect={onSelect} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /Research/ }));
    expect(onSelect).toHaveBeenCalledWith("Research");

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("marks the active tag via aria-pressed", () => {
    render(<TagFilter tags={tags} activeTag="Research" onSelect={jest.fn()} />);
    expect(screen.getByRole("button", { name: /Research/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("renders nothing when there are no tags", () => {
    const { container } = render(
      <TagFilter tags={[]} activeTag={null} onSelect={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
