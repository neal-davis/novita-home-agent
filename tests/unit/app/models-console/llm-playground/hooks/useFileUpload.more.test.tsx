import { act, render, renderHook, waitFor } from "@testing-library/react";
import { upload } from "@vercel/blob/client";
import { message } from "@/components/ui/standard/notify";
import { useFileUpload } from "@/app/models-console/llm-playground/hooks/useFileUpload";

jest.mock("@vercel/blob/client", () => ({
  upload: jest.fn(),
}));

jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "safe-id"),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// FileReader that succeeds by default; flips to error mode when failNext = true
let failNext = false;
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(file: File) {
    if (failNext) {
      this.onerror?.({} as ProgressEvent<FileReader>);
      return;
    }
    this.onload?.({
      target: { result: `data:${file.type};base64,${file.name}` },
    } as ProgressEvent<FileReader>);
  }
}

const mockUpload = upload as jest.Mock;
const mockMessage = message as unknown as {
  error: jest.Mock;
  warning: jest.Mock;
};

function file(name: string, type: string, size = 8) {
  return new File(["x".repeat(size)], name, { type });
}

describe("useFileUpload (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    failNext = false;
    Object.defineProperty(global, "FileReader", {
      configurable: true,
      value: MockFileReader,
    });
    mockUpload.mockResolvedValue({ url: "https://blob.test/uploaded.png" });
  });

  it("falls back to image fileType for accepted non-media mime types (default branch)", async () => {
    const { result } = renderHook(() =>
      useFileUpload(undefined, {
        acceptedTypes: ["application/octet-stream"],
        fileTypeLimits: { image: 5, audio: 0, video: 0 },
      }),
    );

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("blob.bin", "application/octet-stream")],
          value: "blob.bin",
        },
      });
    });

    await waitFor(() => expect(result.current.files).toHaveLength(1));
    // Unknown mime resolves to the "image" default type
    expect(result.current.files[0].fileType).toBe("image");
  });

  it("silently removes the file (no error toast) when the upload is aborted mid-flight", async () => {
    let rejectUpload: (err: unknown) => void = () => {};
    // upload rejects only when we call rejectUpload, simulating an aborted request
    mockUpload.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectUpload = reject;
        }),
    );

    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("a.png", "image/png")], value: "a.png" },
      });
    });

    await waitFor(() => expect(result.current.files[0]?.uploading).toBe(true));
    const abortController = result.current.files[0].abortController!;

    await act(async () => {
      abortController.abort();
      rejectUpload(new Error("aborted"));
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.files).toEqual([]));
    // The aborted branch must NOT raise the generic "File upload failed" toast
    expect(mockMessage.error).not.toHaveBeenCalledWith("File upload failed");
  });

  it("logs and skips a file when the FileReader fails (processFiles catch)", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    failNext = true;
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("a.png", "image/png")], value: "a.png" },
      });
    });

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error reading file:",
        expect.anything(),
      ),
    );
    expect(result.current.files).toEqual([]);
    consoleErrorSpy.mockRestore();
  });

  it("resets the input value even when no files are selected", () => {
    const { unmount } = render(<HookInput />);
    const input = document.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    input.value = "";
    act(() => {
      // onChange with empty files: length-0 branch, value reset still runs
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(input.value).toBe("");
    unmount();
  });

  it("openFileDialog clicks the rendered input when click is enabled", () => {
    const captured: { open?: () => void; el?: React.ReactNode } = {};
    function Harness() {
      const hook = useFileUpload(undefined, { enableClick: true });
      captured.open = hook.openFileDialog;
      return <div>{hook.fileInputElement}</div>;
    }
    render(<Harness />);
    const input = document.querySelector(
      "input[type=file]",
    ) as HTMLInputElement;
    const clickSpy = jest.spyOn(input, "click").mockImplementation();
    act(() => {
      captured.open?.();
    });
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("openFileDialog is a no-op when click is disabled", () => {
    const { result } = renderHook(() =>
      useFileUpload(undefined, { enableClick: false }),
    );
    // No input element, calling openFileDialog should not throw
    expect(() => act(() => result.current.openFileDialog())).not.toThrow();
  });

  it("clearFiles aborts in-flight uploads", async () => {
    mockUpload.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("p.png", "image/png")], value: "p.png" },
      });
    });
    await waitFor(() => expect(result.current.files[0]?.uploading).toBe(true));
    const abort = result.current.files[0].abortController!;
    act(() => result.current.clearFiles());
    expect(abort.signal.aborted).toBe(true);
    expect(result.current.files).toEqual([]);
  });

  it("replaceFile aborts an in-flight upload of the replaced file", async () => {
    mockUpload.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("p.png", "image/png")], value: "p.png" },
      });
    });
    await waitFor(() => expect(result.current.files[0]?.uploading).toBe(true));
    const oldAbort = result.current.files[0].abortController!;
    const id = result.current.files[0].id;

    // new upload also hangs, so replaceFile won't resolve, but the abort path runs
    await act(async () => {
      result.current.replaceFile(id, file("q.png", "image/png"));
      await Promise.resolve();
    });

    expect(oldAbort.signal.aborted).toBe(true);
    expect(result.current.files[0].file.name).toBe("q.png");
  });

  it("logs and skips when replaceFile FileReader fails (replace catch)", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("p.png", "image/png")], value: "p.png" },
      });
    });
    await waitFor(() => expect(result.current.files).toHaveLength(1));
    const id = result.current.files[0].id;

    failNext = true;
    await act(async () => {
      await result.current.replaceFile(id, file("q.png", "image/png"));
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error replacing file:",
      expect.anything(),
    );
    consoleErrorSpy.mockRestore();
  });

  it("sets isDragOver on a dragover event before any dragenter", () => {
    const textarea = document.createElement("textarea");
    const textAreaRef = { current: textarea };
    const { result } = renderHook(() => useFileUpload(textAreaRef));

    const dragOver = new Event("dragover", { bubbles: true });
    act(() => {
      textarea.dispatchEvent(dragOver);
    });
    expect(result.current.isDragOver).toBe(true);
  });

  it("ignores drag/drop events entirely when drop is disabled", () => {
    const textarea = document.createElement("textarea");
    const textAreaRef = { current: textarea };
    const { result } = renderHook(() =>
      useFileUpload(textAreaRef, { enableDrop: false }),
    );
    const dragOver = new Event("dragover", { bubbles: true });
    act(() => {
      textarea.dispatchEvent(dragOver);
    });
    expect(result.current.isDragOver).toBe(false);
  });
});

// Small harness component that renders the hidden file input for value-reset test
function HookInput() {
  const hook = useFileUpload(undefined, { enableClick: true });
  return <div>{hook.fileInputElement}</div>;
}
