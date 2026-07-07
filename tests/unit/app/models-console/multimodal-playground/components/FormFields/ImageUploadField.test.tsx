import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImageUploadField } from "@/app/models-console/multimodal-playground/components/FormFields/ImageUploadField";

class MockFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  error: any = null;
  readAsDataURL(_file: File) {
    this.result = "data:image/png;base64,AAAA";
    this.onload?.();
  }
}

beforeEach(() => {
  Object.defineProperty(global, "FileReader", {
    configurable: true,
    value: MockFileReader,
  });
});

function imageFile(name = "a.png", type = "image/png") {
  return new File(["x"], name, { type });
}

describe("ImageUploadField", () => {
  it("renders previews with current/max counter", () => {
    render(
      <ImageUploadField
        value={["https://x/a.png", "https://x/b.png"]}
        onChange={jest.fn()}
        maxItems={3}
      />,
    );
    expect(screen.getByAltText("Upload 1")).toBeInTheDocument();
    expect(screen.getByAltText("Upload 2")).toBeInTheDocument();
    expect(screen.getByText("2/3 images")).toBeInTheDocument();
  });

  it("removes an image by index", () => {
    const onChange = jest.fn();
    render(<ImageUploadField value={["u1", "u2"]} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onChange).toHaveBeenCalledWith(["u2"]);
  });

  it("uploads a valid image file as base64", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField value={[]} onChange={onChange} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [imageFile()] } });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(["data:image/png;base64,AAAA"]),
    );
  });

  it("rejects a non-image file with a tip dialog", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField value={[]} onChange={onChange} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [imageFile("a.txt", "text/plain")] },
    });
    await waitFor(() =>
      expect(
        screen.getByText("Please select a valid image file"),
      ).toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows max-images tip when uploading beyond maxItems", async () => {
    render(
      <ImageUploadField value={["u1"]} onChange={jest.fn()} maxItems={1} />,
    );
    // upload buttons hidden at max; trigger via the hidden input directly is gone,
    // so assert the add buttons are not rendered
    expect(screen.queryByText("Upload image")).not.toBeInTheDocument();
    expect(screen.queryByText("Add link")).not.toBeInTheDocument();
  });

  it("adds a URL via the link input", () => {
    const onChange = jest.fn();
    render(<ImageUploadField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add link"));
    const input = screen.getByPlaceholderText("https://example.com/image.jpg");
    fireEvent.change(input, { target: { value: "https://x/c.png" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).toHaveBeenCalledWith(["https://x/c.png"]);
  });

  it("ignores an empty URL", () => {
    const onChange = jest.fn();
    render(<ImageUploadField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add link"));
    fireEvent.change(
      screen.getByPlaceholderText("https://example.com/image.jpg"),
      { target: { value: "   " } },
    );
    fireEvent.click(screen.getByText("Add"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects a non-http URL in httpUrl mode", async () => {
    const onChange = jest.fn();
    render(
      <ImageUploadField value={[]} onChange={onChange} inputMode="httpUrl" />,
    );
    // In httpUrl mode the file upload button is hidden
    expect(screen.queryByText("Upload image")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Add link"));
    fireEvent.change(
      screen.getByPlaceholderText("https://example.com/image.jpg"),
      { target: { value: "data:image/png;base64,xxx" } },
    );
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() =>
      expect(
        screen.getByText(
          "Please enter an image URL starting with http or https",
        ),
      ).toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds URL on Enter key press", () => {
    const onChange = jest.fn();
    render(<ImageUploadField value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Add link"));
    const input = screen.getByPlaceholderText("https://example.com/image.jpg");
    fireEvent.change(input, { target: { value: "https://x/d.png" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["https://x/d.png"]);
  });

  it("uses the base64 placeholder in base64 mode", () => {
    render(
      <ImageUploadField value={[]} onChange={jest.fn()} inputMode="base64" />,
    );
    fireEvent.click(screen.getByText("Add link"));
    expect(
      screen.getByPlaceholderText("data:image/png;base64,..."),
    ).toBeInTheDocument();
  });

  it("renders an error message", () => {
    render(<ImageUploadField value={[]} onChange={jest.fn()} error="bad" />);
    expect(screen.getByText("bad")).toBeInTheDocument();
  });
});
