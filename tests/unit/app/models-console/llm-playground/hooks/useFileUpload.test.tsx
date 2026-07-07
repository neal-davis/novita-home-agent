import { act, renderHook, waitFor } from "@testing-library/react";
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

class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(file: File) {
    this.onload?.({
      target: {
        result: `data:${file.type};base64,${file.name}`,
      },
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

describe("useFileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, "FileReader", {
      configurable: true,
      value: MockFileReader,
    });
    mockUpload.mockResolvedValue({ url: "https://blob.test/uploaded.png" });
  });

  it("accepts selected files, creates previews and exposes the uploaded blob url", async () => {
    const { result } = renderHook(() =>
      useFileUpload(undefined, {
        maxFiles: 2,
      }),
    );

    expect(result.current.fileInputElement?.props.accept).toContain(
      "image/png",
    );
    expect(result.current.canAddMore).toBe(true);

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("avatar.png", "image/png")],
          value: "avatar.png",
        },
      });
    });

    await waitFor(() =>
      expect(result.current.files[0]).toMatchObject({
        fileType: "image",
        preview: "data:image/png;base64,avatar.png",
        uploadProgress: 100,
        uploading: false,
        url: "https://blob.test/uploaded.png",
      }),
    );

    expect(mockUpload).toHaveBeenCalledWith("safe-id.png", expect.any(File), {
      access: "public",
      handleUploadUrl: "/api/upload-file",
    });
    expect(result.current.uploadedFileUrl).toBe(
      "https://blob.test/uploaded.png",
    );
    expect(result.current.hasFiles).toBe(true);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.getFileTypeCounts()).toEqual({
      audio: 0,
      image: 1,
      video: 0,
    });
  });

  it("rejects unsupported files, oversized files and per-type limit overflow", async () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    const { result } = renderHook(() =>
      useFileUpload(undefined, {
        acceptedTypes: ["image/png", "audio/mpeg"],
        fileTypeLimits: {
          audio: 1,
          image: 1,
          video: 1,
        },
        maxFileSize: 4,
      }),
    );

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [
            file("notes.txt", "text/plain"),
            file("large.png", "image/png", 8),
          ],
          value: "bad",
        },
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "File type text/plain not supported",
    );
    expect(mockMessage.error).toHaveBeenCalledWith(
      "File size exceeds limit 0MB",
    );
    expect(result.current.files).toEqual([]);

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("one.png", "image/png", 2)],
          value: "one.png",
        },
      });
    });
    await waitFor(() => expect(result.current.files).toHaveLength(1));

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("two.png", "image/png", 2)],
          value: "two.png",
        },
      });
    });

    expect(mockMessage.warning).toHaveBeenCalledWith(
      "Maximum 1 image file allowed",
    );
    expect(result.current.files).toHaveLength(1);
    consoleWarnSpy.mockRestore();
  });

  it("removes, clears and replaces files while aborting in-flight uploads", async () => {
    const neverUploaded = new Promise(() => {});
    mockUpload.mockReturnValue(neverUploaded);
    const { result } = renderHook(() => useFileUpload(undefined));

    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("pending.png", "image/png")],
          value: "pending.png",
        },
      });
    });

    await waitFor(() => expect(result.current.files[0]?.uploading).toBe(true));
    const firstAbort = result.current.files[0].abortController;

    act(() => {
      result.current.removeFile(result.current.files[0].id);
    });

    expect(firstAbort?.signal.aborted).toBe(true);
    expect(result.current.files).toEqual([]);

    mockUpload.mockResolvedValue({ url: "https://blob.test/replaced.wav" });
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: {
          files: [file("sound.mp3", "audio/mpeg")],
          value: "sound.mp3",
        },
      });
    });
    await waitFor(() => expect(result.current.files).toHaveLength(1));

    const fileId = result.current.files[0].id;
    await act(async () => {
      await result.current.replaceFile(fileId, file("sound.wav", "audio/wav"));
    });

    await waitFor(() =>
      expect(result.current.files[0]).toMatchObject({
        fileType: "audio",
        preview: "data:audio/wav;base64,sound.wav",
        url: "https://blob.test/replaced.wav",
      }),
    );

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toEqual([]);
  });

  it("handles paste and drag/drop events from the textarea ref", async () => {
    const textarea = document.createElement("textarea");
    const textAreaRef = { current: textarea };
    const { result } = renderHook(() =>
      useFileUpload(textAreaRef, {
        maxFiles: 3,
      }),
    );

    const dragEnter = new Event("dragenter", { bubbles: true });
    const dragLeave = new Event("dragleave", { bubbles: true });

    act(() => {
      textarea.dispatchEvent(dragEnter);
    });
    expect(result.current.isDragOver).toBe(true);

    await act(async () => {
      textarea.dispatchEvent(dragLeave);
      await new Promise((resolve) => setTimeout(resolve, 15));
    });
    expect(result.current.isDragOver).toBe(false);

    const pasteEvent = new Event("paste", { bubbles: true });
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        items: [
          {
            getAsFile: () => file("pasted.png", "image/png"),
            type: "image/png",
          },
        ],
      },
    });
    const preventPasteDefault = jest.spyOn(pasteEvent, "preventDefault");

    await act(async () => {
      textarea.dispatchEvent(pasteEvent);
    });

    expect(preventPasteDefault).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        result.current.files.some((f) => f.file.name === "pasted.png"),
      ).toBe(true),
    );

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [
          file("clip.mp4", "video/mp4"),
          file("ignored.txt", "text/plain"),
        ],
      },
    });

    await act(async () => {
      textarea.dispatchEvent(dropEvent);
    });

    await waitFor(() =>
      expect(
        result.current.files.map((uploaded) => uploaded.file.name),
      ).toEqual(expect.arrayContaining(["pasted.png", "clip.mp4"])),
    );
    expect(result.current.isDragOver).toBe(false);
  });

  it("errors when a file has no extension", async () => {
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("noext", "image/png")], value: "noext" },
      });
    });
    await waitFor(() =>
      expect(mockMessage.error).toHaveBeenCalledWith("Unrecognized file type"),
    );
    expect(result.current.files).toEqual([]);
  });

  it("shows an error toast when the blob upload fails", async () => {
    mockUpload.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() =>
      useFileUpload(undefined, { acceptedTypes: ["image/png"] }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("a.png", "image/png")], value: "a.png" },
      });
    });
    await waitFor(() =>
      expect(mockMessage.error).toHaveBeenCalledWith("File upload failed"),
    );
    expect(result.current.files).toEqual([]);
  });

  it("does not render a file input element when click is disabled", () => {
    const { result } = renderHook(() =>
      useFileUpload(undefined, { enableClick: false }),
    );
    expect(result.current.fileInputElement).toBeNull();
    expect(result.current.canAddMore).toBe(true);
  });

  it("respects the overall maxFiles cap", async () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    const { result } = renderHook(() =>
      useFileUpload(undefined, {
        maxFiles: 1,
        acceptedTypes: ["image/png"],
        fileTypeLimits: { image: 5, audio: 0, video: 0 },
      }),
    );
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("one.png", "image/png")], value: "one.png" },
      });
    });
    await waitFor(() => expect(result.current.files).toHaveLength(1));
    await act(async () => {
      result.current.fileInputElement?.props.onChange({
        target: { files: [file("two.png", "image/png")], value: "two.png" },
      });
    });
    expect(result.current.files).toHaveLength(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Maximum 1 files allowed");
    consoleWarnSpy.mockRestore();
  });
});
