import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogContentInner,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Test customize DialogContentInner
 * if dialog content exceeds max height, it should have max-height of 60vh and overflow-y: auto
 *
 * @testing-library/react default use JSDOM
 * default window size is 1024x768
 */
test("applies max-height of 60vh and overflow-y: auto when content exceeds max height", () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  render(
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogHeader>
        <DialogContentInner defaultHeight data-testid="content-inner">
          <div style={{ height: "1000px" }}>Long Content</div>
        </DialogContentInner>
      </DialogContent>
    </Dialog>,
  );

  const contentElement = screen.getByTestId("content-inner");
  expect(contentElement).toHaveClass("max-h-[60vh]");
  expect(contentElement).toHaveClass("overflow-y-auto");
  expect(errorSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();

  errorSpy.mockRestore();
  warnSpy.mockRestore();
});
