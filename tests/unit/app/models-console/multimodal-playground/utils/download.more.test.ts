import { downloadMedia } from "@/app/models-console/multimodal-playground/utils/download";

const mockFetch = global.fetch as jest.Mock;

describe("downloadMedia (more base64 signatures)", () => {
  let clickSpy: jest.Mock;
  let appendSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    clickSpy = jest.fn();
    appendSpy = jest.spyOn(document.body, "appendChild");
    jest.spyOn(document.body, "removeChild").mockImplementation((n) => n);
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
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURLSpy,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
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

  it("detects mp4 video from the AAAA ftyp signature", async () => {
    await downloadMedia("AAAAGA", 0);
    expect(latestAnchor().download).toBe("video-1.mp4");
  });

  it("detects mp3 from MPEG audio signatures without ID3", async () => {
    await downloadMedia("//sQAAB", 0);
    expect(latestAnchor().download).toBe("audio-1.mp3");

    await downloadMedia("//swAAB", 1);
    expect(latestAnchor().download).toBe("audio-2.mp3");

    await downloadMedia("SUQzAAB", 2);
    expect(latestAnchor().download).toBe("audio-3.mp3");
  });

  it("detects WAV and AVI inside the RIFF container", async () => {
    // RIFF....WAVE
    await downloadMedia("UklGRgAAV0FWRQAA", 0);
    expect(latestAnchor().download).toBe("audio-1.wav");

    // RIFF....AVI
    await downloadMedia("UklGRgAAQVZJAA", 1);
    // video/avi maps via split fallback to "avi"
    expect(latestAnchor().download).toBe("video-2.avi");
  });

  it("downloads data URLs that lack a recognizable mime via octet-stream fallback", async () => {
    // data URL where the mime regex does not match -> octet-stream branch
    await downloadMedia("data:base64,aGVsbG8=", 0);
    // octet-stream -> prefix "file", extension via split "octet-stream"
    expect(latestAnchor().download).toBe("file-1.octet-stream");
  });

  it("uses octet-stream content type when proxy omits the header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      blob: jest.fn().mockResolvedValue(new Blob(["x"])),
    });
    await downloadMedia("https://cdn.example.test/file", 0);
    expect(latestAnchor().download).toBe("file-1.octet-stream");
  });

  it("falls back to direct proxy link when fetch itself rejects", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    await downloadMedia("https://cdn.example.test/x", 0);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to download media:",
      expect.any(Error),
    );
    expect(latestAnchor().href).toContain("/api/download-media");
    consoleError.mockRestore();
  });
});
