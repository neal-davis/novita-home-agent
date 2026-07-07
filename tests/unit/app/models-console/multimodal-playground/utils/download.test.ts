import { downloadMedia } from "@/app/models-console/multimodal-playground/utils/download";

const mockFetch = global.fetch as jest.Mock;

describe("downloadMedia", () => {
  let clickSpy: jest.Mock;
  let appendSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.Mock;
  let revokeObjectURLSpy: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    clickSpy = jest.fn();
    appendSpy = jest.spyOn(document.body, "appendChild");
    removeSpy = jest.spyOn(document.body, "removeChild");
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        tagName,
      ) as HTMLAnchorElement;
      if (tagName === "a") {
        element.click = clickSpy;
      }
      return element;
    });
    createObjectURLSpy = jest.fn(() => "blob:download");
    revokeObjectURLSpy = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURLSpy,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURLSpy,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function latestAnchor() {
    return appendSpy.mock.calls.at(-1)?.[0] as HTMLAnchorElement;
  }

  it("downloads data URLs with MIME-derived filenames", async () => {
    await downloadMedia("data:image/png;base64,aGVsbG8=", 0);

    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(latestAnchor().href).toBe("blob:download");
    expect(latestAnchor().download).toBe("image-1.png");
    expect(clickSpy).toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:download");
    expect(removeSpy).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it("detects raw base64 signatures and handles invalid base64 safely", async () => {
    await downloadMedia("iVBORw0KGgoAAA==", 1);
    expect(latestAnchor().download).toBe("image-2.png");

    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    await downloadMedia("%%%not-base64%%%", 2);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Failed to process base64 data:",
      expect.any(Error),
    );
    mockConsoleError.mockRestore();
  });

  it("derives the right prefix/extension for various raw base64 signatures", async () => {
    // jpeg
    await downloadMedia("/9j/4AAQ", 0);
    expect(latestAnchor().download).toBe("image-1.jpg");
    // gif
    await downloadMedia("R0lGODlhAQ", 1);
    expect(latestAnchor().download).toBe("image-2.gif");
    // webm video
    await downloadMedia("GkXfo0AB", 2);
    expect(latestAnchor().download).toBe("video-3.webm");
    // mp3 (ID3)
    await downloadMedia("ID3AAAA", 3);
    expect(latestAnchor().download).toBe("audio-4.mp3");
    // ogg audio
    await downloadMedia("T2dnUwAB", 4);
    expect(latestAnchor().download).toBe("audio-5.ogg");
    // flac
    await downloadMedia("ZkxhQwAB", 5);
    expect(latestAnchor().download).toBe("audio-6.flac");
    // RIFF -> WAV default
    await downloadMedia("UklGRiAAAA", 6);
    expect(latestAnchor().download).toBe("audio-7.wav");
    // RIFF + WEBP signature -> image/webp
    await downloadMedia("UklGRgAAV0VCUAAA", 7);
    expect(latestAnchor().download).toBe("image-8.webp");
    // unknown signature -> octet-stream
    await downloadMedia("ZZZZunknown", 8);
    expect(latestAnchor().download).toBe("file-9.octet-stream");
  });

  it("downloads proxied HTTP URLs using response content type", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "Content-Type": "video/mp4" }),
      blob: jest
        .fn()
        .mockResolvedValue(new Blob(["video"], { type: "video/mp4" })),
    });

    await downloadMedia("https://cdn.example.test/video", 2);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/download-media?url=https%3A%2F%2Fcdn.example.test%2Fvideo",
    );
    expect(latestAnchor().download).toBe("video-3.mp4");
  });

  it("falls back to direct proxy link when proxied download fails", async () => {
    const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Forbidden",
      headers: new Headers(),
    });

    await downloadMedia("https://cdn.example.test/blocked", 3);

    expect(mockConsoleError).toHaveBeenCalledWith(
      "Failed to download media:",
      expect.any(Error),
    );
    expect(latestAnchor().href).toContain(
      "/api/download-media?url=https%3A%2F%2Fcdn.example.test%2Fblocked",
    );
    expect(latestAnchor().download).toBe("");
    mockConsoleError.mockRestore();
  });
});
