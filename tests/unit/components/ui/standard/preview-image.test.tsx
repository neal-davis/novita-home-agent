import { fireEvent, render, screen } from "@testing-library/react";
import { PreviewImage } from "@/components/ui/standard/preview-image";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

describe("PreviewImage", () => {
  it("renders a zoomable image with preview enabled", () => {
    render(<PreviewImage src="/a.png" alt="pic" />);
    const img = screen.getByAltText("pic");
    expect(img).toHaveStyle({ cursor: "zoom-in" });
  });

  it("renders a plain image without a dialog when preview is disabled", () => {
    const { container } = render(
      <PreviewImage src="/a.png" alt="pic" preview={false} />,
    );
    // only the single img, no dialog wrapper span
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("opens the preview dialog on click", () => {
    render(<PreviewImage src="/a.png" alt="pic" />);
    fireEvent.click(screen.getByAltText("pic"));
    // dialog renders a second image plus sr-only title
    expect(screen.getByText("pic")).toBeInTheDocument();
  });

  it("forwards onClick", () => {
    const onClick = jest.fn();
    render(<PreviewImage src="/a.png" alt="pic" onClick={onClick} />);
    fireEvent.click(screen.getByAltText("pic"));
    expect(onClick).toHaveBeenCalled();
  });
});
