import { fireEvent, render, screen } from "@testing-library/react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

describe("Collapsible", () => {
  it("hides content by default and reveals it on trigger click", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden body</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.queryByText("Hidden body")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Hidden body")).toBeInTheDocument();
  });

  it("renders open content when defaultOpen", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Body</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
