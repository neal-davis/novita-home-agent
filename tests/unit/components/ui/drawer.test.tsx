import { render, screen } from "@testing-library/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

describe("Drawer", () => {
  it("renders bottom-drawer content with a drag handle when open", () => {
    render(
      <Drawer open>
        <DrawerContent data-testid="content">
          <DrawerHeader className="hd">
            <DrawerTitle>My Drawer</DrawerTitle>
            <DrawerDescription>Some description</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="ft">Footer</DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByText("My Drawer")).toBeInTheDocument();
    expect(screen.getByText("Some description")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();

    // drag handle present for a default (bottom) drawer
    const content = screen.getByTestId("content");
    expect(content.querySelector(".w-\\[100px\\]")).not.toBeNull();
  });

  it("omits the drag handle for an inset-y (side) drawer", () => {
    render(
      <Drawer open>
        <DrawerContent className="inset-y-0" data-testid="side-content">
          <DrawerTitle>Side</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const content = screen.getByTestId("side-content");
    expect(content.querySelector(".w-\\[100px\\]")).toBeNull();
    expect(screen.getByText("Side")).toBeInTheDocument();
  });
});
