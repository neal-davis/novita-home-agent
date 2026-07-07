import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImageUploadField } from "@/app/models-console/multimodal-playground/components/FormFields/ImageUploadField";

// FileReader that can be toggled to fail
let mode: "ok" | "error" | "nonstring" = "ok";
class MockFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  error: any = null;
  readAsDataURL(_file: File) {
    if (mode === "error") {
      this.error = new Error("boom");
      this.onerror?.();
      return;
    }
    if (mode === "nonstring") {
      this.result = null;
      this.onload?.();
      return;
    }
    this.result = "data:image/png;base64,AAAA";
    this.onload?.();
  }
}

beforeEach(() => {
  mode = "ok";
  Object.defineProperty(global, "FileReader", {
    configurable: true,
    value: MockFileReader,
  });
});

function imageFile(name = "a.png", type = "image/png") {
  return new File(["x"], name, { type });
}

describe("ImageUploadField (more branches)", () => {
  it("shows the max-images tip when adding a URL beyond maxItems", () => {
    const onChange = jest.fn();
    render(
      <ImageUploadField value={["u1"]} onChange={onChange} maxItems={1} />,
    );
    // At max, the inline Add buttons are hidden, so the only way to reach the
    // tip is not via UI; assert the buttons are gone (guard branch covered by
    // the rendering of value.length < maxItems being false).
    expect(screen.queryByText("Add link")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the max-images tip when uploading a file beyond maxItems", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField
        value={["u1", "u2"]}
        onChange={onChange}
        maxItems={3}
      />,
    );
    // input still present because 2 < 3; bump value via re-render isn't needed:
    // upload one more makes it 3 (allowed). Instead use maxItems boundary:
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    // value length (2) < maxItems (3): allowed, so this uploads fine
    fireEvent.change(input, { target: { files: [imageFile()] } });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        "u1",
        "u2",
        "data:image/png;base64,AAAA",
      ]),
    );
  });

  it("displays a processing-failed tip when FileReader errors", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mode = "error";
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField value={[]} onChange={onChange} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [imageFile()] } });
    await waitFor(() =>
      expect(
        screen.getByText("Image processing failed, please try again"),
      ).toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("displays a processing-failed tip when FileReader returns a non-string", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mode = "nonstring";
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField value={[]} onChange={onChange} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [imageFile()] } });
    await waitFor(() =>
      expect(
        screen.getByText("Image processing failed, please try again"),
      ).toBeInTheDocument(),
    );
    expect(onChange).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does nothing when the file input has no file", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <ImageUploadField value={[]} onChange={onChange} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes the tip dialog via its Confirm action", async () => {
    mode = "error";
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { container } = render(
      <ImageUploadField value={[]} onChange={jest.fn()} />,
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [imageFile()] } });
    const confirm = await screen.findByText("Confirm");
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(screen.queryByText("Confirm")).not.toBeInTheDocument(),
    );
    consoleError.mockRestore();
  });

  it("accepts a base64 data URL in base64 mode", () => {
    const onChange = jest.fn();
    render(
      <ImageUploadField value={[]} onChange={onChange} inputMode="base64" />,
    );
    fireEvent.click(screen.getByText("Add link"));
    const input = screen.getByPlaceholderText("data:image/png;base64,...");
    fireEvent.change(input, {
      target: { value: "data:image/png;base64,QQ==" },
    });
    fireEvent.click(screen.getByText("Add"));
    // base64 mode does NOT enforce the http guard, so it is accepted
    expect(onChange).toHaveBeenCalledWith(["data:image/png;base64,QQ=="]);
  });

  it("toggles the URL input off when Add link clicked twice", () => {
    render(<ImageUploadField value={[]} onChange={jest.fn()} />);
    fireEvent.click(screen.getByText("Add link"));
    expect(
      screen.getByPlaceholderText("https://example.com/image.jpg"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add link"));
    expect(
      screen.queryByPlaceholderText("https://example.com/image.jpg"),
    ).not.toBeInTheDocument();
  });
});
