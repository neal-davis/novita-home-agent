import { fireEvent, render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

describe("Sheet", () => {
  it("renders content with title and description when open", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel title</SheetTitle>
            <SheetDescription>Panel description</SheetDescription>
          </SheetHeader>
          <div>Panel body</div>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Panel title")).toBeInTheDocument();
    expect(screen.getByText("Panel description")).toBeInTheDocument();
    expect(screen.getByText("Panel body")).toBeInTheDocument();
  });

  it("renders a close button by default", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>t</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("hides the close button when showCloseButton is false", () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>t</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <Sheet open={false}>
        <SheetContent>
          <SheetTitle>Hidden</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("opens via the trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open panel</SheetTrigger>
        <SheetContent>
          <SheetTitle>Now visible</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    fireEvent.click(screen.getByText("Open panel"));
    expect(screen.getByText("Now visible")).toBeInTheDocument();
  });
});
