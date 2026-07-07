import { fireEvent, render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Tabs", () => {
  it("shows the default tab content and switches on trigger click", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();

    const twoTab = screen.getByRole("tab", { name: "Two" });
    fireEvent.mouseDown(twoTab);
    fireEvent.click(twoTab);
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("applies the line tabsStyle variant to the list", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList tabsStyle="line" align="left" data-testid="list">
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("list")).toHaveClass("justify-start");
  });

  it("marks the active trigger", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });
});
